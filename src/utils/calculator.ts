/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BenefitCriteriaConfig,
  BenefitEligibility,
  BenefitType,
  CalculationResult,
  createDefaultCriteriaConfig,
  DEFAULT_2026_MEDIAN_INCOME,
  DEFAULT_BENEFIT_RATIOS,
  IncomeBreakdown,
  MEDIAN_INCOME_EXTRA_PER_PERSON,
  NEAR_POVERTY_2026_MEDIAN_50,
  NEAR_POVERTY_BASIC_PROPERTY_DEDUCTION,
  NEAR_POVERTY_EXTRA_PER_PERSON_50,
  NEAR_POVERTY_OBLIGATION_TABLE_2026,
  NearPovertyBenefitCode,
  NearPovertyResult,
  NearPovertySupportObligation,
  NearPovertyTargetInfo,
  PropertyBreakdown,
  REGION_CONFIGS,
  RegionKey,
  WelfareInputs,
  WorkerCategory,
} from '../types/welfare';

/**
 * 기준 중위소득 계산 (가구원 수 및 커스텀 테이블 반영)
 */
export function calculateMedianIncome(
  householdMembers: number,
  customTable: Record<number, number> = DEFAULT_2026_MEDIAN_INCOME,
  extraPerPerson: number = MEDIAN_INCOME_EXTRA_PER_PERSON,
): number {
  const members = Math.max(1, Math.floor(householdMembers));
  if (members <= 7) {
    return customTable[members] ?? DEFAULT_2026_MEDIAN_INCOME[members] ?? 2_564_238;
  }
  const base7 = customTable[7] ?? DEFAULT_2026_MEDIAN_INCOME[7];
  return base7 + (members - 7) * extraPerPerson;
}

/**
 * 특정 급여(생계, 의료, 주거, 교육) 및 가구원 수에 따른 선정기준액 산출
 * - useCustomAmounts인 경우: 설정된 해당 가구원수별 직접 입력액 반환 (8인이상은 1인당 가산액 반영)
 * - 비율 연동인 경우: Math.round(중위소득 * (ratio / 100))
 */
export function getBenefitCriterionAmount(
  benefitType: BenefitType,
  householdMembers: number,
  criteriaConfig: BenefitCriteriaConfig = createDefaultCriteriaConfig(),
): number {
  const members = Math.max(1, Math.floor(householdMembers));
  const ratio = criteriaConfig.ratios[benefitType] ?? DEFAULT_BENEFIT_RATIOS[benefitType];

  if (criteriaConfig.useCustomAmounts && criteriaConfig.customBenefitAmounts?.[benefitType]) {
    const table = criteriaConfig.customBenefitAmounts[benefitType];
    if (members <= 7) {
      if (typeof table[members] === 'number') {
        return table[members];
      }
    } else {
      const base7 =
        table[7] ??
        Math.round(
          (criteriaConfig.customMedianIncomeTable[7] ?? DEFAULT_2026_MEDIAN_INCOME[7]) *
            (ratio / 100),
        );
      const extra =
        criteriaConfig.extraPerPersonByBenefit?.[benefitType] ??
        Math.round(criteriaConfig.extraPerPerson * (ratio / 100));
      return base7 + (members - 7) * extra;
    }
  }

  // 중위소득 * 비율 연동 계산
  const median = calculateMedianIncome(
    members,
    criteriaConfig.customMedianIncomeTable,
    criteriaConfig.extraPerPerson,
  );
  return Math.round(median * (ratio / 100));
}

/**
 * 근로·사업소득 공제 계산
 * - 일반 수급(권)자: 생계·주거·교육 30% 공제, 의료급여 0% 공제
 * - 청년(34세 이하) 및 대학생: 60만원 공제 후 30% 추가 공제 (전 급여 공통)
 * - 65세 이상 노인, 등록장애인, 북한이탈주민: 20만원 공제 후 30% 추가 공제 (전 급여 공통)
 * - 장애인 직업재활사업 참여자: 20만원 공제 후 50% 추가 공제 (전 급여 공통)
 */
export function calculateEarnedIncomeDeduction(
  income: number,
  category: WorkerCategory,
): { generalEvaluated: number; medicalEvaluated: number } {
  const raw = Math.max(0, income);

  switch (category) {
    case 'general':
      return {
        generalEvaluated: Math.round(raw * 0.7), // 30% 공제
        medicalEvaluated: raw, // 의료급여는 공제 미적용 (0%)
      };

    case 'youth': {
      // 60만 원 공제 후 나머지 30% 추가 공제
      const afterFirstDeduction = Math.max(0, raw - 600_000);
      const evaluated = Math.round(afterFirstDeduction * 0.7);
      return {
        generalEvaluated: evaluated,
        medicalEvaluated: evaluated,
      };
    }

    case 'disabled':
    case 'senior':
    case 'senior_disabled': {
      // 20만 원 공제 후 나머지 30% 추가 공제
      const afterFirstDeduction = Math.max(0, raw - 200_000);
      const evaluated = Math.round(afterFirstDeduction * 0.7);
      return {
        generalEvaluated: evaluated,
        medicalEvaluated: evaluated,
      };
    }

    case 'vocational': {
      // 20만 원 공제 후 나머지 50% 추가 공제
      const afterFirstDeduction = Math.max(0, raw - 200_000);
      const evaluated = Math.round(afterFirstDeduction * 0.5);
      return {
        generalEvaluated: evaluated,
        medicalEvaluated: evaluated,
      };
    }

    default:
      return { generalEvaluated: raw, medicalEvaluated: raw };
  }
}

