/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EarnerItem, WelfareInputs, WorkerCategory } from '../types/welfare';
import { CurrencyInput } from './CurrencyInput';
import { calculateEarnedIncomeDeduction } from '../utils/calculator';
import {
  Briefcase,
  Plus,
  Trash2,
  Building,
  ArrowRightLeft,
  HeartPulse,
  Info,
  Accessibility,
  CheckCircle2,
} from 'lucide-react';

interface IncomeSectionProps {
  inputs: WelfareInputs;
  onChange: (updater: (prev: WelfareInputs) => WelfareInputs) => void;
}

const CATEGORY_LABELS: Record<
  WorkerCategory,
  { label: string; deductionDesc: string; badgeColor: string }
> = {
  general: {
    label: '일반 수급(권)자',
    deductionDesc: '생계·주거·교육·차상위(경감) 30% 공제 / 의료급여 0% 공제(미적용)',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
  },
  youth: {
    label: '청년(34세 이하) 및 대학생',
    deductionDesc: '60만 원 공제 후 잔여액의 30% 추가 공제 (전 급여 공통)',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  disabled: {
    label: '등록장애인 (가구특성 공제 대상)',
    deductionDesc: '20만 원 공제 후 잔여액 30% + 장애인연금·수당 가구특성 100% 공제',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
  },
  vocational: {
    label: '장애인 직업재활사업 참여자',
    deductionDesc: '20만 원 공제 후 잔여액 50% + 장애인연금·수당 가구특성 100% 공제',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  senior: {
    label: '65세 이상 노인',
    deductionDesc: '20만 원 공제 후 잔여액의 30% 추가 공제 (전 급여 공통)',
    badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  },
  senior_disabled: {
    label: '65세 이상 노인 / 등록장애인 / 북한이탈주민',
    deductionDesc: '20만 원 공제 후 잔여액의 30% 추가 공제 + 장애인 공적급여 100% 공제',
    badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  },
};

export const IncomeSection: React.FC<IncomeSectionProps> = ({
  inputs,
  onChange,
}) => {
  // 등록장애인 가구원 공적급여(장애인연금·수당) 합계
  const totalDisabilityBenefits = inputs.earners.reduce((acc, e) => {
    const isDis =
      e.category === 'disabled' ||
      e.category === 'vocational' ||
      e.category === 'senior_disabled';
    return acc + (isDis ? e.disabilityBenefit || 0 : 0);
  }, 0);

  const totalExpenseDeductions =
    (inputs.expenseDeductions.chronicIllnessMedical || 0) +
    (inputs.expenseDeductions.otherAdditionalDeduction || 0) +
    totalDisabilityBenefits;

  // 소득자 추가
  const handleAddEarner = () => {
    const newId = `earner-${Date.now()}`;
    onChange((prev) => ({
      ...prev,
      earners: [
        ...prev.earners,
        {
          id: newId,
          name: `가구원 ${prev.earners.length + 1}`,
          category: 'general',
          monthlyIncome: 0,
        },
      ],
    }));
  };

  // 소득자 삭제
  const handleRemoveEarner = (id: string) => {
    onChange((prev) => ({
      ...prev,
      earners: prev.earners.filter((e) => e.id !== id),
    }));
  };

  // 소득자 정보 수정
  const handleUpdateEarner = (id: string, patch: Partial<EarnerItem>) => {
    onChange((prev) => ({
      ...prev,
      earners: prev.earners.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs transition">
      <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-extrabold text-base shrink-0">
            2
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              소득 사항 입력 및 공제 (월 기준)
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              근로·사업소득은 대상자 유형별로 법정 공제율이 자동 적용되며, 의료급여는 일반 근로소득 공제가 제외됩니다.
            </p>
          </div>
        </div>
      </div>

      {/* 1. 근로 및 사업소득 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4.5 h-4.5 text-emerald-600" />
            <h3 className="text-sm sm:text-base font-bold text-slate-800">
              근로소득 및 사업소득 (대상자 유형별 자동 공제)
            </h3>
          </div>
          <button
            type="button"
            onClick={handleAddEarner}
            className="text-xs sm:text-sm text-emerald-700 hover:text-emerald-800 font-bold inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>소득자 추가</span>
          </button>
        </div>

        <div className="space-y-3.5">
          {inputs.earners.map((earner) => {
            const deduction = calculateEarnedIncomeDeduction(
              earner.monthlyIncome,
              earner.category,
            );
            const catInfo = CATEGORY_LABELS[earner.category];

            return (
              <div
                key={earner.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition"
              >
                <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
                  <div className="flex items-center gap-2.5 flex-1 flex-wrap">
                    <input
                      type="text"
                      value={earner.name}
                      onChange={(e) =>
                        handleUpdateEarner(earner.id, { name: e.target.value })
                      }
                      placeholder="구분 (예: 본인, 배우자, 자녀)"
                      className="text-sm font-bold px-3 py-1.5 border border-slate-300 rounded-lg bg-white w-36 focus:outline-blue-500"
                    />
                    <select
                      value={earner.category}
                      onChange={(e) =>
                        handleUpdateEarner(earner.id, {
                          category: e.target.value as WorkerCategory,
                        })
                      }
                      className="text-sm font-semibold px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-blue-500 cursor-pointer"
                    >
                      <option value="general">일반 수급(권)자</option>
                      <option value="youth">청년(34세 이하) 및 대학생</option>
                      <option value="disabled">
                        등록장애인 (가구특성 공제 대상)
                      </option>
                      <option value="vocational">
                        장애인 직업재활사업 참여자
                      </option>
                      <option value="senior">65세 이상 노인</option>
                      <option value="senior_disabled">
                        기타 취약계층 (노인·장애인·북한이탈주민)
                      </option>
                    </select>
                  </div>

                  {inputs.earners.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEarner(earner.id)}
                      className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg transition cursor-pointer"
                      title="소득자 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="text-xs sm:text-sm text-slate-600 mb-3 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>공제 규칙: {catInfo.deductionDesc}</span>
                </div>

                {/* 장애인 가구원인 경우 공적급여(장애인연금·수당) 입력란 제공 */}
                {(earner.category === 'disabled' ||
                  earner.category === 'vocational' ||
                  earner.category === 'senior_disabled') && (
                  <div className="mb-3.5 p-3.5 rounded-lg bg-purple-50/70 border border-purple-200">
                    <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                      <div className="flex items-center gap-1.5">
                        <Accessibility className="w-4.5 h-4.5 text-purple-700 shrink-0" />
                        <span className="text-sm font-bold text-purple-950">
                          가구특성 공적급여 (장애인연금, 장애수당 등)
                        </span>
                      </div>
                      <span className="text-xs bg-purple-100 text-purple-800 font-bold px-2.5 py-0.5 rounded-md border border-purple-200">
                        가구특성별 지출비용 100% 공제 대상
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-purple-900/90 mb-3 leading-relaxed">
                      ※ 보건복지부 지침: 등록장애인이 받는 <strong>장애인연금(기초·부가급여), 장애수당, 장애아동수당</strong>은 실제소득에 산입되더라도,{' '}
                      <strong className="text-purple-950 font-bold">『가구특성별 지출비용(소득공제)』으로 100% 전액 차감</strong>되어 소득평가액을 늘리지 않습니다.
                    </p>

                    <CurrencyInput
                      label="월 장애인연금 · 장애수당 수령액"
                      value={earner.disabilityBenefit || 0}
                      onChange={(val) =>
                        handleUpdateEarner(earner.id, { disabilityBenefit: val })
                      }
                      placeholder="0"
                      quickAddButtons={false}
                    />

                    {(earner.disabilityBenefit || 0) > 0 && (
                      <div className="mt-2.5 p-2.5 rounded-lg bg-white border border-purple-200 text-xs sm:text-sm flex items-center justify-between flex-wrap gap-1">
                        <span className="text-purple-800 font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          가구특성별 소득공제 적용:
                        </span>
                        <span className="font-bold text-purple-900">
                          -{(earner.disabilityBenefit || 0).toLocaleString()}원 전액 차감 (소득평가액 영향 0원)
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <CurrencyInput
                  label="월 근로/사업소득 (세전 총액)"
                  value={earner.monthlyIncome}
                  onChange={(val) =>
                    handleUpdateEarner(earner.id, { monthlyIncome: val })
                  }
                  placeholder="0"
                />

                {earner.monthlyIncome > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600 font-medium">
                        생계·주거·교육·차상위 반영액:
                      </span>
                      <span className="font-bold text-slate-900">
                        {deduction.generalEvaluated.toLocaleString()}원
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-slate-600 font-medium">
                        의료급여 반영액:
                      </span>
                      <span className="font-bold text-emerald-700">
                        {deduction.medicalEvaluated.toLocaleString()}원
                      </span>
                      {earner.category === 'general' && (
                        <span className="text-xs text-amber-800 bg-amber-50 border border-amber-200 font-semibold px-2 py-0.5 rounded">
                          의료 0% (차상위는 30% 공제)
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. 재산소득 & 이전소득 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {/* 재산소득 (공제 없음) */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40">
          <div className="flex items-center gap-2 mb-2">
            <Building className="w-4.5 h-4.5 text-blue-600" />
            <h3 className="text-sm sm:text-base font-bold text-slate-800">
              재산소득 (월 기준, 공제 없음)
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mb-3.5">
            임대소득, 금융 이자 및 개인연금 수령액은 전액 소득으로 반영됩니다.
          </p>
          <div className="space-y-3.5">
            <CurrencyInput
              label="임대소득"
              value={inputs.propertyIncome.rental}
              onChange={(val) =>
                onChange((prev) => ({
                  ...prev,
                  propertyIncome: { ...prev.propertyIncome, rental: val },
                }))
              }
              quickAddButtons={false}
            />
            <CurrencyInput
              label="이자소득 (월평균)"
              value={inputs.propertyIncome.interest}
              onChange={(val) =>
                onChange((prev) => ({
                  ...prev,
                  propertyIncome: { ...prev.propertyIncome, interest: val },
                }))
              }
              quickAddButtons={false}
            />
            <CurrencyInput
              label="개인연금소득"
              value={inputs.propertyIncome.pension}
              onChange={(val) =>
                onChange((prev) => ({
                  ...prev,
                  propertyIncome: { ...prev.propertyIncome, pension: val },
                }))
              }
              quickAddButtons={false}
            />
          </div>
        </div>

        {/* 이전소득 (공제 없음 / 차상위 사적이전소득 제외) */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-4.5 h-4.5 text-indigo-600" />
              <h3 className="text-sm sm:text-base font-bold text-slate-800">
                이전소득 (월 기준)
              </h3>
            </div>
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
              차상위는 사적이전 제외
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mb-3.5">
            공적이전소득(국민·기초연금 등)은 공통 반영되며, 사적이전소득은 기초수급에만 반영되고 차상위본인부담경감에서는 제외됩니다.
          </p>
          <div className="space-y-3.5">
            <CurrencyInput
              label="공적이전소득 (국민연금, 기초연금 등)"
              value={inputs.transferIncome.publicTransfer}
              onChange={(val) =>
                onChange((prev) => ({
                  ...prev,
                  transferIncome: {
                    ...prev.transferIncome,
                    publicTransfer: val,
                  },
                }))
              }
              helperText="국민연금, 기초연금 등 일반 공적이전소득입니다. ※ 장애인연금·장애수당은 상단 장애인 가구원의 [가구특성 공적급여] 란에 입력하시면 가구특성별 지출비용으로 100% 전액 자동 공제됩니다."
            />
            <CurrencyInput
              label="사적이전소득 (자녀 용돈·정기 후원금 등)"
              value={inputs.transferIncome.privateTransfer}
              onChange={(val) =>
                onChange((prev) => ({
                  ...prev,
                  transferIncome: {
                    ...prev.transferIncome,
                    privateTransfer: val,
                  },
                }))
              }
              quickAddButtons={false}
              helperText="※ 핵심 지침(p.26): 기초생활보장 산정 시에는 100% 소득으로 반영되나, 『차상위 본인부담경감대상자』 산정 시에는 실제소득에서 전액 제외(0원 반영)됩니다!"
            />
          </div>
        </div>
      </div>

      {/* 3. 가구특성별 지출비용 및 추가 지출요인 (차감 항목) */}
      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4.5 h-4.5 text-amber-600 shrink-0" />
            <h3 className="text-sm sm:text-base font-bold text-slate-800">
              가구특성별 지출비용 및 추가 지출요인 (소득공제 차감 항목)
            </h3>
          </div>
          <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-md border border-amber-200">
            소득평가액에서 직접 차감
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">
          보건복지부 지침상 만성질환 의료비, 국민연금 본인부담 보험료(75%), 대학생 학비 및 등록장애인 공적급여(장애인연금·수당)는 실제소득에서 법정 공제(차감)됩니다.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <CurrencyInput
              label="① 만성질환 의료비 지출액 (월평균)"
              value={inputs.expenseDeductions.chronicIllnessMedical}
              onChange={(val) =>
                onChange((prev) => ({
                  ...prev,
                  expenseDeductions: {
                    ...prev.expenseDeductions,
                    chronicIllnessMedical: val,
                  },
                }))
              }
              helperText="만성질환으로 3개월 이상 지속 지출 본인부담액"
            />
          </div>

          <div>
            <CurrencyInput
              label="② 국민연금 보험료(75%) · 대학생 등록금 등"
              value={inputs.expenseDeductions.otherAdditionalDeduction || 0}
              onChange={(val) =>
                onChange((prev) => ({
                  ...prev,
                  expenseDeductions: {
                    ...prev.expenseDeductions,
                    otherAdditionalDeduction: val,
                  },
                }))
              }
              helperText="그 밖의 추가 지출요인 (국민연금 본인부담 75%, 학비 등 지침 p.19)"
            />
          </div>

          <div className="p-3.5 rounded-lg bg-white border border-purple-200 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                <span className="text-sm font-bold text-purple-950 flex items-center gap-1.5">
                  <Accessibility className="w-4 h-4 text-purple-700 shrink-0" />
                  ③ 장애인 공적급여 공제액 (연동)
                </span>
                <span className="text-xs text-purple-800 bg-purple-50 font-bold px-2 py-0.5 rounded border border-purple-200">
                  100% 법정 공제
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mb-2 leading-relaxed">
                상단 가구원에서 [등록장애인] 선택 후 입력한 장애인연금·수당 전액이 자동 공제됩니다.
              </p>
            </div>
            <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
              <span className="text-xs sm:text-sm text-slate-700 font-semibold">
                장애인 공적급여 공제액:
              </span>
              <span className="text-base font-extrabold text-purple-700">
                -{totalDisabilityBenefits.toLocaleString()}원
              </span>
            </div>
          </div>
        </div>

        {/* 합계 요약 바 */}
        <div className="mt-3.5 p-3 rounded-lg bg-amber-100/70 border border-amber-200/80 flex items-center justify-between text-xs sm:text-sm">
          <span className="font-bold text-amber-950">
            총 가구특성별 및 추가 지출비용 공제 합계 (① + ② + ③):
          </span>
          <span className="text-base font-black text-amber-900">
            -{totalExpenseDeductions.toLocaleString()}원 / 월
          </span>
        </div>
      </div>
    </section>
  );
};
