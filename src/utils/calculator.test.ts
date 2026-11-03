/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateMedianIncome,
  calculateEarnedIncomeDeduction,
  calculatePropertyConversion,
  calculateWelfare,
  createDefaultInputs,
  formatKoreanWon,
} from './calculator';
import { DEFAULT_2026_MEDIAN_INCOME, WelfareInputs } from '../types/welfare';

test('2026 기준 중위소득 계산: 1인~7인 및 8인 이상 증가분 검증', () => {
  assert.equal(calculateMedianIncome(1), 2_564_238);
  assert.equal(calculateMedianIncome(2), 4_199_292);
  assert.equal(calculateMedianIncome(4), 6_494_738);
  assert.equal(calculateMedianIncome(7), 9_515_150);

  // 8인 가구: 7인가구 + 959,198원 = 10,474,348원
  assert.equal(calculateMedianIncome(8), 9_515_150 + 959_198);
  // 9인 가구: 7인가구 + 2 * 959,198원 = 11,433,546원
  assert.equal(calculateMedianIncome(9), 9_515_150 + 959_198 * 2);
});

test('근로소득 공제 검증: 유형별 생계/주거 vs 의료급여 차등 적용', () => {
  // 1. 일반 수급(권)자: 월 1,000,000원
  // 생계주거교육: 30% 공제 -> 700,000원
  // 의료급여: 0% 공제 -> 1,000,000원
  const generalResult = calculateEarnedIncomeDeduction(1_000_000, 'general');
  assert.equal(generalResult.generalEvaluated, 700_000);
  assert.equal(generalResult.medicalEvaluated, 1_000_000);

  // 2. 청년(34세 이하) 및 대학생: 월 1,600,000원
  // 60만원 공제 -> 1,000,000원. 그 중 30% 추가 공제 -> 700,000원 (전 급여 공통)
  const youthResult = calculateEarnedIncomeDeduction(1_600_000, 'youth');
  assert.equal(youthResult.generalEvaluated, 700_000);
  assert.equal(youthResult.medicalEvaluated, 700_000);

  // 소득이 60만원 이하인 청년: 0원 처리
  const youthSmall = calculateEarnedIncomeDeduction(500_000, 'youth');
  assert.equal(youthSmall.generalEvaluated, 0);
  assert.equal(youthSmall.medicalEvaluated, 0);

  // 3. 65세 이상 노인, 등록장애인: 월 1,200,000원
  // 20만원 공제 -> 1,000,000원. 그 중 30% 추가 공제 -> 700,000원 (전 급여 공통)
  const seniorResult = calculateEarnedIncomeDeduction(1_200_000, 'senior_disabled');
  assert.equal(seniorResult.generalEvaluated, 700_000);
  assert.equal(seniorResult.medicalEvaluated, 700_000);

  // 4. 장애인 직업재활사업 참여자: 월 1,200,000원
  // 20만원 공제 -> 1,000,000원. 그 중 50% 추가 공제 -> 500,000원 (전 급여 공통)
  const rehabResult = calculateEarnedIncomeDeduction(1_200_000, 'vocational');
  assert.equal(rehabResult.generalEvaluated, 500_000);
  assert.equal(rehabResult.medicalEvaluated, 500_000);
});

test('주거용재산 한도 초과분 일반재산 이관 및 임차보증금 0.95 보정계수 검증', () => {
  const inputs = createDefaultInputs();
  inputs.region = 'seoul'; // 서울 주거용 한도 1억 7,200만 원, 기본재산액 9,900만 원
  inputs.housingProperty.ownHomeValue = 200_000_000; // 2억 원
  inputs.housingProperty.depositValue = 0;

  const breakdown = calculatePropertyConversion(inputs, 'seoul', false);
  // 한도 1억 7,200만 원 인정, 초과분 2,800만 원 일반재산으로 이관
  assert.equal(breakdown.recognizedHousingProperty, 172_000_000);
  assert.equal(breakdown.overflowToGeneralProperty, 28_000_000);
  assert.equal(breakdown.totalGeneralPropertyWithOverflow, 28_000_000);

  // 보증금 0.95 보정계수 테스트
  inputs.housingProperty.ownHomeValue = 0;
  inputs.housingProperty.depositValue = 100_000_000;
  inputs.housingProperty.applyDepositFactor = true;

  const depositBreakdown = calculatePropertyConversion(inputs, 'seoul', false);
  assert.equal(depositBreakdown.rawHousingTotal, 95_000_000);
});

