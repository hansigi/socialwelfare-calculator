/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CalculationResult,
  REGION_CONFIGS,
  WelfareInputs,
} from '../types/welfare';
import { formatKoreanWon } from '../utils/calculator';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Shield,
  Layers,
  Calculator,
  X,
  Printer,
  Minus,
  Plus,
  Equal,
  Sparkles,
  Scale,
  HeartPulse,
  Info,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Building,
} from 'lucide-react';

interface CalculationProcessExplainerProps {
  inputs: WelfareInputs;
  result: CalculationResult;
  isModal?: boolean;
  onClose?: () => void;
  initialStep?: number;
}

export const CalculationProcessExplainer: React.FC<
  CalculationProcessExplainerProps
> = ({ inputs, result, isModal = false, onClose, initialStep = 1 }) => {
  const [activeStep, setActiveStep] = useState<number>(initialStep);
  const [openTipId, setOpenTipId] = useState<string | null>('tip-1');

  const {
    incomeBreakdown,
    propertyBreakdown,
    recognizedIncomeGeneral,
    recognizedIncomeMedical,
    livelihoodBenefit,
    medicalBenefit,
    housingBenefit,
    educationBenefit,
    nearPovertyResult,
    medianIncome,
  } = result;

  const regionCfg = REGION_CONFIGS[inputs.region];
  const appliedHousingLimit = regionCfg.housingPropertyLimit;

  // 부양비 계산값
  const medicalSupportPayment =
    inputs.supportObligation.medicalSupportStatus === 'weak_ability'
      ? inputs.supportObligation.supportPaymentAmount
      : 0;

  // 차상위 대비 절감액
  const nearPovertySavings = Math.max(
    0,
    recognizedIncomeMedical - nearPovertyResult.recognizedIncome
  );

  const content = (
    <div className="space-y-6 text-slate-800">
      {/* 1. 상단 총괄 공식 인포그래픽 & 3대 소득인정액 비교 카드 */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-yellow-300" />
            <h3 className="text-base sm:text-lg font-bold tracking-tight">
              소득인정액 산출 총괄 공식 & 3대 기준 비교
            </h3>
          </div>
          <span className="text-xs bg-white/20 text-yellow-200 px-2.5 py-0.5 rounded-full font-bold">
            2026 복지부 기초생활보장 & 차상위 지침 통합
          </span>
        </div>
        <p className="text-xs sm:text-sm text-blue-200 mb-4 leading-relaxed">
          수급 및 본인부담경감 자격은 소득과 재산을 사회보장급여법령에 따라 환산한{' '}
          <strong className="text-yellow-300 font-bold">‘소득인정액’</strong>을 기준으로 판정합니다.
          급여 종류와 사업 지침에 따라 공제율과 기본재산공제액이 크게 다릅니다.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs sm:text-sm">
          {/* 생계·주거·교육급여 산식 */}
          <div
            onClick={() => setActiveStep(2)}
            className="p-3.5 rounded-xl bg-white/10 hover:bg-white/15 transition cursor-pointer border border-white/15 flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-bold text-yellow-300 block mb-1">
                ① 생계 · 주거 · 교육급여 소득인정액
              </span>
              <div className="text-xs font-mono text-slate-300 mb-1.5">
                소득평가액(30%공제) + 재산환산액
              </div>
              <div className="text-xs text-blue-200 space-y-0.5 mb-2 font-mono">
                <div>소득: {incomeBreakdown.finalIncomeGeneral.toLocaleString()}원</div>
                <div>재산: {propertyBreakdown.totalPropertyConvertedMonthly.toLocaleString()}원</div>
              </div>
            </div>
            <div className="pt-2 border-t border-white/10 flex justify-between items-baseline">
              <span className="text-xs text-blue-200">최종:</span>
              <strong className="text-yellow-300 text-base font-black">
                {recognizedIncomeGeneral.toLocaleString()}원/월
              </strong>
            </div>
          </div>

          {/* 의료급여 산식 */}
          <div
            onClick={() => setActiveStep(2)}
            className="p-3.5 rounded-xl bg-white/10 hover:bg-white/15 transition cursor-pointer border border-white/15 flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-bold text-emerald-300 block mb-1">
                ② 의료급여 소득인정액 (부양비 포함)
              </span>
              <div className="text-xs font-mono text-slate-300 mb-1.5">
                소득(0%공제) + 재산환산 + 부양비
              </div>
              <div className="text-xs text-blue-200 space-y-0.5 mb-2 font-mono">
                <div>소득: {incomeBreakdown.finalIncomeMedical.toLocaleString()}원</div>
                <div>재산: {propertyBreakdown.totalPropertyConvertedMonthly.toLocaleString()}원</div>
                <div>부양비: {medicalSupportPayment.toLocaleString()}원</div>
              </div>
            </div>
            <div className="pt-2 border-t border-white/10 flex justify-between items-baseline">
              <span className="text-xs text-blue-200">최종:</span>
              <strong className="text-emerald-300 text-base font-black">
                {recognizedIncomeMedical.toLocaleString()}원/월
              </strong>
            </div>
          </div>

          {/* 차상위본인부담경감 산식 */}
          <div
            onClick={() => setActiveStep(4)}
            className="p-3.5 rounded-xl bg-teal-950/70 hover:bg-teal-950/90 transition cursor-pointer border-2 border-teal-400/50 flex flex-col justify-between ring-1 ring-teal-300/30 shadow-inner"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black text-teal-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                  ③ 차상위본인부담경감 소득인정액
                </span>
                <span className="text-[11px] font-bold bg-teal-500/30 text-teal-200 px-1.5 py-0.2 rounded">
                  중위 50%
                </span>
              </div>
              <div className="text-xs font-mono text-teal-200 mb-1.5">
                차상위 소득평가 + 차상위 재산환산 (부양비 0원)
              </div>
              <div className="text-xs text-teal-200/90 space-y-0.5 mb-2 font-mono">
                <div>소득: {nearPovertyResult.incomeBreakdown.finalIncomeGeneral.toLocaleString()}원 (사적이전 제외)</div>
                <div>재산: {nearPovertyResult.propertyBreakdown.totalPropertyConvertedMonthly.toLocaleString()}원 (기본공제 1.35억)</div>
              </div>
            </div>
            <div className="pt-2 border-t border-teal-700/50 flex justify-between items-baseline">
              <span className="text-xs text-teal-200">
                {nearPovertySavings > 0 ? (
                  <span className="text-teal-300 font-bold">
                    ▼ {nearPovertySavings.toLocaleString()}원 절감
                  </span>
                ) : (
                  '최종:'
                )}
              </span>
              <strong className="text-teal-300 text-base font-black">
                {nearPovertyResult.recognizedIncome.toLocaleString()}원/월
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 단계별 탭 네비게이션 */}
      <div className="flex border-b border-slate-200 overflow-x-auto text-xs sm:text-sm font-bold gap-1 pb-1">
        <button
          type="button"
          onClick={() => setActiveStep(1)}
          className={`px-3.5 py-2.5 rounded-t-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeStep === 1
              ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600 font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-blue-600" />
          <span>한눈에 보는 종합 계산 흐름도</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveStep(2)}
          className={`px-3.5 py-2.5 rounded-t-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeStep === 2
              ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600 font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
            1
          </span>
          <span>소득평가액 도출</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveStep(3)}
          className={`px-3.5 py-2.5 rounded-t-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeStep === 3
              ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600 font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
            2
          </span>
          <span>재산환산액 순차 차감 도출</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveStep(4)}
          className={`px-3.5 py-2.5 rounded-t-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeStep === 4
              ? 'bg-teal-50 text-teal-800 border-b-2 border-teal-600 font-black shadow-2xs'
              : 'text-teal-700 hover:bg-teal-50/50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span className="font-extrabold">차상위본인부담경감 산출 이유 상세 해설</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveStep(5)}
          className={`px-3.5 py-2.5 rounded-t-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeStep === 5
              ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600 font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs">
            4
          </span>
          <span>급여별 판정 원리</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveStep(6)}
          className={`px-3.5 py-2.5 rounded-t-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeStep === 6
              ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600 font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span>실무 Q&A 노트</span>
        </button>
      </div>

      {/* 3. 단계별 본문 */}

      {/* STEP 1: 한눈에 보는 종합 계산 흐름도 (Visual Pipeline Flow) */}
      {activeStep === 1 && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="p-4 sm:p-5 rounded-xl border border-blue-200 bg-white shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <span>한눈에 보는 소득·재산·공제 종합 흐름도</span>
              </h4>
              <span className="text-xs text-slate-500">
                입력하신 실제 데이터 기준 실시간 산출 파이프라인
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              복지제도의 소득인정액은 <strong>[실제소득에서 법정공제를 차감한 소득평가액]</strong>과{' '}
              <strong>[재산에서 기본공제·부채를 순차 차감한 후 월 환산율을 적용한 재산환산액]</strong>,{' '}
              그리고 <strong>[의료급여 부양비]</strong>의 합으로 도출됩니다.
            </p>

            {/* 시각적 파이프라인 블록 다이어그램 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              {/* 소득평가액 도출 블록 */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block mb-2">
                  PART 1. 소득평가액 산출 파이프라인
                </span>
                <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
                  {/* 실제 총소득 */}
                  <div className="flex-1 p-3 rounded-lg bg-blue-50/70 border border-blue-100 w-full">
                    <span className="text-xs font-bold text-slate-600 block">① 가구 총 실제소득</span>
                    <div className="text-base sm:text-lg font-black text-slate-900 mt-1">
                      {(
                        incomeBreakdown.rawEarnedTotal +
                        incomeBreakdown.propertyIncomeTotal +
                        incomeBreakdown.transferIncomeTotal +
                        incomeBreakdown.disabilityBenefitTotal
                      ).toLocaleString()}원
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      근로 {incomeBreakdown.rawEarnedTotal.toLocaleString()} + 이전/재산 {(incomeBreakdown.propertyIncomeTotal + incomeBreakdown.transferIncomeTotal + incomeBreakdown.disabilityBenefitTotal).toLocaleString()}원
                    </span>
                  </div>

                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-black shrink-0">
                    <Minus className="w-4 h-4" />
                  </div>

                  {/* 소득 공제액 */}
                  <div className="flex-1 p-3 rounded-lg bg-rose-50/70 border border-rose-100 w-full">
                    <span className="text-xs font-bold text-rose-700 block">② 법정 소득공제 합계</span>
                    <div className="text-base sm:text-lg font-black text-rose-700 mt-1">
                      -{(
                        (incomeBreakdown.rawEarnedTotal - incomeBreakdown.earnedGeneralEvaluated) +
                        incomeBreakdown.expenseDeductionTotal
                      ).toLocaleString()}원
                    </div>
                    <span className="text-[11px] text-rose-600 block mt-0.5">
                      근로공제 {(incomeBreakdown.rawEarnedTotal - incomeBreakdown.earnedGeneralEvaluated).toLocaleString()} + 지출비용공제 {incomeBreakdown.expenseDeductionTotal.toLocaleString()}원
                    </span>
                  </div>

                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-black shrink-0">
                    <Equal className="w-4 h-4" />
                  </div>

                  {/* 소득평가액 도출 결과 */}
                  <div className="flex-1 p-3 rounded-lg bg-indigo-50 border border-indigo-200 w-full">
                    <span className="text-xs font-bold text-indigo-900 block">③ 최종 소득평가액</span>
                    <div className="text-base sm:text-lg font-black text-indigo-800 mt-1">
                      {incomeBreakdown.finalIncomeGeneral.toLocaleString()}원
                    </div>
                    <span className="text-[11px] text-indigo-600 block mt-0.5">
                      의료용: {incomeBreakdown.finalIncomeMedical.toLocaleString()}원 (공제미적용)
                    </span>
                  </div>
                </div>
              </div>

              {/* 연산자: + */}
              <div className="flex justify-center">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 text-white font-black shadow-xs">
                  <Plus className="w-5 h-5" />
                </div>
              </div>

              {/* 재산환산액 도출 블록 */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block mb-2">
                  PART 2. 재산의 소득환산액 산출 파이프라인
                </span>
                <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
                  {/* 보유 재산 */}
                  <div className="flex-1 p-3 rounded-lg bg-slate-50 border border-slate-200 w-full">
                    <span className="text-xs font-bold text-slate-600 block">① 총 재산 가액</span>
                    <div className="text-base sm:text-lg font-black text-slate-900 mt-1">
                      {(
                        propertyBreakdown.recognizedHousingProperty +
                        propertyBreakdown.totalGeneralPropertyWithOverflow +
                        propertyBreakdown.netFinancialProperty +
                        propertyBreakdown.rawCarTotal
                      ).toLocaleString()}원
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      주거용 + 일반 + 순금융 + 자동차
                    </span>
                  </div>

                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-black shrink-0">
                    <Minus className="w-4 h-4" />
                  </div>

                  {/* 차감 풀 */}
                  <div className="flex-1 p-3 rounded-lg bg-amber-50/70 border border-amber-200 w-full">
                    <span className="text-xs font-bold text-amber-800 block">② 총 차감 풀 (Pool)</span>
                    <div className="text-base sm:text-lg font-black text-amber-900 mt-1">
                      -{propertyBreakdown.totalDeductionPool.toLocaleString()}원
                    </div>
                    <span className="text-[11px] text-amber-700 block mt-0.5">
                      기본재산공제({formatKoreanWon(propertyBreakdown.basicPropertyDeduction)}) + 부채({formatKoreanWon(propertyBreakdown.totalDebt)})
                    </span>
                  </div>

                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-black shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>

                  {/* 월 환산액 */}
                  <div className="flex-1 p-3 rounded-lg bg-emerald-50 border border-emerald-200 w-full">
                    <span className="text-xs font-bold text-emerald-900 block">③ 월 재산환산액</span>
                    <div className="text-base sm:text-lg font-black text-emerald-800 mt-1">
                      {propertyBreakdown.totalPropertyConvertedMonthly.toLocaleString()}원/월
                    </div>
                    <span className="text-[11px] text-emerald-600 block mt-0.5">
                      주거(1.04%) + 일반(4.17%) + 금융(6.26%) + 차
                    </span>
                  </div>
                </div>
              </div>

              {/* 연산자: = 최종 소득인정액 */}
              <div className="flex justify-center">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-900 text-yellow-300 font-black shadow-xs">
                  <Equal className="w-5 h-5" />
                </div>
              </div>

              {/* 최종 소득인정액 종합 결과 박스 */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-yellow-300 font-bold uppercase tracking-wider block">
                    FINAL RECOGNIZED INCOME
                  </span>
                  <h4 className="text-lg sm:text-xl font-extrabold mt-0.5">
                    가구 최종 소득인정액 산출 결과
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    소득평가액 {incomeBreakdown.finalIncomeGeneral.toLocaleString()}원 + 재산환산액 {propertyBreakdown.totalPropertyConvertedMonthly.toLocaleString()}원
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <div className="text-right">
                    <span className="text-xs text-slate-300 block">생계·주거·교육용:</span>
                    <span className="text-xl sm:text-2xl font-black text-yellow-300">
                      {recognizedIncomeGeneral.toLocaleString()}원
                    </span>
                  </div>
                  <div className="h-10 w-px bg-white/20"></div>
                  <div className="text-right">
                    <span className="text-xs text-emerald-300 block">차상위본인부담경감용:</span>
                    <span className="text-xl sm:text-2xl font-black text-teal-300">
                      {nearPovertyResult.recognizedIncome.toLocaleString()}원
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 빠른 이동 카드 2개 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/30 transition text-left cursor-pointer flex items-center justify-between shadow-2xs"
              >
                <div>
                  <span className="text-xs font-bold text-blue-700 block">
                    순차 차감 매뉴얼 확인 ➔
                  </span>
                  <div className="text-sm font-bold text-slate-900">
                    기본재산공제와 부채가 왜 주거용부터 먼저 차감될까요?
                  </div>
                </div>
                <ChevronDown className="w-5 h-5 text-slate-400 -rotate-90 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => setActiveStep(4)}
                className="p-3.5 rounded-xl border-2 border-teal-300 hover:border-teal-500 bg-teal-50/50 hover:bg-teal-50 transition text-left cursor-pointer flex items-center justify-between shadow-2xs"
              >
                <div>
                  <span className="text-xs font-bold text-teal-700 block">
                    차상위 심층 해설 확인 ➔
                  </span>
                  <div className="text-sm font-extrabold text-teal-950">
                    차상위 소득인정액({nearPovertyResult.recognizedIncome.toLocaleString()}원)은 왜 이렇게 도출되었을까요?
                  </div>
                </div>
                <Sparkles className="w-5 h-5 text-teal-600 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: 소득평가액 도출 */}
      {activeStep === 2 && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-4 shadow-xs">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 text-xs sm:text-sm font-bold">
                  공식 대입
                </span>
                <span>소득평가액 = 실제소득 - 가구특성 지출비용 - 근로소득공제</span>
              </h4>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              근로소득 공제는 급여 유형에 따라 차등 적용됩니다.
              일반 수급(권)자의 경우 <strong>생계·주거·교육급여는 30%가 공제</strong>되지만,{' '}
              <strong>의료급여는 공제가 적용되지 않아(0%)</strong> 실제 소득 전액이 반영됩니다.
              단, 청년(34세 이하), 65세 이상 노인, 장애인 등 취약계층은 전 급여 공통으로 정액+정률 추가 공제가 적용됩니다.
            </p>

            {/* 가구원별 근로소득 공제 내역 표 */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="min-w-full text-xs sm:text-sm text-left divide-y divide-slate-200">
                <thead className="bg-slate-50 font-bold text-slate-700">
                  <tr>
                    <th className="p-2.5 border-r">가구원</th>
                    <th className="p-2.5 border-r">대상자 구분</th>
                    <th className="p-2.5 border-r text-right">세전 월소득</th>
                    <th className="p-2.5 border-r text-blue-700">생계·주거·교육 공제공식</th>
                    <th className="p-2.5 border-r text-right text-blue-700">생계 반영액</th>
                    <th className="p-2.5 border-r text-right text-emerald-700">의료 반영액</th>
                    <th className="p-2.5 text-right text-teal-700 bg-teal-50/50">차상위 반영액</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {inputs.earners.map((e) => {
                    let formulaDesc = '30% 공제 (소득 × 70%)';
                    if (e.category === 'youth') {
                      formulaDesc = '60만 원 공제 후 잔여액 30% 추가공제';
                    } else if (
                      e.category === 'disabled' ||
                      e.category === 'senior' ||
                      e.category === 'senior_disabled'
                    ) {
                      formulaDesc = '20만 원 공제 후 잔여액 30% 추가공제';
                    } else if (e.category === 'vocational') {
                      formulaDesc = '20만 원 공제 후 잔여액 50% 추가공제';
                    }

                    const genVal =
                      e.category === 'general'
                        ? Math.round(e.monthlyIncome * 0.7)
                        : e.category === 'youth'
                        ? Math.round(Math.max(0, e.monthlyIncome - 600_000) * 0.7)
                        : e.category === 'vocational'
                        ? Math.round(Math.max(0, e.monthlyIncome - 200_000) * 0.5)
                        : Math.round(Math.max(0, e.monthlyIncome - 200_000) * 0.7);

                    const medVal =
                      e.category === 'general'
                        ? e.monthlyIncome
                        : genVal;

                    const nearPovertyVal = genVal; // 차상위는 일반수급자도 30% 공제 적용!

                    const categoryNameMap: Record<string, string> = {
                      general: '일반 수급(권)자',
                      youth: '청년(34세 이하)·대학생',
                      disabled: '등록장애인',
                      senior: '65세 이상 노인',
                      senior_disabled: '노인·장애인·취약계층',
                      vocational: '장애인 직업재활 참여자',
                    };

                    const isDisability =
                      e.category === 'disabled' ||
                      e.category === 'vocational' ||
                      e.category === 'senior_disabled';

                    return (
                      <tr key={e.id} className="hover:bg-slate-50">
                        <td className="p-2.5 border-r font-semibold">{e.name}</td>
                        <td className="p-2.5 border-r text-slate-700 font-medium">
                          {categoryNameMap[e.category] || e.category}
                          {isDisability && e.disabilityBenefit && e.disabilityBenefit > 0 ? (
                            <span className="block text-xs text-purple-700 font-bold">
                              장애수당·연금 {e.disabilityBenefit.toLocaleString()}원 (100% 공제)
                            </span>
                          ) : null}
                        </td>
                        <td className="p-2.5 border-r text-right font-medium">
                          {e.monthlyIncome.toLocaleString()}원
                        </td>
                        <td className="p-2.5 border-r text-xs text-slate-600">
                          {formulaDesc}
                        </td>
                        <td className="p-2.5 border-r text-right font-bold text-blue-700">
                          {genVal.toLocaleString()}원
                        </td>
                        <td className="p-2.5 border-r text-right font-bold text-emerald-700">
                          {medVal.toLocaleString()}원
                        </td>
                        <td className="p-2.5 text-right font-black text-teal-700 bg-teal-50/30">
                          {nearPovertyVal.toLocaleString()}원
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 기타 소득 및 차감 내역 집계 카드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="space-y-2">
                <span className="font-bold text-slate-900 block border-b border-slate-200 pb-1">
                  소득 및 추가 공제 내역 집계
                </span>
                <div className="flex justify-between">
                  <span className="text-slate-600">• 재산소득(임대+이자+연금):</span>
                  <span className="font-semibold">
                    {incomeBreakdown.propertyIncomeTotal.toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">• 공적이전소득(국민연금, 기초연금 등):</span>
                  <span className="font-semibold">
                    {(incomeBreakdown.transferIncomeTotal - (inputs.transferIncome?.privateTransfer || 0)).toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">• 사적이전소득(자녀용돈 등):</span>
                  <span className="font-semibold">
                    {(inputs.transferIncome?.privateTransfer || 0).toLocaleString()}원
                    <span className="text-xs text-teal-700 font-bold ml-1">
                      (차상위는 0원 제외)
                    </span>
                  </span>
                </div>
                {incomeBreakdown.disabilityBenefitTotal > 0 && (
                  <div className="flex justify-between text-purple-700 font-medium">
                    <span>• 장애인 공적급여(연금·수당 수령액):</span>
                    <span>+{incomeBreakdown.disabilityBenefitTotal.toLocaleString()}원</span>
                  </div>
                )}
                <div className="flex justify-between text-rose-600 font-semibold border-t border-slate-200 pt-1">
                  <span>• 가구특성 지출비용 총 공제:</span>
                  <span>-{incomeBreakdown.expenseDeductionTotal.toLocaleString()}원</span>
                </div>
                {incomeBreakdown.expenseDeductionTotal > 0 && (
                  <div className="text-xs text-slate-600 pl-2 leading-relaxed">
                    └ 만성질환 의료비: {incomeBreakdown.chronicMedicalDeduction.toLocaleString()}원
                    {(inputs.expenseDeductions?.otherAdditionalDeduction || 0) > 0 && (
                      <span> + 국민연금 등 추가공제: {(inputs.expenseDeductions?.otherAdditionalDeduction || 0).toLocaleString()}원</span>
                    )}
                    {incomeBreakdown.disabilityBenefitDeduction > 0 && (
                      <span className="text-purple-700 font-semibold ml-1">
                        + 장애인연금·수당 100%: {incomeBreakdown.disabilityBenefitDeduction.toLocaleString()}원
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4 flex flex-col justify-center space-y-2.5">
                <span className="font-bold text-slate-900 block border-b border-slate-200 pb-1">
                  급여별 최종 소득평가액 도출 비교
                </span>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-blue-900">
                    생계·주거·교육급여용:
                  </span>
                  <span className="text-base font-black text-blue-700">
                    {incomeBreakdown.finalIncomeGeneral.toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-emerald-900">
                    의료급여용 (공제미적용):
                  </span>
                  <span className="text-base font-black text-emerald-700">
                    {incomeBreakdown.finalIncomeMedical.toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-teal-100/70 border border-teal-200">
                  <span className="font-extrabold text-teal-950">
                    차상위본인부담경감용:
                  </span>
                  <span className="text-base font-black text-teal-800">
                    {nearPovertyResult.incomeBreakdown.finalIncomeGeneral.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: 재산의 소득환산액 순차 차감 도출 */}
      {activeStep === 3 && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-4 shadow-xs">
            <h4 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-indigo-100 text-indigo-800 text-xs sm:text-sm font-bold">
                공식 대입
              </span>
              <span>재산의 소득환산액 = (순차 차감 후 잔여재산 × 환산율 합계) + 자동차 환산액</span>
            </h4>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              기초생활보장제도에서 재산은 현금이 아니므로 매월 일정한 비율(환산율)을 곱하여 ‘월 소득’으로 환산합니다.
              이때 가구의 기초적인 생활 안정을 위해 <strong>기본재산액과 부채, 처분재산 자연감소분을 합산한 ‘차감 풀’</strong>을 구성한 후,{' '}
              <strong className="text-blue-700 font-bold">[주거용재산 → 일반재산 → 금융재산]</strong> 순서로 차감합니다.{' '}
              <span className="text-rose-600 font-semibold">(자동차는 차감 풀에서 차감되지 않습니다.)</span>
            </p>

            {/* 총 차감 풀 구성 배너 */}
            <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs sm:text-sm">
              <span className="font-extrabold text-indigo-900 block mb-1.5">
                📌 총 차감 풀 (Deduction Pool) 산출 내역:
              </span>
              <div className="flex flex-wrap items-center gap-2 text-slate-700 font-medium">
                <span>기본재산액 ({formatKoreanWon(propertyBreakdown.basicPropertyDeduction)})</span>
                <span>+</span>
                <span>총 부채 ({formatKoreanWon(propertyBreakdown.totalDebt)})</span>
                {propertyBreakdown.naturalDeclineDeduction > 0 && (
                  <>
                    <span>+</span>
                    <span>처분재산 자연감소분 ({formatKoreanWon(propertyBreakdown.naturalDeclineDeduction)})</span>
                  </>
                )}
                <span>=</span>
                <strong className="text-indigo-800 text-base font-black">
                  총 {propertyBreakdown.totalDeductionPool.toLocaleString()}원
                </strong>
              </div>
            </div>

            {/* 순차 차감 단계별 시뮬레이션 표 */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="min-w-full text-xs sm:text-sm text-left divide-y divide-slate-200">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="p-2.5 border-r text-center">차감순서</th>
                    <th className="p-2.5 border-r">재산 항목</th>
                    <th className="p-2.5 border-r">가액 산정 설명</th>
                    <th className="p-2.5 border-r text-right">차감 전 가액</th>
                    <th className="p-2.5 border-r text-right text-rose-600">적용 차감액</th>
                    <th className="p-2.5 border-r text-right font-bold">최종 잔여액</th>
                    <th className="p-2.5 border-r text-center">월 환산율</th>
                    <th className="p-2.5 text-right font-bold text-slate-900">월 환산액</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {/* 주거용 */}
                  <tr>
                    <td className="p-2.5 text-center font-bold text-blue-700 border-r bg-blue-50/40">1단계</td>
                    <td className="p-2.5 font-bold text-blue-800 border-r">주거용재산</td>
                    <td className="p-2.5 text-xs text-slate-600 border-r">
                      자가 + (보증금×0.95), 한도 {formatKoreanWon(appliedHousingLimit)}
                      {propertyBreakdown.overflowToGeneralProperty > 0 && (
                        <span className="text-amber-600 block font-semibold">
                          한도초과 {formatKoreanWon(propertyBreakdown.overflowToGeneralProperty)} 일반재산 이관
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 text-right border-r">
                      {propertyBreakdown.recognizedHousingProperty.toLocaleString()}원
                    </td>
                    <td className="p-2.5 text-right text-rose-600 border-r">
                      -{propertyBreakdown.housingDeductedAmount.toLocaleString()}원
                    </td>
                    <td className="p-2.5 text-right font-bold border-r">
                      {propertyBreakdown.finalHousingProperty.toLocaleString()}원
                    </td>
                    <td className="p-2.5 text-center border-r font-semibold">1.04%</td>
                    <td className="p-2.5 text-right font-extrabold text-blue-700">
                      {propertyBreakdown.housingConvertedMonthly.toLocaleString()}원
                    </td>
                  </tr>

                  {/* 일반재산 */}
                  <tr>
                    <td className="p-2.5 text-center font-bold text-indigo-700 border-r bg-indigo-50/40">2단계</td>
                    <td className="p-2.5 font-bold text-indigo-800 border-r">일반재산</td>
                    <td className="p-2.5 text-xs text-slate-600 border-r">
                      비거주주택+토지+건물+주거초과분
                    </td>
                    <td className="p-2.5 text-right border-r">
                      {propertyBreakdown.totalGeneralPropertyWithOverflow.toLocaleString()}원
                    </td>
                    <td className="p-2.5 text-right text-rose-600 border-r">
                      -{propertyBreakdown.generalDeductedAmount.toLocaleString()}원
                    </td>
                    <td className="p-2.5 text-right font-bold border-r">
                      {propertyBreakdown.finalGeneralProperty.toLocaleString()}원
                    </td>
                    <td className="p-2.5 text-center border-r font-semibold">4.17%</td>
                    <td className="p-2.5 text-right font-extrabold text-indigo-700">
                      {propertyBreakdown.generalConvertedMonthly.toLocaleString()}원
                    </td>
                  </tr>

                  {/* 금융재산 */}
                  <tr>
                    <td className="p-2.5 text-center font-bold text-emerald-700 border-r bg-emerald-50/40">3단계</td>
                    <td className="p-2.5 font-bold text-emerald-800 border-r">금융재산</td>
                    <td className="p-2.5 text-xs text-slate-600 border-r">
                      총금융재산 - 생활준비금(500만) - 장기저축공제
                    </td>
                    <td className="p-2.5 text-right border-r">
                      {propertyBreakdown.netFinancialProperty.toLocaleString()}원
                    </td>
                    <td className="p-2.5 text-right text-rose-600 border-r">
                      -{propertyBreakdown.financialDeductedAmount.toLocaleString()}원
                    </td>
                    <td className="p-2.5 text-right font-bold border-r">
                      {propertyBreakdown.finalFinancialProperty.toLocaleString()}원
                    </td>
                    <td className="p-2.5 text-center border-r font-semibold">6.26%</td>
                    <td className="p-2.5 text-right font-extrabold text-emerald-700">
                      {propertyBreakdown.financialConvertedMonthly.toLocaleString()}원
                    </td>
                  </tr>

                  {/* 자동차 */}
                  <tr className="bg-amber-50/40">
                    <td className="p-2.5 text-center font-bold text-slate-500 border-r">별도</td>
                    <td className="p-2.5 font-bold text-amber-900 border-r">자동차</td>
                    <td className="p-2.5 text-xs text-slate-600 border-r">
                      일반 승용차 100%, 특례 4.17% (차감 풀 차감 배제)
                    </td>
                    <td className="p-2.5 text-right border-r">
                      {propertyBreakdown.rawCarTotal.toLocaleString()}원
                    </td>
                    <td className="p-2.5 text-center text-slate-400 border-r">차감 없음</td>
                    <td className="p-2.5 text-right font-bold border-r">
                      {propertyBreakdown.rawCarTotal.toLocaleString()}원
                    </td>
                    <td className="p-2.5 text-center border-r font-semibold">100% / 4.17%</td>
                    <td className="p-2.5 text-right font-extrabold text-amber-800">
                      {propertyBreakdown.carConvertedMonthly.toLocaleString()}원
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3.5 bg-slate-100 rounded-lg text-right font-bold text-xs sm:text-sm text-slate-800">
              월 재산환산액 합계: 주거용({propertyBreakdown.housingConvertedMonthly.toLocaleString()}원) +
              일반재산({propertyBreakdown.generalConvertedMonthly.toLocaleString()}원) +
              금융재산({propertyBreakdown.financialConvertedMonthly.toLocaleString()}원) +
              자동차({propertyBreakdown.carConvertedMonthly.toLocaleString()}원) ={' '}
              <span className="text-base font-black text-blue-700">
                {propertyBreakdown.totalPropertyConvertedMonthly.toLocaleString()}원/월
              </span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: 차상위본인부담경감 소득인정액 왜 이렇게 나왔을까? (핵심 요청 심층 해설) */}
      {activeStep === 4 && (
        <div className="space-y-5 animate-in fade-in duration-150 text-xs sm:text-sm">
          {/* 하이라이트 배너 */}
          <div className="p-4 sm:p-5 rounded-2xl border-2 border-teal-500 bg-gradient-to-br from-teal-900 via-emerald-950 to-slate-900 text-white shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-teal-300" />
              <h4 className="text-base sm:text-lg font-bold text-teal-200">
                차상위 본인부담경감 소득인정액은 왜 이렇게 도출되었을까요?
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-teal-100 leading-relaxed mb-4">
              기초생활보장(특히 의료급여)에서 탈락했거나 기준을 초과한 가구라도,{' '}
              <strong>차상위 본인부담경감 지원사업 지침</strong>은 사회적 취약계층 보호를 위해 소득과 재산 기준을 대폭 완화합니다.
              아래의 <strong>4대 법정 특례</strong>로 인해 소득인정액이 획기적으로 낮아지거나 0원으로 산출됩니다.
            </p>

            {/* 수식 대입 카드 */}
            <div className="p-4 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20">
              <span className="text-xs font-bold text-teal-300 block mb-1">
                차상위 본인부담경감 소득인정액 공식 대입식
              </span>
              <div className="text-sm sm:text-base font-mono font-bold text-white mb-2">
                소득평가액 {nearPovertyResult.incomeBreakdown.finalIncomeGeneral.toLocaleString()}원 + 재산환산액 {nearPovertyResult.propertyBreakdown.totalPropertyConvertedMonthly.toLocaleString()}원 + 부양비 0원 ={' '}
                <strong className="text-teal-300 text-lg font-black">
                  {nearPovertyResult.recognizedIncome.toLocaleString()}원/월
                </strong>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-teal-200">
                <span>기준 중위소득 50%({nearPovertyResult.criterionAmount.toLocaleString()}원) 대비:</span>
                <span className="font-bold text-white px-2 py-0.5 rounded bg-teal-500/40">
                  {nearPovertyResult.incomeDifference >= 0
                    ? `${nearPovertyResult.incomeDifference.toLocaleString()}원 여유 (선정 적합)`
                    : `${Math.abs(nearPovertyResult.incomeDifference).toLocaleString()}원 초과 (부적합)`}
                </span>
                {nearPovertySavings > 0 && (
                  <span className="text-yellow-300 font-bold ml-auto">
                    (기초 의료급여 인정액 대비 {nearPovertySavings.toLocaleString()}원 대폭 절감!)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 4대 핵심 사유 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* 1. 사적이전소득 100% 제외 */}
            <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-950 text-sm flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-black">
                    1
                  </span>
                  <span>사적이전소득 전액 제외 (0원 처리)</span>
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-teal-200/70 text-teal-900 font-bold">
                  지침 p.26
                </span>
              </div>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                기초생활보장에서는 자녀가 정기적으로 주는 용돈 등 <strong>사적이전소득이 100% 소득으로 잡혀</strong> 수급 탈락의 주원인이 됩니다.
                그러나 차상위 본인부담경감 지침에서는 <strong>사적이전소득을 전액 산정 제외(0원)</strong>하여 본인 소득만으로 평가합니다.
              </p>
              <div className="p-2 rounded-lg bg-white border border-teal-200 text-xs flex justify-between font-mono">
                <span className="text-slate-600">사적이전소득 입력값: {(inputs.transferIncome?.privateTransfer || 0).toLocaleString()}원</span>
                <strong className="text-teal-800">차상위 반영액: 0원</strong>
              </div>
            </div>

            {/* 2. 기본재산공제액 1.35억 대폭 확대 */}
            <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-950 text-sm flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-black">
                    2
                  </span>
                  <span>기본재산공제액 1억 3,500만 원 적용</span>
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-teal-200/70 text-teal-900 font-bold">
                  지침 p.32
                </span>
              </div>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                기초생활보장의 기본재산공제(서울 9,900만, 경기 8,000만, 광역 7,700만, 기타 5,300만 원)와 달리,
                차상위 본인부담경감은 <strong>대도시/중소도시 1억 3,500만 원</strong>, 농어촌 8,500만 원을 일괄 공제합니다.{' '}
                재산 가액이 공제액 안에 들어가면 <strong>재산환산액이 0원</strong>이 됩니다.
              </p>
              <div className="p-2 rounded-lg bg-white border border-teal-200 text-xs flex justify-between font-mono">
                <span className="text-slate-600">기초 공제: {formatKoreanWon(propertyBreakdown.basicPropertyDeduction)}</span>
                <strong className="text-teal-800">
                  차상위 공제: {formatKoreanWon(nearPovertyResult.propertyBreakdown.basicPropertyDeduction)}
                </strong>
              </div>
            </div>

            {/* 3. 일반근로소득 30% 기본 정률 공제 */}
            <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-950 text-sm flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-black">
                    3
                  </span>
                  <span>일반근로소득 30% 기본공제 혜택 부여</span>
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-teal-200/70 text-teal-900 font-bold">
                  지침 p.28
                </span>
              </div>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                기초의료급여는 일반 수급자의 근로소득에 대해 공제를 0% 적용(전액 소득 반영)하여 탈락하는 경우가 매우 많습니다.
                차상위 본인부담경감은 일반근로자에게도 <strong>30% 기본 공제를 일괄 적용</strong>하여 소득평가액을 대폭 낮춥니다.
              </p>
              <div className="p-2 rounded-lg bg-white border border-teal-200 text-xs flex justify-between font-mono">
                <span className="text-slate-600">의료급여 근로반영: {incomeBreakdown.earnedMedicalEvaluated.toLocaleString()}원</span>
                <strong className="text-teal-800">
                  차상위 근로반영: {nearPovertyResult.incomeBreakdown.earnedGeneralEvaluated.toLocaleString()}원
                </strong>
              </div>
            </div>

            {/* 4. 부양의무자 재산 미반영 & 부양비 부과 0원 */}
            <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-950 text-sm flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-black">
                    4
                  </span>
                  <span>부양의무자 재산 미반영 & 부양비 부과 0원</span>
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-teal-200/70 text-teal-900 font-bold">
                  지침 p.43
                </span>
              </div>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                기초의료급여는 부양의무자의 재산을 소득으로 환산하고 부양비(매월 수십만 원)를 부과하지만,
                차상위 본인부담경감은 <strong>부양의무자의 재산은 일체 보지 않고 소득만 심사</strong>하며,{' '}
                <strong>부양비를 일체 부과하지 않습니다(0원)</strong>.
              </p>
              <div className="p-2 rounded-lg bg-white border border-teal-200 text-xs flex justify-between font-mono">
                <span className="text-slate-600">의료급여 부양비: {medicalSupportPayment.toLocaleString()}원</span>
                <strong className="text-teal-800">차상위 부양비: 0원 (미부과)</strong>
              </div>
            </div>
          </div>

          {/* 3자 1:1 대조 표 (기초생계 vs 기초의료 vs 차상위본인부담경감) */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-4.5 h-4.5 text-blue-600" />
              <span>현재 가구 데이터 기준 3대 심사 항목 직접 1:1 대조표</span>
            </h4>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="min-w-full text-xs sm:text-sm text-left divide-y divide-slate-200">
                <thead className="bg-slate-50 font-bold text-slate-700">
                  <tr>
                    <th className="p-2.5 border-r">심사 항목</th>
                    <th className="p-2.5 border-r">① 기초 생계급여</th>
                    <th className="p-2.5 border-r">② 기초 의료급여</th>
                    <th className="p-2.5 bg-teal-50/80 text-teal-950 font-extrabold">③ 차상위 본인부담경감</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  <tr>
                    <td className="p-2.5 font-bold border-r bg-slate-50/50">선정 기준선</td>
                    <td className="p-2.5 border-r">기준 중위소득 32% 이하</td>
                    <td className="p-2.5 border-r">기준 중위소득 40% 이하</td>
                    <td className="p-2.5 bg-teal-50/30 text-teal-900 font-bold">기준 중위소득 50% 이하 (가장 완화)</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold border-r bg-slate-50/50">가구 소득평가액</td>
                    <td className="p-2.5 border-r">{incomeBreakdown.finalIncomeGeneral.toLocaleString()}원</td>
                    <td className="p-2.5 border-r text-rose-700 font-medium">{incomeBreakdown.finalIncomeMedical.toLocaleString()}원 (공제미적용)</td>
                    <td className="p-2.5 bg-teal-50/30 text-teal-900 font-extrabold">
                      {nearPovertyResult.incomeBreakdown.finalIncomeGeneral.toLocaleString()}원 (사적이전 제외)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold border-r bg-slate-50/50">기본재산공제액</td>
                    <td className="p-2.5 border-r">{formatKoreanWon(propertyBreakdown.basicPropertyDeduction)}</td>
                    <td className="p-2.5 border-r">{formatKoreanWon(propertyBreakdown.basicPropertyDeduction)}</td>
                    <td className="p-2.5 bg-teal-50/30 text-teal-900 font-extrabold">
                      {formatKoreanWon(nearPovertyResult.propertyBreakdown.basicPropertyDeduction)} (대폭 공제)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold border-r bg-slate-50/50">월 재산환산액</td>
                    <td className="p-2.5 border-r">{propertyBreakdown.totalPropertyConvertedMonthly.toLocaleString()}원</td>
                    <td className="p-2.5 border-r">{propertyBreakdown.totalPropertyConvertedMonthly.toLocaleString()}원</td>
                    <td className="p-2.5 bg-teal-50/30 text-teal-900 font-extrabold">
                      {nearPovertyResult.propertyBreakdown.totalPropertyConvertedMonthly.toLocaleString()}원
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold border-r bg-slate-50/50">부양비 합산액</td>
                    <td className="p-2.5 border-r text-slate-500">폐지 (0원)</td>
                    <td className="p-2.5 border-r text-rose-700 font-medium">{medicalSupportPayment.toLocaleString()}원</td>
                    <td className="p-2.5 bg-teal-50/30 text-teal-900 font-extrabold">0원 (부양비 규정 없음)</td>
                  </tr>
                  <tr className="bg-slate-50/80 font-bold">
                    <td className="p-2.5 font-black border-r text-slate-900">최종 소득인정액</td>
                    <td className="p-2.5 border-r text-blue-700 font-black">{recognizedIncomeGeneral.toLocaleString()}원</td>
                    <td className="p-2.5 border-r text-emerald-700 font-black">{recognizedIncomeMedical.toLocaleString()}원</td>
                    <td className="p-2.5 bg-teal-100/70 text-teal-950 font-black text-sm">
                      {nearPovertyResult.recognizedIncome.toLocaleString()}원
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold border-r bg-slate-50/50">자격 판정 결과</td>
                    <td className="p-2.5 border-r">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${livelihoodBenefit.isEligible ? 'bg-blue-600 text-white' : 'bg-rose-100 text-rose-700'}`}>
                        {livelihoodBenefit.isEligible ? '생계 적합' : '생계 부적합'}
                      </span>
                    </td>
                    <td className="p-2.5 border-r">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${medicalBenefit.isEligible ? 'bg-emerald-600 text-white' : 'bg-rose-100 text-rose-700'}`}>
                        {medicalBenefit.isEligible ? '의료 적합' : '의료 부적합'}
                      </span>
                    </td>
                    <td className="p-2.5 bg-teal-50/30">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-black ${nearPovertyResult.isFinalEligible ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                        {nearPovertyResult.isFinalEligible ? `차상위 적합 (${nearPovertyResult.targetBenefitCode}코드)` : '차상위 부적합'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: 급여별 판정 원리 */}
      {activeStep === 5 && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white space-y-4 shadow-xs">
            <h4 className="text-base sm:text-lg font-bold text-slate-900">
              4대 급여별 선정기준액과 소득인정액 비교 및 지급액 산정 원리
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              각 급여의 선정기준선 이하인 경우 해당 급여 수급자로 판정됩니다.
              특히 <strong>생계급여는 ‘보충급여 원칙’에 따라 선정기준액에서 소득인정액을 뺀 전액을 현금 지급</strong>합니다.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
              {/* 생계급여 */}
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-blue-900 text-base">
                    생계급여 (기준 {livelihoodBenefit.ratioPercent}%)
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      livelihoodBenefit.isEligible
                        ? 'bg-blue-600 text-white'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {livelihoodBenefit.isEligible ? '적합' : '부적합'}
                  </span>
                </div>
                <ul className="space-y-1 text-slate-600 text-xs sm:text-sm mb-2.5">
                  <li>• 선정기준액: {livelihoodBenefit.criterionAmount.toLocaleString()}원</li>
                  <li>• 적용 소득인정액: {recognizedIncomeGeneral.toLocaleString()}원</li>
                  <li>• 차액 (선정기준액 - 소득인정액): {livelihoodBenefit.differenceAmount.toLocaleString()}원</li>
                </ul>
                {livelihoodBenefit.isEligible ? (
                  <div className="p-2.5 rounded-lg bg-blue-100/70 border border-blue-200 text-blue-900">
                    <span className="text-xs block font-semibold">
                      예상 생계급여 지급액:
                    </span>
                    <span className="text-lg font-black text-blue-800">
                      월 {livelihoodBenefit.expectedLivelihoodGrant?.toLocaleString()}원
                    </span>
                  </div>
                ) : (
                  <p className="text-rose-700 text-xs sm:text-sm font-semibold">
                    부적합 사유: {livelihoodBenefit.ineligibilityReason}
                  </p>
                )}
              </div>

              {/* 의료급여 */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-emerald-900 text-base">
                    의료급여 (기준 {medicalBenefit.ratioPercent}%)
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      medicalBenefit.isEligible
                        ? 'bg-emerald-600 text-white'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {medicalBenefit.isEligible ? '적합' : '부적합'}
                  </span>
                </div>
                <ul className="space-y-1 text-slate-600 text-xs sm:text-sm mb-2.5">
                  <li>• 선정기준액: {medicalBenefit.criterionAmount.toLocaleString()}원</li>
                  <li>• 적용 소득인정액 (부양비 포함): {recognizedIncomeMedical.toLocaleString()}원</li>
                  <li>• 부양의무자 기준: {inputs.supportObligation.medicalSupportStatus}</li>
                </ul>
                <p className="text-xs sm:text-sm text-slate-700 font-medium">
                  {medicalBenefit.isEligible
                    ? '1종 또는 2종 의료급여 자격 취득 (진료비 감면 혜택)'
                    : `부적합 사유: ${medicalBenefit.ineligibilityReason}`}
                </p>
              </div>

              {/* 주거급여 */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-amber-900 text-base">
                    주거급여 (기준 {housingBenefit.ratioPercent}%)
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      housingBenefit.isEligible
                        ? 'bg-amber-600 text-white'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {housingBenefit.isEligible ? '적합' : '부적합'}
                  </span>
                </div>
                <ul className="space-y-1 text-slate-600 text-xs sm:text-sm">
                  <li>• 선정기준액: {housingBenefit.criterionAmount.toLocaleString()}원</li>
                  <li>• 적용 소득인정액: {recognizedIncomeGeneral.toLocaleString()}원</li>
                  <li>
                    • 지원 내용: 임차가구는 지역별 기준임대료 내 실임차료 지급, 자가가구는 주택 노후도에 따른 수선유지급여
                  </li>
                </ul>
              </div>

              {/* 교육급여 */}
              <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-purple-900 text-base">
                    교육급여 (기준 {educationBenefit.ratioPercent}%)
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      educationBenefit.isEligible
                        ? 'bg-purple-600 text-white'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {educationBenefit.isEligible ? '적합' : '부적합'}
                  </span>
                </div>
                <ul className="space-y-1 text-slate-600 text-xs sm:text-sm">
                  <li>• 선정기준액: {educationBenefit.criterionAmount.toLocaleString()}원</li>
                  <li>• 적용 소득인정액: {recognizedIncomeGeneral.toLocaleString()}원</li>
                  <li>
                    • 지원 내용: 초·중·고 학령기 자녀 교육활동지원비 연 1회 바우처 지급
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 6: 실무자 핵심 Q&A 스터디 노트 */}
      {activeStep === 6 && (
        <div className="space-y-3 animate-in fade-in duration-150">
          {[
            {
              id: 'tip-1',
              q: 'Q1. 왜 생계·주거·교육급여와 의료급여의 소득인정액이 서로 다를까요?',
              a: '일반 수급자의 근로·사업소득에 대해 생계·주거·교육급여는 근로의욕 고취를 위해 30%를 공제(70%만 반영)하지만, 의료급여는 국민건강보험 재정 및 형평성을 이유로 30% 공제가 적용되지 않고 100% 반영되기 때문입니다. 또한 의료급여는 부양능력 미약 판정 시 산정된 부양비가 추가 합산됩니다.',
            },
            {
              id: 'tip-near-poverty',
              q: 'Q2. 차상위본인부담경감의 소득인정액은 왜 의료급여보다 훨씬 낮게 나오나요?',
              a: '보건복지부 차상위본인부담경감 지침(p.26, p.32)상 4가지 핵심 차이가 있습니다: ① 자녀 용돈 등 사적이전소득을 전액 0원으로 제외, ② 기본재산공제액을 1억 3,500만 원(농어촌 8,500만 원)으로 파격 상향 적용, ③ 일반근로소득도 30% 정률 공제 적용, ④ 부양의무자 재산 미반영 및 부양비 0원(미부과) 규정 때문입니다.',
            },
            {
              id: 'tip-2',
              q: 'Q3. 주거용재산 한도를 초과하면 왜 일반재산(4.17%)으로 넘어갈까요?',
              a: '주거용재산은 주거 안정을 보장하기 위해 월 1.04%라는 매우 낮은 특례 환산율을 적용합니다. 그러나 과도하게 비싼 고가 주택을 보유한 경우까지 특례 환산율을 무제한 적용할 수는 없으므로, 지역별 주거용재산 한도액까지만 1.04%를 적용하고 초과분은 일반재산 환산율(4.17%)을 적용하도록 지침에서 규정하고 있습니다.',
            },
            {
              id: 'tip-3',
              q: 'Q4. 기본재산액과 부채는 왜 [주거용 → 일반 → 금융] 순서로 차감할까요?',
              a: '보건복지부 지침에 따른 소득환산 순서입니다. 환산율이 가장 낮은 주거용재산(1.04%)부터 먼저 털어내고, 그 다음 일반재산(4.17%), 마지막으로 가장 환산율이 높은 금융재산(6.26%) 순서로 차감 풀을 소진합니다. 이는 거주용 주택을 지켜주면서 금융자산의 소득환산액을 줄여주는 수급자 보호 장치입니다.',
            },
            {
              id: 'tip-4',
              q: 'Q5. 자동차는 왜 100% 환산율을 적용하고 기본공제 차감에서 제외될까요?',
              a: '자동차는 유지비가 많이 드는 고비용 동산으로 분류되어 원칙적으로 가액의 100%가 매월 소득으로 환산됩니다. 또한 기본재산액 및 부채 차감 풀에서도 차감되지 않습니다. 다만, 생업용 화물차, 1600cc 미만 장애인용 차량 등은 일반재산 환산율(4.17%) 또는 전액 재산 산정 제외(0%) 특례가 적용됩니다.',
            },
            {
              id: 'tip-5',
              q: 'Q6. 장애인연금·장애수당은 왜 실제소득에 들어가면서도 가구특성별 지출비용으로 전액 공제되나요?',
              a: '보건복지부 『국민기초생활보장사업안내』 지침상, 장애인연금(기초급여 및 부가급여), 장애수당, 장애아동수당은 장애로 인해 불가피하게 추가로 발생하는 생활비·간병비·의료비 등을 보전하기 위해 지급되는 목적성 급여입니다. 따라서 공적이전소득으로 잡히더라도 『가구특성별 지출비용』으로 100% 전액 차감(공제)하여, 장애 관련 급여를 받았다고 해서 생계급여 지급액이 삭감되지 않도록 두텁게 보호합니다.',
            },
          ].map((item) => {
            const isOpen = openTipId === item.id;
            return (
              <div
                key={item.id}
                className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenTipId(isOpen ? null : item.id)}
                  className="w-full text-left p-4 flex items-center justify-between font-bold text-sm text-slate-900 hover:bg-slate-50 transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Lightbulb className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                    <span>{item.q}</span>
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-2 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
        <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  소득인정액 계산과정 상세 해설서 (학습·업무 매뉴얼)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  입력된 소득·재산·공제가 법정 공식에 대입되어 최종 소득인정액으로 도출되는 전 과정을 설명합니다.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="text-xs sm:text-sm font-bold px-3 py-1.5 text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>인쇄</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto flex-1">{content}</div>

          <div className="p-3.5 border-t border-slate-200 bg-slate-50 text-right">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 rounded-xl border border-blue-200 bg-white shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            소득인정액 계산과정 상세 해설서 (학습·업무 매뉴얼)
          </h3>
        </div>
        <span className="text-xs sm:text-sm text-blue-700 font-bold bg-blue-50 px-2.5 py-0.5 rounded-full">
          단계별 공식 대입 & 실무 Q&A
        </span>
      </div>
      {content}
    </div>
  );
};