/**
 * 재산의 소득환산액 및 순차 차감 계산
 * 차감 순서: [주거용재산 → 일반재산 → 금융재산], 자동차에서는 차감 안 함
 */
export function calculatePropertyConversion(
  inputs: WelfareInputs,
  regionKey: RegionKey,
  isSpecialIncapable: boolean,
): PropertyBreakdown {
  const regionCfg = REGION_CONFIGS[regionKey];

  // 1. 주거용 재산 산정
  const depositAdjusted = inputs.housingProperty.applyDepositFactor
    ? Math.round(inputs.housingProperty.depositValue * 0.95)
    : inputs.housingProperty.depositValue;

  const rawHousingTotal = inputs.housingProperty.ownHomeValue + depositAdjusted;
  const housingLimit = regionCfg.housingPropertyLimit;

  // 지역별 주거용재산 한도액 초과분은 자동으로 일반재산으로 이관
  const recognizedHousingProperty = Math.min(rawHousingTotal, housingLimit);
  const overflowToGeneralProperty = Math.max(0, rawHousingTotal - housingLimit);

  // 2. 일반재산 산정 (초과분 합산)
  const rawGeneralPropertyTotal =
    inputs.generalProperty.nonResHomeValue +
    inputs.generalProperty.buildingValue +
    inputs.generalProperty.landValue +
    inputs.generalProperty.otherGeneralValue;

  const totalGeneralPropertyWithOverflow =
    rawGeneralPropertyTotal + overflowToGeneralProperty;

  // 3. 금융재산 산정 (생활준비금 500만원 공제 및 장기저축 공제)
  const rawFinancialTotal = inputs.financialProperty.depositAndSavings;
  const financialLivingReserveDeduction = inputs.financialProperty
    .applyLivingReserveDeduction
    ? Math.min(rawFinancialTotal, 5_000_000)
    : 0;

  // 장기저축 공제 (희망저축계좌, 청년내일저축계좌 등)
  const longTermSavingsInput = inputs.propertyDeductions?.longTermSavings || 0;
  const financialAfterLivingReserve = Math.max(
    0,
    rawFinancialTotal - financialLivingReserveDeduction,
  );
  const longTermSavingsDeduction = Math.min(
    financialAfterLivingReserve,
    Math.max(0, longTermSavingsInput),
  );

  const netFinancialProperty = Math.max(
    0,
    financialAfterLivingReserve - longTermSavingsDeduction,
  );

  // 4. 자동차 가액 분류
  let generalCarValue = 0;
  let exemptCarGeneralValue = 0;
  let excludedCarValue = 0;

  for (const car of inputs.cars) {
    if (car.type === 'general') {
      generalCarValue += car.value;
    } else if (car.type === 'general_property') {
      exemptCarGeneralValue += car.value;
    } else if (car.type === 'excluded') {
      excludedCarValue += car.value;
    }
  }
  const rawCarTotal =
    generalCarValue + exemptCarGeneralValue + excludedCarValue;

  // 5. 기본재산액 및 부채, 자연감소분 (차감 풀 산출)
  const basicPropertyDeduction = isSpecialIncapable
    ? regionCfg.specialPropertyDeduction
    : regionCfg.basicPropertyDeduction;

  const totalDebt =
    inputs.debt.financialLoan + inputs.debt.rentalDepositLiability;

  const naturalDeclineDeduction = Math.max(
    0,
    inputs.propertyDeductions?.naturalDecline || 0,
  );

  let remainingDeductionPool =
    basicPropertyDeduction + totalDebt + naturalDeclineDeduction;
  const totalDeductionPool = remainingDeductionPool;

  // 6. 순차 차감 [주거용재산 -> 일반재산 -> 금융재산]
  // 단계 1: 주거용 재산 차감
  const housingDeductedAmount = Math.min(
    recognizedHousingProperty,
    remainingDeductionPool,
  );
  const finalHousingProperty =
    recognizedHousingProperty - housingDeductedAmount;
  remainingDeductionPool -= housingDeductedAmount;

  // 단계 2: 일반재산 차감 (주거용 초과분 포함)
  const generalDeductedAmount = Math.min(
    totalGeneralPropertyWithOverflow,
    remainingDeductionPool,
  );
  const finalGeneralProperty =
    totalGeneralPropertyWithOverflow - generalDeductedAmount;
  remainingDeductionPool -= generalDeductedAmount;

  // 단계 3: 금융재산 차감
  const financialDeductedAmount = Math.min(
    netFinancialProperty,
    remainingDeductionPool,
  );
  const finalFinancialProperty =
    netFinancialProperty - financialDeductedAmount;
  remainingDeductionPool -= financialDeductedAmount;

  // 7. 소득환산율 적용 (월 기준)
  // 주거용: 1.04% (0.0104)
  // 일반재산: 4.17% (0.0417)
  // 금융재산: 6.26% (0.0626)
  // 자동차: 일반 승용차 100% (1.0), 일반재산환산 4.17% (0.0417), 제외 0%
  const housingConvertedMonthly = Math.round(finalHousingProperty * 0.0104);
  const generalConvertedMonthly = Math.round(finalGeneralProperty * 0.0417);
  const financialConvertedMonthly = Math.round(finalFinancialProperty * 0.0626);
  const carConvertedMonthly = Math.round(
    generalCarValue * 1.0 + exemptCarGeneralValue * 0.0417,
  );

  const totalPropertyConvertedMonthly =
    housingConvertedMonthly +
    generalConvertedMonthly +
    financialConvertedMonthly +
    carConvertedMonthly;

  return {
    rawHousingTotal,
    housingLimit,
    recognizedHousingProperty,
    overflowToGeneralProperty,
    rawGeneralPropertyTotal,
    totalGeneralPropertyWithOverflow,
    rawFinancialTotal,
    financialLivingReserveDeduction,
    longTermSavingsDeduction,
    netFinancialProperty,
    rawCarTotal,
    generalCarValue,
    exemptCarGeneralValue,
    excludedCarValue,
    totalDebt,
    naturalDeclineDeduction,
    basicPropertyDeduction,
    totalDeductionPool,
    housingDeductedAmount,
    finalHousingProperty,
    housingConvertedMonthly,
    generalDeductedAmount,
    finalGeneralProperty,
    generalConvertedMonthly,
    financialDeductedAmount,
    finalFinancialProperty,
    financialConvertedMonthly,
    carConvertedMonthly,
    totalPropertyConvertedMonthly,
  };
}

