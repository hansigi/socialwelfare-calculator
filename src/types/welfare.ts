/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RegionKey = 'seoul' | 'gyeonggi' | 'metro' | 'other';

export interface RegionConfig {
  key: RegionKey;
  name: string;
  basicPropertyDeduction: number; // 일반 기본재산액 (원)
  specialPropertyDeduction: number; // 근로무능력자 특례 기본재산액 (원)
  housingPropertyLimit: number; // 주거용재산 한도액 (원)
}

export const REGION_CONFIGS: Record<RegionKey, RegionConfig> = {
  seoul: {
    key: 'seoul',
    name: '서울',
    basicPropertyDeduction: 99_000_000,
    specialPropertyDeduction: 143_000_000,
    housingPropertyLimit: 172_000_000,
  },
  gyeonggi: {
    key: 'gyeonggi',
    name: '경기',
    basicPropertyDeduction: 80_000_000,
    specialPropertyDeduction: 125_000_000,
    housingPropertyLimit: 151_000_000,
  },
  metro: {
    key: 'metro',
    name: '광역·세종·창원',
    basicPropertyDeduction: 77_000_000,
    specialPropertyDeduction: 120_000_000,
    housingPropertyLimit: 146_000_000,
  },
  other: {
    key: 'other',
    name: '기타 지역',
    basicPropertyDeduction: 53_000_000,
    specialPropertyDeduction: 91_000_000,
    housingPropertyLimit: 112_000_000,
  },
};

// 2026년 기준 중위소득 기본값
export const DEFAULT_2026_MEDIAN_INCOME: Record<number, number> = {
  1: 2_564_238,
  2: 4_199_292,
  3: 5_359_036,
  4: 6_494_738,
  5: 7_556_719,
  6: 8_555_952,
  7: 9_515_150,
};

export const MEDIAN_INCOME_EXTRA_PER_PERSON = 959_198;

export type BenefitType = 'livelihood' | 'medical' | 'housing' | 'education';

export const BENEFIT_NAMES: Record<BenefitType, string> = {
  livelihood: '생계급여',
  medical: '의료급여',
  housing: '주거급여',
  education: '교육급여',
};

export const DEFAULT_BENEFIT_RATIOS: Record<BenefitType, number> = {
  livelihood: 32,
  medical: 40,
  housing: 48,
  education: 50,
};

// ==========================================
// 2026년 차상위 본인부담경감대상자 지원사업 전용 기준
// ==========================================

// 차상위본인부담경감 지역별 기본재산공제액 (지침 p.35)
export const NEAR_POVERTY_BASIC_PROPERTY_DEDUCTION: Record<RegionKey, number> = {
  seoul: 135_000_000, // 서울 1억 3,500만 원
  gyeonggi: 135_000_000, // 경기 1억 3,500만 원
  metro: 135_000_000, // 광역·세종·창원 1억 3,500만 원
  other: 85_000_000, // 기타 8,500만 원
};

// 2026년 기준 중위소득 50% 기준표 (지침 p.3, p.12)
export const NEAR_POVERTY_2026_MEDIAN_50: Record<number, number> = {
  1: 1_282_119,
  2: 2_099_646,
  3: 2_679_518,
  4: 3_247_369,
  5: 3_778_360,
  6: 4_277_976,
  7: 4_757_575,
};
export const NEAR_POVERTY_EXTRA_PER_PERSON_50 = 479_599; // 8인이상 1인당 가산액

