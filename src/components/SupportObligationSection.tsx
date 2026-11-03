/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  MedicalSupportObligation,
  WelfareInputs,
} from '../types/welfare';
import { CurrencyInput } from './CurrencyInput';
import {
  UserCheck,
  AlertTriangle,
  Stethoscope,
  Info,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface SupportObligationSectionProps {
  inputs: WelfareInputs;
  onChange: (updater: (prev: WelfareInputs) => WelfareInputs) => void;
}

export const SupportObligationSection: React.FC<SupportObligationSectionProps> = ({
  inputs,
  onChange,
}) => {
  const { supportObligation } = inputs;

  const handleLivelihoodExceptionChange = (exceeds: boolean) => {
    onChange((prev) => ({
      ...prev,
      supportObligation: {
        ...prev.supportObligation,
        livelihoodExceedsCriteria: exceeds,
      },
    }));
  };

  const handleMedicalStatusChange = (status: MedicalSupportObligation) => {
    onChange((prev) => ({
      ...prev,
      supportObligation: {
        ...prev.supportObligation,
        medicalSupportStatus: status,
      },
    }));
  };

  const handleSupportFeeChange = (val: number) => {
    onChange((prev) => ({
      ...prev,
      supportObligation: {
        ...prev.supportObligation,
        supportPaymentAmount: val,
      },
    }));
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs transition">
      <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-extrabold text-base shrink-0">
            4
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              부양의무자 기준 적용 선택
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              생계급여는 고소득·고재산 예외 기준만 적용되며, 의료급여는 부양능력 판정에 따라 부양비가 부과되거나 수급 여부가 결정됩니다.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
          <Info className="w-4 h-4 text-slate-500" />
          <span>주거·교육급여는 부양의무자 기준 폐지(미적용)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. 생계급여 부양의무자 예외 체크 */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40">
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="w-4.5 h-4.5 text-blue-600" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              생계급여: 부양의무자 고소득·고재산 예외 기준
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 mb-3.5">
            생계급여는 부양의무자 기준이 사실상 폐지되었으나, 극단적 고소득·고재산가인 경우에 한해 수급이 제한됩니다.
          </p>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-white">
            <p className="text-sm font-semibold text-slate-800 leading-relaxed mb-3.5">
              "부양의무자(부모, 자녀) 중{' '}
              <span className="text-rose-600 font-bold">
                연 소득 1.3억 원(월 1,084만 원) 초과
              </span>{' '}
              또는{' '}
              <span className="text-rose-600 font-bold">
                일반재산 12억 원 초과자
              </span>
              가 있습니까?"
            </p>

            <div className="flex items-center gap-3">
              <label
                className={`flex-1 p-3 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
                  !supportObligation.livelihoodExceedsCriteria
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="livelihoodException"
                  checked={!supportObligation.livelihoodExceedsCriteria}
                  onChange={() => handleLivelihoodExceptionChange(false)}
                  className="sr-only"
                />
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                <span>아니오 (적격 판정 유지)</span>
              </label>

              <label
                className={`flex-1 p-3 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition ${
                  supportObligation.livelihoodExceedsCriteria
                    ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="livelihoodException"
                  checked={supportObligation.livelihoodExceedsCriteria}
                  onChange={() => handleLivelihoodExceptionChange(true)}
                  className="sr-only"
                />
                <XCircle className="w-4.5 h-4.5 text-rose-600 shrink-0" />
                <span>예 (생계급여 부적합)</span>
              </label>
            </div>

            {supportObligation.livelihoodExceedsCriteria && (
              <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>부양의무자 고소득·고재산 예외 사유로 생계급여 지급 대상에서 제외됩니다.</span>
              </div>
            )}
          </div>
        </div>

        {/* 2. 의료급여 부양의무자 기준 선택 */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40">
          <div className="flex items-center gap-2 mb-2">
            <Stethoscope className="w-4.5 h-4.5 text-emerald-600" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              의료급여: 부양의무자 판정 기준
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 mb-3.5">
            의료급여는 부양의무자 조사 결과(부양능력 없음, 미약, 있음)에 따라 적격 판정 및 부양비 산정이 달라집니다.
          </p>

          <div className="space-y-2.5">
            {[
              {
                value: 'none_or_abolished',
                label: '부양의무자 없음 또는 기준 폐지 대상',
                desc: '중증장애인 포함 가구, 30세 미만 한부모·자립준비청년, 부양의무자 가구에 기초연금·장애인연금 수급자 포함 시',
                badge: '적격 유지',
                badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              },
              {
                value: 'no_ability',
                label: '부양능력 없음',
                desc: '부양의무자의 소득·재산이 부양능력 판정기준 미달',
                badge: '의료급여 적격',
                badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              },
              {
                value: 'weak_ability',
                label: '부양능력 미약 (부양비 부과)',
                desc: '부양의무자로부터 산정된 부양비가 수급권자의 소득인정액에 합산됨',
                badge: '부양비 합산',
                badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
              },
              {
                value: 'has_ability',
                label: '부양능력 있음',
                desc: '부양의무자의 소득·재산이 충분하여 수급권자를 부양할 수 있음',
                badge: '의료급여 부적합',
                badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
              },
            ].map((opt) => {
              const isSelected =
                supportObligation.medicalSupportStatus === opt.value;
              return (
                <label
                  key={opt.value}
                  className={`block p-3 rounded-lg border text-sm cursor-pointer transition ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-100'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <input
                        type="radio"
                        name="medicalSupportStatus"
                        value={opt.value}
                        checked={isSelected}
                        onChange={() =>
                          handleMedicalStatusChange(
                            opt.value as MedicalSupportObligation,
                          )
                        }
                        className="mt-1 w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <div>
                        <span className="font-bold text-slate-900">
                          {opt.label}
                        </span>
                        <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-snug">
                          {opt.desc}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-md border whitespace-nowrap shrink-0 ${opt.badgeClass}`}
                    >
                      {opt.badge}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>

          {/* 부양능력 미약 선택 시 부양비 입력창 활성화 */}
          {supportObligation.medicalSupportStatus === 'weak_ability' && (
            <div className="mt-3.5 p-3.5 rounded-lg border border-amber-300 bg-amber-50/50">
              <CurrencyInput
                label="월 산정 부양비 (의료급여 소득인정액 합산액)"
                value={supportObligation.supportPaymentAmount}
                onChange={handleSupportFeeChange}
                helperText="행복e음 등에서 산정된 월 부양비 입력액"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
