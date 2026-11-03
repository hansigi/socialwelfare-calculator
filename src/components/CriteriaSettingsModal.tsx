/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BenefitCriteriaConfig,
  BenefitType,
  BENEFIT_NAMES,
  createDefaultCriteriaConfig,
  DEFAULT_BENEFIT_RATIOS,
  NEAR_POVERTY_2026_MEDIAN_50,
  NEAR_POVERTY_BASIC_PROPERTY_DEDUCTION,
  NEAR_POVERTY_EXTRA_PER_PERSON_50,
  NEAR_POVERTY_OBLIGATION_TABLE_2026,
} from '../types/welfare';
import { X, RotateCcw, Check, Sliders, Table, Sparkles, HeartPulse } from 'lucide-react';

interface CriteriaSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  criteriaConfig: BenefitCriteriaConfig;
  onSave: (updatedConfig: BenefitCriteriaConfig) => void;
}

export const CriteriaSettingsModal: React.FC<CriteriaSettingsModalProps> = ({
  isOpen,
  onClose,
  criteriaConfig,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'ratios' | 'near_poverty'>('matrix');
  const [config, setConfig] = useState<BenefitCriteriaConfig>(() =>
    JSON.parse(JSON.stringify(criteriaConfig)),
  );

  if (!isOpen) return null;

  // 특정 급여의 가구원수별 금액 수정
  const handleAmountChange = (
    benefit: BenefitType,
    member: number,
    valStr: string,
  ) => {
    const raw = valStr.replace(/[^0-9]/g, '');
    const num = raw === '' ? 0 : parseInt(raw, 10);
    setConfig((prev) => ({
      ...prev,
      useCustomAmounts: true,
      customBenefitAmounts: {
        ...prev.customBenefitAmounts,
        [benefit]: {
          ...prev.customBenefitAmounts[benefit],
          [member]: num,
        },
      },
    }));
  };

  // 기준 중위소득 금액 수정
  const handleMedianChange = (member: number, valStr: string) => {
    const raw = valStr.replace(/[^0-9]/g, '');
    const num = raw === '' ? 0 : parseInt(raw, 10);
    setConfig((prev) => ({
      ...prev,
      customMedianIncomeTable: {
        ...prev.customMedianIncomeTable,
        [member]: num,
      },
    }));
  };

  // 8인 이상 가산액 수정
  const handleExtraPerPersonChange = (
    benefit: BenefitType | 'median',
    valStr: string,
  ) => {
    const raw = valStr.replace(/[^0-9]/g, '');
    const num = raw === '' ? 0 : parseInt(raw, 10);
    if (benefit === 'median') {
      setConfig((prev) => ({
        ...prev,
        extraPerPerson: num,
      }));
    } else {
      setConfig((prev) => ({
        ...prev,
        extraPerPersonByBenefit: {
          ...prev.extraPerPersonByBenefit,
          [benefit]: num,
        },
      }));
    }
  };

  // 급여별 선정비율(%) 수정
  const handleRatioChange = (benefit: BenefitType, valStr: string) => {
    const num = parseFloat(valStr) || 0;
    setConfig((prev) => ({
      ...prev,
      ratios: {
        ...prev.ratios,
        [benefit]: num,
      },
    }));
  };

  // 비율 기반으로 가구원수별 금액 전체 자동 재계산
  const handleRecalculateAmountsFromRatios = () => {
    const newAmounts: Record<BenefitType, Record<number, number>> = {
      livelihood: {},
      medical: {},
      housing: {},
      education: {},
    };

    const newExtra: Record<BenefitType, number> = {
      livelihood: 0,
      medical: 0,
      housing: 0,
      education: 0,
    };

    const benefits: BenefitType[] = [
      'livelihood',
      'medical',
      'housing',
      'education',
    ];

    for (const b of benefits) {
      const ratio = config.ratios[b] ?? DEFAULT_BENEFIT_RATIOS[b];
      for (let m = 1; m <= 7; m++) {
        const med = config.customMedianIncomeTable[m] || 0;
        newAmounts[b][m] = Math.round(med * (ratio / 100));
      }
      newExtra[b] = Math.round(config.extraPerPerson * (ratio / 100));
    }

    setConfig((prev) => ({
      ...prev,
      customBenefitAmounts: newAmounts,
      extraPerPersonByBenefit: newExtra,
      useCustomAmounts: false,
    }));
  };

  // 기본값 복원
  const handleResetToDefault = () => {
    setConfig(createDefaultCriteriaConfig());
  };

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  const benefits: BenefitType[] = [
    'livelihood',
    'medical',
    'housing',
    'education',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-slate-50">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                기초생활보장 및 차상위본인부담경감 선정기준 설정 · 일람표
              </h3>
              <span className="text-xs sm:text-sm bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full">
                2026년 정부 고시 기준
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              4대 급여의 가구원수별 선정기준액 설정 및 2026 차상위본인부담경감(중위 50% · 부양능력 120~180%) 법정 기준표를 확인할 수 있습니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher & Mode Toggle */}
        <div className="px-4 sm:px-5 py-3 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'matrix'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-4 h-4" />
              <span>급여별 선정기준액 직접 수정</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ratios')}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'ratios'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>기준 중위소득 및 비율(%)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('near_poverty')}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'near_poverty'
                  ? 'bg-white text-teal-700 shadow-xs border border-teal-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HeartPulse className="w-4 h-4 text-teal-600" />
              <span>차상위본인부담경감 기준표 (2026 지침)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={config.useCustomAmounts}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    useCustomAmounts: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <span className="font-bold text-slate-800">
                가구원수별 직접 입력 금액 우선 적용
              </span>
            </label>
            {config.useCustomAmounts && (
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">
                직접입력 활성
              </span>
            )}
          </div>
        </div>

        {/* Tab 1: Matrix Table */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'matrix' && (
            <div>
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <span className="text-xs sm:text-sm text-slate-600 font-medium">
                  * 각 급여별 1인~7인 가구 선정기준액을 직접 수정할 수 있으며, 8인 이상은 1인당 가산액이 자동 합산됩니다.
                </span>
                <button
                  type="button"
                  onClick={handleRecalculateAmountsFromRatios}
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>중위소득·비율 기준으로 전체 자동 재계산</span>
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
                <table className="min-w-full divide-y divide-slate-200 text-xs sm:text-sm">
                  <thead className="bg-slate-50 font-bold text-slate-800">
                    <tr>
                      <th className="p-3 text-center w-24 border-r border-slate-200">
                        가구원수
                      </th>
                      <th className="p-3 text-center text-blue-700 bg-blue-50/50 border-r border-slate-200">
                        생계급여 ({config.ratios.livelihood}%)
                      </th>
                      <th className="p-3 text-center text-emerald-700 bg-emerald-50/50 border-r border-slate-200">
                        의료급여 ({config.ratios.medical}%)
                      </th>
                      <th className="p-3 text-center text-amber-700 bg-amber-50/50 border-r border-slate-200">
                        주거급여 ({config.ratios.housing}%)
                      </th>
                      <th className="p-3 text-center text-purple-700 bg-purple-50/50 border-r border-slate-200">
                        교육급여 ({config.ratios.education}%)
                      </th>
                      <th className="p-3 text-center text-slate-900 bg-slate-100">
                        기준 중위소득 (100%)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {[1, 2, 3, 4, 5, 6, 7].map((m) => (
                      <tr key={m} className="hover:bg-slate-50/80 transition">
                        <td className="p-2.5 text-center font-bold text-slate-800 bg-slate-50/30 border-r border-slate-200">
                          {m}인 가구
                        </td>

                        {/* 생계급여 */}
                        <td className="p-2 border-r border-slate-200">
                          <input
                            type="text"
                            value={
                              config.customBenefitAmounts.livelihood[
                                m
                              ]?.toLocaleString('ko-KR') ?? ''
                            }
                            onChange={(e) =>
                              handleAmountChange(
                                'livelihood',
                                m,
                                e.target.value,
                              )
                            }
                            className="w-full text-right px-2.5 py-1.5 text-sm font-semibold border border-slate-300 rounded-md focus:border-blue-500 focus:outline-none"
                          />
                        </td>

                        {/* 의료급여 */}
                        <td className="p-2 border-r border-slate-200">
                          <input
                            type="text"
                            value={
                              config.customBenefitAmounts.medical[
                                m
                              ]?.toLocaleString('ko-KR') ?? ''
                            }
                            onChange={(e) =>
                              handleAmountChange('medical', m, e.target.value)
                            }
                            className="w-full text-right px-2.5 py-1.5 text-sm font-semibold border border-slate-300 rounded-md focus:border-emerald-500 focus:outline-none"
                          />
                        </td>

                        {/* 주거급여 */}
                        <td className="p-2 border-r border-slate-200">
                          <input
                            type="text"
                            value={
                              config.customBenefitAmounts.housing[
                                m
                              ]?.toLocaleString('ko-KR') ?? ''
                            }
                            onChange={(e) =>
                              handleAmountChange('housing', m, e.target.value)
                            }
                            className="w-full text-right px-2.5 py-1.5 text-sm font-semibold border border-slate-300 rounded-md focus:border-amber-500 focus:outline-none"
                          />
                        </td>

                        {/* 교육급여 */}
                        <td className="p-2 border-r border-slate-200">
                          <input
                            type="text"
                            value={
                              config.customBenefitAmounts.education[
                                m
                              ]?.toLocaleString('ko-KR') ?? ''
                            }
                            onChange={(e) =>
                              handleAmountChange(
                                'education',
                                m,
                                e.target.value,
                              )
                            }
                            className="w-full text-right px-2.5 py-1.5 text-sm font-semibold border border-slate-300 rounded-md focus:border-purple-500 focus:outline-none"
                          />
                        </td>

                        {/* 기준 중위소득 */}
                        <td className="p-2 bg-slate-50/40">
                          <input
                            type="text"
                            value={
                              config.customMedianIncomeTable[
                                m
                              ]?.toLocaleString('ko-KR') ?? ''
                            }
                            onChange={(e) =>
                              handleMedianChange(m, e.target.value)
                            }
                            className="w-full text-right px-2.5 py-1.5 text-sm font-bold border border-slate-300 rounded-md bg-white focus:border-blue-500 focus:outline-none"
                          />
                        </td>
                      </tr>
                    ))}

                    {/* 8인 이상 가산 행 */}
                    <tr className="bg-slate-100/70 font-semibold text-slate-800">
                      <td className="p-2.5 text-center text-sm font-bold border-r border-slate-200">
                        8인 이상
                        <span className="block text-xs text-slate-500">
                          (1인당 증가)
                        </span>
                      </td>

                      {/* 생계 8인가산 */}
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={
                            config.extraPerPersonByBenefit.livelihood?.toLocaleString(
                              'ko-KR',
                            ) ?? ''
                          }
                          onChange={(e) =>
                            handleExtraPerPersonChange(
                              'livelihood',
                              e.target.value,
                            )
                          }
                          className="w-full text-right px-2.5 py-1.5 text-sm font-semibold border border-slate-300 rounded-md bg-white"
                        />
                      </td>

                      {/* 의료 8인가산 */}
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={
                            config.extraPerPersonByBenefit.medical?.toLocaleString(
                              'ko-KR',
                            ) ?? ''
                          }
                          onChange={(e) =>
                            handleExtraPerPersonChange('medical', e.target.value)
                          }
                          className="w-full text-right px-2.5 py-1.5 text-sm font-semibold border border-slate-300 rounded-md bg-white"
                        />
                      </td>

                      {/* 주거 8인가산 */}
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={
                            config.extraPerPersonByBenefit.housing?.toLocaleString(
                              'ko-KR',
                            ) ?? ''
                          }
                          onChange={(e) =>
                            handleExtraPerPersonChange('housing', e.target.value)
                          }
                          className="w-full text-right px-2.5 py-1.5 text-sm font-semibold border border-slate-300 rounded-md bg-white"
                        />
                      </td>

                      {/* 교육 8인가산 */}
                      <td className="p-2 border-r border-slate-200">
                        <input
                          type="text"
                          value={
                            config.extraPerPersonByBenefit.education?.toLocaleString(
                              'ko-KR',
                            ) ?? ''
                          }
                          onChange={(e) =>
                            handleExtraPerPersonChange(
                              'education',
                              e.target.value,
                            )
                          }
                          className="w-full text-right px-2.5 py-1.5 text-sm font-semibold border border-slate-300 rounded-md bg-white"
                        />
                      </td>

                      {/* 중위소득 8인가산 */}
                      <td className="p-2">
                        <input
                          type="text"
                          value={
                            config.extraPerPerson?.toLocaleString('ko-KR') ?? ''
                          }
                          onChange={(e) =>
                            handleExtraPerPersonChange('median', e.target.value)
                          }
                          className="w-full text-right px-2.5 py-1.5 text-sm font-bold border border-slate-300 rounded-md bg-white"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Ratios & Median Table */}
          {activeTab === 'ratios' && (
            <div className="space-y-5">
              {/* 급여별 기준 비율(%) 설정 */}
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30">
                <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5">
                  4대 급여별 선정기준 비율(%) 설정 (기준 중위소득 대비)
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 mb-3.5">
                  법령 및 정책 개정으로 급여별 기준선 비율이 변경될 경우(예: 생계급여 32% → 35% 상향) 비율을 직접 수정할 수 있습니다.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  {benefits.map((b) => (
                    <div
                      key={b}
                      className="bg-white p-3.5 rounded-lg border border-slate-200"
                    >
                      <label className="block text-sm font-bold text-slate-800 mb-1.5">
                        {BENEFIT_NAMES[b]} 비율
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          min="1"
                          max="100"
                          value={config.ratios[b]}
                          onChange={(e) => handleRatioChange(b, e.target.value)}
                          className="w-full px-3 py-2 text-base font-bold text-right pr-7 border border-slate-300 rounded-md focus:outline-blue-500"
                        />
                        <span className="absolute right-2.5 top-2.5 text-sm text-slate-400">
                          %
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3.5 text-right">
                  <button
                    type="button"
                    onClick={handleRecalculateAmountsFromRatios}
                    className="text-xs sm:text-sm font-bold px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition cursor-pointer"
                  >
                    이 비율로 가구원수별 선정기준액 일괄 재산출
                  </button>
                </div>
              </div>

              {/* 기준 중위소득 1인~7인 테이블 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40">
                <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-2.5">
                  가구원수별 기준 중위소득 설정 (월 기준, 원)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7].map((m) => (
                    <div
                      key={m}
                      className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between"
                    >
                      <span className="text-sm font-bold text-slate-700">
                        {m}인 가구
                      </span>
                      <input
                        type="text"
                        value={
                          config.customMedianIncomeTable[m]?.toLocaleString(
                            'ko-KR',
                          ) ?? ''
                        }
                        onChange={(e) => handleMedianChange(m, e.target.value)}
                        className="w-32 text-right px-2.5 py-1.5 text-sm font-bold border border-slate-300 rounded-md focus:outline-blue-500"
                      />
                    </div>
                  ))}

                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700">
                      8인이상(1인당)
                    </span>
                    <input
                      type="text"
                      value={
                        config.extraPerPerson?.toLocaleString('ko-KR') ?? ''
                      }
                      onChange={(e) =>
                        handleExtraPerPersonChange('median', e.target.value)
                      }
                      className="w-32 text-right px-2.5 py-1.5 text-sm font-bold border border-slate-300 rounded-md focus:outline-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: 2026 차상위본인부담경감 기준표 */}
          {activeTab === 'near_poverty' && (
            <div className="space-y-5">
              {/* 1. 차상위본인부담경감 중위소득 50% 및 지역별 기본재산공제 */}
              <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/30 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-sm sm:text-base font-bold text-teal-950">
                    ① 2026년 차상위본인부담경감 소득인정액 선정기준 (기준 중위소득 50% 이하, 지침 p.3·12)
                  </h4>
                  <span className="text-xs sm:text-sm font-bold text-teal-800 bg-teal-100/80 px-2.5 py-1 rounded-md">
                    지역 기본재산공제: 서울·경기·광역 {(NEAR_POVERTY_BASIC_PROPERTY_DEDUCTION.seoul / 10000).toLocaleString()}만원 / 기타 {(NEAR_POVERTY_BASIC_PROPERTY_DEDUCTION.other / 10000).toLocaleString()}만원
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5 text-center text-xs sm:text-sm">
                  {[1, 2, 3, 4, 5, 6, 7].map((m) => (
                    <div key={m} className="p-2.5 rounded-lg bg-white border border-teal-200 shadow-2xs">
                      <span className="block text-xs text-slate-600 font-semibold">{m}인 가구</span>
                      <strong className="text-teal-800 font-extrabold block mt-0.5">
                        {NEAR_POVERTY_2026_MEDIAN_50[m].toLocaleString()}원
                      </strong>
                    </div>
                  ))}
                  <div className="p-2.5 rounded-lg bg-teal-100/60 border border-teal-300">
                    <span className="block text-xs text-teal-800 font-bold">8인이상(1인당)</span>
                    <strong className="text-teal-900 font-extrabold block mt-0.5">
                      +{NEAR_POVERTY_EXTRA_PER_PERSON_50.toLocaleString()}원
                    </strong>
                  </div>
                </div>
              </div>

              {/* 2. 2026년도 부양의무자의 부양능력 판정기준표 (120% ~ 180%) */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">
                    ② 2026년도 차상위본인부담경감 부양의무자의 부양능력 판정기준표 (지침 p.3, p.47)
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    * 부양의무자의 재산은 산정하지 않으며, 실제소득(교육비·월세 등 차감 후 순소득)이 아래 기준액 미만이면 <strong>부양능력 없음(적격)</strong>으로 판정됩니다. (부양비 부과 없음)
                  </p>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="min-w-full divide-y divide-slate-200 text-xs sm:text-sm text-center">
                    <thead className="bg-slate-100 font-bold text-slate-800">
                      <tr>
                        <th className="p-2.5 border-r border-slate-200">
                          차상위 대상자수 \ 부양의무자 세대원수
                        </th>
                        {[1, 2, 3, 4, 5, 6, 7].map((f) => (
                          <th key={f} className="p-2.5 border-r border-slate-200 last:border-r-0">
                            {f}인 세대
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {[1, 2, 3, 4, 5, 6, 7].map((t) => (
                        <tr key={t} className={t === 1 ? 'bg-teal-50/50 font-semibold' : 'hover:bg-slate-50'}>
                          <td className="p-2.5 font-bold text-teal-900 bg-slate-50 border-r border-slate-200">
                            대상자 {t}인 ({110 + t * 10}%)
                          </td>
                          {[1, 2, 3, 4, 5, 6, 7].map((f) => (
                            <td key={f} className="p-2.5 border-r border-slate-200 last:border-r-0 font-mono">
                              {NEAR_POVERTY_OBLIGATION_TABLE_2026[t][f].toLocaleString()}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>정부 고시 기본값 복원</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 px-4 py-2 rounded-lg cursor-pointer"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>설정 저장 및 적용</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