// 2026년도 부양의무자의 부양능력 판정기준표 (지침 p.3, p.47)
// [차상위 대상자수(1인~7인)][부양의무자 세대원수(1인~7인)]
export const NEAR_POVERTY_OBLIGATION_TABLE_2026: Record<number, Record<number, number>> = {
  1: { // 120%
    1: 3_077_086,
    2: 5_039_150,
    3: 6_430_843,
    4: 7_793_686,
    5: 9_068_063,
    6: 10_267_142,
    7: 11_418_180,
  },
  2: { // 130%
    1: 3_333_509,
    2: 5_459_080,
    3: 6_966_747,
    4: 8_443_159,
    5: 9_823_735,
    6: 11_122_738,
    7: 12_369_695,
  },
  3: { // 140%
    1: 3_589_933,
    2: 5_879_009,
    3: 7_502_650,
    4: 9_092_633,
    5: 10_579_407,
    6: 11_978_333,
    7: 13_321_210,
  },
  4: { // 150%
    1: 3_846_357,
    2: 6_298_938,
    3: 8_038_554,
    4: 9_742_107,
    5: 11_335_079,
    6: 12_833_928,
    7: 14_272_725,
  },
  5: { // 160%
    1: 4_102_781,
    2: 6_718_867,
    3: 8_574_458,
    4: 10_391_581,
    5: 12_090_750,
    6: 13_689_523,
    7: 15_224_240,
  },
  6: { // 170%
    1: 4_359_205,
    2: 7_138_796,
    3: 9_110_361,
    4: 11_041_055,
    5: 12_846_422,
    6: 14_545_118,
    7: 16_175_755,
  },
  7: { // 180%
    1: 4_615_628,
    2: 7_558_726,
    3: 9_646_265,
    4: 11_690_528,
    5: 13_602_094,
    6: 15_400_714,
    7: 17_127_270,
  },
};

// 13개 고시 만성질환 및 대표 상병코드 목록 (지침 p.64)
export interface ChronicDiseaseInfo {
  code: string;
  name: string;
  icdRange: string;
}

export const CHRONIC_DISEASE_LIST_13: ChronicDiseaseInfo[] = [
  { code: 'HYPERTENSION', name: '고혈압', icdRange: 'I10 ~ I15' },
  { code: 'DIABETES', name: '당뇨병', icdRange: 'E10 ~ E14' },
  { code: 'ARTHRITIS', name: '관절염', icdRange: 'M00 ~ M14' },
  { code: 'HEART', name: '심장질환', icdRange: 'I05~I09, I20~I27, I30~I52' },
  { code: 'CEREBROVASCULAR', name: '뇌혈관질환', icdRange: 'I60 ~ I69' },
  { code: 'THYROID', name: '갑상선의 장애', icdRange: 'E00 ~ E07' },
  { code: 'CHRONIC_LIVER', name: '만성간질환(만성바이러스간염 포함)', icdRange: 'B18, B19, K70~K77' },
  { code: 'COPD', name: '기타 만성폐쇄성폐질환', icdRange: 'J44' },
  { code: 'TB', name: '호흡기결핵', icdRange: 'A15 ~ A16, A19' },
  { code: 'MALIGNANT', name: '악성 신생물 (암 등)', icdRange: 'C00~D09, D37~D38' },
  { code: 'PSYCHIATRIC', name: '정신장애, 행동장애(간질포함)', icdRange: 'F00~F99, G40~G41' },
  { code: 'NEUROLOGICAL', name: '신경계질환', icdRange: 'G00~G37, G43~G83' },
  { code: 'BRAIN_INJURY', name: '두개내손상', icdRange: 'S06' },
];

// 부양의무자 가구원 자녀 교육비 표준공제액 (지침 p.44)
export const OBLIGATION_EDUCATION_STANDARD = {
  elementary: 195_000, // 초등 19.5만
  middle: 205_000, // 중학 20.5만
  high: 231_000, // 고등 23.1만
};