test('기본재산액 및 부채의 순차 차감 [주거용 -> 일반 -> 금융] 및 자동차 차감 배제 검증', () => {
  const inputs = createDefaultInputs();
  inputs.region = 'other'; // 기타지역 기본재산액 5,300만 원
  inputs.housingProperty.ownHomeValue = 40_000_000; // 주거용 4,000만 원
  inputs.generalProperty.landValue = 30_000_000; // 일반 3,000만 원
  inputs.financialProperty.depositAndSavings = 25_000_000; // 금융 2,500만 원 (500만 공제 시 2,000만 원)
  inputs.financialProperty.applyLivingReserveDeduction = true;
  inputs.debt.financialLoan = 10_000_000; // 부채 1,000만 원
  // 총 차감 풀 = 기본재산 5,300만 + 부채 1,000만 = 6,300만 원
  // 순차 차감:
  // 1. 주거용 4,000만 원 전액 차감 -> 잔여 주거용 = 0원 (남은 차감 풀 = 2,300만 원)
  // 2. 일반재산 3,000만 중 2,300만 차감 -> 잔여 일반재산 = 7,000,000원 (남은 차감 풀 = 0원)
  // 3. 금융재산 순 2,000만 차감액 0원 -> 잔여 금융재산 = 20,000,000원
  // 4. 자동차: 일반 승용차 500만원 등록 시 차감 없이 100% 반영
  inputs.cars = [
    { id: 'c1', name: '승용차', value: 5_000_000, type: 'general' },
  ];

  const breakdown = calculatePropertyConversion(inputs, 'other', false);
  assert.equal(breakdown.totalDeductionPool, 63_000_000);
  assert.equal(breakdown.housingDeductedAmount, 40_000_000);
  assert.equal(breakdown.finalHousingProperty, 0);
  assert.equal(breakdown.generalDeductedAmount, 23_000_000);
  assert.equal(breakdown.finalGeneralProperty, 7_000_000);
  assert.equal(breakdown.financialDeductedAmount, 0);
  assert.equal(breakdown.finalFinancialProperty, 20_000_000);

  // 환산액 검증:
  // 일반재산: 7,000,000 * 0.0417 = 291,900원
  // 금융재산: 20,000,000 * 0.0626 = 1,252,000원
  // 자동차: 5,000,000 * 1.0 = 5,000,000원
  assert.equal(breakdown.generalConvertedMonthly, Math.round(7_000_000 * 0.0417));
  assert.equal(breakdown.financialConvertedMonthly, Math.round(20_000_000 * 0.0626));
  assert.equal(breakdown.carConvertedMonthly, 5_000_000);
});

test('근로무능력자 특례 가구 기본재산액 적용 검증', () => {
  const inputs = createDefaultInputs();
  inputs.region = 'seoul';
  inputs.isWorkIncapableSpecial = true; // 특례 체크

  const breakdown = calculatePropertyConversion(inputs, 'seoul', true);
  // 서울 특례 기본재산액 1억 4,300만 원
  assert.equal(breakdown.basicPropertyDeduction, 143_000_000);
});

test('부양의무자 기준에 따른 생계·의료급여 판정 로직 검증', () => {
  const inputs = createDefaultInputs();
  inputs.householdMembers = 1; // 2026 1인가구 중위소득 2,564,238원
  // 생계급여 32% 기준선 = 820,556원
  // 의료급여 40% 기준선 = 1,025,695원
  inputs.earners[0].monthlyIncome = 500_000; // 일반수급자 30% 공제 -> 350,000원 (의료는 500,000원)

  // 케이스 1: 정상 적격
  let result = calculateWelfare(inputs);
  assert.equal(result.livelihoodBenefit.isEligible, true);
  assert.equal(result.medicalBenefit.isEligible, true);
  // 생계급여 예상 지급액 = 820,556 - 350,000 = 470,556원
  assert.equal(result.livelihoodBenefit.expectedLivelihoodGrant, 820_556 - 350_000);

  // 케이스 2: 생계급여 부양의무자 고소득(연 1.3억 초과) 예외 체크 시 생계급여 부적합
  inputs.supportObligation.livelihoodExceedsCriteria = true;
  result = calculateWelfare(inputs);
  assert.equal(result.livelihoodBenefit.isEligible, false);
  assert.equal(result.livelihoodBenefit.expectedLivelihoodGrant, 0);

  // 케이스 3: 의료급여 부양능력 있음 선택 시 의료급여 부적합
  inputs.supportObligation.medicalSupportStatus = 'has_ability';
  result = calculateWelfare(inputs);
  assert.equal(result.medicalBenefit.isEligible, false);

  // 케이스 4: 의료급여 부양능력 미약 선택 시 부양비 합산
  inputs.supportObligation.medicalSupportStatus = 'weak_ability';
  inputs.supportObligation.supportPaymentAmount = 600_000;
  result = calculateWelfare(inputs);
  // 의료급여 소득인정액 = 500,000 + 600,000 = 1,100,000원 > 1,025,695원 이므로 소득초과 부적합
  assert.equal(result.recognizedIncomeMedical, 1_100_000);
  assert.equal(result.medicalBenefit.isEligible, false);
});

