// import React from 'react';
import type { BQCData } from '@/types';
import { formatCurrency } from '@/utils/calculations';

interface ScopeSectionProps {
  data: BQCData;
  onChange: (updates: Partial<BQCData>) => void;
  calculatedValues: {
    pastPerformance: number;
  };
}

export function ScopeSection({ data, onChange, calculatedValues }: ScopeSectionProps) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-medium text-gray-900">Scope of Work</h3>
      </div>
      <div className="card-body space-y-6">
        {/* Scope of Work */}
        <div>
          <label htmlFor="scopeOfWork" className="form-label">
            Brief Scope of Work *
          </label>
          <textarea
            id="scopeOfWork"
            rows={3}
            className="form-input"
            placeholder="Provide a brief scope of work or supply items"
            value={data.scopeOfWork}
            onChange={(e) => onChange({ scopeOfWork: e.target.value })}
          />
        </div>

        {/* Contract Period - Only show for LCS */}
        {data.evaluationMethodology === 'LCS' && (
          <div>
            <label htmlFor="contractPeriodYears" className="form-label">
              Contract Period (Years) *
            </label>
            <div className="relative">
              <input
                type="number"
                id="contractPeriodYears"
                className="form-input pr-16"
                placeholder="1"
                step="1"
                min="1"
                max="20"
                value={data.contractPeriodYears || ''}
                onChange={(e) => onChange({ contractPeriodYears: parseInt(e.target.value) || 1 })}
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">
                years
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Contract period must be at least 1 year
            </p>
          </div>
        )}

        {/* Lot-wise Contract Period Notice */}
        {data.evaluationMethodology === 'Lot-wise' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-blue-800">
                Contract periods are managed individually for each lot in the Preamble section.
              </p>
            </div>
          </div>
        )}

            {/* Calculation Display - Different for LCS vs Lot-wise */}
            {data.evaluationMethodology === 'LCS' ? (
              /* LCS - Single Past Performance Value */
              <div className="calculation-display">
                <div className="flex items-center justify-between mb-2">
                  <label className="form-label text-blue-700">Past Performance Requirement</label>
                  <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="calculation-value">
                  {formatCurrency(calculatedValues.pastPerformance)}
                </p>
                <p className="text-xs text-blue-600 mt-1 font-medium">
                  {data.mseRelaxation ? '25.5% of CEC (with MSE relaxation)' : '30% of CEC incl. GST'}
                </p>
              </div>
        ) : (
          /* Lot-wise - Individual Calculations Notice */
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h4 className="text-md font-semibold text-purple-900">Lot-wise Calculations</h4>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-purple-800 font-medium">
                📊 Individual calculations are shown in the lot table above:
              </p>
              <ul className="text-sm text-purple-700 space-y-1 ml-4">
                <li>• <strong>Past Performance:</strong> 30% of CEC incl. GST (25.5% with MSE relaxation)</li>
                <li>• <strong>EMD Amount:</strong> Calculated per lot based on individual CEC values</li>
                <li>• <strong>Turnover Requirement:</strong> 30% of each lot's CEC (excluding AMC if applicable)</li>
                <li>• <strong>MSE Relaxation:</strong> Individual 15% reduction per lot when applicable</li>
              </ul>
              
              {data.lots && data.lots.length > 0 && (
                <div className="mt-4 p-3 bg-white/60 rounded-lg border border-purple-100">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-purple-600 font-medium">Total Lots:</span>
                      <p className="text-purple-900 font-semibold">{data.lots.length}</p>
                    </div>
                    <div>
                      <span className="text-purple-600 font-medium">Lots with AMC:</span>
                      <p className="text-purple-900 font-semibold">
                        {data.lots.filter(lot => lot.hasAmc).length}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AMC Section - Only show for LCS */}
        {data.evaluationMethodology === 'LCS' && (
          <div className="card hover-lift">
          <div className="card-header">
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hasAmc"
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
                  checked={data.hasAmc}
                  onChange={(e) => onChange({ hasAmc: e.target.checked })}
                />
                <label htmlFor="hasAmc" className="ml-3 block text-sm font-semibold text-gray-700">
                  Has AMC/CAMC?
                </label>
              </div>
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>

          {data.hasAmc && (
            <div className="space-y-5">
              <div className="form-group">
                <label htmlFor="amcPeriod" className="form-label">
                  AMC Period
                </label>
                <input
                  type="text"
                  id="amcPeriod"
                  className="form-input h-11"
                  placeholder="e.g., 3 years"
                  value={data.amcPeriod}
                  onChange={(e) => onChange({ amcPeriod: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="amcValue" className="form-label">
                  AMC Value
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="amcValue"
                    className="form-input h-11 pr-16"
                    placeholder="0"
                    step="0.01"
                    min="0"
                    value={data.amcValue || ''}
                    onChange={(e) => onChange({ amcValue: parseFloat(e.target.value) || 0 })}
                  />
                  <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-sm font-medium text-gray-500">
                    Lakh
                  </span>
                </div>
              </div>
            </div>
          )}
          </div>
        )}

        {/* Lot-wise AMC Notice */}
        {data.evaluationMethodology === 'Lot-wise' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-amber-800">
                AMC/CAMC is managed individually for each lot in the Preamble section.
              </p>
            </div>
          </div>
        )}

        {/* Payment Terms */}
        <div>
          <label htmlFor="paymentTerms" className="form-label">
            Payment Terms
          </label>
          <input
            type="text"
            id="paymentTerms"
            className="form-input"
            placeholder="e.g., Within 30 days"
            value={data.paymentTerms}
            onChange={(e) => onChange({ paymentTerms: e.target.value })}
          />
          <p className="mt-1 text-sm text-gray-500">
            Only if different from standard terms (within 30 days)
          </p>
        </div>

        {/* Goods-specific fields */}
        {data.tenderType === 'Goods' && (
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-900 mb-4">Goods-Specific Fields</h4>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="deliveryPeriod" className="form-label">
                  Delivery Period *
                </label>
                <input
                  type="text"
                  id="deliveryPeriod"
                  className="form-input"
                  placeholder="e.g., 30 days"
                  value={data.deliveryPeriod}
                  onChange={(e) => onChange({ deliveryPeriod: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="warrantyPeriod" className="form-label">
                  Warranty Period *
                </label>
                <input
                  type="text"
                  id="warrantyPeriod"
                  className="form-input"
                  placeholder="e.g., 12 months"
                  value={data.warrantyPeriod}
                  onChange={(e) => onChange({ warrantyPeriod: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