/**
 * 전체 모의 계산 및 4대 급여 판정 실행
 */
export function calculateWelfare(inputs: WelfareInputs): CalculationResult {
  const medianIncome = calculateMedianIncome(
    inputs.householdMembers,
    inputs.customMedianIncomeTable,
  );

  // 1. 소득 평가액 산출
  let rawEarnedTotal = 0;
  let earnedGeneralEvaluated = 0;
  let earnedMedicalEvaluated = 0;
  let disabilityBenefitTotal = 0;

  for (const earner of inputs.earners) {
    rawEarnedTotal += earner.monthlyIncome;
    const { generalEvaluated, medicalEvaluated } = calculateEarnedIncomeDeduction(
      earner.monthlyIncome,
      earner.category,
    );
    earnedGeneralEvaluated += generalEvaluated;
    earnedMedicalEvaluated += medicalEvaluated;

    // 가구원 특성에 장애인(또는 직업재활/노인장애인)이 선택되고 공적급여(장애인연금·수당)가 입력된 경우
    const isDisability =
      earner.category === 'disabled' ||
      earner.category === 'vocational' ||
      earner.category === 'senior_disabled';
    if (isDisability && earner.disabilityBenefit && earner.disabilityBenefit > 0) {
      disabilityBenefitTotal += earner.disabilityBenefit;
    }
  }

  const propertyIncomeTotal =
    inputs.propertyIncome.rental +
    inputs.propertyIncome.interest +
    inputs.propertyIncome.pension;

  const transferIncomeTotal =
    inputs.transferIncome.publicTransfer + inputs.transferIncome.privateTransfer;

  // 실제소득 = 근로소득 + 재산소득 + 이전소득(공적·사적) + 장애인 공적급여(장애인연금·수당)
  const totalActualIncome =
    rawEarnedTotal +
    propertyIncomeTotal +
    transferIncomeTotal +
    disabilityBenefitTotal;

  // 가구특성별 지출비용 (차감 항목)
  // 1) 만성질환 등의 치료·요양 의료비 + 그 밖의 추가 지출요인(국민연금 75%, 대학생 등록금 등)
  const chronicMedicalDeduction =
    (inputs.expenseDeductions.chronicIllnessMedical || 0) +
    (inputs.expenseDeductions.otherAdditionalDeduction || 0);
  // 2) 장애인연금·장애수당 공제: 보건복지부 『국민기초생활보장사업안내』 지침상
  //    지급받은 장애인 공적급여 전액을 가구특성별 지출비용으로 100% 공제
  const disabilityBenefitDeduction = disabilityBenefitTotal;

  const expenseDeductionTotal =
    chronicMedicalDeduction + disabilityBenefitDeduction;

  // 소득평가액 = 실제소득 - 가구특성별 지출비용 - 근로소득공제 (음수시 0원)
  const finalIncomeGeneral = Math.max(
    0,
    earnedGeneralEvaluated +
      propertyIncomeTotal +
      transferIncomeTotal +
      disabilityBenefitTotal -
      expenseDeductionTotal,
  );

  const finalIncomeMedical = Math.max(
    0,
    earnedMedicalEvaluated +
      propertyIncomeTotal +
      transferIncomeTotal +
      disabilityBenefitTotal -
      expenseDeductionTotal,
  );

  const incomeBreakdown: IncomeBreakdown = {
    rawEarnedTotal,
    earnedGeneralEvaluated,
    earnedMedicalEvaluated,
    propertyIncomeTotal,
    transferIncomeTotal,
    disabilityBenefitTotal,
    totalActualIncome,
    chronicMedicalDeduction,
    disabilityBenefitDeduction,
    expenseDeductionTotal,
    finalIncomeGeneral,
    finalIncomeMedical,
  };

  // 2. 재산의 소득환산액 산출
  const propertyBreakdown = calculatePropertyConversion(
    inputs,
    inputs.region,
    inputs.isWorkIncapableSpecial,
  );

  // 3. 최종 소득인정액
  // 생계·주거·교육급여용 소득인정액 = 소득평가액(생계) + 재산환산액
  const recognizedIncomeGeneral =
    finalIncomeGeneral + propertyBreakdown.totalPropertyConvertedMonthly;

  // 의료급여용 소득인정액 = 소득평가액(의료) + 재산환산액 + 부양비(부양능력 미약시)
  const medicalSupportFee =
    inputs.supportObligation.medicalSupportStatus === 'weak_ability'
      ? inputs.supportObligation.supportPaymentAmount
      : 0;

  const recognizedIncomeMedical =
    finalIncomeMedical +
    propertyBreakdown.totalPropertyConvertedMonthly +
    medicalSupportFee;

  // 4. 급여별 선정기준액 및 수급 판정
  const config = inputs.criteriaConfig ?? createDefaultCriteriaConfig();

  // 생계급여
  const livelihoodRatio = config.ratios.livelihood ?? 32;
  const livelihoodCriterion = getBenefitCriterionAmount('livelihood', inputs.householdMembers, config);
  const livelihoodIncomeDiff = livelihoodCriterion - recognizedIncomeGeneral;
  let livelihoodEligible = recognizedIncomeGeneral <= livelihoodCriterion;
  let livelihoodReason: string | undefined;

  if (inputs.supportObligation.livelihoodExceedsCriteria) {
    livelihoodEligible = false;
    livelihoodReason =
      '부양의무자 중 연소득 1.3억원(월 1,084만원) 또는 일반재산 12억원 초과자가 있어 부적합';
  } else if (!livelihoodEligible) {
    livelihoodReason = `소득인정액(${recognizedIncomeGeneral.toLocaleString()}원)이 생계급여 선정기준액(${livelihoodCriterion.toLocaleString()}원)을 초과함`;
  }

  const expectedLivelihoodGrant = livelihoodEligible
    ? Math.max(0, livelihoodIncomeDiff)
    : 0;

  const livelihoodBenefit: BenefitEligibility = {
    benefitName: '생계급여',
    ratioPercent: livelihoodRatio,
    criterionAmount: livelihoodCriterion,
    incomeRecognized: recognizedIncomeGeneral,
    differenceAmount: livelihoodIncomeDiff,
    isEligible: livelihoodEligible,
    ineligibilityReason: livelihoodReason,
    expectedLivelihoodGrant,
  };

  // 의료급여 (부양의무자 기준 연동)
  const medicalRatio = config.ratios.medical ?? 40;
  const medicalCriterion = getBenefitCriterionAmount('medical', inputs.householdMembers, config);
  const medicalIncomeDiff = medicalCriterion - recognizedIncomeMedical;
  let medicalEligible = recognizedIncomeMedical <= medicalCriterion;
  let medicalReason: string | undefined;

  if (inputs.supportObligation.medicalSupportStatus === 'has_ability') {
    medicalEligible = false;
    medicalReason =
      '부양의무자에게 부양능력이 있음(충분)으로 판정되어 의료급여 부적합';
  } else if (!medicalEligible) {
    medicalReason = `소득인정액(부양비 포함 ${recognizedIncomeMedical.toLocaleString()}원)이 의료급여 선정기준액(${medicalCriterion.toLocaleString()}원)을 초과함`;
  }

  const medicalBenefit: BenefitEligibility = {
    benefitName: '의료급여',
    ratioPercent: medicalRatio,
    criterionAmount: medicalCriterion,
    incomeRecognized: recognizedIncomeMedical,
    differenceAmount: medicalIncomeDiff,
    isEligible: medicalEligible,
    ineligibilityReason: medicalReason,
  };

  // 주거급여 (부양의무자 기준 폐지)
  const housingRatio = config.ratios.housing ?? 48;
  const housingCriterion = getBenefitCriterionAmount('housing', inputs.householdMembers, config);
  const housingIncomeDiff = housingCriterion - recognizedIncomeGeneral;
  const housingEligible = recognizedIncomeGeneral <= housingCriterion;

  const housingBenefit: BenefitEligibility = {
    benefitName: '주거급여',
    ratioPercent: housingRatio,
    criterionAmount: housingCriterion,
    incomeRecognized: recognizedIncomeGeneral,
    differenceAmount: housingIncomeDiff,
    isEligible: housingEligible,
    ineligibilityReason: housingEligible
      ? undefined
      : `소득인정액(${recognizedIncomeGeneral.toLocaleString()}원)이 주거급여 선정기준액(${housingCriterion.toLocaleString()}원)을 초과함`,
  };

  // 교육급여 (부양의무자 기준 폐지)
  const educationRatio = config.ratios.education ?? 50;
  const educationCriterion = getBenefitCriterionAmount('education', inputs.householdMembers, config);
  const educationIncomeDiff = educationCriterion - recognizedIncomeGeneral;
  const educationEligible = recognizedIncomeGeneral <= educationCriterion;

  const educationBenefit: BenefitEligibility = {
    benefitName: '교육급여',
    ratioPercent: educationRatio,
    criterionAmount: educationCriterion,
    incomeRecognized: recognizedIncomeGeneral,
    differenceAmount: educationIncomeDiff,
    isEligible: educationEligible,
    ineligibilityReason: educationEligible
      ? undefined
      : `소득인정액(${recognizedIncomeGeneral.toLocaleString()}원)이 교육급여 선정기준액(${educationCriterion.toLocaleString()}원)을 초과함`,
  };

  // 5. 차상위 본인부담경감대상자 지원사업 모의 판정 실행
  const nearPovertyResult = calculateNearPoverty(inputs, incomeBreakdown, {
    livelihoodEligible,
    medicalEligible,
    livelihoodReason,
    medicalReason,
  });

  return {
    medianIncome,
    incomeBreakdown,
    propertyBreakdown,
    recognizedIncomeGeneral,
    recognizedIncomeMedical,
    livelihoodBenefit,
    medicalBenefit,
    housingBenefit,
    educationBenefit,
    nearPovertyResult,
  };
}