// 부양의무자 가구 월세 공제 상한액 (지침 p.46)
export const OBLIGATION_RENT_LIMIT: Record<number, Record<number, number>> = {
  1: { 1: 369_000, 2: 414_000, 3: 492_000, 4: 571_000, 5: 591_000, 6: 699_000, 7: 699_000 }, // 1급지: 서울
  2: { 1: 300_000, 2: 335_000, 3: 401_000, 4: 463_000, 5: 479_000, 6: 568_000, 7: 568_000 }, // 2급지: 경기·인천
  3: { 1: 247_000, 2: 275_000, 3: 327_000, 4: 381_000, 5: 394_000, 6: 463_000, 7: 463_000 }, // 3급지: 광역·세종·특례시
  4: { 1: 212_000, 2: 238_000, 3: 283_000, 4: 329_000, 5: 340_000, 6: 402_000, 7: 402_000 }, // 4급지: 그 외 지역
};

export interface BenefitCriteriaConfig {
  useCustomAmounts: boolean; // false: 중위소득*비율 자동연동, true: 가구원수별 금액 직접 적용
  ratios: Record<BenefitType, number>;
  customMedianIncomeTable: Record<number, number>;
  extraPerPerson: number; // 8인이상 1인당 가산액
  customBenefitAmounts: Record<BenefitType, Record<number, number>>; // 1~7인가구 급여별 금액
  extraPerPersonByBenefit: Record<BenefitType, number>; // 8인이상 1인당 가산액
}

export function createDefaultCriteriaConfig(): BenefitCriteriaConfig {
  const customAmounts: Record<BenefitType, Record<number, number>> = {
    livelihood: {},
    medical: {},
    housing: {},
    education: {},
  };

  const ratios = { ...DEFAULT_BENEFIT_RATIOS };
  for (let m = 1; m <= 7; m++) {
    const med = DEFAULT_2026_MEDIAN_INCOME[m];
    customAmounts.livelihood[m] = Math.round(med * (ratios.livelihood / 100));
    customAmounts.medical[m] = Math.round(med * (ratios.medical / 100));
    customAmounts.housing[m] = Math.round(med * (ratios.housing / 100));
    customAmounts.education[m] = Math.round(med * (ratios.education / 100));
  }

  return {
    useCustomAmounts: false,
    ratios,
    customMedianIncomeTable: { ...DEFAULT_2026_MEDIAN_INCOME },
    extraPerPerson: MEDIAN_INCOME_EXTRA_PER_PERSON,
    customBenefitAmounts: customAmounts,
    extraPerPersonByBenefit: {
      livelihood: Math.round(MEDIAN_INCOME_EXTRA_PER_PERSON * (ratios.livelihood / 100)),
      medical: Math.round(MEDIAN_INCOME_EXTRA_PER_PERSON * (ratios.medical / 100)),
      housing: Math.round(MEDIAN_INCOME_EXTRA_PER_PERSON * (ratios.housing / 100)),
      education: Math.round(MEDIAN_INCOME_EXTRA_PER_PERSON * (ratios.education / 100)),
    },
  };
}

export type WorkerCategory =
  | 'general' // 일반 수급(권)자: 생계주거교육 30% 공제, 의료급여 0% 공제
  | 'youth' // 청년(34세 이하) 및 대학생: 60만원 공제 후 30% 추가 공제 (전 급여 공통)
  | 'disabled' // 등록장애인: 20만원 공제 후 30% 추가 공제 + 공적급여(장애인연금·수당) 가구특성별 지출비용 100% 공제
  | 'senior' // 65세 이상 노인: 20만원 공제 후 30% 추가 공제
  | 'senior_disabled' // 65세 이상 노인, 등록장애인, 북한이탈주민 (기존 호환)
  | 'vocational'; // 장애인 직업재활사업 참여자: 20만원 공제 후 50% 추가 공제 + 장애인 공적급여 100% 공제

export interface EarnerItem {
  id: string;
  name: string; // 예: 본인, 배우자, 자녀
  category: WorkerCategory;
  monthlyIncome: number; // 월 근로/사업소득 (원)
  disabilityBenefit?: number; // 공적급여 (장애인연금, 장애수당, 장애아동수당 등 월 수령액)
}

