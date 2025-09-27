// import React from 'react';
import type { BQCData } from '@/types';
import { DIVISIBILITY_OPTIONS } from '@/utils/constants';
import { formatCurrency } from '@/utils/calculations';

interface OtherSectionProps {
  data: BQCData;
  onChange: (updates: Partial<BQCData>) => void;
  calculatedValues: {
    emdAmount: number;
  };
}

export function OtherSection({ data, onChange, calculatedValues }: OtherSectionProps) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-medium text-gray-900">Other Sections</h3>
      </div>
      <div className="card-body space-y-6">
        {/* Escalation Clause */}
        <div>
          <label htmlFor="escalationClause" className="form-label">
            Escalation Clause
          </label>
          <textarea
            id="escalationClause"
            rows={3}
            className="form-input"
            placeholder="Enter escalation/de-escalation clause details"
            value={data.escalationClause}
            onChange={(e) => onChange({ escalationClause: e.target.value })}
          />
        </div>

        {/* Additional Details */}
        <div>
          <label htmlFor="additionalDetails" className="form-label">
            Additional Details
          </label>
          <textarea
            id="additionalDetails"
            rows={3}
            className="form-input"
            placeholder="Enter any additional details or requirements"
            value={data.additionalDetails}
            onChange={(e) => onChange({ additionalDetails: e.target.value })}
          />
        </div>

        {/* Divisibility */}
        <div>
          <label htmlFor="divisibility" className="form-label">
            Divisibility
          </label>
          <select
            id="divisibility"
            className="form-input"
            value={data.divisibility}
            onChange={(e) => onChange({ divisibility: e.target.value as BQCData['divisibility'] })}
          >
            {DIVISIBILITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Correction Factor (only for divisible) */}
        {data.divisibility === 'Divisible' && (
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-900 mb-4">Divisibility Settings</h4>
            
            <div>
              <label htmlFor="correctionFactor" className="form-label">
                Correction Factor
              </label>
              <input
                type="number"
                id="correctionFactor"
                className="form-input"
                placeholder="0"
                step="0.01"
                min="0"
                max="1"
                value={data.correctionFactor || ''}
                onChange={(e) => onChange({ correctionFactor: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
        )}

        {/* EMD Preview */}
        <div>
          <label className="form-label">EMD Preview</label>
          
          {data.evaluationMethodology === 'LCS' ? (
            /* LCS - Show calculated EMD */
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-lg font-semibold text-yellow-900">
                EMD will be automatically calculated as: {calculatedValues.emdAmount === 0 ? 'Nil' : formatCurrency(calculatedValues.emdAmount)}
              </p>
            </div>
          ) : (
            /* Lot-wise - Show reference to Preamble table */
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <h5 className="text-md font-semibold text-emerald-900">Lot-wise EMD Preview</h5>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm text-emerald-800 font-medium">
                  💰 For lot-wise evaluation, EMD is calculated individually for each lot.
                </p>
                
                <div className="bg-white/60 rounded-lg border border-emerald-100 p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-semibold text-emerald-900">
                      Check the Preamble → Lot-wise Table for:
                    </p>
                  </div>
                  {/* <ul className="text-sm text-emerald-700 space-y-1 ml-6">
                    <li>• <strong>Individual EMD amounts</strong> displayed in the "EMD" column</li>
                    <li>• <strong>Calculated per lot</strong> based on individual CEC values</li>
                    <li>• <strong>EMD thresholds</strong> applied to each lot separately</li>
                  </ul> */}
                </div>
                
                {/* <div className="bg-emerald-100/50 rounded-lg p-3">
                  <p className="text-xs text-emerald-800 font-medium">
                    📋 EMD Calculation Rules (per lot):
                  </p>
                  <ul className="text-xs text-emerald-700 mt-1 space-y-0.5 ml-4">
                    <li>• &lt; ₹50L: Nil EMD</li>
                    <li>• ₹50L - ₹100L: Nil EMD (Goods/Services)</li>
                    <li>• ₹100L - ₹500L: ₹2.5L</li>
                    <li>• ₹500L - ₹1000L: ₹5L</li>
                    <li>• &gt; ₹2500L: ₹20L</li>
                  </ul>
                </div> */}
                
                <p className="text-xs text-emerald-600 italic">
                  💡 Navigate to Preamble tab to view individual lot EMD calculations.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Performance Security */}
        <div>
          <label htmlFor="performanceSecurity" className="form-label">
            Performance Security
          </label>
          <div className="relative">
            <input
              type="number"
              id="performanceSecurity"
              className={`form-input pr-8 ${
                data.performanceSecurity && ![5, 10].includes(data.performanceSecurity)
                  ? 'border-amber-300 bg-amber-50 focus:border-amber-500 focus:ring-amber-200'
                  : ''
              }`}
              placeholder="5"
              min="0"
              max="20"
              value={data.performanceSecurity || ''}
              onChange={(e) => onChange({ performanceSecurity: parseInt(e.target.value) || 5 })}
            />
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">
              %
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Standard: 5% for Goods & Services, 10% for Works
          </p>
          {data.performanceSecurity && ![5, 10].includes(data.performanceSecurity) && (
            <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg className="h-4 w-4 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-sm text-amber-800 font-medium">
                  ⚠️ Non-standard performance security percentage. Standard values are 5% (Goods & Services) or 10% (Works).
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
