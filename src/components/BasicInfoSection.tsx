/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  NEAR_POVERTY_BASIC_PROPERTY_DEDUCTION,
  REGION_CONFIGS,
  RegionKey,
  WelfareInputs,
} from '../types/welfare';
import { calculateMedianIncome, formatKoreanWon } from '../utils/calculator';
import { Users, MapPin, ShieldAlert, SlidersHorizontal, Check } from 'lucide-react';

interface BasicInfoSectionProps {
  inputs: WelfareInputs;
  onChange: (updater: (prev: WelfareInputs) => WelfareInputs) => void;
  onOpenMedianModal: () => void;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  inputs,
  onChange,
  onOpenMedianModal,
}) => {
  const currentRegion = REGION_CONFIGS[inputs.region];
  const medianIncome = calculateMedianIncome(
    inputs.householdMembers,
    inputs.criteriaConfig?.customMedianIncomeTable ?? inputs.customMedianIncomeTable,
    inputs.criteriaConfig?.extraPerPerson,
  );

  const appliedBasicDeduction = inputs.isWorkIncapableSpecial
    ? currentRegion.specialPropertyDeduction
    : currentRegion.basicPropertyDeduction;

  const handleMemberChange = (count: number) => {
    onChange((prev) => ({
      ...prev,
      householdMembers: Math.max(1, count),
    }));
  };

  const handleRegionChange = (reg: RegionKey) => {
    onChange((prev) => ({
      ...prev,
      region: reg,
    }));
  };

  const handleToggleSpecial = (checked: boolean) => {
    onChange((prev) => ({
      ...prev,
      isWorkIncapableSpecial: checked,
    }));
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs transition">
      <div className="flex items-start sm:items-center justify-between pb-3.5 mb-5 border-b border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold text-base shrink-0">
            1
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">가구 기본 정보</h2>
            <p className="text-sm text-slate-600 mt-0.5">
              가구원 수, 거주지역 및 특례 기준에 따라 기준 중위소득 및 기본재산액이 결정됩니다.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenMedianModal}
          className="text-sm text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1.5 cursor-pointer ml-auto sm:ml-0"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>선정기준 관리 (급여별·가구원수별)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 가구원 수 선택 */}
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-slate-500" />
            <span>가구원 수 선택</span>
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleMemberChange(num)}
                className={`py-2.5 px-2 text-center rounded-lg text-sm font-bold border transition cursor-pointer ${
                  inputs.householdMembers === num
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                {num}인
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-slate-600 font-medium">8인 이상 직접 입력:</span>
            <input
              type="number"
              min="1"
              max="20"
              value={inputs.householdMembers}
              onChange={(e) => handleMemberChange(parseInt(e.target.value, 10) || 1)}
              className="w-20 px-2.5 py-1.5 text-sm border border-slate-300 rounded-md text-center font-bold text-slate-900 focus:outline-blue-500"
            />
            <span className="text-sm text-slate-600 font-medium">명</span>
          </div>

          {/* 해당 가구 중위소득 정보 요약 */}
          <div className="mt-3.5 p-3 rounded-lg bg-blue-50/70 border border-blue-100 flex items-center justify-between">
            <span className="text-sm text-slate-800 font-semibold">
              {inputs.householdMembers}인 가구 기준 중위소득:
            </span>
            <span className="text-base sm:text-lg font-extrabold text-blue-700">
              {medianIncome.toLocaleString()}원
            </span>
          </div>
        </div>

        {/* 거주 지역 선택 */}
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-slate-500" />
            <span>거주 지역 선택 (기초·차상위 기본재산액 및 주거용 한도)</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(Object.keys(REGION_CONFIGS) as RegionKey[]).map((regKey) => {
              const cfg = REGION_CONFIGS[regKey];
              const nearPovertyDed = NEAR_POVERTY_BASIC_PROPERTY_DEDUCTION[regKey];
              const isSelected = inputs.region === regKey;
              return (
                <button
                  key={regKey}
                  type="button"
                  onClick={() => handleRegionChange(regKey)}
                  className={`p-3 text-left rounded-lg border transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-100'
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-slate-900">
                      {cfg.name}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                  <div className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-snug space-y-0.5">
                    <div>기초 기본공제: {formatKoreanWon(cfg.basicPropertyDeduction)}</div>
                    <div className="text-teal-700 font-bold">
                      차상위 기본공제: {formatKoreanWon(nearPovertyDed)}
                    </div>
                    <div>주거용재산 한도: {formatKoreanWon(cfg.housingPropertyLimit)}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 특례 가구 체크박스 */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <label className="flex items-start gap-3 p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-50 cursor-pointer transition">
          <input
            type="checkbox"
            checked={inputs.isWorkIncapableSpecial}
            onChange={(e) => handleToggleSpecial(e.target.checked)}
            className="mt-1 w-4.5 h-4.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm sm:text-base font-bold text-slate-900">
                특례 가구 적용 (근로무능력자로만 구성된 가구)
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                기본재산액 상향
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              중증장애인, 65세 이상 노인 등 근로능력이 없는 사람으로만 구성된 가구의 경우 기본재산액이 상향 적용됩니다.
              (현재 선택 지역 적용액: <strong className="text-blue-700 font-bold">{formatKoreanWon(appliedBasicDeduction)}</strong>)
            </p>
          </div>
        </label>
      </div>
    </section>
  );
};