export type CarExemptionType =
  | 'general' // 일반 승용차: 100% 환산
  | 'general_property' // 생업용·장애인용 등 일반재산 환산: 4.17%
  | 'excluded'; // 재산 산정 제외: 0%

export interface CarItem {
  id: string;
  name: string;
  value: number;
  type: CarExemptionType;
}

export type MedicalSupportObligation =
  | 'none_or_abolished' // 부양의무자 없음 또는 기준 폐지 대상
  | 'no_ability' // 부양능력 없음 (적격)
  | 'weak_ability' // 부양능력 미약 (부양비 부과)
  | 'has_ability'; // 부양능력 있음 (부적격)

export interface WelfareInputs {
  // 1. 기본 정보
  householdMembers: number;
  region: RegionKey;
  isWorkIncapableSpecial: boolean; // 근로무능력자로만 구성된 가구 여부
  customMedianIncomeTable: Record<number, number>;
  criteriaConfig: BenefitCriteriaConfig; // 생계·의료·주거·교육 가구원수별 선정기준 설정

  // 2. 소득 사항
  earners: EarnerItem[];
  propertyIncome: {
    rental: number; // 임대소득
    interest: number; // 이자소득
    pension: number; // 개인연금소득
  };
  transferIncome: {
    publicTransfer: number; // 공적이전소득 (국민연금, 기초연금 등)
    privateTransfer: number; // 사적이전소득
  };
  expenseDeductions: {
    chronicIllnessMedical: number; // 만성질환 의료비 지출액 등 가구특성별 지출비용
    otherAdditionalDeduction?: number; // 국민연금 본인부담 보험료(75%), 대학생 학비 등 그 밖의 추가 지출요인 (지침 p.19)
  };

  // 3. 재산 사항
  housingProperty: {
    ownHomeValue: number; // 자가 주택 가액
    depositValue: number; // 전·월세 임차보증금
    applyDepositFactor: boolean; // 임차보증금 0.95 보정계수 적용 여부
  };
  generalProperty: {
    nonResHomeValue: number; // 일반 주택(비거주)
    buildingValue: number; // 건물(상가 등)
    landValue: number; // 토지(시가표준액)
    otherGeneralValue: number; // 기타 일반재산
  };
  financialProperty: {
    depositAndSavings: number; // 예금, 적금, 주식, 보험해약환급금 등
    applyLivingReserveDeduction: boolean; // 생활준비금 500만원 기본 공제 여부
  };
  cars: CarItem[];
  debt: {
    financialLoan: number; // 금융기관 대출금
    rentalDepositLiability: number; // 임대보증금 (1채 한함)
  };
  propertyDeductions: {
    longTermSavings: number; // 장기저축 공제액 (희망저축계좌, 청년내일저축계좌 등)
    naturalDecline: number; // 처분재산 자연감소분 (생계비, 의료비, 부채상환 등 소비 인정액)
  };

  // 4. 부양의무자 기준
  supportObligation: {
    // 생계급여 부양의무자 고소득/고재산 여부
    livelihoodExceedsCriteria: boolean; // 연소득 1.3억(월 1,084만) 또는 일반재산 12억 초과자 여부
    // 의료급여 부양의무자 기준
    medicalSupportStatus: MedicalSupportObligation;
    supportPaymentAmount: number; // 부양능력 미약 시 부양비 (월)
  };

  // 5. 차상위 본인부담경감대상자 지원사업 전용 입력사항
  nearPovertyTarget: NearPovertyTargetInfo;
  nearPovertyObligation: NearPovertySupportObligation;
}

export type NearPovertyTargetType =
  | 'rare_severe' // C: 희귀질환, 중증난치질환·중증질환자 (산정특례 등록자)
  | 'chronic' // E: 만성질환자 (6개월 이상 치료 요함)
  | 'minor' // E: 18세 미만 아동
  | 'none'; // 대상자 없음

export type NearPovertyBenefitCode = 'C' | 'E' | 'F' | 'none';

