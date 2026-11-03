/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CHRONIC_DISEASE_LIST_13,
  MEDIAN_INCOME_EXTRA_PER_PERSON,
  NEAR_POVERTY_BASIC_PROPERTY_DEDUCTION,
  NEAR_POVERTY_OBLIGATION_TABLE_2026,
  NearPovertyBenefitCode,
  NearPovertySupportObligation,
  NearPovertyTargetInfo,
  NearPovertyTargetType,
  OBLIGATION_EDUCATION_STANDARD,
  OBLIGATION_RENT_LIMIT,
  REGION_CONFIGS,
  WelfareInputs,
} from '../types/welfare';
import { CurrencyInput } from './CurrencyInput';
import { formatKoreanWon } from '../utils/calculator';
import {
  HeartPulse,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Info,
  Stethoscope,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

interface NearPovertySectionProps {
  inputs: WelfareInputs;
  onChange: (updater: (prev: WelfareInputs) => WelfareInputs) => void;
}

export const NearPovertySection: React.FC<NearPovertySectionProps> = ({
  inputs,
  onChange,
}) => {
  const [showObligationDetails, setShowObligationDetails] = useState(false);
  const [showCriteriaGuide, setShowCriteriaGuide] = useState(false);

  const { nearPovertyTarget, nearPovertyObligation, region } = inputs;
  const regionConfig = REGION_CONFIGS[region];
  const nearPovertyDeduction = NEAR_POVERTY_BASIC_PROPERTY_DEDUCTION[region];

  // 대상자 요건 변경 핸들러
  const handleTargetChange = (updates: Partial<NearPovertyTargetInfo>) => {
    onChange((prev) => ({
      ...prev,
      nearPovertyTarget: {
        ...prev.nearPovertyTarget,
        ...updates,
      },
    }));
  };

  // 부양의무자 조사 변경 핸들러
  const handleObligationChange = (updates: Partial<NearPovertySupportObligation>) => {
    onChange((prev) => ({
      ...prev,
      nearPovertyObligation: {
        ...prev.nearPovertyObligation,
        ...updates,
      },
    }));
  };

  // 실시간 부양의무자 판정기준액 계산 (중증장애인 가구원수 추가 산정 포함 - 지침 p.40)
  const targetPersons = Math.min(
    7,
    Math.max(1, Math.floor(nearPovertyObligation.targetPersonCount || 1)),
  );
  const rawFamilyCount = Math.max(1, Math.floor(nearPovertyObligation.familyCount || 1));
  const severeDisabledExtra = Math.max(0, Math.floor(nearPovertyObligation.severeDisabledCount || 0));
  const effectiveFamilyCount = rawFamilyCount + severeDisabledExtra;
  const tableFamilyCount = Math.min(7, effectiveFamilyCount);

  const baseTableAmount =
    NEAR_POVERTY_OBLIGATION_TABLE_2026[targetPersons]?.[tableFamilyCount] ??
    NEAR_POVERTY_OBLIGATION_TABLE_2026[1][tableFamilyCount];

  const baseCriterion =
    effectiveFamilyCount > 7
      ? baseTableAmount +
        (effectiveFamilyCount - 7) *
          Math.round(MEDIAN_INCOME_EXTRA_PER_PERSON * (1.2 + (targetPersons - 1) * 0.1))
      : baseTableAmount;

  const totalDeductions =
    (nearPovertyObligation.deductionEducation || 0) +
    (nearPovertyObligation.deductionRent || 0) +
    (nearPovertyObligation.deductionMedical || 0) +
    (nearPovertyObligation.deductionPension || 0) +
    (nearPovertyObligation.deductionDebt || 0);

  const netObligationIncome = Math.max(
    0,
    nearPovertyObligation.monthlyIncome - totalDeductions,
  );

  const isObligationEligible =
    !nearPovertyObligation.hasObligation ||
    nearPovertyObligation.cannotReceiveSupport ||
    netObligationIncome < baseCriterion;

  // 예상 구분코드
  let previewCode: NearPovertyBenefitCode = 'none';
  if (nearPovertyTarget.targetType === 'rare_severe') {
    previewCode = 'C';
  } else if (nearPovertyTarget.targetType === 'chronic' || nearPovertyTarget.targetType === 'minor') {
    previewCode = nearPovertyTarget.isRegisteredDisabled ? 'F' : 'E';
  }

  return (
    <section className="bg-white rounded-xl border border-teal-200/80 p-5 sm:p-6 shadow-xs transition relative overflow-hidden">
      {/* 장식용 탑 라인 */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500" />

      {/* 헤더 */}
      <div className="flex items-start sm:items-center justify-between pb-3.5 mb-5 border-b border-teal-100 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center font-extrabold text-base shadow-xs shrink-0">
            5
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-1.5">
                <HeartPulse className="w-5 h-5 text-teal-600" />
                <span>차상위본인부담경감대상자 지원사업 자격 및 부양요건</span>
              </h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                기초수급 탈락·부적합 시 연계 필수
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-0.5">
              보건복지부 『2026년 차상위 본인부담경감대상자 지원사업안내』 지침 기준 (중위 50% 이하, 기본재산 1억 3,500만 원, 사적이전소득·부양의무자재산 제외)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowCriteriaGuide(!showCriteriaGuide)}
          className="text-xs sm:text-sm text-teal-800 hover:text-teal-950 font-bold px-3 py-1.5 rounded-lg border border-teal-200 bg-teal-50/70 hover:bg-teal-100/60 flex items-center gap-1.5 cursor-pointer transition ml-auto sm:ml-0"
        >
          <Info className="w-4 h-4 text-teal-600" />
          <span>차상위 지침 핵심기준 {showCriteriaGuide ? '접기' : '보기'}</span>
        </button>
      </div>

      {/* 지침 핵심기준 요약 박스 (토글) */}
      {showCriteriaGuide && (
        <div className="mb-5 p-4 rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50/60 via-white to-cyan-50/40 text-sm text-slate-700 space-y-3">
          <div className="font-bold text-teal-900 flex items-center gap-2 text-base">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            <span>기초생활보장 의료급여 vs 차상위본인부담경감 4대 핵심 차이점</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-white border border-teal-100 shadow-2xs">
              <span className="font-bold text-teal-800 block mb-1 text-sm">1. 소득기준 완화 (50%)</span>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                기초의료(40%) 대비 <strong>기준 중위소득 50% 이하</strong>로 범위가 넓으며, 일반 근로소득자도 <strong>30% 기본공제</strong>(기초의료 0%)를 적용받습니다.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-white border border-teal-100 shadow-2xs">
              <span className="font-bold text-teal-800 block mb-1 text-sm">2. 사적이전소득 전액 제외</span>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                지침 p.26에 따라 자녀 용돈 등 <strong>사적이전소득, 부양비, 보장기관확인소득은 실제소득에서 0원(전액 제외)</strong> 처리됩니다.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-white border border-teal-100 shadow-2xs">
              <span className="font-bold text-teal-800 block mb-1 text-sm">3. 기본재산액 대폭 상향</span>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                서울·경기·광역 모두 <strong>1억 3,500만 원</strong>(기타 8,500만 원)까지 전액 공제되어 주택이나 전세금이 있어도 재산환산액이 대폭 낮아집니다.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-white border border-teal-100 shadow-2xs">
              <span className="font-bold text-teal-800 block mb-1 text-sm">4. 부양의무자 재산 미반영</span>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                부양의무자의 재산은 아예 산정하지 않고 <strong>실제소득만 심사</strong>하며, <strong>부양비 부과가 전혀 없어</strong> 탈락 위험이 현저히 낮습니다.
              </p>
            </div>
          </div>
          <div className="pt-2.5 border-t border-teal-100 text-xs sm:text-sm text-teal-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-teal-600" />
            <span>
              <strong>90일 이내 소급신청 지침:</strong> 기초생활수급 탈락(상실) 통보를 받은 날로부터 90일 이내에 신청하면 의료급여 상실일자로 소급하여 경감 혜택이 적용됩니다. (행복e음 소급요청 'Y' 전송)
            </span>
          </div>
        </div>
      )}

      {/* 2단 레이아웃: 1) 대상자 질환/연령 요건  2) 부양의무자 소득 조사 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. 대상자 질환 및 연령 요건 */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4.5 h-4.5 text-teal-600" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  지원 대상자 요건 및 구분코드 선택 (C · E · F)
                </h3>
              </div>
              <span
                className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${
                  previewCode === 'C'
                    ? 'bg-purple-100 text-purple-800 border-purple-300'
                    : previewCode === 'F'
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : previewCode === 'E'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}
              >
                예상 종별: {previewCode !== 'none' ? `구분코드 [${previewCode}]` : '미선택'}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 mb-3.5">
              가구원 중 해당 질환자 또는 아동이 포함되어 있어야 합니다.
            </p>

            {/* 대상 유형 선택 라디오 */}
            <div className="space-y-2.5">
              {[
                {
                  type: 'chronic',
                  title: '만성질환자 (구분코드 E / F)',
                  badge: '외래 1,000원·입원 14%',
                  desc: '고혈압, 당뇨 등 6개월 이상 치료 중이거나 치료를 요하는 질환자 (13대 고시질환 등)',
                },
                {
                  type: 'rare_severe',
                  title: '희귀질환 · 중증난치 · 중증질환자 (구분코드 C)',
                  badge: '진료비 100% 면제',
                  desc: '산정특례 등록자 (암, 뇌혈관, 심장, 결핵, 중증화상, 희귀난치 등) - 입원/외래 요양급여 면제 (식대 20%)',
                },
                {
                  type: 'minor',
                  title: '18세 미만 아동 (구분코드 E / F)',
                  badge: '진단서 불필요',
                  desc: '18세가 도래하는 해의 12.31까지 (고교 재학 시 20세 도래월까지) 질환 유무 무관 경감',
                },
                {
                  type: 'none',
                  title: '해당 대상자 없음',
                  badge: '신청 대상 아님',
                  desc: '가구원 중 희귀/만성질환자 또는 18세 미만 아동이 없는 일반 성인 가구',
                },
              ].map((opt) => {
                const isSelected = nearPovertyTarget.targetType === opt.type;
                return (
                  <label
                    key={opt.type}
                    className={`block p-3 rounded-lg border text-sm cursor-pointer transition ${
                      isSelected
                        ? 'bg-teal-50/80 border-teal-500 ring-2 ring-teal-100'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <input
                          type="radio"
                          name="nearPovertyTargetType"
                          value={opt.type}
                          checked={isSelected}
                          onChange={() =>
                            handleTargetChange({
                              targetType: opt.type as NearPovertyTargetType,
                            })
                          }
                          className="mt-1 w-4 h-4 text-teal-600 border-slate-300 focus:ring-teal-500 cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900">{opt.title}</span>
                            <span className="text-xs font-bold text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded-md">
                              {opt.badge}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-snug">{opt.desc}</p>
                        </div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* 만성질환자 선택 시 13대 고시질환 퀵 선택 및 상병코드 */}
            {nearPovertyTarget.targetType === 'chronic' && (
              <div className="mt-3.5 p-3.5 rounded-lg border border-teal-200 bg-white space-y-3">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                    만성질환 상병 선택 (보건복지부 13개 고시질환 지침 p.64)
                  </label>
                  <select
                    value={nearPovertyTarget.illnessCode || 'HYPERTENSION'}
                    onChange={(e) => {
                      const selected = CHRONIC_DISEASE_LIST_13.find(
                        (d) => d.code === e.target.value,
                      );
                      handleTargetChange({
                        illnessCode: e.target.value,
                        illnessName: selected ? `${selected.name} (${selected.icdRange})` : e.target.value,
                      });
                    }}
                    className="w-full text-sm font-medium p-2.5 border border-slate-300 rounded-lg bg-white focus:outline-teal-500"
                  >
                    {CHRONIC_DISEASE_LIST_13.map((disease) => (
                      <option key={disease.code} value={disease.code}>
                        {disease.name} [{disease.icdRange}]
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-start gap-2.5 pt-1 text-xs sm:text-sm text-slate-700">
                  <input
                    type="checkbox"
                    id="hasMedicalCert"
                    checked={nearPovertyTarget.hasMedicalCertificate}
                    onChange={(e) =>
                      handleTargetChange({ hasMedicalCertificate: e.target.checked })
                    }
                    className="mt-0.5 w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
                  />
                  <label htmlFor="hasMedicalCert" className="cursor-pointer font-semibold leading-snug">
                    최근 3개월 이내 발급 진단서 구비 (6개월 이상 치료 요함 기재 / 산정특례 정신질환·치매 면제)
                  </label>
                </div>

                {!nearPovertyTarget.hasMedicalCertificate && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>
                      진단서 미제출 시 만성질환(E·F코드) 인정이 불가합니다. 병·의원에서 6개월 이상 치료 필요 소견 진단서를 발급받아 첨부해야 합니다.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* 희귀질환 산정특례 확인 체크 */}
            {nearPovertyTarget.targetType === 'rare_severe' && (
              <div className="mt-3.5 p-3.5 rounded-lg border border-purple-200 bg-purple-50/50 space-y-2 text-xs sm:text-sm">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="isSanctuary"
                    checked={nearPovertyTarget.isSanctuaryRegistered}
                    onChange={(e) =>
                      handleTargetChange({ isSanctuaryRegistered: e.target.checked })
                    }
                    className="mt-0.5 w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                  />
                  <label htmlFor="isSanctuary" className="font-bold text-purple-900 cursor-pointer leading-snug">
                    건강보험 산정특례 등록자 (행복e음 연계 확인 시 진단서 제출 생략)
                  </label>
                </div>
                <p className="text-xs sm:text-sm text-purple-800 pl-6">
                  산정특례 등록 유효기간 내 자동 인정되며, 본인부담액은 기본 식대 20% 외 전액 면제됩니다.
                </p>
                {!nearPovertyTarget.isSanctuaryRegistered && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>
                      산정특례 미등록 시 C코드 책정이 불가합니다. 국민건강보험공단에 산정특례 등록을 먼저 하거나, 진단서를 첨부하여 만성질환자(E코드)로 신청하세요.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* 등록장애인 추가 지원 여부 (E -> F 전환) */}
            {(nearPovertyTarget.targetType === 'chronic' ||
              nearPovertyTarget.targetType === 'minor') && (
              <div className="mt-3 p-3 rounded-lg border border-amber-200 bg-amber-50/60">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={nearPovertyTarget.isRegisteredDisabled}
                    onChange={(e) =>
                      handleTargetChange({ isRegisteredDisabled: e.target.checked })
                    }
                    className="mt-0.5 w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-amber-900 text-sm">
                      대상자 본인이 등록장애인인 경우 (구분코드 F 적용)
                    </span>
                    <p className="text-xs sm:text-sm text-amber-800 mt-0.5 leading-snug">
                      의원 외래 본인부담금 750원 지원 및 병원급 이상 본인부담금 14% 전액을 장애인의료비로 추가 지원하여 진료비 실부담이 대폭 줄어듭니다.
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-slate-200/70 text-xs sm:text-sm text-slate-600 flex items-center justify-between">
            <span className="font-medium">적용 기본재산공제:</span>
            <strong className="text-teal-700 font-bold">
              {regionConfig.name} {formatKoreanWon(nearPovertyDeduction)}
            </strong>
          </div>
        </div>

        {/* 2. 차상위 부양의무자 조사 입력 (실제소득만 심사, 재산 미반영) */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4.5 h-4.5 text-teal-600" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  차상위 부양의무자 기준 심사 (재산 미반영 · 실제소득만 판정)
                </h3>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${
                  isObligationEligible
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-rose-50 text-rose-700 border-rose-300'
                }`}
              >
                {isObligationEligible ? '부양요건 충족' : '부양능력 있음'}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 mb-3.5">
              1촌 직계혈족(부모, 자녀)의 재산은 보지 않으며, 소득에서 교육비·월세 등을 차감한 순소득이 기준표 미만이면 적격입니다. (부양비 부과 없음)
            </p>

            {/* 부양의무자 유무 라디오 */}
            <div className="grid grid-cols-2 gap-2.5 mb-3.5">
              <label
                className={`p-3 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
                  !nearPovertyObligation.hasObligation
                    ? 'bg-teal-50 border-teal-500 text-teal-800 ring-2 ring-teal-100'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="nearPovertyHasObligation"
                  checked={!nearPovertyObligation.hasObligation}
                  onChange={() => handleObligationChange({ hasObligation: false })}
                  className="sr-only"
                />
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                <span>부양의무자 없음 (적격)</span>
              </label>

              <label
                className={`p-3 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
                  nearPovertyObligation.hasObligation
                    ? 'bg-teal-50 border-teal-500 text-teal-800 ring-2 ring-teal-100'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="nearPovertyHasObligation"
                  checked={nearPovertyObligation.hasObligation}
                  onChange={() => handleObligationChange({ hasObligation: true })}
                  className="sr-only"
                />
                <UserCheck className="w-4.5 h-4.5 text-teal-600 shrink-0" />
                <span>부양의무자 있음 (심사)</span>
              </label>
            </div>

            {/* 부양의무자가 있는 경우 상세 입력창 */}
            {nearPovertyObligation.hasObligation && (
              <div className="space-y-3.5 p-3.5 rounded-lg border border-teal-200 bg-white">
                {/* 부양불가 사유 토글 */}
                <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={nearPovertyObligation.cannotReceiveSupport}
                      onChange={(e) =>
                        handleObligationChange({
                          cannotReceiveSupport: e.target.checked,
                        })
                      }
                      className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-emerald-900 text-sm">
                        부양을 받을 수 없는 경우 (지침 p.37 - 자동 적격 인정)
                      </span>
                      <p className="text-xs sm:text-sm text-emerald-800 mt-0.5 leading-snug">
                        군복무, 해외이주, 교정시설 수용, 행방불명, 실질적 가족관계 해체·부양거부 및 기피 등
                      </p>
                    </div>
                  </label>
                </div>

                {!nearPovertyObligation.cannotReceiveSupport && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                          부양의무자 가구원수
                        </label>
                        <select
                          value={nearPovertyObligation.familyCount}
                          onChange={(e) =>
                            handleObligationChange({
                              familyCount: parseInt(e.target.value, 10) || 1,
                            })
                          }
                          className="w-full text-sm font-medium p-2 border border-slate-300 rounded-lg bg-white focus:outline-teal-500"
                        >
                          {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                            <option key={num} value={num}>
                              {num}인 가구
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1"
                          title="부양의무자 가구원 중 장애인연금법상 중증장애인이 있는 경우 그 수만큼 가구원수를 추가 산정 (지침 p.40)"
                        >
                          가구 내 중증장애인
                        </label>
                        <select
                          value={nearPovertyObligation.severeDisabledCount || 0}
                          onChange={(e) =>
                            handleObligationChange({
                              severeDisabledCount: parseInt(e.target.value, 10) || 0,
                            })
                          }
                          className="w-full text-sm font-medium p-2 border border-slate-300 rounded-lg bg-white focus:outline-teal-500"
                        >
                          {[0, 1, 2, 3].map((num) => (
                            <option key={num} value={num}>
                              {num === 0 ? '없음 (0명)' : `${num}명 (+${num}인 가산)`}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1">
                          부양 대상 차상위인원
                        </label>
                        <select
                          value={nearPovertyObligation.targetPersonCount}
                          onChange={(e) =>
                            handleObligationChange({
                              targetPersonCount: parseInt(e.target.value, 10) || 1,
                            })
                          }
                          className="w-full text-sm font-medium p-2 border border-slate-300 rounded-lg bg-white focus:outline-teal-500"
                        >
                          {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                            <option key={num} value={num}>
                              {num}명 ({110 + num * 10}%)
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <CurrencyInput
                      label="부양의무자 월 실제소득 (근로+사업+재산+사적이전소득)"
                      value={nearPovertyObligation.monthlyIncome}
                      onChange={(val) => handleObligationChange({ monthlyIncome: val })}
                      helperText="공적이전소득, 보장기관확인소득은 부양의무자 실제소득에서 제외 (지침 p.43)"
                    />

                    {/* 소득 차감 항목 토글 버튼 */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowObligationDetails(!showObligationDetails)}
                        className="text-xs sm:text-sm text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>
                          부양의무자 소득 차감항목 (교육비·월세·의료비·연금 등) 입력{' '}
                          {totalDeductions > 0 && `(-${totalDeductions.toLocaleString()}원)`}
                        </span>
                        {showObligationDetails ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>

                      {showObligationDetails && (
                        <div className="mt-2.5 space-y-3.5 p-3.5 rounded-lg border border-slate-200 bg-slate-50/70">
                          <div>
                            <CurrencyInput
                              label="① 자녀 교육비 공제 (초중고 표준공제 / 대학생 등록금)"
                              value={nearPovertyObligation.deductionEducation}
                              onChange={(val) =>
                                handleObligationChange({ deductionEducation: val })
                              }
                              quickAddButtons={false}
                            />
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              {[
                                { label: '+초등(19.5만)', amt: OBLIGATION_EDUCATION_STANDARD.elementary },
                                { label: '+중학(20.5만)', amt: OBLIGATION_EDUCATION_STANDARD.middle },
                                { label: '+고등(23.1만)', amt: OBLIGATION_EDUCATION_STANDARD.high },
                              ].map((btn) => (
                                <button
                                  key={btn.label}
                                  type="button"
                                  onClick={() =>
                                    handleObligationChange({
                                      deductionEducation:
                                        (nearPovertyObligation.deductionEducation || 0) + btn.amt,
                                    })
                                  }
                                  className="text-xs px-2.5 py-1 rounded-md bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold cursor-pointer"
                                >
                                  {btn.label}
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={() => handleObligationChange({ deductionEducation: 0 })}
                                className="text-xs px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 font-semibold cursor-pointer"
                              >
                                교육비 0원
                              </button>
                            </div>
                          </div>

                          <div>
                            <CurrencyInput
                              label="② 부양의무자 실거주 월세 공제 (급지별·가구원수별 상한액 내)"
                              value={nearPovertyObligation.deductionRent}
                              onChange={(val) =>
                                handleObligationChange({ deductionRent: val })
                              }
                              quickAddButtons={false}
                            />
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              {[
                                { tier: 1, name: '1급지(서울) 상한' },
                                { tier: 2, name: '2급지(경기·인천) 상한' },
                                { tier: 3, name: '3급지(광역) 상한' },
                                { tier: 4, name: '4급지(기타) 상한' },
                              ].map((r) => {
                                const limitAmt =
                                  OBLIGATION_RENT_LIMIT[r.tier]?.[Math.min(7, rawFamilyCount)] ?? 0;
                                return (
                                  <button
                                    key={r.tier}
                                    type="button"
                                    onClick={() =>
                                      handleObligationChange({ deductionRent: limitAmt })
                                    }
                                    className="text-xs px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold cursor-pointer"
                                  >
                                    {r.name} ({(limitAmt / 10000).toFixed(1)}만)
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <CurrencyInput
                            label="③ 3개월 이상 지속 만성질환 의료비 및 간병비 실비"
                            value={nearPovertyObligation.deductionMedical}
                            onChange={(val) =>
                              handleObligationChange({ deductionMedical: val })
                            }
                            quickAddButtons={false}
                          />

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <CurrencyInput
                              label="④ 국민연금 본인부담 보험료 75%"
                              value={nearPovertyObligation.deductionPension}
                              onChange={(val) =>
                                handleObligationChange({ deductionPension: val })
                              }
                              quickAddButtons={false}
                            />
                            <CurrencyInput
                              label="⑤ 신복위·캠코·법원 채무변제액 등"
                              value={nearPovertyObligation.deductionDebt}
                              onChange={(val) =>
                                handleObligationChange({ deductionDebt: val })
                              }
                              quickAddButtons={false}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 실시간 판정 결과 박스 */}
                    <div className="p-3 rounded-lg bg-teal-50/60 border border-teal-200 text-xs sm:text-sm flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <span className="text-slate-600 block text-xs">
                          부양능력 판정기준액 (유효 {effectiveFamilyCount}인 가구, 대상자 {targetPersons}명):
                        </span>
                        <strong className="text-teal-900 font-extrabold text-base">
                          {baseCriterion.toLocaleString()}원
                        </strong>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-600 block text-xs">
                          공제 후 부양의무자 순소득:
                        </span>
                        <strong
                          className={`text-base font-extrabold ${
                            netObligationIncome < baseCriterion
                              ? 'text-emerald-700'
                              : 'text-rose-600'
                          }`}
                        >
                          {netObligationIncome.toLocaleString()}원
                        </strong>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-slate-200/70 text-xs sm:text-sm text-slate-600">
            {nearPovertyObligation.hasObligation ? (
              nearPovertyObligation.cannotReceiveSupport ? (
                <span className="text-emerald-700 font-bold">
                  부양불가 사유 인정으로 부양능력 심사 면제 (적격)
                </span>
              ) : isObligationEligible ? (
                <span className="text-emerald-700 font-bold">
                  부양의무자 소득이 기준액 미만이므로 부양능력 없음 (적격 판정)
                </span>
              ) : (
                <span className="text-rose-600 font-bold">
                  부양의무자 소득이 기준액 이상으로 부양능력 있음 (수급 제한)
                </span>
              )
            ) : (
              <span className="text-emerald-700 font-bold">
                부양의무자 없음: 부양능력 심사 통과 (적격)
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
