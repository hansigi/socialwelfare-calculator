/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  CarExemptionType,
  CarItem,
  REGION_CONFIGS,
  WelfareInputs,
} from '../types/welfare';
import { CurrencyInput } from './CurrencyInput';
import { formatKoreanWon } from '../utils/calculator';
import {
  Home,
  Building2,
  Coins,
  Car,
  ReceiptText,
  AlertCircle,
  Plus,
  Trash2,
  Layers,
  PiggyBank,
} from 'lucide-react';

interface PropertySectionProps {
  inputs: WelfareInputs;
  onChange: (updater: (prev: WelfareInputs) => WelfareInputs) => void;
}

export const PropertySection: React.FC<PropertySectionProps> = ({
  inputs,
  onChange,
}) => {
  const regionCfg = REGION_CONFIGS[inputs.region];
  const appliedHousingLimit = regionCfg.housingPropertyLimit;

  // 주거용 재산 총액 계산 (보정계수 반영)
  const depositAdjusted = inputs.housingProperty.applyDepositFactor
    ? Math.round(inputs.housingProperty.depositValue * 0.95)
    : inputs.housingProperty.depositValue;
  const rawHousingTotal = inputs.housingProperty.ownHomeValue + depositAdjusted;
  const isHousingOverflow = rawHousingTotal > appliedHousingLimit;
  const overflowAmount = isHousingOverflow
    ? rawHousingTotal - appliedHousingLimit
    : 0;

  // 차량 추가/수정/삭제
  const handleAddCar = () => {
    const newCar: CarItem = {
      id: `car-${Date.now()}`,
      name: `차량 ${inputs.cars.length + 1}`,
      value: 0,
      type: 'general',
    };
    onChange((prev) => ({
      ...prev,
      cars: [...prev.cars, newCar],
    }));
  };

  const handleUpdateCar = (id: string, patch: Partial<CarItem>) => {
    onChange((prev) => ({
      ...prev,
      cars: prev.cars.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  };

  const handleRemoveCar = (id: string) => {
    onChange((prev) => ({
      ...prev,
      cars: prev.cars.filter((c) => c.id !== id),
    }));
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs transition">
      <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-extrabold text-base shrink-0">
            3
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              재산 사항 입력 및 환산 (주거용·일반·금융·자동차)
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              기본재산액과 부채는 [주거용재산 → 일반재산 → 금융재산] 순으로 차감되며, 자동차는 별도 100% 또는 감면율이 적용됩니다.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* 1. 주거용 재산 */}
        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/20">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
            <div className="flex items-center gap-2">
              <Home className="w-4.5 h-4.5 text-blue-600" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                주거용 재산 (월 1.04% 소득환산율)
              </h3>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-md">
              지역 한도: {formatKoreanWon(appliedHousingLimit)}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 mb-3.5">
            자가 주택 및 전·월세 임차보증금이 해당되며, 한도 초과 시 자동으로 일반재산(4.17%)으로 합산됩니다.
          </p>

          <div className="space-y-3.5">
            <CurrencyInput
              label="자가 거주 주택 (시가표준액 또는 공시가격)"
              value={inputs.housingProperty.ownHomeValue}
              onChange={(val) =>
                onChange((prev) => ({
                  ...prev,
                  housingProperty: {
                    ...prev.housingProperty,
                    ownHomeValue: val,
                  },
                }))
              }
            />

            <div>
              <CurrencyInput
                label="전·월세 임차보증금"
                value={inputs.housingProperty.depositValue}
                onChange={(val) =>
                  onChange((prev) => ({
                    ...prev,
                    housingProperty: {
                      ...prev.housingProperty,
                      depositValue: val,
                    },
                  }))
                }
              />
              <label className="mt-2.5 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inputs.housingProperty.applyDepositFactor}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      housingProperty: {
                        ...prev.housingProperty,
                        applyDepositFactor: e.target.checked,
                      },
                    }))
                  }
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs sm:text-sm text-slate-700 font-semibold">
                  임차보증금 보정계수 0.95(95%) 적용{' '}
                  <span className="text-xs text-slate-500 font-normal">
                    (지침 권장: 거주 유지 필수비용 감안)
                  </span>
                </span>
              </label>
            </div>

            {/* 초과분 안내 배너 */}
            {isHousingOverflow && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm flex items-start gap-2">
                <AlertCircle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">주거용재산 한도 초과 자동 이관</p>
                  <p className="text-xs sm:text-sm text-amber-700 mt-0.5 leading-relaxed">
                    주거용 합계 {formatKoreanWon(rawHousingTotal)} 중 한도(
                    {formatKoreanWon(appliedHousingLimit)})를 초과한{' '}
                    <strong className="text-amber-900 font-bold">
                      {formatKoreanWon(overflowAmount)}
                    </strong>
                    은 자동으로 일반재산(4.17%)으로 전환되어 산정됩니다.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. 일반재산 */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/30">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
            <div className="flex items-center gap-2">
              <Building2 className="w-4.5 h-4.5 text-slate-700" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                일반재산 (월 4.17% 소득환산율)
              </h3>
            </div>
            {isHousingOverflow && (
              <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md">
                주거초과분 +{formatKoreanWon(overflowAmount)} 포함
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-600 mb-3.5">
            비거주 일반 주택, 상가 건물, 토지 시가표준액, 회원권, 분양권, 기타증여재산 등이 포함됩니다.
          </p>

          <div className="space-y-3.5">
            <CurrencyInput
              label="일반 주택(비거주) 가액"
              value={inputs.generalProperty.nonResHomeValue}
              onChange={(val) =>
                onChange((prev) => ({
                  ...prev,
                  generalProperty: {
                    ...prev.generalProperty,
                    nonResHomeValue: val,
                  },
                }))
              }
              quickAddButtons={false}
            />
            <CurrencyInput
              label="건물(상가, 사무실 등) 시가표준액"
              value={inputs.generalProperty.buildingValue}
              onChange={(val) =>
                onChange((prev) => ({
                  ...prev,
                  generalProperty: {
                    ...prev.generalProperty,
                    buildingValue: val,
                  },
                }))
              }
              quickAddButtons={false}
            />
            <CurrencyInput
              label="토지(임야, 전답, 대지 등) 시가표준액"
              value={inputs.generalProperty.landValue}
              onChange={(val) =>
                onChange((prev) => ({
                  ...prev,
                  generalProperty: {
                    ...prev.generalProperty,
                    landValue: val,
                  },
                }))
              }
              quickAddButtons={false}
            />
            <CurrencyInput
              label="기타 일반재산 (입주권, 회원권, 기타증여 등)"
              value={inputs.generalProperty.otherGeneralValue}
              onChange={(val) =>
                onChange((prev) => ({
                  ...prev,
                  generalProperty: {
                    ...prev.generalProperty,
                    otherGeneralValue: val,
                  },
                }))
              }
              quickAddButtons={false}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* 3. 금융재산 */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/30">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
            <div className="flex items-center gap-2">
              <Coins className="w-4.5 h-4.5 text-emerald-600" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                금융재산 (월 6.26% 소득환산율)
              </h3>
            </div>
            <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md font-bold">
              환산율 6.26%
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 mb-3.5">
            예금, 적금, 주식, 펀드, 보험 해약환급금 등 가구원의 모든 금융자산 합계입니다.
          </p>

          <div className="space-y-3.5">
            <CurrencyInput
              label="금융자산 총액 (예·적금, 주식, 보험환급금 등)"
              value={inputs.financialProperty.depositAndSavings}
              onChange={(val) =>
                onChange((prev) => ({
                  ...prev,
                  financialProperty: {
                    ...prev.financialProperty,
                    depositAndSavings: val,
                  },
                }))
              }
            />

            <label className="flex items-start gap-2.5 p-3 rounded-lg border border-emerald-200 bg-emerald-50/40 cursor-pointer">
              <input
                type="checkbox"
                checked={inputs.financialProperty.applyLivingReserveDeduction}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    financialProperty: {
                      ...prev.financialProperty,
                      applyLivingReserveDeduction: e.target.checked,
                    },
                  }))
                }
                className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
              <div className="flex-1 text-xs sm:text-sm">
                <span className="font-bold text-slate-900">
                  생활준비금 500만 원 기본공제 적용
                </span>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  가구당 1회 500만 원을 금융재산에서 최우선 공제하여 산정합니다.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* 4. 부채 (차감 항목) */}
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/20">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
            <div className="flex items-center gap-2">
              <ReceiptText className="w-4.5 h-4.5 text-rose-600" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                부채 (재산 차감 항목)
              </h3>
            </div>
            <span className="text-xs bg-rose-100 text-rose-800 font-bold px-2.5 py-0.5 rounded-md">
              기본재산액과 함께 차감
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 mb-3.5">
            금융기관 대출금 및 임대보증금(1채에 한함)은 재산가액에서 차감됩니다. (사채 제외)
          </p>

          <div className="space-y-3.5">
            <CurrencyInput
              label="금융기관 대출금 (담보/신용대출)"
              value={inputs.debt.financialLoan}
              onChange={(val) =>
                onChange((prev) => ({
                  ...prev,
                  debt: { ...prev.debt, financialLoan: val },
                }))
              }
              helperText="은행, 상호금융 등 공적 증빙 가능한 대출 잔액"
            />
            <CurrencyInput
              label="임대보증금 부채 (타인에게 임대한 주택 1채)"
              value={inputs.debt.rentalDepositLiability}
              onChange={(val) =>
                onChange((prev) => ({
                  ...prev,
                  debt: { ...prev.debt, rentalDepositLiability: val },
                }))
              }
              helperText="임대차계약서 및 확정일자 증빙 가능한 임대보증금 반환의무액"
            />
          </div>
        </div>
      </div>

      {/* 5. 재산 공제 항목 (장기저축 & 처분재산 자연감소분) */}
      <div className="p-4 rounded-xl border border-teal-300 bg-teal-50/30 mb-6">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
          <div className="flex items-center gap-2">
            <PiggyBank className="w-4.5 h-4.5 text-teal-600" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              재산 공제 항목 (장기저축 공제 & 처분재산 자연감소분)
            </h3>
          </div>
          <span className="text-xs bg-teal-100 text-teal-800 font-bold px-2.5 py-0.5 rounded-md">
            재산 산정 시 특별 차감
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 mb-3.5">
          수급자의 자활·자립을 위한 정책 장기저축과 과거 재산 처분 후 생계비·의료비 등으로 소진된 자연감소분을 재산 산정에서 공제합니다.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-3.5 rounded-lg border border-teal-200">
            <CurrencyInput
              label="장기저축 공제액 (희망저축·청년내일저축 등)"
              value={inputs.propertyDeductions?.longTermSavings || 0}
              onChange={(val) =>
                onChange((prev) => ({
                  ...prev,
                  propertyDeductions: {
                    ...prev.propertyDeductions,
                    longTermSavings: val,
                  },
                }))
              }
              helperText="청년내일저축계좌, 희망저축계좌(Ⅰ·Ⅱ), 청년희망키움 등 금융재산에서 추가 공제"
            />
          </div>

          <div className="bg-white p-3.5 rounded-lg border border-teal-200">
            <CurrencyInput
              label="처분재산 자연감소분 (생계비·의료비 소비 인정액)"
              value={inputs.propertyDeductions?.naturalDecline || 0}
              onChange={(val) =>
                onChange((prev) => ({
                  ...prev,
                  propertyDeductions: {
                    ...prev.propertyDeductions,
                    naturalDecline: val,
                  },
                }))
              }
              helperText="부동산·전세금 등 처분 후 생계비, 만성질환 병원비, 부채상환으로 정당하게 소비된 차감액"
            />
          </div>
        </div>
      </div>

      {/* 6. 자동차 */}
      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/20 mb-4">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
          <div className="flex items-center gap-2">
            <Car className="w-4.5 h-4.5 text-amber-600" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              자동차 (월 100% 또는 감면율 적용, 기본공제·부채 차감 제외)
            </h3>
          </div>
          <button
            type="button"
            onClick={handleAddCar}
            className="text-xs sm:text-sm text-amber-800 hover:text-amber-900 font-bold inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100/70 hover:bg-amber-100 border border-amber-200 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>차량 추가</span>
          </button>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 mb-3.5 leading-relaxed">
          일반 승용차는 가액의 100%가 매월 소득으로 환산되므로 수급 탈락의 주요 요인이 됩니다.
          생업용, 배기량 1600cc 미만 장애인용 차량 등은 일반재산 환산율(4.17%) 또는 재산 산정 제외(0%)가 적용됩니다.
        </p>

        {inputs.cars.length === 0 ? (
          <div className="py-5 text-center rounded-lg border border-dashed border-slate-300 bg-white">
            <Car className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
            <p className="text-sm text-slate-600 font-medium">
              보유 중인 등록 차량이 없습니다.
            </p>
            <button
              type="button"
              onClick={handleAddCar}
              className="mt-2 text-sm text-blue-600 hover:underline font-bold cursor-pointer"
            >
              + 차량 등록하기
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {inputs.cars.map((car) => (
              <div
                key={car.id}
                className="p-3.5 rounded-lg border border-slate-200 bg-white"
              >
                <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
                  <input
                    type="text"
                    value={car.name}
                    onChange={(e) =>
                      handleUpdateCar(car.id, { name: e.target.value })
                    }
                    placeholder="차종/용도 (예: 모닝, 생업용 화물차)"
                    className="text-sm font-bold px-3 py-1.5 border border-slate-300 rounded-lg bg-white w-48 focus:outline-blue-500"
                  />

                  <div className="flex items-center gap-2">
                    <select
                      value={car.type}
                      onChange={(e) =>
                        handleUpdateCar(car.id, {
                          type: e.target.value as CarExemptionType,
                        })
                      }
                      className="text-sm font-semibold px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-blue-500 cursor-pointer"
                    >
                      <option value="general">일반 승용차 (월 100% 환산)</option>
                      <option value="general_property">
                        생업용·장애인용 등 (월 4.17% 일반재산 환산)
                      </option>
                      <option value="excluded">
                        재산 산정 제외 (0% 환산 제외)
                      </option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleRemoveCar(car.id)}
                      className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg transition cursor-pointer"
                      title="차량 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <CurrencyInput
                  label="차량 가액 (보험개발원 차량기준가액)"
                  value={car.value}
                  onChange={(val) => handleUpdateCar(car.id, { value: val })}
                />

                {car.value > 0 && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-slate-600 font-medium">
                      월 소득환산 반영액:
                    </span>
                    <span className="font-bold text-amber-700">
                      {car.type === 'general' &&
                        `${car.value.toLocaleString()}원 (월 100%)`}
                      {car.type === 'general_property' &&
                        `${Math.round(car.value * 0.0417).toLocaleString()}원 (월 4.17%)`}
                      {car.type === 'excluded' && '0원 (재산산정 제외)'}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 차감 순서 안내 인포그래픽 */}
      <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 flex items-center gap-2.5">
        <Layers className="w-4.5 h-4.5 text-blue-600 shrink-0" />
        <div className="leading-relaxed">
          <strong className="text-slate-900 font-bold">
            재산가액 차감 순서 [주거용재산 → 일반재산 → 금융재산]
          </strong>
          <span className="text-slate-600 ml-1.5">
            (기본재산액 + 부채 + 처분재산 자연감소분 합산 차감 풀이 소진될 때까지 순차 차감되며, 자동차 가액은 차감 풀에서 차감되지 않습니다.)
          </span>
        </div>
      </div>
    </section>
  );
};