test('재산 공제 항목 검증: 장기저축 공제 및 처분재산 자연감소분 공제', () => {
  const inputs = createDefaultInputs();
  inputs.region = 'other'; // 기본재산액 5,300만 원
  inputs.financialProperty.depositAndSavings = 15_000_000; // 금융재산 1,500만 원
  inputs.financialProperty.applyLivingReserveDeduction = true; // 생활준비금 500만 공제 -> 잔여 1,000만 원
  inputs.propertyDeductions.longTermSavings = 6_000_000; // 청년내일저축 600만 원 공제
  // 순 금융재산 = 1,500만 - 500만 - 600만 = 4,000,000원

  inputs.generalProperty.landValue = 60_000_000; // 일반재산 토지 6,000만 원
  inputs.propertyDeductions.naturalDecline = 20_000_000; // 주택 처분대금 중 생활비/의료비 자연감소분 2,000만 원
  // 총 차감 풀 = 기본재산 5,300만 + 부채 0 + 자연감소분 2,000만 = 7,300만 원
  // 순차 차감:
  // 1. 주거용: 0원
  // 2. 일반재산 6,000만 전액 차감 -> 잔여 일반재산 0원 (남은 차감 풀: 1,300만 원)
  // 3. 금융재산 순 400만 전액 차감 -> 잔여 금융재산 0원 (남은 차감 풀: 900만 원)
  // 따라서 재산환산액은 0원이 되어야 함!

  const breakdown = calculatePropertyConversion(inputs, 'other', false);
  assert.equal(breakdown.longTermSavingsDeduction, 6_000_000);
  assert.equal(breakdown.netFinancialProperty, 4_000_000);
  assert.equal(breakdown.naturalDeclineDeduction, 20_000_000);
  assert.equal(breakdown.totalDeductionPool, 73_000_000);
  assert.equal(breakdown.finalGeneralProperty, 0);
  assert.equal(breakdown.finalFinancialProperty, 0);
  assert.equal(breakdown.totalPropertyConvertedMonthly, 0);
});

test('급여별 및 가구원수별 선정기준 수정 검증 (비율 변경 및 직접 금액 입력)', () => {
  const inputs = createDefaultInputs();
  inputs.householdMembers = 1;
  // 기본 중위소득 1인 2,564,238원

  // 1. 비율 변경 테스트: 생계급여를 32%에서 35%로 변경
  inputs.criteriaConfig.ratios.livelihood = 35;
  let result = calculateWelfare(inputs);
  const expectedLivelihood35 = Math.round(2_564_238 * 0.35);
  assert.equal(result.livelihoodBenefit.criterionAmount, expectedLivelihood35);
  assert.equal(result.livelihoodBenefit.ratioPercent, 35);

  // 2. 가구원수별 직접 금액 입력 모드 테스트:
  // 1인 가구 생계급여를 950,000원으로 직접 지정
  // 1인 가구 의료급여를 1,100,000원으로 직접 지정
  inputs.criteriaConfig.useCustomAmounts = true;
  inputs.criteriaConfig.customBenefitAmounts.livelihood[1] = 950_000;
  inputs.criteriaConfig.customBenefitAmounts.medical[1] = 1_100_000;

  result = calculateWelfare(inputs);
  assert.equal(result.livelihoodBenefit.criterionAmount, 950_000);
  assert.equal(result.medicalBenefit.criterionAmount, 1_100_000);
});

test('한글 금액 포맷팅 유틸리티 검증', () => {
  assert.equal(formatKoreanWon(0), '0원');
  assert.equal(formatKoreanWon(172_000_000), '1억 7,200만 원');
  assert.equal(formatKoreanWon(500_000), '50만 원');
  assert.equal(formatKoreanWon(10_000_000), '1,000만 원');
});

