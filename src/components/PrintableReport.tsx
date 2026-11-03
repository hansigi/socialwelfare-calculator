/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CalculationResult, REGION_CONFIGS, WelfareInputs } from '../types/welfare';
import { formatKoreanWon } from '../utils/calculator';

interface PrintableReportProps {
  inputs: WelfareInputs;
  result: CalculationResult;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({
  inputs,
  result,
}) => {
  const regionName = REGION_CONFIGS[inputs.region].name;
  const todayStr = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="hidden print:block p-8 bg-white text-slate-900 font-sans max-w-4xl mx-auto text-xs">
      {/* Title Header */}
      <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
        <span className="text-[11px] font-semibold text-slate-600 tracking-wider">
          보건복지부 국민기초생활보장 및 의료급여 사업안내 지침 기준
        </span>
        <h1 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
          국민기초생활보장 수급자격 모의상담 결과서
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          상담일자: {todayStr} | 상담 구분: 초기 민원모의계산 참고용
        </p>
      </div>

      {/* 1. 기본 인적 및 가구 사항 */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-slate-900 border-l-4 border-blue-600 pl-2 mb-2">
          1. 기본 가구 정보
        </h2>
        <table className="w-full border border-slate-300 text-center">
          <tbody className="divide-y divide-slate-300">
            <tr className="bg-slate-50 font-semibold">
              <td className="p-2 border-r border-slate-300 w-1/4">가구원 수</td>
              <td className="p-2 border-r border-slate-300 w-1/4">거주 지역</td>
              <td className="p-2 border-r border-slate-300 w-1/4">특례 가구 여부</td>
              <td className="p-2 w-1/4">기준 중위소득</td>
            </tr>
            <tr>
              <td className="p-2 border-r border-slate-300 font-bold">
                {inputs.householdMembers}인 가구
              </td>
              <td className="p-2 border-r border-slate-300">{regionName}</td>
              <td className="p-2 border-r border-slate-300">
                {inputs.isWorkIncapableSpecial
                  ? '근로무능력자 특례 적용'
                  : '일반 가구'}
              </td>
              <td className="p-2 font-bold text-blue-700">
                {result.medianIncome.toLocaleString()}원
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 2. 소득 및 재산 산정 요약 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* 소득 산정 */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 border-l-4 border-blue-600 pl-2 mb-2">
            2. 월 소득평가액
          </h2>
          <table className="w-full border border-slate-300">
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-1.5 bg-slate-50 font-medium border-r border-slate-300">
                  근로·사업소득 (세전 총액)
                </td>
                <td className="p-1.5 text-right">
                  {result.incomeBreakdown.rawEarnedTotal.toLocaleString()}원
                </td>
              </tr>
              <tr>
                <td className="p-1.5 bg-slate-50 font-medium border-r border-slate-300">
                  생계·주거·교육 근로반영액
                </td>
                <td className="p-1.5 text-right font-semibold">
                  {result.incomeBreakdown.earnedGeneralEvaluated.toLocaleString()}원
                </td>
              </tr>
              <tr>
                <td className="p-1.5 bg-slate-50 font-medium border-r border-slate-300">
                  의료급여 근로반영액
                </td>
                <td className="p-1.5 text-right font-semibold">
                  {result.incomeBreakdown.earnedMedicalEvaluated.toLocaleString()}원
                </td>
              </tr>
              <tr>
                <td className="p-1.5 bg-slate-50 font-medium border-r border-slate-300">
                  재산소득 및 이전소득 합계
                </td>
                <td className="p-1.5 text-right">
                  {(
                    result.incomeBreakdown.propertyIncomeTotal +
                    result.incomeBreakdown.transferIncomeTotal
                  ).toLocaleString()}
                  원
                </td>
              </tr>
              {result.incomeBreakdown.disabilityBenefitTotal > 0 && (
                <tr>
                  <td className="p-1.5 bg-slate-50 font-medium border-r border-slate-300 text-purple-900">
                    장애인 공적급여 (연금·수당 수령액)
                  </td>
                  <td className="p-1.5 text-right text-purple-900 font-medium">
                    +{result.incomeBreakdown.disabilityBenefitTotal.toLocaleString()}원
                  </td>
                </tr>
              )}
              <tr>
                <td className="p-1.5 bg-slate-50 font-medium border-r border-slate-300">
                  가구특성별 지출비용 차감
                  {result.incomeBreakdown.disabilityBenefitDeduction > 0 && (
                    <span className="block text-[10px] text-slate-500 font-normal">
                      (만성질환: {result.incomeBreakdown.chronicMedicalDeduction.toLocaleString()}원 + 장애인연금·수당: {result.incomeBreakdown.disabilityBenefitDeduction.toLocaleString()}원)
                    </span>
                  )}
                </td>
                <td className="p-1.5 text-right text-rose-600 font-semibold">
                  -{result.incomeBreakdown.expenseDeductionTotal.toLocaleString()}원
                </td>
              </tr>
              <tr className="bg-blue-50 font-bold">
                <td className="p-1.5 border-r border-slate-300">
                  최종 소득평가액 (생계용)
                </td>
                <td className="p-1.5 text-right text-blue-800">
                  {result.incomeBreakdown.finalIncomeGeneral.toLocaleString()}원
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 재산 환산 */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 border-l-4 border-blue-600 pl-2 mb-2">
            3. 재산의 소득환산액
          </h2>
          <table className="w-full border border-slate-300">
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-1.5 bg-slate-50 font-medium border-r border-slate-300">
                  적용 기본재산액
                </td>
                <td className="p-1.5 text-right">
                  {result.propertyBreakdown.basicPropertyDeduction.toLocaleString()}원
                </td>
              </tr>
              <tr>
                <td className="p-1.5 bg-slate-50 font-medium border-r border-slate-300">
                  총 부채 차감액
                </td>
                <td className="p-1.5 text-right">
                  {result.propertyBreakdown.totalDebt.toLocaleString()}원
                </td>
              </tr>
              {result.propertyBreakdown.naturalDeclineDeduction > 0 && (
                <tr>
                  <td className="p-1.5 bg-slate-50 font-medium border-r border-slate-300">
                    처분재산 자연감소분 차감
                  </td>
                  <td className="p-1.5 text-right text-teal-700 font-semibold">
                    -{result.propertyBreakdown.naturalDeclineDeduction.toLocaleString()}원
                  </td>
                </tr>
              )}
              {result.propertyBreakdown.longTermSavingsDeduction > 0 && (
                <tr>
                  <td className="p-1.5 bg-slate-50 font-medium border-r border-slate-300">
                    장기저축 공제액 (희망·내일저축)
                  </td>
                  <td className="p-1.5 text-right text-teal-700 font-semibold">
                    -{result.propertyBreakdown.longTermSavingsDeduction.toLocaleString()}원
                  </td>
                </tr>
              )}
              <tr>
                <td className="p-1.5 bg-slate-50 font-medium border-r border-slate-300">
                  주거용재산 환산액 (월 1.04%)
                </td>
                <td className="p-1.5 text-right">
                  {result.propertyBreakdown.housingConvertedMonthly.toLocaleString()}원
                </td>
              </tr>
              <tr>
                <td className="p-1.5 bg-slate-50 font-medium border-r border-slate-300">
                  일반재산 환산액 (월 4.17%)
                </td>
                <td className="p-1.5 text-right">
                  {result.propertyBreakdown.generalConvertedMonthly.toLocaleString()}원
                </td>
              </tr>
              <tr>
                <td className="p-1.5 bg-slate-50 font-medium border-r border-slate-300">
                  금융재산 환산액 (월 6.26%)
                </td>
                <td className="p-1.5 text-right">
                  {result.propertyBreakdown.financialConvertedMonthly.toLocaleString()}원
                </td>
              </tr>
              <tr>
                <td className="p-1.5 bg-slate-50 font-medium border-r border-slate-300">
                  자동차 환산액 (100%/4.17%)
                </td>
                <td className="p-1.5 text-right">
                  {result.propertyBreakdown.carConvertedMonthly.toLocaleString()}원
                </td>
              </tr>
              <tr className="bg-blue-50 font-bold">
                <td className="p-1.5 border-r border-slate-300">
                  재산의 소득환산액 합계
                </td>
                <td className="p-1.5 text-right text-blue-800">
                  {result.propertyBreakdown.totalPropertyConvertedMonthly.toLocaleString()}원
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. 소득인정액 확정 */}
      <div className="p-3 bg-slate-100 rounded-lg mb-6 border border-slate-300 flex justify-between items-center text-xs">
        <div>
          <span className="font-bold text-slate-800">생계·주거·교육급여용 소득인정액:</span>
          <span className="text-base font-black text-blue-700 ml-2">
            {result.recognizedIncomeGeneral.toLocaleString()}원
          </span>
        </div>
        <div>
          <span className="font-bold text-slate-800">의료급여용 소득인정액 (부양비 포함):</span>
          <span className="text-base font-black text-emerald-700 ml-2">
            {result.recognizedIncomeMedical.toLocaleString()}원
          </span>
        </div>
      </div>

      {/* 4. 급여별 수급 판정 결과표 */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-slate-900 border-l-4 border-blue-600 pl-2 mb-2">
          4. 4대 급여별 수급 자격 판정 결과
        </h2>
        <table className="w-full border border-slate-400 text-center">
          <thead className="bg-slate-200 text-slate-800 font-bold border-b border-slate-400">
            <tr>
              <th className="p-2 border-r border-slate-400">급여 종류</th>
              <th className="p-2 border-r border-slate-400">선정 기준선</th>
              <th className="p-2 border-r border-slate-400">선정 기준액</th>
              <th className="p-2 border-r border-slate-400">적용 소득인정액</th>
              <th className="p-2 border-r border-slate-400">판정 결과</th>
              <th className="p-2">비고 (지급액 / 사유)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300 text-xs">
            {/* 생계급여 */}
            <tr>
              <td className="p-2 font-bold border-r border-slate-300">생계급여</td>
              <td className="p-2 border-r border-slate-300">중위소득 32%</td>
              <td className="p-2 border-r border-slate-300">
                {result.livelihoodBenefit.criterionAmount.toLocaleString()}원
              </td>
              <td className="p-2 border-r border-slate-300">
                {result.recognizedIncomeGeneral.toLocaleString()}원
              </td>
              <td
                className={`p-2 font-black border-r border-slate-300 ${
                  result.livelihoodBenefit.isEligible
                    ? 'text-blue-700 bg-blue-50'
                    : 'text-rose-600'
                }`}
              >
                {result.livelihoodBenefit.isEligible ? '적합' : '부적합'}
              </td>
              <td className="p-2 text-left">
                {result.livelihoodBenefit.isEligible ? (
                  <span className="font-bold text-blue-800">
                    예상 지급액: 월{' '}
                    {result.livelihoodBenefit.expectedLivelihoodGrant?.toLocaleString()}
                    원
                  </span>
                ) : (
                  result.livelihoodBenefit.ineligibilityReason
                )}
              </td>
            </tr>

            {/* 의료급여 */}
            <tr>
              <td className="p-2 font-bold border-r border-slate-300">의료급여</td>
              <td className="p-2 border-r border-slate-300">중위소득 40%</td>
              <td className="p-2 border-r border-slate-300">
                {result.medicalBenefit.criterionAmount.toLocaleString()}원
              </td>
              <td className="p-2 border-r border-slate-300">
                {result.recognizedIncomeMedical.toLocaleString()}원
              </td>
              <td
                className={`p-2 font-black border-r border-slate-300 ${
                  result.medicalBenefit.isEligible
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-rose-600'
                }`}
              >
                {result.medicalBenefit.isEligible ? '적합' : '부적합'}
              </td>
              <td className="p-2 text-left">
                {result.medicalBenefit.isEligible
                  ? '의료비 본인부담금 감면 지원'
                  : result.medicalBenefit.ineligibilityReason}
              </td>
            </tr>

            {/* 주거급여 */}
            <tr>
              <td className="p-2 font-bold border-r border-slate-300">주거급여</td>
              <td className="p-2 border-r border-slate-300">중위소득 48%</td>
              <td className="p-2 border-r border-slate-300">
                {result.housingBenefit.criterionAmount.toLocaleString()}원
              </td>
              <td className="p-2 border-r border-slate-300">
                {result.recognizedIncomeGeneral.toLocaleString()}원
              </td>
              <td
                className={`p-2 font-black border-r border-slate-300 ${
                  result.housingBenefit.isEligible
                    ? 'text-amber-700 bg-amber-50'
                    : 'text-rose-600'
                }`}
              >
                {result.housingBenefit.isEligible ? '적합' : '부적합'}
              </td>
              <td className="p-2 text-left">
                {result.housingBenefit.isEligible
                  ? '기준임대료 내 임차급여 지원'
                  : result.housingBenefit.ineligibilityReason}
              </td>
            </tr>

            {/* 교육급여 */}
            <tr>
              <td className="p-2 font-bold border-r border-slate-300">교육급여</td>
              <td className="p-2 border-r border-slate-300">중위소득 50%</td>
              <td className="p-2 border-r border-slate-300">
                {result.educationBenefit.criterionAmount.toLocaleString()}원
              </td>
              <td className="p-2 border-r border-slate-300">
                {result.recognizedIncomeGeneral.toLocaleString()}원
              </td>
              <td
                className={`p-2 font-black border-r border-slate-300 ${
                  result.educationBenefit.isEligible
                    ? 'text-purple-700 bg-purple-50'
                    : 'text-rose-600'
                }`}
              >
                {result.educationBenefit.isEligible ? '적합' : '부적합'}
              </td>
              <td className="p-2 text-left">
                {result.educationBenefit.isEligible
                  ? '초·중·고 교육활동지원비 지급'
                  : result.educationBenefit.ineligibilityReason}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 4-2. 차상위본인부담경감대상자 지원사업 연계 모의 판정 결과 */}
      <div className="mb-6 p-3 rounded-lg border-2 border-teal-600 bg-teal-50/20">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-teal-950 border-l-4 border-teal-600 pl-2">
            5. [신청 연계] 2026 차상위 본인부담경감대상자 판정 및 상담 소견
          </h2>
          <span
            className={`px-2 py-0.5 rounded text-xs font-black ${
              result.nearPovertyResult.isFinalEligible
                ? 'bg-teal-700 text-white'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {result.nearPovertyResult.isFinalEligible
              ? `적격 확정 [${result.nearPovertyResult.targetBenefitCode}코드]`
              : '부적합'}
          </span>
        </div>

        <table className="w-full border border-teal-300 text-center mb-2 text-xs">
          <thead className="bg-teal-100/70 font-semibold text-teal-950">
            <tr>
              <th className="p-1.5 border-r border-teal-300">선정기준 (중위 50%)</th>
              <th className="p-1.5 border-r border-teal-300">차상위 소득인정액</th>
              <th className="p-1.5 border-r border-teal-300">적용 기본재산공제</th>
              <th className="p-1.5 border-r border-teal-300">부양의무자 심사</th>
              <th className="p-1.5 border-r border-teal-300">대상 구분코드</th>
              <th className="p-1.5">최종 판정</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-teal-200 bg-white">
            <tr>
              <td className="p-1.5 border-r border-teal-200 font-bold">
                {result.nearPovertyResult.criterionAmount.toLocaleString()}원
              </td>
              <td className="p-1.5 border-r border-teal-200 font-black text-teal-800">
                {result.nearPovertyResult.recognizedIncome.toLocaleString()}원
              </td>
              <td className="p-1.5 border-r border-teal-200">
                {regionName}{' '}
                {formatKoreanWon(
                  result.nearPovertyResult.propertyBreakdown.basicPropertyDeduction,
                )}
              </td>
              <td className="p-1.5 border-r border-teal-200">
                {result.nearPovertyResult.isSupportEligible
                  ? '부양능력 없음 (적격)'
                  : '부양능력 있음 (부적합)'}
              </td>
              <td className="p-1.5 border-r border-teal-200 font-bold text-teal-900">
                {result.nearPovertyResult.targetBenefitCode !== 'none'
                  ? `[${result.nearPovertyResult.targetBenefitCode}] ${result.nearPovertyResult.benefitCodeName}`
                  : '미선택'}
              </td>
              <td
                className={`p-1.5 font-black ${
                  result.nearPovertyResult.isFinalEligible
                    ? 'text-teal-700 bg-teal-50 font-black'
                    : 'text-rose-600'
                }`}
              >
                {result.nearPovertyResult.isFinalEligible ? '적격' : '부적합'}
              </td>
            </tr>
          </tbody>
        </table>

        {/* 연계상담 소견 및 절차 안내 */}
        <div className="p-2 rounded bg-white border border-teal-200 text-[11px] leading-relaxed text-slate-700 space-y-1">
          <div>
            <strong className="text-teal-900 font-bold">상담사 종합 소견: </strong>
            <span>{result.nearPovertyResult.finalStatusMessage}</span>
          </div>
          {(!result.livelihoodBenefit.isEligible || !result.medicalBenefit.isEligible) && (
            <div className="text-teal-800">
              <strong className="font-bold">기초수급 탈락 시 연계 권고사항: </strong>
              <span>{result.nearPovertyResult.linkageRecommendation.reason}</span>
            </div>
          )}
          <div className="text-slate-600">
            * <strong>신청 시 주의사항 (지침 p.58, p.61):</strong> 기초생활보장 수급자격 상실일로부터 90일 이내 신청 시 상실일자로 소급 경감(행복e음 소급요청 'Y') 처리되며, 지역가입자 건강보험료 전액 국고지원 및 요양급여비용 본인부담금 감면 혜택을 받으실 수 있습니다.
          </div>
        </div>
      </div>

      {/* 5. 법정 유의사항 */}
      <div className="p-3 border border-slate-400 bg-slate-50 text-[11px] leading-relaxed mb-8">
        <p className="font-bold text-slate-800 mb-0.5">[유의사항]</p>
        <p>
          본 계산 결과는 신청 전 초기 상담을 통해 민원인이 진술한 정보를 바탕으로 모의 계산된 참고용 자료입니다. 실제 수급자 선정 여부는 급여 신청 후 차세대사회보장정보시스템(행복e음)을 통한 공적자료 조회, 금융재산 조사 및 통합조사관리팀의 실태조사 결과에 따라 달라질 수 있습니다.
        </p>
      </div>

      {/* 서명란 */}
      <div className="flex justify-between items-end pt-4 border-t border-slate-300">
        <div>
          <p className="text-slate-500 text-[10px]">
            * 본 문서는 행정처분서가 아니며, 초기 민원상담 안내 목적으로만 발급됩니다.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-slate-800">
            상담자(담당자): __________________ (인)
          </p>
        </div>
      </div>
    </div>
  );
};
