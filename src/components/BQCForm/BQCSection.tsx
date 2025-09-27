import React from 'react';
import type { BQCData } from '@/types';
import { MANUFACTURER_TYPES } from '@/utils/constants';
import { formatCurrency, formatPercentage } from '@/utils/calculations';

interface BQCSectionProps {
  data: BQCData;
  onChange: (updates: Partial<BQCData>) => void;
  calculatedValues: {
    turnoverRequirement: {
      amount: number;
      percentage: number;
      description: string;
    };
    supplyingCapacity: {
      calculated: number;
      final: number;
      mseAdjusted?: number;
    };
    experienceRequirements: {
      optionA: { percentage: number; value: number };
      optionB: { percentage: number; value: number };
      optionC: { percentage: number; value: number };
    };
  };
}

export function BQCSection({ data, onChange, calculatedValues }: BQCSectionProps) {
  const handleManufacturerTypeChange = (type: string, checked: boolean) => {
    const currentTypes = data.manufacturerTypes || [];
    let newTypes;
    
    if (checked) {
      newTypes = [...currentTypes, type as any];
    } else {
      newTypes = currentTypes.filter(t => t !== type);
    }
    
    onChange({ manufacturerTypes: newTypes });
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-medium text-gray-900">BQC Criteria</h3>
      </div>
      <div className="card-body space-y-6">
        {/* Technical Criteria */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Technical Criteria</h4>
          
          {/* Goods-specific criteria */}
          {data.tenderType === 'Goods' && (
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <h5 className="text-sm font-medium text-gray-900 mb-3">For Goods</h5>
              
              {/* Manufacturer Types */}
              <div className="mb-4">
                <label className="form-label">Manufacturer Types *</label>
                <div className="mt-2 space-y-2">
                  {MANUFACTURER_TYPES.map((type) => (
                    <div key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`manufacturer-${type}`}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        checked={data.manufacturerTypes?.includes(type) || false}
                        onChange={(e) => handleManufacturerTypeChange(type, e.target.checked)}
                      />
                      <label htmlFor={`manufacturer-${type}`} className="ml-2 text-sm text-gray-700">
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Supplying Capacity */}
              <div className="mb-4">
                <label htmlFor="supplyingCapacity" className="form-label">
                  Quantity to be supplied (base value)
                </label>
                <input
                  type="number"
                  id="supplyingCapacity"
                  className="form-input"
                  placeholder="30"
                  min="0"
                  max="1000"
                  value={data.supplyingCapacity || ''}
                  onChange={(e) => onChange({ supplyingCapacity: parseInt(e.target.value) || 30 })}
                />
                <p className="mt-1 text-sm text-blue-600">
                  Calculated Supplying Capacity: 30% of {data.supplyingCapacity} = {calculatedValues.supplyingCapacity.calculated}
                </p>
              </div>

              {/* MSE Relaxation */}
              <div className="mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="mseRelaxation"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={data.mseRelaxation}
                    onChange={(e) => onChange({ mseRelaxation: e.target.checked })}
                  />
                  <label htmlFor="mseRelaxation" className="ml-2 text-sm font-medium text-gray-700">
                    Apply MSE Relaxation (15%)
                  </label>
                </div>
                {data.mseRelaxation && calculatedValues.supplyingCapacity.mseAdjusted && (
                  <p className="mt-1 text-sm text-blue-600">
                    MSE Relaxation Calculation: {calculatedValues.supplyingCapacity.calculated} × (1 - 15%) = {calculatedValues.supplyingCapacity.mseAdjusted}
                  </p>
                )}
              </div>

              {/* Past Performance for Goods */}
              <div className="mb-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h6 className="text-sm font-medium text-gray-900 mb-2">Past Performance Requirement</h6>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-purple-700">Base Requirement (30% of CEC incl. GST):</span>
                      <span className="text-sm font-semibold text-purple-900">
                        ₹{(data.cecEstimateInclGst * 0.30).toFixed(2)} Lakh
                      </span>
                    </div>
                    {data.mseRelaxation && (
                      <div className="flex items-center justify-between border-t border-purple-200 pt-2">
                        <span className="text-sm text-green-700">With MSE Relaxation (15% reduction):</span>
                        <span className="text-sm font-semibold text-green-900">
                          ₹{(data.cecEstimateInclGst * 0.30 * (1 - 0.15)).toFixed(2)} Lakh
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Service/Works-specific criteria */}
          {(data.tenderType === 'Service' || data.tenderType === 'Works') && (
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <h5 className="text-sm font-medium text-gray-900 mb-3">For Service/Works</h5>
              
              <div className="mb-4">
                <label htmlFor="similarWorkDefinition" className="form-label">
                  Definition of Similar Work *
                </label>
                <textarea
                  id="similarWorkDefinition"
                  rows={3}
                  className="form-input"
                  placeholder="Define what constitutes similar work for this tender"
                  value={data.similarWorkDefinition}
                  onChange={(e) => onChange({ similarWorkDefinition: e.target.value })}
                />
              </div>

              {/* Experience Requirements Display */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h6 className="text-sm font-medium text-gray-900 mb-2">Experience Requirements:</h6>
                <div className="space-y-1 text-sm text-blue-900">
                  <p>Option A ({formatPercentage(calculatedValues.experienceRequirements.optionA.percentage)}): {formatCurrency(calculatedValues.experienceRequirements.optionA.value)}</p>
                  <p>Option B ({formatPercentage(calculatedValues.experienceRequirements.optionB.percentage)}): {formatCurrency(calculatedValues.experienceRequirements.optionB.value)}</p>
                  <p>Option C ({formatPercentage(calculatedValues.experienceRequirements.optionC.percentage)}): {formatCurrency(calculatedValues.experienceRequirements.optionC.value)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Financial Criteria */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Financial Criteria</h4>
          
          {data.evaluationMethodology === 'LCS' ? (
            /* LCS - Show calculated turnover */
            <div className="bg-green-50 p-4 rounded-lg">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Annual Turnover Requirement</h5>
              <p className="text-lg font-semibold text-green-900">
                {calculatedValues.turnoverRequirement.description}: {formatCurrency(calculatedValues.turnoverRequirement.amount / 100, 'Crore')}
              </p>
            </div>
          ) : (
            /* Lot-wise - Show reference to Preamble table */
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h5 className="text-md font-semibold text-blue-900">Lot-wise Financial Criteria</h5>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm text-blue-800 font-medium">
                  📊 For lot-wise evaluation, financial criteria are calculated individually for each lot.
                </p>
                
                <div className="bg-white/60 rounded-lg border border-blue-100 p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-semibold text-blue-900">
                      Check the Preamble → Lot-wise Table for:
                    </p>
                  </div>
                  {/* <ul className="text-sm text-blue-700 space-y-1 ml-6">
                    <li>• <strong>Turnover Requirement:</strong> 30% of each lot's CEC (excluding AMC)</li>
                    <li>• <strong>Individual calculations</strong> displayed in the "Turnover" column</li>
                    <li>• <strong>AMC considerations</strong> applied per lot when applicable</li>
                  </ul> */}
                </div>
                
                <p className="text-xs text-blue-600 italic">
                  💡 Navigate to Preamble tab to view and manage individual lot financial criteria.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