test('가구특성별 소득공제 검증: 등록장애인 공적급여(장애인연금·수당) 100% 가구특성 지출비용 공제', () => {
  const inputs = createDefaultInputs();
  inputs.householdMembers = 1;

  // 1. 등록장애인 가구원이 장애인연금 424,000원을 받는 경우
  inputs.earners = [
    {
      id: 'e1',
      name: '본인(장애인)',
      category: 'disabled',
      monthlyIncome: 0,
      disabilityBenefit: 424_000,
    },
  ];
  inputs.expenseDeductions.chronicIllnessMedical = 100_000; // 만성질환 의료비 100,000원

  const result = calculateWelfare(inputs);

  // 실제소득에 424,000원이 잡힘
  assert.equal(result.incomeBreakdown.disabilityBenefitTotal, 424_000);
  assert.equal(result.incomeBreakdown.totalActualIncome, 424_000);

  // 가구특성별 지출비용: 의료비 10만 + 장애인연금 42.4만 = 524,000원
  assert.equal(result.incomeBreakdown.chronicMedicalDeduction, 100_000);
  assert.equal(result.incomeBreakdown.disabilityBenefitDeduction, 424_000);
  assert.equal(result.incomeBreakdown.expenseDeductionTotal, 524_000);

  // 소득평가액: 실제소득(42.4만) - 가구특성별비용(52.4만) = 음수이므로 0원
  assert.equal(result.incomeBreakdown.finalIncomeGeneral, 0);
  assert.equal(result.incomeBreakdown.finalIncomeMedical, 0);

  // 2. 근로소득이 있는 등록장애인: 월 1,000,000원 근로 + 장애인연금 400,000원
  inputs.earners[0].monthlyIncome = 1_000_000;
  inputs.earners[0].disabilityBenefit = 400_000;
  inputs.expenseDeductions.chronicIllnessMedical = 0;

  const resultWithEarned = calculateWelfare(inputs);
  // 근로소득평가액 = (100만 - 20만) * 0.7 = 560,000원
  assert.equal(resultWithEarned.incomeBreakdown.earnedGeneralEvaluated, 560_000);
  // 장애인연금 40만 원은 전액 공제되어 소득평가액은 정확히 근로소득평가액인 560,000원만 남아야 함!
  assert.equal(resultWithEarned.incomeBreakdown.finalIncomeGeneral, 560_000);
  // 의료급여 역시 등록장애인은 20만원+30% 공제가 동일하게 적용되므로 560,000원
  assert.equal(resultWithEarned.incomeBreakdown.finalIncomeMedical, 560_000);
});

test('차상위본인부담경감 검증: 완화된 기본재산공제(경기 1억 3,500만원)로 기초의료 탈락자가 차상위 적격 판정되는 사례', () => {
  const inputs = createDefaultInputs();
  inputs.householdMembers = 1;
  inputs.region = 'gyeonggi'; // 경기: 기초의료 기본재산 8,000만 원, 차상위본인부담경감 기본재산 1억 3,500만 원!
  inputs.housingProperty.ownHomeValue = 110_000_000; // 1억 1,000만 원 주택
  inputs.nearPovertyTarget.targetType = 'chronic'; // 고혈압 등 만성질환자
  inputs.nearPovertyTarget.isRegisteredDisabled = false;

  const result = calculateWelfare(inputs);

  // 1. 기초의료급여:
  // 재산 1.1억 - 기본재산 8,000만 = 3,000만 원 잔여 주거용재산
  // 월 소득환산액 = 30,000,000 * 1.04% = 312,000원
  assert.equal(result.propertyBreakdown.basicPropertyDeduction, 80_000_000);
  assert.equal(result.propertyBreakdown.finalHousingProperty, 30_000_000);
  assert.equal(result.propertyBreakdown.housingConvertedMonthly, 312_000);

  // 2. 차상위본인부담경감:
  // 재산 1.1억 - 차상위 기본재산 1억 3,500만 = 차감 후 0원!
  // 월 소득환산액 = 0원!
  assert.equal(result.nearPovertyResult.propertyBreakdown.basicPropertyDeduction, 135_000_000);
  assert.equal(result.nearPovertyResult.propertyBreakdown.finalHousingProperty, 0);
  assert.equal(result.nearPovertyResult.propertyBreakdown.totalPropertyConvertedMonthly, 0);
  assert.equal(result.nearPovertyResult.recognizedIncome, 0);

  // 차상위 중위 50% 기준 (1,282,119원) 내에 있으므로 적격!
  assert.equal(result.nearPovertyResult.isIncomeEligible, true);
  assert.equal(result.nearPovertyResult.targetBenefitCode, 'E'); // 만성질환자 E코드
  assert.equal(result.nearPovertyResult.isFinalEligible, true);
});

