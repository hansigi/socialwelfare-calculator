/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { BenefitCriteriaConfig, WelfareInputs } from './types/welfare';
import {
  calculateWelfare,
  createDefaultInputs,
} from './utils/calculator';
import { Header } from './components/Header';
import { BasicInfoSection } from './components/BasicInfoSection';
import { IncomeSection } from './components/IncomeSection';
import { PropertySection } from './components/PropertySection';
import { SupportObligationSection } from './components/SupportObligationSection';
import { NearPovertySection } from './components/NearPovertySection';
import { ResultsDashboard } from './components/ResultsDashboard';
import { CriteriaSettingsModal } from './components/CriteriaSettingsModal';
import { CalculationProcessExplainer } from './components/CalculationProcessExplainer';
import { NoticeTopBanner } from './components/NoticeTopBanner';
import { PrintableReport } from './components/PrintableReport';

export default function App() {
  const [inputs, setInputs] = useState<WelfareInputs>(createDefaultInputs());
  const [isCriteriaModalOpen, setIsCriteriaModalOpen] = useState(false);
  const [isExplainerModalOpen, setIsExplainerModalOpen] = useState(false);
  const [explainerStep, setExplainerStep] = useState<number>(1);

  const handleOpenExplainer = (step: number = 1) => {
    setExplainerStep(step);
    setIsExplainerModalOpen(true);
  };

  // 실시간 모의 계산 실행
  const calculationResult = useMemo(() => {
    return calculateWelfare(inputs);
  }, [inputs]);

  // 상담 프리셋 적용
  const handleApplyPreset = (presetKey: string) => {
    const base = createDefaultInputs();

    switch (presetKey) {
      case 'youth_single': // 1인 청년 단독가구
        setInputs({
          ...base,
          householdMembers: 1,
          region: 'seoul',
          earners: [
            {
              id: 'earner-1',
              name: '본인(청년)',
              category: 'youth',
              monthlyIncome: 1_200_000, // 60만 공제 후 30% 추가공제 -> 42만 원 인정
            },
          ],
          housingProperty: {
            ownHomeValue: 0,
            depositValue: 10_000_000, // 월세보증금 1천만 원
            applyDepositFactor: true,
          },
          financialProperty: {
            depositAndSavings: 5_000_000,
            applyLivingReserveDeduction: true,
          },
          propertyDeductions: {
            longTermSavings: 3_000_000, // 청년내일저축계좌 300만 원 공제
            naturalDecline: 0,
          },
        });
        break;

      case 'senior_couple': // 2인 고령 취약가구
        setInputs({
          ...base,
          householdMembers: 2,
          region: 'gyeonggi',
          earners: [
            {
              id: 'earner-1',
              name: '본인(노인)',
              category: 'senior_disabled',
              monthlyIncome: 300_000,
            },
          ],
          transferIncome: {
            publicTransfer: 600_000, // 기초연금 부부 합산
            privateTransfer: 0,
          },
          expenseDeductions: {
            chronicIllnessMedical: 150_000, // 만성질환 병원비
          },
          housingProperty: {
            ownHomeValue: 70_000_000, // 경기 7,000만 원 주택
            depositValue: 0,
            applyDepositFactor: true,
          },
          financialProperty: {
            depositAndSavings: 6_000_000,
            applyLivingReserveDeduction: true,
          },
          propertyDeductions: {
            longTermSavings: 0,
            naturalDecline: 10_000_000, // 과거 전세금 회수 후 병원비/생활비 자연감소분 1,000만 원 인정
          },
        });
        break;

      case 'special_disabled': // 1인 근로무능력 특례가구
        setInputs({
          ...base,
          householdMembers: 1,
          region: 'seoul',
          isWorkIncapableSpecial: true, // 근로무능력 특례 (기본재산 1억 4,300만 원 적용)
          earners: [
            {
              id: 'earner-1',
              name: '본인(장애인)',
              category: 'disabled',
              monthlyIncome: 0,
              disabilityBenefit: 400_000, // 장애인연금 (가구특성별 지출비용 100% 자동 공제)
            },
          ],
          transferIncome: {
            publicTransfer: 0,
            privateTransfer: 0,
          },
          housingProperty: {
            ownHomeValue: 0,
            depositValue: 90_000_000, // 전세보증금 9천만 원
            applyDepositFactor: true,
          },
          financialProperty: {
            depositAndSavings: 4_000_000,
            applyLivingReserveDeduction: true,
          },
        });
        break;

      case 'family_four': // 4인 일반가구
        setInputs({
          ...base,
          householdMembers: 4,
          region: 'metro',
          earners: [
            {
              id: 'earner-1',
              name: '부 (일반근로)',
              category: 'general',
              monthlyIncome: 2_200_000,
            },
            {
              id: 'earner-2',
              name: '모 (파트타임)',
              category: 'general',
              monthlyIncome: 800_000,
            },
          ],
          housingProperty: {
            ownHomeValue: 130_000_000, // 1억 3천만 원
            depositValue: 0,
            applyDepositFactor: true,
          },
          debt: {
            financialLoan: 80_000_000, // 주택담보대출 8천만 원
            rentalDepositLiability: 0,
          },
          financialProperty: {
            depositAndSavings: 12_000_000,
            applyLivingReserveDeduction: true,
          },
          cars: [
            {
              id: 'car-1',
              name: '생업용 트럭',
              value: 6_000_000,
              type: 'general_property', // 일반재산 4.17%
            },
          ],
        });
        break;

      case 'near_poverty_linkage': // 1인 기초의료 탈락 ➔ 차상위본인부담경감 연계 성공 사례
        setInputs({
          ...base,
          householdMembers: 1,
          region: 'gyeonggi', // 경기: 기초의료 기본재산 8,000만, 차상위 기본재산 1억 3,500만 원!
          earners: [
            {
              id: 'earner-1',
              name: '본인(만성질환 고령자)',
              category: 'senior',
              monthlyIncome: 0,
            },
          ],
          transferIncome: {
            publicTransfer: 750_000, // 국민연금 월 75만 원
            privateTransfer: 150_000, // 자녀 정기 용돈 15만 원 (기초수급은 반영, 차상위는 지침 p.26에 따라 전액 제외!)
          },
          housingProperty: {
            ownHomeValue: 110_000_000, // 1억 1,000만 원 주택 (기초의료 31.2만 환산 -> 탈락, 차상위는 1.35억 공제로 0원 -> 적격!)
            depositValue: 0,
            applyDepositFactor: true,
          },
          financialProperty: {
            depositAndSavings: 4_000_000,
            applyLivingReserveDeduction: true,
          },
          expenseDeductions: {
            chronicIllnessMedical: 80_000,
            otherAdditionalDeduction: 0,
          },
          supportObligation: {
            livelihoodExceedsCriteria: false,
            medicalSupportStatus: 'none_or_abolished',
            supportPaymentAmount: 0,
          },
          nearPovertyTarget: {
            targetType: 'chronic', // 만성질환자 (구분코드 E)
            illnessCode: 'HYPERTENSION',
            illnessName: '고혈압 (I10 ~ I15)',
            isRegisteredDisabled: false,
            hasMedicalCertificate: true,
            isSanctuaryRegistered: true,
          },
          nearPovertyObligation: {
            hasObligation: false, // 부양의무자 없음
            familyCount: 1,
            severeDisabledCount: 0,
            monthlyIncome: 0,
            targetPersonCount: 1,
            deductionEducation: 0,
            deductionRent: 0,
            deductionMedical: 0,
            deductionPension: 0,
            deductionDebt: 0,
            cannotReceiveSupport: false,
          },
        });
        break;

      default:
        break;
    }
  };

  // 초기화 핸들러
  const handleReset = () => {
    setInputs(createDefaultInputs());
  };

  // 인쇄 핸들러
  const handlePrint = () => {
    window.print();
  };

  // 선정기준 설정 (급여별·가구원수별) 저장
  const handleSaveCriteriaConfig = (updatedConfig: BenefitCriteriaConfig) => {
    setInputs((prev) => ({
      ...prev,
      criteriaConfig: updatedConfig,
      customMedianIncomeTable: updatedConfig.customMedianIncomeTable,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans antialiased flex flex-col justify-between">
      {/* Printable Sheet (Visible only when printing) */}
      <PrintableReport inputs={inputs} result={calculationResult} />

      {/* Main Interactive Screen */}
      <div className="print:hidden flex-1">
        <Header
          onReset={handleReset}
          onPrint={handlePrint}
          onOpenMedianModal={() => setIsCriteriaModalOpen(true)}
          onOpenExplainer={() => handleOpenExplainer(1)}
          onApplyPreset={handleApplyPreset}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-6">
          {/* 상단 법정 고정 유의사항 배너 */}
          <NoticeTopBanner />

          {/* Section 1: 기본 정보 */}
          <BasicInfoSection
            inputs={inputs}
            onChange={setInputs}
            onOpenMedianModal={() => setIsCriteriaModalOpen(true)}
          />

          {/* Section 2: 소득 사항 */}
          <IncomeSection inputs={inputs} onChange={setInputs} />

          {/* Section 3: 재산 사항 */}
          <PropertySection inputs={inputs} onChange={setInputs} />

          {/* Section 4: 부양의무자 기준 */}
          <SupportObligationSection inputs={inputs} onChange={setInputs} />

          {/* Section 5: 차상위본인부담경감 자격 및 부양요건 (신청 연계) */}
          <NearPovertySection inputs={inputs} onChange={setInputs} />

          {/* Section 6: 시각적 결과 대시보드 */}
          <ResultsDashboard
            inputs={inputs}
            result={calculationResult}
            householdMembers={inputs.householdMembers}
            onOpenExplainerModal={(step) => handleOpenExplainer(step || 1)}
          />
        </main>
      </div>

      {/* 급여별·가구원수별 선정기준 수정 모달 */}
      <CriteriaSettingsModal
        isOpen={isCriteriaModalOpen}
        onClose={() => setIsCriteriaModalOpen(false)}
        criteriaConfig={inputs.criteriaConfig}
        onSave={handleSaveCriteriaConfig}
      />

      {/* 소득인정액 계산과정 상세 해설서 모달 (직원 스터디 및 업무 매뉴얼) */}
      {isExplainerModalOpen && (
        <CalculationProcessExplainer
          inputs={inputs}
          result={calculationResult}
          isModal={true}
          initialStep={explainerStep}
          onClose={() => setIsExplainerModalOpen(false)}
        />
      )}
    </div>
  );
}
