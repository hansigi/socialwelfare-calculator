/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';

export const NoticeFooter: React.FC = () => {
  return (
    <footer className="mt-8 border-t border-slate-200 bg-white py-5 shadow-sm print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/70 text-amber-900 shadow-2xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm leading-relaxed">
            <span className="font-bold mr-1.5">[유의사항]</span>
            본 계산 결과는 신청 전 초기 상담을 통해 민원인이 진술한 정보를 바탕으로 모의 계산된 참고용 자료입니다.
            실제 수급자 선정 여부는 급여 신청 후 차세대사회보장정보시스템(행복e음)을 통한 공적자료 조회, 금융재산 조사 및 통합조사관리팀의 실태조사 결과에 따라 달라질 수 있습니다.
          </div>
        </div>
      </div>
    </footer>
  );
};
