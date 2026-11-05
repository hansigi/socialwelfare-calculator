/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Printer,
  RotateCcw,
  Sliders,
  Sparkles,
  BookOpen,
  Type,
} from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  onPrint: () => void;
  onOpenMedianModal: () => void;
  onOpenExplainer: () => void;
  onApplyPreset: (presetKey: string) => void;
}

type FontScaleLevel = 'normal' | 'large' | 'xlarge';

export const Header: React.FC<HeaderProps> = ({
  onReset,
  onPrint,
  onOpenMedianModal,
  onOpenExplainer,
  onApplyPreset,
}) => {
  const [fontScale, setFontScale] = useState<FontScaleLevel>('large');

  useEffect(() => {
    const htmlEl = document.documentElement;
    if (fontScale === 'normal') {
      htmlEl.style.fontSize = '16px';
    } else if (fontScale === 'large') {
      htmlEl.style.fontSize = '17.5px';
    } else {
      htmlEl.style.fontSize = '19px';
    }
  }, [fontScale]);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        {/* 1단: 로고·타이틀 (한 줄) + 우측 액션 버튼 */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-2xs shrink-0">
              <Calculator className="w-4.5 h-4.5" />
            </div>
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight whitespace-nowrap">
                국민기초생활수급자 · 차상위경감 모의계산기
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 shrink-0">
                <BookOpen className="w-3 h-3" />
                2026 지침 통합
              </span>
            </div>
          </div>

          {/* 우측 컨트롤 버튼 그룹 */}
          <div className="flex items-center gap-1.5 flex-wrap justify-end shrink-0">
            {/* 글자크기 조절 스위치 */}
            <div
              className="inline-flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200"
              title="화면 글자크기 조절"
            >
              <span className="text-xs font-bold text-slate-600 px-1.5 flex items-center gap-1">
                <Type className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden md:inline">글자</span>
              </span>
              {(
                [
                  { key: 'normal', label: '보통' },
                  { key: 'large', label: '크게' },
                  { key: 'xlarge', label: '특대' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setFontScale(opt.key)}
                  className={`px-1.5 py-0.5 text-xs font-bold rounded transition cursor-pointer ${
                    fontScale === opt.key
                      ? 'bg-white text-blue-700 shadow-2xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onOpenExplainer}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition cursor-pointer whitespace-nowrap"
              title="보건복지부 지침 단계별 산정 공식 및 실무자 Q&A 스터디 노트"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>계산해설서</span>
            </button>

            <button
              type="button"
              onClick={onOpenMedianModal}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg transition cursor-pointer whitespace-nowrap"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>선정기준 설정</span>
            </button>

            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span>초기화</span>
            </button>

            <button
              type="button"
              onClick={onPrint}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-2xs cursor-pointer whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5 shrink-0" />
              <span>결과 인쇄</span>
            </button>
          </div>
        </div>

        {/* 2단: 상담 예시 시나리오 (컴팩트 한 줄 배치) */}
        <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none">
          <span className="text-slate-500 font-bold shrink-0 flex items-center gap-1 mr-0.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            상담 예시:
          </span>
          <button
            type="button"
            onClick={() => onApplyPreset('youth_single')}
            className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium border border-slate-200 transition shrink-0 cursor-pointer"
          >
            ① 1인 청년(월세·알바)
          </button>
          <button
            type="button"
            onClick={() => onApplyPreset('senior_couple')}
            className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium border border-slate-200 transition shrink-0 cursor-pointer"
          >
            ② 2인 고령(기초연금·만성질환)
          </button>
          <button
            type="button"
            onClick={() => onApplyPreset('special_disabled')}
            className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium border border-slate-200 transition shrink-0 cursor-pointer"
          >
            ③ 1인 장애인 특례(전세)
          </button>
          <button
            type="button"
            onClick={() => onApplyPreset('family_four')}
            className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-medium border border-slate-200 transition shrink-0 cursor-pointer"
          >
            ④ 4인 가구(일반근로·자가)
          </button>
          <button
            type="button"
            onClick={() => onApplyPreset('near_poverty_linkage')}
            className="px-2 py-0.5 rounded-md bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 font-bold transition shrink-0 cursor-pointer"
          >
            ⑤ 기초의료 탈락 ➔ 차상위경감 연계(만성질환·재산1.1억)
          </button>
        </div>
      </div>
    </header>
  );
};