test('차상위본인부담경감 근로소득 공제 검증: 일반근로자 30% 공제 적용', () => {
  const inputs = createDefaultInputs();
  inputs.householdMembers = 1;
  inputs.earners = [
    {
      id: 'e1',
      name: '본인(일반)',
      category: 'general',
      monthlyIncome: 1_500_000, // 일반근로 월 150만원
    },
  ];
  inputs.nearPovertyTarget.targetType = 'chronic';

  const result = calculateWelfare(inputs);

  // 기초의료급여는 일반근로 공제 0% -> 소득평가액 1,500,000원 > 의료급여 40% 기준선(1,025,695원) 탈락!
  assert.equal(result.incomeBreakdown.finalIncomeMedical, 1_500_000);
  assert.equal(result.medicalBenefit.isEligible, false);

  // 차상위본인부담경감은 일반근로 30% 공제 적용 -> 150만 * 0.7 = 1,050,000원!
  // 1인 중위 50% 기준액 (1,282,119원) 미만이므로 소득 기준 적격!
  assert.equal(result.nearPovertyResult.incomeBreakdown.finalIncomeGeneral, 1_050_000);
  assert.equal(result.nearPovertyResult.recognizedIncome, 1_050_000);
  assert.equal(result.nearPovertyResult.isIncomeEligible, true);
});

test('차상위본인부담경감 부양의무자 기준 판정: 120% 기준표 및 교육비·월세 공제 반영', () => {
  const inputs = createDefaultInputs();
  inputs.householdMembers = 1; // 대상자 1명 (부양능력 기준표: 1인 대상자 120%)
  inputs.nearPovertyTarget.targetType = 'rare_severe'; // C코드 희귀질환

  // 부양의무자 가구원 4인
  // 2026년 4인 기준 1인 대상자 부양능력 판정기준액 = 7,793,686원
  inputs.nearPovertyObligation.hasObligation = true;
  inputs.nearPovertyObligation.targetPersonCount = 1;
  inputs.nearPovertyObligation.familyCount = 4;
  inputs.nearPovertyObligation.monthlyIncome = 8_000_000; // 월 800만원 소득
  inputs.nearPovertyObligation.deductionEducation = 500_000; // 고등자녀 등 교육비 공제
  // 순소득 = 800만 - 50만 = 7,500,000원 < 7,793,686원이므로 '부양능력 없음(적격)' 판정!

  const result = calculateWelfare(inputs);
  assert.equal(result.nearPovertyResult.supportObligationCriterion, 7_793_686);
  assert.equal(result.nearPovertyResult.netObligationIncome, 7_500_000);
  assert.equal(result.nearPovertyResult.isSupportEligible, true);
  assert.equal(result.nearPovertyResult.targetBenefitCode, 'C'); // 희귀중증 C
  assert.equal(result.nearPovertyResult.isFinalEligible, true);

  // 만약 소득이 900만원이고 공제가 없다면 부양능력 있음 -> 부적합
  inputs.nearPovertyObligation.monthlyIncome = 9_000_000;
  inputs.nearPovertyObligation.deductionEducation = 0;
  const resultIneligible = calculateWelfare(inputs);
  assert.equal(resultIneligible.nearPovertyResult.isSupportEligible, false);
  assert.equal(resultIneligible.nearPovertyResult.isFinalEligible, false);
});

test('차상위본인부담경감 등록장애인 F코드 부여 및 18세 미만 아동 검증', () => {
  const inputs = createDefaultInputs();
  inputs.householdMembers = 2;

  // 1. 만성질환자인데 등록장애인인 경우 -> 구분코드 F (장애인의료비 지원)
  inputs.nearPovertyTarget.targetType = 'chronic';
  inputs.nearPovertyTarget.isRegisteredDisabled = true;
  let result = calculateWelfare(inputs);
  assert.equal(result.nearPovertyResult.targetBenefitCode, 'F');

  // 2. 18세 미만 아동인 경우 -> 구분코드 E (등록장애인이 아닐 때)
  inputs.nearPovertyTarget.targetType = 'minor';
  inputs.nearPovertyTarget.isRegisteredDisabled = false;
  result = calculateWelfare(inputs);
  assert.equal(result.nearPovertyResult.targetBenefitCode, 'E');

  // 3. 18세 미만 등록장애아동 -> 구분코드 F
  inputs.nearPovertyTarget.isRegisteredDisabled = true;
  result = calculateWelfare(inputs);
  assert.equal(result.nearPovertyResult.targetBenefitCode, 'F');
});

