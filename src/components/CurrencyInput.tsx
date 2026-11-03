/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useId } from 'react';
import { formatKoreanWon } from '../utils/calculator';
import { RotateCcw } from 'lucide-react';

interface CurrencyInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  helperText?: string;
  quickAddButtons?: boolean;
  unitText?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label,
  value,
  onChange,
  helperText,
  quickAddButtons = true,
  unitText = '원',
  placeholder = '0',
  disabled = false,
}) => {
  const id = useId();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    const num = rawVal === '' ? 0 : parseInt(rawVal, 10);
    onChange(num);
  };

  const handleQuickAdd = (addAmount: number) => {
    onChange(Math.max(0, (value || 0) + addAmount));
  };

  const handleReset = () => {
    onChange(0);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5 gap-2">
        <label htmlFor={id} className="text-sm font-bold text-slate-800">
          {label}
        </label>
        {value > 0 && (
          <span className="text-xs sm:text-sm font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md shrink-0">
            {formatKoreanWon(value)}
          </span>
        )}
      </div>

      <div className="relative rounded-lg shadow-xs">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          disabled={disabled}
          value={value === 0 ? '' : value.toLocaleString('ko-KR')}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`block w-full rounded-lg border py-2.5 pr-11 pl-3.5 text-base font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors ${
            disabled
              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
              : 'border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
          }`}
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5">
          <span className="text-sm font-semibold text-slate-500">{unitText}</span>
        </div>
      </div>

      {helperText && (
        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
          {helperText}
        </p>
      )}

      {quickAddButtons && !disabled && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleQuickAdd(100_000)}
            className="text-xs font-semibold px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200/80 transition cursor-pointer"
          >
            +10만
          </button>
          <button
            type="button"
            onClick={() => handleQuickAdd(500_000)}
            className="text-xs font-semibold px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200/80 transition cursor-pointer"
          >
            +50만
          </button>
          <button
            type="button"
            onClick={() => handleQuickAdd(1_000_000)}
            className="text-xs font-semibold px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200/80 transition cursor-pointer"
          >
            +100만
          </button>
          <button
            type="button"
            onClick={() => handleQuickAdd(10_000_000)}
            className="text-xs font-semibold px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200/80 transition cursor-pointer"
          >
            +1,000만
          </button>
          <button
            type="button"
            onClick={() => handleQuickAdd(100_000_000)}
            className="text-xs font-semibold px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200/80 transition cursor-pointer"
          >
            +1억
          </button>
          {value > 0 && (
            <button
              type="button"
              onClick={handleReset}
              title="금액 0원 초기화"
              className="text-xs font-semibold px-2 py-1 text-slate-500 hover:text-red-600 rounded-md transition flex items-center gap-1 cursor-pointer ml-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>0원</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
