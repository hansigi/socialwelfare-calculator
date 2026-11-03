/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CalculationResult, WelfareInputs } from '../types/welfare';
import { formatKoreanWon } from '../utils/calculator';
import { CalculationProcessExplainer } from './CalculationProcessExplainer';
import {
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Building,
  GraduationCap,
  HeartHandshake,
  HeartPulse,
  Info,
  Scale,
  BookOpen,
  Clock,
  AlertTriangle,
  BadgePercent,
} from 'lucide-react';

interface ResultsDashboardProps {
  inputs: WelfareInputs;
  result: CalculationResult;
  householdMembers: number;
  onOpenExplainerModal?: (step?: number) => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  inputs,
  result,
  householdMembers,
  onOpenExplainerModal,
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showNearPovertyDetails, setShowNearPovertyDetails] = useState(false);

  const {
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
  } = result;

  // 프로그레스 바 계산 (기준 중위소득 대비 백분율, 최대 110%로 클램프)
  const generalRatio = medianIncome > 0 ? (recognizedIncomeGeneral / medianIncome) * 100 : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-6">
      {/* 1. 상단 타이틀 */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-extrabold text-base shadow-xs shrink-0">
            6
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              산정 결과 요약, 4대 급여 및 차상위 연계 통합 판정
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              {householdMembers}인 가구 기준 중위소득({medianIncome.toLocaleString()}원) 대비 소득인정액 모의 판정 결과
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenExplainerModal && (
            <button
              type="button"
              onClick={() => onOpenExplainerModal(1)}
              className="text-xs sm:text-sm font-bold text-blue-700 hover:text-blue-900 px-3.5 py-2 rounded-lg border border-blue-200 hover:border-blue-300 bg-blue-50 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              title="소득인정액 계산과정 상세 해설서 전체화면 모달 열기"
            >
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>계산과정 해설서 (전체화면)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 px-3.5 py-2 rounded-lg border border-slate-200 hover:border-blue-300 bg-slate-50 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Scale className="w-4 h-4 text-blue-600" />
            <span>상세 산출과정 {showBreakdown ? '접기' : '펼쳐보기'}</span>
            {showBreakdown ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* 기초수급(생계·의료) 탈락 가구 대상: 차상위본인부담경감 연계 진단 브릿지 배너 */}
      {(!livelihoodBenefit.isEligible || !medicalBenefit.isEligible) && (
        <div
          className={`p-4 sm:p-5 rounded-xl border transition ${
            nearPovertyResult.isFinalEligible
              ? 'bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-cyan-500/10 border-teal-300 shadow-xs'
              : 'bg-amber-50/70 border-amber-300 shadow-xs'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div
              className={`p-2.5 rounded-lg shrink-0 mt-0.5 ${
                nearPovertyResult.isFinalEligible
                  ? 'bg-teal-600 text-white'
                  : 'bg-amber-600 text-white'
              }`}
            >
              <HeartPulse className="w-5 h-5" />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-base sm:text-lg text-slate-900">
                    [상담 연계 안내]{' '}
                    {nearPovertyResult.isFinalEligible
                      ? '기초생활수급 탈락 대비 ➔ 차상위본인부담경감대상자 연계 신청 가능!'
                      : '차상위 본인부담경감대상자 연계 적합성 검토 결과'}
                  </span>
                  {nearPovertyResult.isFinalEligible && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-bold bg-teal-600 text-white">
                      적격 확정 ({nearPovertyResult.benefitCodeName})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-teal-800 bg-teal-100/80 px-2.5 py-1 rounded-md">
                  <Clock className="w-4 h-4 text-teal-700" />
                  <span>탈락일로부터 90일 이내 신청 시 소급 적용</span>
                </div>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed">
                {nearPovertyResult.linkageRecommendation.reason}
              </p>

              {nearPovertyResult.isFinalEligible ? (
                <div className="mt-2.5 p-3 rounded-lg bg-white/95 border border-teal-200 text-sm flex items-center justify-between flex-wrap gap-2">
                  <div className="space-y-1">
                    <span className="font-bold text-teal-900 block">
                      주요 혜택: 외래 본인부담금 0원~1,000원(또는 14%) + 건강보험료 전액 국고지원(0원 고지)
                    </span>
                    <span className="text-xs sm:text-sm text-slate-600 block">
                      차상위 기본재산 {formatKoreanWon(nearPovertyResult.propertyBreakdown.basicPropertyDeduction)} 공제 적용 후 소득인정액:{' '}
                      <strong className="text-teal-700 font-bold">
                        {nearPovertyResult.recognizedIncome.toLocaleString()}원
                      </strong>{' '}
                      (중위 50% 기준 {nearPovertyResult.criterionAmount.toLocaleString()}원 대비{' '}
                      <strong className="text-emerald-700 font-bold">
                        {nearPovertyResult.incomeDifference.toLocaleString()}원 여유
                      </strong>
                      )
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-teal-700 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-300">
                    사회복지전담공무원 직권신청 또는 읍·면·동 통합신청서 연계 권고
                  </span>
                </div>
              ) : (
                <div className="mt-1 text-sm text-amber-900 font-semibold">
                  부적합 사유: {nearPovertyResult.finalStatusMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. 소득인정액 요약 카드 (생계·주거·교육용 vs 의료급여용) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 생계·주거·교육급여용 소득인정액 */}
        <div className="p-4 sm:p-5 rounded-xl border-2 border-blue-500/80 bg-gradient-to-br from-blue-50/70 via-white to-blue-50/30 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
            <span className="text-sm font-bold text-blue-900 uppercase tracking-wide">
              생계 · 주거 · 교육급여용
            </span>
            <span className="text-xs font-bold text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-full">
              근로소득 30% 공제 적용
            </span>
          </div>

          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <span className="text-xs sm:text-sm text-slate-600 font-semibold">
                월 소득인정액
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-700 tracking-tight">
                {recognizedIncomeGeneral.toLocaleString()}
                <span className="text-base sm:text-lg font-bold text-slate-800 ml-1">원</span>
              </div>
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-700 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs">
              중위소득 {generalRatio.toFixed(1)}%
            </span>
          </div>

          <div className="mt-3.5 pt-3 border-t border-blue-100 flex items-center justify-between text-xs sm:text-sm text-slate-700">
            <span>
              소득평가액:{' '}
              <strong className="text-slate-900 font-bold">
                {incomeBreakdown.finalIncomeGeneral.toLocaleString()}원
              </strong>
            </span>
            <span className="text-slate-300">|</span>
            <span>
              재산환산액:{' '}
              <strong className="text-slate-900 font-bold">
                {propertyBreakdown.totalPropertyConvertedMonthly.toLocaleString()}원
              </strong>
            </span>
          </div>
        </div>

        {/* 의료급여용 소득인정액 */}
        <div className="p-4 sm:p-5 rounded-xl border-2 border-emerald-500/80 bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
            <span className="text-sm font-bold text-emerald-900 uppercase tracking-wide">
              의료급여용
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
              일반근로 공제제외 & 부양비 합산
            </span>
          </div>

          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <span className="text-xs sm:text-sm text-slate-600 font-semibold">
                월 소득인정액 (부양비 포함)
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tracking-tight">
                {recognizedIncomeMedical.toLocaleString()}
                <span className="text-base sm:text-lg font-bold text-slate-800 ml-1">원</span>
              </div>
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-700 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs">
              중위소득{' '}
              {medianIncome > 0
                ? ((recognizedIncomeMedical / medianIncome) * 100).toFixed(1)
                : '0.0'}
              %
            </span>
          </div>

          <div className="mt-3.5 pt-3 border-t border-emerald-100 flex items-center justify-between text-xs sm:text-sm text-slate-700">
            <span>
              소득평가액:{' '}
              <strong className="text-slate-900 font-bold">
                {incomeBreakdown.finalIncomeMedical.toLocaleString()}원
              </strong>
            </span>
            <span className="text-slate-300">|</span>
            <span>
              재산환산액:{' '}
              <strong className="text-slate-900 font-bold">
                {propertyBreakdown.totalPropertyConvertedMonthly.toLocaleString()}원
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* 3. 가로형 프로그레스 바 (선정기준선 대비 소득인정액 위치 한눈에 비교) */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/60">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
          <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
            <Scale className="w-4.5 h-4.5 text-blue-600" />
            <span>기준 중위소득 구간별 선정기준선 비교</span>
          </h3>
          <span className="text-xs sm:text-sm text-slate-600 font-semibold">
            현재 소득인정액 위치: 중위소득 대비 {generalRatio.toFixed(1)}%
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="relative mt-8 mb-11 pt-2">
          {/* Main Track */}
          <div className="h-4.5 w-full bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                generalRatio <= 32
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                  : generalRatio <= 40
                  ? 'bg-gradient-to-r from-blue-500 via-indigo-600 to-emerald-500'
                  : generalRatio <= 48
                  ? 'bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500'
                  : generalRatio <= 50
                  ? 'bg-gradient-to-r from-blue-500 via-amber-500 to-rose-400'
                  : 'bg-gradient-to-r from-blue-500 via-amber-500 to-rose-600'
              }`}
              style={{ width: `${Math.min(100, Math.max(2, generalRatio))}%` }}
            />
          </div>

          {/* Markers on the track: 32%, 40%, 48%, 50% */}
          {[
            {
              pct: 32,
              label: '생계 32%',
              color: 'border-indigo-600 text-indigo-700',
              bg: 'bg-indigo-600',
              offset: 'top-2',
            },
            {
              pct: 40,
              label: '의료 40%',
              color: 'border-emerald-600 text-emerald-700',
              bg: 'bg-emerald-600',
              offset: 'top-2',
            },
            {
              pct: 48,
              label: '주거 48%',
              color: 'border-amber-600 text-amber-700',
              bg: 'bg-amber-600',
              offset: 'top-2',
            },
            {
              pct: 50,
              label: '교육·차상위 50%',
              color: 'border-teal-600 text-teal-700',
              bg: 'bg-teal-600',
              offset: 'top-8 sm:top-2',
            },
          ].map((mk) => (
            <div
              key={mk.pct}
              className={`absolute -translate-x-1/2 flex flex-col items-center pointer-events-none ${mk.offset}`}
              style={{ left: `${mk.pct}%` }}
            >
              <div className={`w-0.5 ${mk.offset.includes('top-8') ? 'h-3 sm:h-6' : 'h-6'} ${mk.bg} opacity-80`} />
              <div
                className={`mt-1 text-xs font-bold px-2 py-0.5 rounded bg-white shadow-2xs border ${mk.color} whitespace-nowrap`}
              >
                {mk.label}
              </div>
            </div>
          ))}

          {/* Current Position Pin */}
          <div
            className="absolute -top-8 -translate-x-1/2 flex flex-col items-center pointer-events-none transition-all duration-500 z-10"
            style={{ left: `${Math.min(98, Math.max(2, generalRatio))}%` }}
          >
            <div className="bg-slate-900 text-white text-xs font-extrabold px-2.5 py-0.5 rounded-full shadow-md whitespace-nowrap flex items-center gap-1">
              <span>내 소득인정액</span>
              <span className="text-yellow-300">
                ({formatKoreanWon(recognizedIncomeGeneral)})
              </span>
            </div>
            <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900" />
          </div>
        </div>
      </div>

      {/* 4. 4대 급여별 판정 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 생계급여 카드 */}
        <div
          className={`p-4 rounded-xl border transition flex flex-col justify-between ${
            livelihoodBenefit.isEligible
              ? 'bg-blue-50/40 border-blue-300 shadow-xs ring-1 ring-blue-200'
              : 'bg-white border-slate-200 opacity-95'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4.5 h-4.5 text-blue-600" />
                <h3 className="text-base font-extrabold text-slate-900">생계급여</h3>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  livelihoodBenefit.isEligible
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {livelihoodBenefit.isEligible ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    적합
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    부적합
                  </>
                )}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 mb-2.5">
              선정기준: 중위소득 32% (
              <strong className="text-slate-900">{livelihoodBenefit.criterionAmount.toLocaleString()}원</strong>)
            </p>

            {livelihoodBenefit.isEligible ? (
              <div className="p-3 rounded-lg bg-blue-100/60 border border-blue-200 text-blue-900">
                <span className="text-xs text-blue-800 font-bold block">
                  예상 생계급여 지급액:
                </span>
                <span className="text-lg sm:text-xl font-black text-blue-800">
                  {livelihoodBenefit.expectedLivelihoodGrant?.toLocaleString()}원
                </span>
                <p className="text-xs text-blue-700 mt-0.5">
                  (선정기준액 - 소득인정액 차액 지급)
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm leading-snug">
                <p className="font-bold text-rose-700 mb-0.5">부적합 사유:</p>
                <p>{livelihoodBenefit.ineligibilityReason}</p>
              </div>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs sm:text-sm text-slate-600 flex justify-between">
            <span>기준선 대비:</span>
            <span
              className={`font-bold ${
                livelihoodBenefit.differenceAmount >= 0
                  ? 'text-blue-700'
                  : 'text-rose-600'
              }`}
            >
              {livelihoodBenefit.differenceAmount >= 0
                ? `${livelihoodBenefit.differenceAmount.toLocaleString()}원 여유`
                : `${Math.abs(livelihoodBenefit.differenceAmount).toLocaleString()}원 초과`}
            </span>
          </div>
        </div>

        {/* 의료급여 카드 */}
        <div
          className={`p-4 rounded-xl border transition flex flex-col justify-between ${
            medicalBenefit.isEligible
              ? 'bg-emerald-50/40 border-emerald-300 shadow-xs ring-1 ring-emerald-200'
              : 'bg-white border-slate-200 opacity-95'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
                <h3 className="text-base font-extrabold text-slate-900">의료급여</h3>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  medicalBenefit.isEligible
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {medicalBenefit.isEligible ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    적합
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    부적합
                  </>
                )}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 mb-2.5">
              선정기준: 중위소득 40% (
              <strong className="text-slate-900">{medicalBenefit.criterionAmount.toLocaleString()}원</strong>)
            </p>

            {medicalBenefit.isEligible ? (
              <div className="p-3 rounded-lg bg-emerald-100/60 border border-emerald-200 text-emerald-900 text-xs sm:text-sm">
                <span className="font-bold block">1종 / 2종 의료급여 대상</span>
                <p className="text-xs text-emerald-800 mt-0.5">
                  진료비 본인부담금 감면 및 의료지원 혜택 적용 대상
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm leading-snug">
                <p className="font-bold text-rose-700 mb-0.5">부적합 사유:</p>
                <p>{medicalBenefit.ineligibilityReason}</p>
              </div>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs sm:text-sm text-slate-600 flex justify-between">
            <span>기준선 대비:</span>
            <span
              className={`font-bold ${
                medicalBenefit.differenceAmount >= 0
                  ? 'text-emerald-700'
                  : 'text-rose-600'
              }`}
            >
              {medicalBenefit.differenceAmount >= 0
                ? `${medicalBenefit.differenceAmount.toLocaleString()}원 여유`
                : `${Math.abs(medicalBenefit.differenceAmount).toLocaleString()}원 초과`}
            </span>
          </div>
        </div>

        {/* 주거급여 카드 */}
        <div
          className={`p-4 rounded-xl border transition flex flex-col justify-between ${
            housingBenefit.isEligible
              ? 'bg-amber-50/40 border-amber-300 shadow-xs ring-1 ring-amber-200'
              : 'bg-white border-slate-200 opacity-95'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Building className="w-4.5 h-4.5 text-amber-600" />
                <h3 className="text-base font-extrabold text-slate-900">주거급여</h3>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  housingBenefit.isEligible
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {housingBenefit.isEligible ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    적합
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    부적합
                  </>
                )}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 mb-2.5">
              선정기준: 중위소득 48% (
              <strong className="text-slate-900">{housingBenefit.criterionAmount.toLocaleString()}원</strong>)
            </p>

            {housingBenefit.isEligible ? (
              <div className="p-3 rounded-lg bg-amber-100/60 border border-amber-200 text-amber-900 text-xs sm:text-sm">
                <span className="font-bold block">임차료 / 수선유지급여 대상</span>
                <p className="text-xs text-amber-800 mt-0.5">
                  임차가구 기준임대료 지원 또는 자가가구 주택보수 지원
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm leading-snug">
                <p className="font-bold text-rose-700 mb-0.5">부적합 사유:</p>
                <p>{housingBenefit.ineligibilityReason}</p>
              </div>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs sm:text-sm text-slate-600 flex justify-between">
            <span>기준선 대비:</span>
            <span
              className={`font-bold ${
                housingBenefit.differenceAmount >= 0
                  ? 'text-amber-700'
                  : 'text-rose-600'
              }`}
            >
              {housingBenefit.differenceAmount >= 0
                ? `${housingBenefit.differenceAmount.toLocaleString()}원 여유`
                : `${Math.abs(housingBenefit.differenceAmount).toLocaleString()}원 초과`}
            </span>
          </div>
        </div>

        {/* 교육급여 카드 */}
        <div
          className={`p-4 rounded-xl border transition flex flex-col justify-between ${
            educationBenefit.isEligible
              ? 'bg-purple-50/40 border-purple-300 shadow-xs ring-1 ring-purple-200'
              : 'bg-white border-slate-200 opacity-95'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4.5 h-4.5 text-purple-600" />
                <h3 className="text-base font-extrabold text-slate-900">교육급여</h3>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  educationBenefit.isEligible
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {educationBenefit.isEligible ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    적합
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    부적합
                  </>
                )}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 mb-2.5">
              선정기준: 중위소득 50% (
              <strong className="text-slate-900">{educationBenefit.criterionAmount.toLocaleString()}원</strong>)
            </p>

            {educationBenefit.isEligible ? (
              <div className="p-3 rounded-lg bg-purple-100/60 border border-purple-200 text-purple-900 text-xs sm:text-sm">
                <span className="font-bold block">교육활동지원비 바우처</span>
                <p className="text-xs text-purple-800 mt-0.5">
                  초·중·고 학령기 자녀 교육활동지원비 지급 대상
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm leading-snug">
                <p className="font-bold text-rose-700 mb-0.5">부적합 사유:</p>
                <p>{educationBenefit.ineligibilityReason}</p>
              </div>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs sm:text-sm text-slate-600 flex justify-between">
            <span>기준선 대비:</span>
            <span
              className={`font-bold ${
                educationBenefit.differenceAmount >= 0
                  ? 'text-purple-700'
                  : 'text-rose-600'
              }`}
            >
              {educationBenefit.differenceAmount >= 0
                ? `${educationBenefit.differenceAmount.toLocaleString()}원 여유`
                : `${Math.abs(educationBenefit.differenceAmount).toLocaleString()}원 초과`}
            </span>
          </div>
        </div>
      </div>

      {/* 5. 차상위 본인부담경감대상자 (중위 50%) 특별 판정 카드 (신청 연계) */}
      <div className="p-4 sm:p-5 rounded-xl border-2 border-teal-500/80 bg-gradient-to-br from-teal-50/70 via-white to-cyan-50/40 shadow-xs relative overflow-hidden">
        {/* 상단 뱃지 및 타이틀 */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3.5 border-b border-teal-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <HeartPulse className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-extrabold text-teal-950">
                  차상위 본인부담경감대상자 지원사업 모의 판정 결과
                </h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-300">
                  국민건강보험법 시행령 별표2 & 2026 복지부 지침
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                기초의료급여보다 완화된 소득(50%)·사적이전제외·재산(기본공제 1.35억)·부양의무자(재산 미반영) 기준 적용
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-black shadow-xs ${
                nearPovertyResult.isFinalEligible
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {nearPovertyResult.isFinalEligible ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>적합 ({nearPovertyResult.targetBenefitCode}코드)</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  <span>부적합</span>
                </>
              )}
            </span>

            <button
              type="button"
              onClick={() => setShowNearPovertyDetails(!showNearPovertyDetails)}
              className="text-xs sm:text-sm font-bold text-teal-800 hover:text-teal-950 px-3 py-1.5 rounded-lg border border-teal-200 hover:border-teal-300 bg-white shadow-2xs flex items-center gap-1.5 cursor-pointer transition"
            >
              <Info className="w-4 h-4 text-teal-600" />
              <span>{showNearPovertyDetails ? '혜택 요약 접기' : '지원 혜택표 보기'}</span>
              {showNearPovertyDetails ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* 4분면 지표 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-4">
          {/* 1. 선정기준액 (중위 50%) */}
          <div className="p-3.5 rounded-lg bg-white border border-teal-100 shadow-2xs">
            <span className="text-xs sm:text-sm text-slate-600 font-semibold block">
              기준 중위소득 50%
            </span>
            <div className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
              {nearPovertyResult.criterionAmount.toLocaleString()}원
            </div>
            <span className="text-xs text-teal-700 font-bold">
              {householdMembers}인 가구 기준
            </span>
          </div>

          {/* 2. 차상위 소득인정액 */}
          <div className="p-3.5 rounded-lg bg-white border border-teal-100 shadow-2xs">
            <span className="text-xs sm:text-sm text-slate-600 font-semibold block">
              차상위 소득인정액
            </span>
            <div className="text-lg sm:text-xl font-black text-teal-700 mt-0.5">
              {nearPovertyResult.recognizedIncome.toLocaleString()}원
            </div>
            <span className="text-xs text-slate-500 block">
              소득평가 {nearPovertyResult.incomeBreakdown.finalIncomeGeneral.toLocaleString()} + 재산환산 {nearPovertyResult.propertyBreakdown.totalPropertyConvertedMonthly.toLocaleString()}
            </span>
          </div>

          {/* 3. 소득 적합 여부 */}
          <div className="p-3.5 rounded-lg bg-white border border-teal-100 shadow-2xs">
            <span className="text-xs sm:text-sm text-slate-600 font-semibold block">
              소득기준 대비
            </span>
            <div
              className={`text-lg sm:text-xl font-black mt-0.5 ${
                nearPovertyResult.incomeDifference >= 0
                  ? 'text-emerald-700'
                  : 'text-rose-600'
              }`}
            >
              {nearPovertyResult.incomeDifference >= 0
                ? `${nearPovertyResult.incomeDifference.toLocaleString()}원 여유`
                : `${Math.abs(nearPovertyResult.incomeDifference).toLocaleString()}원 초과`}
            </div>
            <span
              className={`text-xs font-bold ${
                nearPovertyResult.isIncomeEligible
                  ? 'text-emerald-600'
                  : 'text-rose-600'
              }`}
            >
              {nearPovertyResult.isIncomeEligible ? '소득기준 적격' : '소득기준 초과'}
            </span>
          </div>

          {/* 4. 부양의무자 및 대상 요건 */}
          <div className="p-3.5 rounded-lg bg-white border border-teal-100 shadow-2xs">
            <span className="text-xs sm:text-sm text-slate-600 font-semibold block">
              부양의무자 / 대상 요건
            </span>
            <div className="text-base font-black text-slate-900 mt-0.5">
              {nearPovertyResult.isSupportEligible ? '부양요건 충족' : '부양능력 있음'}
            </div>
            <span className="text-xs text-slate-600 block truncate">
              {nearPovertyResult.benefitCodeName}
            </span>
          </div>
        </div>

        {/* 차상위본인부담경감 소득인정액 도출 원리 & 기초의료 대비 4대 특례 카드 */}
        <div className="mb-3.5 p-4 rounded-xl bg-white/95 border-2 border-teal-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-teal-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-teal-600 text-white flex items-center justify-center text-xs font-black">
                ∑
              </span>
              <span className="font-extrabold text-sm sm:text-base text-teal-950">
                차상위 소득인정액 도출 내역 (왜 이 금액이 나왔을까요?)
              </span>
            </div>

            {onOpenExplainerModal && (
              <button
                type="button"
                onClick={() => onOpenExplainerModal(4)}
                className="text-xs sm:text-sm font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg border border-teal-300 flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
              >
                <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                <span>차상위 산출공식 상세 해설서 보기 ➔</span>
              </button>
            )}
          </div>

          {/* 실시간 덧셈 수식 카드 */}
          <div className="p-3 rounded-lg bg-teal-50/70 border border-teal-200 text-xs sm:text-sm flex flex-col md:flex-row items-center justify-between gap-2.5 font-mono">
            <div className="flex items-center flex-wrap gap-2 text-slate-800">
              <span className="p-1 px-2 rounded bg-white border border-teal-200 font-bold text-teal-900">
                소득평가액 {nearPovertyResult.incomeBreakdown.finalIncomeGeneral.toLocaleString()}원
              </span>
              <span className="font-black text-teal-700 text-base">+</span>
              <span className="p-1 px-2 rounded bg-white border border-teal-200 font-bold text-teal-900">
                재산환산액 {nearPovertyResult.propertyBreakdown.totalPropertyConvertedMonthly.toLocaleString()}원
              </span>
              <span className="font-black text-teal-700 text-base">+</span>
              <span className="p-1 px-2 rounded bg-white border border-teal-200 font-bold text-slate-500">
                부양비 0원
              </span>
              <span className="font-black text-slate-700 text-base">=</span>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-600 mr-2 font-sans">최종 소득인정액:</span>
              <strong className="text-base sm:text-lg font-black text-teal-800 font-mono">
                {nearPovertyResult.recognizedIncome.toLocaleString()}원/월
              </strong>
            </div>
          </div>

          {/* 4대 차상위 완화 특례 배지 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-teal-800 block mb-0.5">① 사적이전소득 0원</span>
              <p className="text-slate-600 text-[11px] leading-tight">
                자녀용돈 등 {(inputs.transferIncome?.privateTransfer || 0).toLocaleString()}원 전액 제외
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-teal-800 block mb-0.5">
                ② 기본재산 {formatKoreanWon(nearPovertyResult.propertyBreakdown.basicPropertyDeduction)} 공제
              </span>
              <p className="text-slate-600 text-[11px] leading-tight">
                기초({formatKoreanWon(propertyBreakdown.basicPropertyDeduction)}) 대비 대폭 공제로 재산환산액 절감
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-teal-800 block mb-0.5">③ 근로소득 30% 공제</span>
              <p className="text-slate-600 text-[11px] leading-tight">
                의료급여(0% 공제)와 달리 일반근로 30% 감면
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="font-bold text-teal-800 block mb-0.5">④ 부양비 0원 부과</span>
              <p className="text-slate-600 text-[11px] leading-tight">
                부양의무자 재산 미반영 및 부양비 미부과
              </p>
            </div>
          </div>
        </div>

        {/* 종합 판정 소견 */}
        <div
          className={`p-3.5 rounded-lg border text-sm leading-relaxed ${
            nearPovertyResult.isFinalEligible
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {nearPovertyResult.isFinalEligible ? (
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold">
                {nearPovertyResult.finalStatusMessage}
              </span>
              <p className="text-xs sm:text-sm mt-1 text-slate-600">
                기초생활보장 기본재산공제({formatKoreanWon(propertyBreakdown.basicPropertyDeduction)}) 대비 차상위 기본재산공제(
                <strong>{formatKoreanWon(nearPovertyResult.propertyBreakdown.basicPropertyDeduction)}</strong>
                )가 대폭 상향 적용되며, 사적이전소득 및 부양비가 제외되어 탈락 위험을 방지합니다.
              </p>
            </div>
          </div>
        </div>

        {/* 토글 시 차상위 본인부담금 감면표 및 상세 혜택 (지침 p.17, p.86) */}
        {showNearPovertyDetails && (
          <div className="mt-4 pt-3.5 border-t border-teal-200 space-y-3.5">
            <h4 className="text-sm font-bold text-teal-900 flex items-center gap-1.5">
              <BadgePercent className="w-4.5 h-4.5 text-teal-600" />
              <span>차상위 본인부담경감 대상자 본인부담 기준 및 국고지원 혜택 안내</span>
            </h4>

            <div className="overflow-x-auto rounded-lg border border-teal-200 bg-white">
              <table className="w-full text-xs sm:text-sm text-left border-collapse">
                <thead className="bg-teal-50/80 text-teal-950 font-bold border-b border-teal-200">
                  <tr>
                    <th className="p-2.5 border-r border-teal-200">구분코드</th>
                    <th className="p-2.5 border-r border-teal-200">지원 대상자</th>
                    <th className="p-2.5 border-r border-teal-200">외래 진료 본인부담</th>
                    <th className="p-2.5 border-r border-teal-200">입원 진료 본인부담</th>
                    <th className="p-2.5">건강보험료 지원</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-100 text-slate-700">
                  <tr className={nearPovertyResult.targetBenefitCode === 'C' ? 'bg-purple-50/50 font-semibold' : ''}>
                    <td className="p-2.5 font-bold text-purple-700 border-r border-teal-200">
                      C
                    </td>
                    <td className="p-2.5 border-r border-teal-200">
                      희귀질환, 중증난치질환, 중증질환자(암, 심장, 뇌혈관, 결핵, 중증화상)
                    </td>
                    <td className="p-2.5 border-r border-teal-200 text-purple-800 font-bold">
                      0원 (전액 면제)
                    </td>
                    <td className="p-2.5 border-r border-teal-200">
                      요양급여비용 면제 (기본식대 20%만 부담)
                    </td>
                    <td className="p-2.5" rowSpan={3}>
                      지역가입자 건강보험료 <strong className="text-teal-700 font-bold">전액 국고지원</strong> (별도세대 분리 후 0원 고지)
                    </td>
                  </tr>
                  <tr className={nearPovertyResult.targetBenefitCode === 'E' ? 'bg-emerald-50/50 font-semibold' : ''}>
                    <td className="p-2.5 font-bold text-emerald-700 border-r border-teal-200">
                      E
                    </td>
                    <td className="p-2.5 border-r border-teal-200">
                      만성질환자 (6개월 이상 치료 요함), 18세 미만 아동
                    </td>
                    <td className="p-2.5 border-r border-teal-200 text-emerald-800 font-bold">
                      의원 1,000~1,500원 정액, 병원급 이상 14%
                    </td>
                    <td className="p-2.5 border-r border-teal-200">
                      요양급여총액의 14% (기본식대 20%)
                    </td>
                  </tr>
                  <tr className={nearPovertyResult.targetBenefitCode === 'F' ? 'bg-amber-50/50 font-semibold' : ''}>
                    <td className="p-2.5 font-bold text-amber-700 border-r border-teal-200">
                      F
                    </td>
                    <td className="p-2.5 border-r border-teal-200">
                      만성질환자 및 18세 미만 아동 중 <strong>등록장애인</strong>
                    </td>
                    <td className="p-2.5 border-r border-teal-200 text-amber-800 font-bold">
                      의원 750원 지원, 병원급 이상 14% 전액 지원 (본인부담 0원)
                    </td>
                    <td className="p-2.5 border-r border-teal-200">
                      본인부담금(14%) 전액 장애인의료비 국비 지원 (기본식대 20%만 부담)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-600">
              <div className="p-3 rounded-lg bg-teal-50/40 border border-teal-100">
                <span className="font-bold text-teal-900 block mb-1">
                  📋 90일 이내 소급신청 지침 (복지부 지침 p.58, p.61)
                </span>
                <p>
                  기초생활보장 수급자격 상실일로부터 90일 이내에 신청서 및 진단서를 제출하면 상실일로 소급하여 본인부담 차액을 건강보험공단에서 환급받을 수 있습니다.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-teal-50/40 border border-teal-100">
                <span className="font-bold text-teal-900 block mb-1">
                  💡 복지대상자 감면서비스 연계 신청
                </span>
                <p>
                  차상위본인부담경감대상자로 책정 시 전기요금(월 최대 1.6만원), 도시가스요금, 이동통신요금 감면(기본료 감면 등), TV수신료 면제가 함께 연계됩니다.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. 상세 산출 공식 및 실무자 해설서 */}
      {showBreakdown && (
        <div className="pt-4 border-t border-slate-200">
          <CalculationProcessExplainer
            inputs={inputs}
            result={result}
            isModal={false}
          />
        </div>
      )}
    </div>
  );
};