/**
 * 2026년 차상위 본인부담경감대상자 지원사업 전용 모의 계산 및 자격 판정
 * - 기준 중위소득 50% 이하
 * - 차상위 전용 기본재산공제: 서울 1억 3,500만, 경기 1억 3,500만, 광역 1억 3,500만, 기타 8,500만 원
 * - 근로소득 공제: 일반수급자도 30% 공제 (의료급여 0%와 차별화)
 * - 사적이전소득 제외: 지침 p.26에 따라 사적이전소득, 부양비, 보장기관확인소득은 실제소득 산정에서 전액 제외
 * - 부양의무자 기준: 실제소득만으로 판정 (재산환산 미적용, 부양비 부과 없음, 중증장애인 수만큼 가구원수 추가 산정, 120%~180% 기준표 적용)
 * - 질환 요건: C(희귀·중증난치·중증), E(만성질환·18세미만), F(장애인 만성·18세미만)
 */
export function calculateNearPoverty(
  inputs: WelfareInputs,
  baseIncomeBreakdown?: IncomeBreakdown,
  basicWelfareStatus?: {
    livelihoodEligible: boolean;
    medicalEligible: boolean;
    livelihoodReason?: string;
    medicalReason?: string;
  },
): NearPovertyResult {
  const members = Math.max(1, Math.floor(inputs.householdMembers));

  // 1. 기준 중위소득 50% 선정기준액 산출 (지침 p.3, 12)
  let criterionAmount: number;
  if (members <= 7) {
    criterionAmount = NEAR_POVERTY_2026_MEDIAN_50[members];
  } else {
    criterionAmount =
      NEAR_POVERTY_2026_MEDIAN_50[7] +
      (members - 7) * NEAR_POVERTY_EXTRA_PER_PERSON_50;
  }

  // 2. 소득평가액 산출 (일반 근로소득 30% 공제 적용 + 사적이전소득 제외!)
  let rawEarnedTotal = 0;
  let earnedEvaluated = 0;
  let disabilityBenefitTotal = 0;

  for (const earner of inputs.earners) {
    rawEarnedTotal += earner.monthlyIncome;
    const { generalEvaluated } = calculateEarnedIncomeDeduction(
      earner.monthlyIncome,
      earner.category,
    );
    // 차상위 지침상 일반근로자도 30% 공제 적용 (generalEvaluated)
    earnedEvaluated += generalEvaluated;

    const isDisability =
      earner.category === 'disabled' ||
      earner.category === 'vocational' ||
      earner.category === 'senior_disabled';
    if (isDisability && earner.disabilityBenefit && earner.disabilityBenefit > 0) {
      disabilityBenefitTotal += earner.disabilityBenefit;
    }
  }

  const propertyIncomeTotal =
    inputs.propertyIncome.rental +
    inputs.propertyIncome.interest +
    inputs.propertyIncome.pension;

  // [핵심 지침 p.26] 차상위 본인부담경감사업은 실제소득 산정에서 '사적이전소득, 부양비, 보장기관확인소득'을 전액 제외함!
  const excludedPrivateTransfer = Math.max(0, inputs.transferIncome.privateTransfer || 0);
  const transferIncomeTotal = inputs.transferIncome.publicTransfer;

  const totalActualIncome =
    rawEarnedTotal +
    propertyIncomeTotal +
    transferIncomeTotal +
    disabilityBenefitTotal;

  // 가구특성별 지출비용 및 추가 지출요인 (3개월 이상 만성의료비 + 국민연금 75% 등 + 장애인연금·수당 100% 공제)
  const chronicMedicalDeduction =
    (inputs.expenseDeductions.chronicIllnessMedical || 0) +
    (inputs.expenseDeductions.otherAdditionalDeduction || 0);
  const disabilityBenefitDeduction = disabilityBenefitTotal;
  const expenseDeductionTotal = chronicMedicalDeduction + disabilityBenefitDeduction;

  const finalIncomeNearPoverty = Math.max(
    0,
    earnedEvaluated +
      propertyIncomeTotal +
      transferIncomeTotal +
      disabilityBenefitTotal -
      expenseDeductionTotal,
  );

  const nearPovertyIncomeBreakdown: IncomeBreakdown = {
    rawEarnedTotal,
    earnedGeneralEvaluated: earnedEvaluated,
    earnedMedicalEvaluated: earnedEvaluated,
    propertyIncomeTotal,
    transferIncomeTotal,
    disabilityBenefitTotal,
    totalActualIncome,
    chronicMedicalDeduction,
    disabilityBenefitDeduction,
    expenseDeductionTotal,
    finalIncomeGeneral: finalIncomeNearPoverty,
    finalIncomeMedical: finalIncomeNearPoverty,
  };

  // 3. 차상위 전용 재산환산액 산출 (기본재산공제: 서울/경기/광역 1.35억, 기타 8,500만 원)
  const regionCfg = REGION_CONFIGS[inputs.region];
  const nearPovertyBasicDeduction = NEAR_POVERTY_BASIC_PROPERTY_DEDUCTION[inputs.region];

  const depositAdjusted = inputs.housingProperty.applyDepositFactor
    ? Math.round(inputs.housingProperty.depositValue * 0.95)
    : inputs.housingProperty.depositValue;

  const rawHousingTotal = inputs.housingProperty.ownHomeValue + depositAdjusted;
  const housingLimit = regionCfg.housingPropertyLimit;
  const recognizedHousingProperty = Math.min(rawHousingTotal, housingLimit);
  const overflowToGeneralProperty = Math.max(0, rawHousingTotal - housingLimit);

  const rawGeneralPropertyTotal =
    inputs.generalProperty.nonResHomeValue +
    inputs.generalProperty.buildingValue +
    inputs.generalProperty.landValue +
    inputs.generalProperty.otherGeneralValue;

  const totalGeneralPropertyWithOverflow =
    rawGeneralPropertyTotal + overflowToGeneralProperty;

  const rawFinancialTotal = inputs.financialProperty.depositAndSavings;
  const financialLivingReserveDeduction = inputs.financialProperty
    .applyLivingReserveDeduction
    ? Math.min(rawFinancialTotal, 5_000_000)
    : 0;

  const longTermSavingsInput = inputs.propertyDeductions?.longTermSavings || 0;
  const financialAfterLivingReserve = Math.max(
    0,
    rawFinancialTotal - financialLivingReserveDeduction,
  );
  const longTermSavingsDeduction = Math.min(
    financialAfterLivingReserve,
    Math.max(0, longTermSavingsInput),
  );
  const netFinancialProperty = Math.max(
    0,
    financialAfterLivingReserve - longTermSavingsDeduction,
  );

  let generalCarValue = 0;
  let exemptCarGeneralValue = 0;
  let excludedCarValue = 0;

  for (const car of inputs.cars) {
    if (car.type === 'general') {
      generalCarValue += car.value;
    } else if (car.type === 'general_property') {
      exemptCarGeneralValue += car.value;
    } else if (car.type === 'excluded') {
      excludedCarValue += car.value;
    }
  }
  const rawCarTotal = generalCarValue + exemptCarGeneralValue + excludedCarValue;

  const totalDebt = inputs.debt.financialLoan + inputs.debt.rentalDepositLiability;
  const naturalDeclineDeduction = Math.max(
    0,
    inputs.propertyDeductions?.naturalDecline || 0,
  );

  // 차상위 전용 차감 풀
  let remainingDeductionPool =
    nearPovertyBasicDeduction + totalDebt + naturalDeclineDeduction;
  const totalDeductionPool = remainingDeductionPool;

  // 순차 차감 [주거용 -> 일반 -> 금융]
  const housingDeductedAmount = Math.min(
    recognizedHousingProperty,
    remainingDeductionPool,
  );
  const finalHousingProperty =
    recognizedHousingProperty - housingDeductedAmount;
  remainingDeductionPool -= housingDeductedAmount;

  const generalDeductedAmount = Math.min(
    totalGeneralPropertyWithOverflow,
    remainingDeductionPool,
  );
  const finalGeneralProperty =
    totalGeneralPropertyWithOverflow - generalDeductedAmount;
  remainingDeductionPool -= generalDeductedAmount;

  const financialDeductedAmount = Math.min(
    netFinancialProperty,
    remainingDeductionPool,
  );
  const finalFinancialProperty =
    netFinancialProperty - financialDeductedAmount;
  remainingDeductionPool -= financialDeductedAmount;

  const housingConvertedMonthly = Math.round(finalHousingProperty * 0.0104);
  const generalConvertedMonthly = Math.round(finalGeneralProperty * 0.0417);
  const financialConvertedMonthly = Math.round(finalFinancialProperty * 0.0626);
  const carConvertedMonthly = Math.round(
    generalCarValue * 1.0 + exemptCarGeneralValue * 0.0417,
  );

  const totalPropertyConvertedMonthly =
    housingConvertedMonthly +
    generalConvertedMonthly +
    financialConvertedMonthly +
    carConvertedMonthly;

  const nearPovertyPropertyBreakdown: PropertyBreakdown = {
    rawHousingTotal,
    housingLimit,
    recognizedHousingProperty,
    overflowToGeneralProperty,
    rawGeneralPropertyTotal,
    totalGeneralPropertyWithOverflow,
    rawFinancialTotal,
    financialLivingReserveDeduction,
    longTermSavingsDeduction,
    netFinancialProperty,
    rawCarTotal,
    generalCarValue,
    exemptCarGeneralValue,
    excludedCarValue,
    totalDebt,
    naturalDeclineDeduction,
    basicPropertyDeduction: nearPovertyBasicDeduction,
    totalDeductionPool,
    housingDeductedAmount,
    finalHousingProperty,
    housingConvertedMonthly,
    generalDeductedAmount,
    finalGeneralProperty,
    generalConvertedMonthly,
    financialDeductedAmount,
    finalFinancialProperty,
    financialConvertedMonthly,
    carConvertedMonthly,
    totalPropertyConvertedMonthly,
  };

  // 4. 최종 차상위 소득인정액
  const recognizedIncome =
    finalIncomeNearPoverty + totalPropertyConvertedMonthly;
  const isIncomeEligible = recognizedIncome <= criterionAmount;
  const incomeDifference = criterionAmount - recognizedIncome;

  // 5. 부양의무자 기준 판정 (실제소득만으로 판정, 부양비 부과 없음, 중증장애인 수만큼 가구원수 추가 산정 - 지침 p.40)
  const obligation = inputs.nearPovertyObligation;
  let isSupportEligible = true;
  let supportIneligibilityReason: string | undefined;
  let supportObligationCriterion = 0;
  let obligationTotalDeduction = 0;
  let netObligationIncome = 0;
  const severeDisabledExtra = Math.max(0, Math.floor(obligation.severeDisabledCount || 0));
  const effectiveFamilyCount = Math.max(1, Math.floor(obligation.familyCount || 1)) + severeDisabledExtra;

  if (!obligation.hasObligation) {
    isSupportEligible = true;
  } else if (obligation.cannotReceiveSupport) {
    isSupportEligible = true;
  } else {
    // 부양의무자 유효 세대원수(중증장애인 추가 산정 포함) 및 경감 대상자 수 반영
    const targetPersons = Math.min(
      7,
      Math.max(1, Math.floor(obligation.targetPersonCount || 1)),
    );
    const tableFamilyCount = Math.min(7, effectiveFamilyCount);

    const baseCriterion =
      NEAR_POVERTY_OBLIGATION_TABLE_2026[targetPersons]?.[tableFamilyCount] ??
      NEAR_POVERTY_OBLIGATION_TABLE_2026[1][tableFamilyCount];

    if (effectiveFamilyCount > 7) {
      const extraPerPersonRatio = 1.2 + (targetPersons - 1) * 0.1;
      const extra = Math.round(
        MEDIAN_INCOME_EXTRA_PER_PERSON * extraPerPersonRatio,
      );
      supportObligationCriterion =
        baseCriterion + (effectiveFamilyCount - 7) * extra;
    } else {
      supportObligationCriterion = baseCriterion;
    }

    obligationTotalDeduction =
      (obligation.deductionEducation || 0) +
      (obligation.deductionRent || 0) +
      (obligation.deductionMedical || 0) +
      (obligation.deductionPension || 0) +
      (obligation.deductionDebt || 0);

    netObligationIncome = Math.max(
      0,
      obligation.monthlyIncome - obligationTotalDeduction,
    );

    isSupportEligible = netObligationIncome < supportObligationCriterion;
    if (!isSupportEligible) {
      supportIneligibilityReason = `부양의무자 순소득(${netObligationIncome.toLocaleString()}원)이 부양능력 판정기준액(${supportObligationCriterion.toLocaleString()}원) 이상으로 부양능력 있음 판정`;
    }
  }

  // 6. 대상자 요건 (희귀·중증질환, 만성질환, 18세 미만 아동) 및 구분코드(C/E/F) 판정
  const target = inputs.nearPovertyTarget;
  let targetBenefitCode: NearPovertyBenefitCode = 'none';
  let benefitCodeName = '해당사항 없음';
  let isTargetEligible = false;
  let targetIneligibilityReason: string | undefined;

  switch (target.targetType) {
    case 'rare_severe':
      targetBenefitCode = 'C';
      benefitCodeName = '희귀·중증난치·중증질환자 (구분코드 C)';
      if (target.isSanctuaryRegistered) {
        isTargetEligible = true;
      } else {
        isTargetEligible = false;
        targetIneligibilityReason =
          '희귀·중증질환자(C코드)는 건강보험 산정특례 등록이 확인되어야 합니다 (미등록 시 산정특례 등록 후 신청하거나 진단서를 첨부하여 만성질환 E코드로 신청 필요)';
      }
      break;

    case 'chronic':
      if (target.isRegisteredDisabled) {
        targetBenefitCode = 'F';
        benefitCodeName = '만성질환 등록장애인 (구분코드 F)';
      } else {
        targetBenefitCode = 'E';
        benefitCodeName = '만성질환자 (구분코드 E)';
      }
      if (target.hasMedicalCertificate) {
        isTargetEligible = true;
      } else {
        isTargetEligible = false;
        targetIneligibilityReason =
          '만성질환자(E·F코드)는 최근 3개월 이내 발급된 진단서(6개월 이상 치료 요함 기재) 구비가 필수입니다 (단, 산정특례 등록 정신질환 F20~F29·치매는 진단서 면제)';
      }
      break;

    case 'minor':
      if (target.isRegisteredDisabled) {
        targetBenefitCode = 'F';
        benefitCodeName = '18세 미만 등록장애아동 (구분코드 F)';
      } else {
        targetBenefitCode = 'E';
        benefitCodeName = '18세 미만 아동 (구분코드 E)';
      }
      isTargetEligible = true;
      break;

    default:
      targetBenefitCode = 'none';
      benefitCodeName = '대상자 요건 미선택';
      isTargetEligible = false;
      targetIneligibilityReason =
        '희귀·중증질환자, 만성질환자(6개월 이상 치료), 또는 18세 미만 아동에 해당해야 지원 가능';
      break;
  }

  // 7. 최종 적격 여부
  const isFinalEligible =
    isIncomeEligible && isSupportEligible && isTargetEligible;

  let finalStatusMessage = '';
  if (isFinalEligible) {
    finalStatusMessage = `차상위 본인부담경감대상자 [적격] - ${benefitCodeName} 혜택 적용`;
  } else {
    const reasons: string[] = [];
    if (!isTargetEligible) {
      reasons.push(targetIneligibilityReason || '대상자 질환·연령·증빙 요건 미충족');
    }
    if (!isIncomeEligible)
      reasons.push(
        `소득인정액(${recognizedIncome.toLocaleString()}원)이 기준 중위 50%(${criterionAmount.toLocaleString()}원)를 초과`,
      );
    if (!isSupportEligible) reasons.push('부양의무자 부양능력 있음 판정');
    finalStatusMessage = `차상위 본인부담경감대상자 [부적합] - ${reasons.join(', ')}`;
  }

  // 8. 기초수급(생계·의료) 탈락 가구에 대한 연계 분석
  const isBasicIneligible =
    basicWelfareStatus &&
    (!basicWelfareStatus.livelihoodEligible || !basicWelfareStatus.medicalEligible);

  const advantageHighlights: string[] = [];
  if (excludedPrivateTransfer > 0) {
    advantageHighlights.push(`사적이전소득 월 ${excludedPrivateTransfer.toLocaleString()}원 전액 제외(지침 p.26)`);
  }
  if (
    inputs.supportObligation.medicalSupportStatus === 'weak_ability' &&
    inputs.supportObligation.supportPaymentAmount > 0
  ) {
    advantageHighlights.push(
      `기초의료 부양비 월 ${inputs.supportObligation.supportPaymentAmount.toLocaleString()}원 미부과`,
    );
  }
  advantageHighlights.push(
    `기본재산공제 ${formatKoreanWon(nearPovertyBasicDeduction)} 상향 및 중위소득 50% 기준 적용`,
  );

  const linkageRecommendation = {
    needed: Boolean(isBasicIneligible),
    reason: isBasicIneligible
      ? basicWelfareStatus?.medicalEligible === false
        ? `기초의료급여는 탈락(${basicWelfareStatus.medicalReason ?? '기준초과'})하였으나, 차상위본인부담경감은 [${advantageHighlights.join(' · ')}] 및 부양의무자 재산 미반영으로 진료비 경감과 지역건보료 전액 지원을 받을 수 있습니다.`
        : `생계급여는 탈락하였으나 차상위본인부담경감 대상자로 연계 신청 시 높은 가능성으로 의료비 및 건보료 지원을 수혜할 수 있습니다.`
      : '현재 기초생활보장 수급 대상에 해당하거나 상담 진행 중입니다.',
    urgencyTip:
      '기초생활수급 자격 탈락(상실)일로부터 90일 이내에 신청하면 상실일로 소급하여 본인부담경감이 적용(행복e음 소급요청 Y)됩니다.',
  };

  return {
    criterionAmount,
    recognizedIncome,
    propertyBreakdown: nearPovertyPropertyBreakdown,
    incomeBreakdown: nearPovertyIncomeBreakdown,
    excludedPrivateTransfer,
    isIncomeEligible,
    incomeDifference,
    isSupportEligible,
    effectiveFamilyCount,
    supportObligationCriterion,
    obligationActualIncome: obligation.monthlyIncome,
    obligationTotalDeduction,
    netObligationIncome,
    supportIneligibilityReason,
    targetBenefitCode,
    benefitCodeName,
    isTargetEligible,
    targetIneligibilityReason,
    isFinalEligible,
    finalStatusMessage,
    linkageRecommendation,
  };
}