export interface NearPovertyTargetInfo {
  targetType: NearPovertyTargetType;
  illnessCode?: string; // 13대 만성질환 코드 또는 기타 상병코드
  illnessName?: string; // 질환명
  isRegisteredDisabled: boolean; // 만성질환 또는 18세미만 아동 중 등록장애인 -> 구분코드 F 적용
  hasMedicalCertificate: boolean; // 진단서 제출 여부 (최근 3개월, 6개월 이상 치료 요함)
  isSanctuaryRegistered: boolean; // 건강보험 산정특례 등록 여부 (희귀/중증 C코드 필수 확인)
}

export interface NearPovertySupportObligation {
  hasObligation: boolean; // 부양의무자 존재 여부 (true: 있음, false: 없음(적격))
  familyCount: number; // 부양의무자의 세대원 수 (1~7인 이상)
  severeDisabledCount?: number; // 부양의무자 가구원 중 중증장애인 수 (지침 p.40: 해당 인원만큼 가구원수 추가 산정)
  monthlyIncome: number; // 부양의무자 월 실제소득 (근로, 사업 등)
  targetPersonCount: number; // 부양해야 하는 차상위 경감 대상자 수 (기본 1명)

  // 소득에서 차감하는 비용 (지침 p.44~46)
  deductionEducation: number; // 초중고자녀 교육비 표준공제 및 대학생 학비
  deductionRent: number; // 부양의무자 실거주 월세 공제액
  deductionMedical: number; // 3개월 이상 만성의료비 및 간병비
  deductionPension: number; // 국민연금 본인부담금 75%
  deductionDebt: number; // 신용회복위·캠코 채무변제액 등

  // 부양을 받을 수 없는 경우 (지침 p.37)
  cannotReceiveSupport: boolean;
  cannotReceiveReason?: 'military' | 'overseas' | 'prison' | 'missing' | 'family_break' | 'refusal';
}

export interface NearPovertyResult {
  criterionAmount: number; // 기준 중위소득 50% 기준액 (원)
  recognizedIncome: number; // 차상위 전용 소득인정액 (기본재산 1.35억/8500만 공제 적용)
  propertyBreakdown: PropertyBreakdown; // 차상위 재산환산 내역
  incomeBreakdown: IncomeBreakdown; // 차상위 소득평가 내역
  excludedPrivateTransfer: number; // 차상위 지침(p.26)에 따라 실제소득에서 제외된 사적이전소득

  // 소득 적합 여부
  isIncomeEligible: boolean;
  incomeDifference: number; // 50% 기준액 - 소득인정액

  // 부양의무자 판정
  isSupportEligible: boolean;
  effectiveFamilyCount: number; // 중증장애인 가구원수 추가 산정 반영된 유효 가구원수
  supportObligationCriterion: number; // 부양능력 판정기준액 (120%~180%)
  obligationActualIncome: number; // 부양의무자 실제소득
  obligationTotalDeduction: number; // 차감비용 합계
  netObligationIncome: number; // 차감 후 부양의무자 순소득
  supportIneligibilityReason?: string;

  // 대상자 요건 판정
  targetBenefitCode: NearPovertyBenefitCode;
  benefitCodeName: string;
  isTargetEligible: boolean;
  targetIneligibilityReason?: string;

  // 최종 판정 결과
  isFinalEligible: boolean;
  finalStatusMessage: string;

  // 기초수급(생계·의료) 연계 권고 분석
  linkageRecommendation: {
    needed: boolean; // 생계 또는 의료 탈락으로 연계 검토 대상인지
    reason: string; // 기초수급 탈락 사유 및 차상위 연계 이점 분석
    urgencyTip: string; // 90일 이내 소급신청 안내
  };
}