test('차상위본인부담경감 핵심 지침(p.26): 사적이전소득 전액 제외 및 추가 지출요인 공제 검증', () => {
  const inputs = createDefaultInputs();
  inputs.householdMembers = 1;
  inputs.transferIncome.publicTransfer = 800_000; // 국민연금 80만원
  inputs.transferIncome.privateTransfer = 400_000; // 자녀 정기 용돈 40만원
  inputs.expenseDeductions.otherAdditionalDeduction = 50_000; // 국민연금 보험료 본인부담금 75% 공제 5만원

  const result = calculateWelfare(inputs);

  // 1. 기초생활보장(의료급여)은 사적이전소득 40만원이 전액 합산됨:
  // 소득평가액 = 80만 + 40만 - 5만 = 1,150,000원 > 의료급여 40% 기준(1,025,695원) -> 탈락!
  assert.equal(result.incomeBreakdown.finalIncomeMedical, 1_150_000);
  assert.equal(result.medicalBenefit.isEligible, false);

  // 2. 차상위본인부담경감은 사적이전소득 40만원이 실제소득 산정에서 전액 제외됨(0원):
  // 소득평가액 = 80만 + 0원 - 5만 = 750,000원 <= 중위 50% 기준(1,282,119원) -> 적격!
  assert.equal(result.nearPovertyResult.excludedPrivateTransfer, 400_000);
  assert.equal(result.nearPovertyResult.incomeBreakdown.finalIncomeGeneral, 750_000);
  assert.equal(result.nearPovertyResult.recognizedIncome, 750_000);
  assert.equal(result.nearPovertyResult.isIncomeEligible, true);
  assert.equal(result.nearPovertyResult.isFinalEligible, true);
});

test('차상위본인부담경감 부양의무자 중증장애인 가구원수 추가 산정(지침 p.40) 및 진단서·산정특례 검증', () => {
  const inputs = createDefaultInputs();
  inputs.householdMembers = 1;

  // 부양의무자 가구원 2인이나, 그 중 중증장애인이 1명 있는 경우 -> 유효 가구원수 3인으로 상향!
  // 2인 세대 기준액(5,039,150원) -> 3인 세대 기준액(6,430,843원) 적용
  inputs.nearPovertyObligation.hasObligation = true;
  inputs.nearPovertyObligation.familyCount = 2;
  inputs.nearPovertyObligation.severeDisabledCount = 1;
  inputs.nearPovertyObligation.monthlyIncome = 5_800_000; // 2인 기준(503.9만)은 초과하지만 3인 기준(643.0만) 미만!

  let result = calculateWelfare(inputs);
  assert.equal(result.nearPovertyResult.effectiveFamilyCount, 3);
  assert.equal(result.nearPovertyResult.supportObligationCriterion, 6_430_843);
  assert.equal(result.nearPovertyResult.isSupportEligible, true);

  // 만성질환자(chronic)인데 진단서 미구비 시 부적합 판정 검증
  inputs.nearPovertyTarget.targetType = 'chronic';
  inputs.nearPovertyTarget.hasMedicalCertificate = false;
  result = calculateWelfare(inputs);
  assert.equal(result.nearPovertyResult.isTargetEligible, false);
  assert.equal(result.nearPovertyResult.isFinalEligible, false);

  // 희귀중증질환자(rare_severe)인데 산정특례 미등록 시 부적합 판정 검증
  inputs.nearPovertyTarget.targetType = 'rare_severe';
  inputs.nearPovertyTarget.isSanctuaryRegistered = false;
  result = calculateWelfare(inputs);
  assert.equal(result.nearPovertyResult.isTargetEligible, false);
  assert.equal(result.nearPovertyResult.isFinalEligible, false);
});

test('초기 기본 입력값 검증: 초기 거주지역이 광역·세종·창원(metro)으로 설정됨', () => {
  const defaultInputs = createDefaultInputs();
  assert.equal(defaultInputs.region, 'metro');
});