/**
 * 기본 입력값 팩토리
 */
export function createDefaultInputs(): WelfareInputs {
  return {
    householdMembers: 1,
    region: 'metro',
    isWorkIncapableSpecial: false,
    customMedianIncomeTable: { ...DEFAULT_2026_MEDIAN_INCOME },
    criteriaConfig: createDefaultCriteriaConfig(),

    earners: [
      {
        id: 'earner-1',
        name: '본인',
        category: 'general',
        monthlyIncome: 0,
      },
    ],
    propertyIncome: {
      rental: 0,
      interest: 0,
      pension: 0,
    },
    transferIncome: {
      publicTransfer: 0,
      privateTransfer: 0,
    },
    expenseDeductions: {
      chronicIllnessMedical: 0,
      otherAdditionalDeduction: 0,
    },

    housingProperty: {
      ownHomeValue: 0,
      depositValue: 0,
      applyDepositFactor: true,
    },
    generalProperty: {
      nonResHomeValue: 0,
      buildingValue: 0,
      landValue: 0,
      otherGeneralValue: 0,
    },
    financialProperty: {
      depositAndSavings: 0,
      applyLivingReserveDeduction: true,
    },
    cars: [],
    debt: {
      financialLoan: 0,
      rentalDepositLiability: 0,
    },
    propertyDeductions: {
      longTermSavings: 0,
      naturalDecline: 0,
    },

    supportObligation: {
      livelihoodExceedsCriteria: false,
      medicalSupportStatus: 'none_or_abolished',
      supportPaymentAmount: 0,
    },

    // 차상위본인부담경감 기본값
    nearPovertyTarget: {
      targetType: 'chronic', // 기본값: 만성질환자 (신청 상담의 70% 이상이 만성질환 연계)
      illnessCode: 'HYPERTENSION',
      illnessName: '고혈압 (I10~I15)',
      isRegisteredDisabled: false,
      hasMedicalCertificate: true,
      isSanctuaryRegistered: true,
    },
    nearPovertyObligation: {
      hasObligation: false, // 기본값: 부양의무자 없음 또는 미약
      familyCount: 1,
      severeDisabledCount: 0,
      monthlyIncome: 0,
      targetPersonCount: 1,
      deductionEducation: 0,
      deductionRent: 0,
      deductionMedical: 0,
      deductionPension: 0,
      deductionDebt: 0,
      cannotReceiveSupport: false,
    },
  };
}

/**
 * 원 단위 금액을 한글 표기(예: 1억 2,500만 원, 80만 원)로 변환
 */
export function formatKoreanWon(amount: number): string {
  if (isNaN(amount) || amount === 0) return '0원';
  const isNegative = amount < 0;
  const abs = Math.abs(Math.round(amount));

  const eok = Math.floor(abs / 100_000_000);
  const man = Math.floor((abs % 100_000_000) / 10_000);
  const won = abs % 10_000;

  const parts: string[] = [];
  if (eok > 0) parts.push(`${eok}억`);
  if (man > 0) parts.push(`${man.toLocaleString()}만`);
  if (won > 0 && eok === 0 && man === 0) parts.push(`${won.toLocaleString()}`);

  const str = parts.join(' ') + ' 원';
  return isNegative ? `-${str}` : str;
}