export interface IncomeBreakdown {
  rawEarnedTotal: number;
  earnedGeneralEvaluated: number; // 생계·주거·교육용 근로소득평가액
  earnedMedicalEvaluated: number; // 의료급여용 근로소득평가액
  propertyIncomeTotal: number;
  transferIncomeTotal: number;
  disabilityBenefitTotal: number; // 장애인 가구원 공적급여(장애인연금·수당 등) 합계
  totalActualIncome: number;
  chronicMedicalDeduction: number; // 만성질환 의료비 지출액
  disabilityBenefitDeduction: number; // 가구특성별 지출비용: 장애인연금·수당 공제액 (100% 전액 공제)
  expenseDeductionTotal: number; // 가구특성별 지출비용 총합 (만성질환 + 장애인 공적급여)
  finalIncomeGeneral: number; // 소득평가액 (생계·주거·교육)
  finalIncomeMedical: number; // 소득평가액 (의료급여)
}

export interface PropertyBreakdown {
  rawHousingTotal: number;
  housingLimit: number;
  recognizedHousingProperty: number; // 한도 내 주거용 재산
  overflowToGeneralProperty: number; // 한도 초과분 -> 일반재산 이관액

  rawGeneralPropertyTotal: number;
  totalGeneralPropertyWithOverflow: number; // 일반재산 + 초과분

  rawFinancialTotal: number;
  financialLivingReserveDeduction: number; // 500만원 생활준비금 공제액
  longTermSavingsDeduction: number; // 장기저축 공제액 (희망·청년내일저축 등)
  netFinancialProperty: number; // 공제 후 순금융재산

  rawCarTotal: number;
  generalCarValue: number;
  exemptCarGeneralValue: number; // 4.17% 대상 차량
  excludedCarValue: number; // 0% 제외 차량

  totalDebt: number; // 총 부채
  naturalDeclineDeduction: number; // 자연감소분 (처분재산 소비인정액)
  basicPropertyDeduction: number; // 적용된 기본재산액
  totalDeductionPool: number; // 차감 풀 = 기본재산액 + 부채 + 자연감소분

  // 차감 상세
  housingDeductedAmount: number;
  finalHousingProperty: number;
  housingConvertedMonthly: number; // 월 1.04%

  generalDeductedAmount: number;
  finalGeneralProperty: number;
  generalConvertedMonthly: number; // 월 4.17%

  financialDeductedAmount: number;
  finalFinancialProperty: number;
  financialConvertedMonthly: number; // 월 6.26%

  carConvertedMonthly: number; // 자동차 환산액

  totalPropertyConvertedMonthly: number; // 재산의 소득환산액 합계
}

export interface BenefitEligibility {
  benefitName: string;
  ratioPercent: number; // 기준 중위소득 대비 비율
  criterionAmount: number; // 선정기준액 (원)
  incomeRecognized: number; // 적용 소득인정액 (원)
  differenceAmount: number; // 선정기준액 - 소득인정액
  isEligible: boolean; // 적합/부적합
  ineligibilityReason?: string;
  expectedLivelihoodGrant?: number; // 생계급여 예상 지급액
}

export interface CalculationResult {
  medianIncome: number; // 해당 가구원 수 기준 중위소득
  incomeBreakdown: IncomeBreakdown;
  propertyBreakdown: PropertyBreakdown;

  // 최종 소득인정액
  recognizedIncomeGeneral: number; // 생계·주거·교육용 (소득평가액 + 재산환산액)
  recognizedIncomeMedical: number; // 의료급여용 (소득평가액 + 재산환산액 + 부양비)

  // 4대 급여별 판정 결과
  livelihoodBenefit: BenefitEligibility; // 생계급여 (32%)
  medicalBenefit: BenefitEligibility; // 의료급여 (40%)
  housingBenefit: BenefitEligibility; // 주거급여 (48%)
  educationBenefit: BenefitEligibility; // 교육급여 (50%)

  // 차상위 본인부담경감대상자 지원사업 모의 판정 결과
  nearPovertyResult: NearPovertyResult;
}
