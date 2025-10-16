import type { BQCData } from '@/types';
import { MANUFACTURER_TYPES, COMMERCIAL_EVALUATION_OPTIONS } from '@/utils/constants';
import { formatCurrency, formatPercentage, formatTurnoverAmount } from '@/utils/calculations';
import { ExplanatoryNote } from '../ExplanatoryNote';

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

  const handleCommercialEvaluationMethodChange = (method: string, checked: boolean) => {
    const currentMethods = data.commercialEvaluationMethod || [];
    let newMethods;
    
    if (checked) {
      newMethods = [...currentMethods, method];
    } else {
      newMethods = currentMethods.filter(m => m !== method);
    }
    
    onChange({ commercialEvaluationMethod: newMethods });
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">3. BQC CRITERIA</h2>
        <p className="text-gray-600 font-medium">Technical and commercial evaluation criteria for bidders</p>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h3 className="text-xl font-semibold text-gray-900">Evaluation Criteria</h3>
          <p className="text-gray-600 mt-1">Define technical requirements and commercial evaluation methods</p>
        </div>
        <div className="card-body space-y-8">
        {/* Technical Criteria */}
        <div className="form-group">
          <h4 className="text-lg font-semibold text-gray-900 mb-6">Technical Criteria</h4>
          
          {/* Goods-specific criteria */}
          {data.tenderType === 'Goods' && (
            <div className="border border-gray-200 rounded-xl p-6 mb-6 bg-gradient-to-br from-blue-50 to-indigo-50">
              <h5 className="text-lg font-semibold text-gray-900 mb-4">Goods Requirements</h5>
              
              {/* Manufacturer Types */}
              <div className="mb-6">
                <label className="form-label text-lg">Manufacturer Types *</label>
                <div className="mt-3 space-y-3">
                  {MANUFACTURER_TYPES.map((type) => (
                    <div key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`manufacturer-${type}`}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={data.manufacturerTypes?.includes(type) || false}
                        onChange={(e) => handleManufacturerTypeChange(type, e.target.checked)}
                      />
                      <label htmlFor={`manufacturer-${type}`} className="ml-3 text-base text-gray-700 font-medium">
                        {type}
                      </label>
                    </div>
                  ))}
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

              {/* MSE Relaxation for Service/Works with least cash outflow */}
              {(data.tenderType === 'Service' || data.tenderType === 'Works') && data.evaluationMethodology === 'least cash outflow' && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="mseRelaxationService"
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      checked={data.mseRelaxation}
                      onChange={(e) => onChange({ mseRelaxation: e.target.checked })}
                    />
                    <label htmlFor="mseRelaxationService" className="ml-2 text-sm font-medium text-gray-700">
                      Apply MSE Relaxation (15% reduction)
                    </label>
                  </div>
                </div>
              )}

              {/* Experience Requirements Display */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h6 className="text-sm font-medium text-gray-900 mb-2">Experience Requirements:</h6>
                <div className="space-y-1 text-sm text-blue-900">
                  {(data.tenderType === 'Service' || data.tenderType === 'Works') && data.evaluationMethodology === 'least cash outflow' && data.mseRelaxation ? (
                    /* Show both MSE and non-MSE values when MSE relaxation is enabled */
                    <div className="space-y-3">
                      {/* Non-MSE (Standard) Requirements */}
                      <div className="bg-white p-3 rounded border border-blue-200">
                        <h6 className="text-sm font-semibold text-gray-800 mb-2 block">Non-MSE Requirements:</h6>
                        <div className="space-y-1">
                          <p>Option A ({formatPercentage(calculatedValues.experienceRequirements.optionA.percentage)}): {formatCurrency(calculatedValues.experienceRequirements.optionA.value / 0.85)}</p>
                          <p>Option B ({formatPercentage(calculatedValues.experienceRequirements.optionB.percentage)}): {formatCurrency(calculatedValues.experienceRequirements.optionB.value / 0.85)}</p>
                          <p>Option C ({formatPercentage(calculatedValues.experienceRequirements.optionC.percentage)}): {formatCurrency(calculatedValues.experienceRequirements.optionC.value / 0.85)}</p>
                        </div>
                      </div>
                      
                      {/* MSE Relaxed Requirements */}
                      <div className="bg-green-50 p-3 rounded border border-green-200">
                        <h6 className="text-sm font-semibold text-green-800 mb-2 block">MSE Requirements (15% reduction):</h6>
                        <div className="space-y-1">
                          <p>Option A ({formatPercentage(calculatedValues.experienceRequirements.optionA.percentage)}): {formatCurrency(calculatedValues.experienceRequirements.optionA.value)}</p>
                          <p>Option B ({formatPercentage(calculatedValues.experienceRequirements.optionB.percentage)}): {formatCurrency(calculatedValues.experienceRequirements.optionB.value)}</p>
                          <p>Option C ({formatPercentage(calculatedValues.experienceRequirements.optionC.percentage)}): {formatCurrency(calculatedValues.experienceRequirements.optionC.value)}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Show standard requirements when MSE relaxation is not enabled */
                    <div className="space-y-1">
                      <p>Option A ({formatPercentage(calculatedValues.experienceRequirements.optionA.percentage)}): {formatCurrency(calculatedValues.experienceRequirements.optionA.value)}</p>
                      <p>Option B ({formatPercentage(calculatedValues.experienceRequirements.optionB.percentage)}): {formatCurrency(calculatedValues.experienceRequirements.optionB.value)}</p>
                      <p>Option C ({formatPercentage(calculatedValues.experienceRequirements.optionC.percentage)}): {formatCurrency(calculatedValues.experienceRequirements.optionC.value)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Explanatory Note for Experience Requirements */}
          <ExplanatoryNote
            label="Experience Requirements"
            checked={data.hasExperienceExplanatoryNote || false}
            onCheckedChange={(checked) => onChange({ hasExperienceExplanatoryNote: checked })}
            value={data.experienceExplanatoryNote || ''}
            onValueChange={(value) => onChange({ experienceExplanatoryNote: value })}
            placeholder="Add any additional information about experience requirements..."
          />
        </div>

        {/* Commercial Evaluation Method */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Commercial Evaluation Method</h4>
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="form-label">
              Commercial Evaluation Method *
            </label>
            <div className="mt-2 space-y-2">
              {COMMERCIAL_EVALUATION_OPTIONS.map((method) => (
                <div key={method} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`commercial-eval-${method}`}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={data.commercialEvaluationMethod?.includes(method) || false}
                    onChange={(e) => handleCommercialEvaluationMethodChange(method, e.target.checked)}
                  />
                  <label htmlFor={`commercial-eval-${method}`} className="ml-2 text-sm text-gray-700">
                    {method}
                  </label>
                </div>
              ))}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Select one or more methods for commercial evaluation of bids
            </p>
          </div>
        </div>

        {/* Financial Criteria */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Financial Criteria</h4>
          
          {/* Contract Duration for Calculation */}
          <div className="mb-4">
            <label htmlFor="contractDurationYears" className="form-label">
              Contract Duration (Years) - For Calculation Only *
            </label>
            <input
              type="number"
              id="contractDurationYears"
              className="form-input"
              placeholder="1"
              step="0.1"
              min="0.1"
              max="20"
              value={data.contractDurationYears || ''}
              onChange={(e) => onChange({ contractDurationYears: parseFloat(e.target.value) || 1 })}
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter contract duration in years (used for annualization calculations only, not shown in output)
            </p>
          </div>
          
          {data.evaluationMethodology === 'least cash outflow' ? (
            /* least cash outflow - Show calculated turnover */
            <div className="bg-green-50 p-4 rounded-lg">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Annual Turnover Requirement</h5>
              <p className="text-lg font-semibold text-green-900">
                {calculatedValues.turnoverRequirement.description}: {formatTurnoverAmount(calculatedValues.turnoverRequirement.amount)}
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

        {/* Explanatory Note for Financial Criteria */}
        <ExplanatoryNote
          label="Financial Criteria"
          checked={data.hasFinancialExplanatoryNote || false}
          onCheckedChange={(checked) => onChange({ hasFinancialExplanatoryNote: checked })}
          value={data.financialExplanatoryNote || ''}
          onValueChange={(value) => onChange({ financialExplanatoryNote: value })}
          placeholder="Add any additional information about financial criteria..."
        />
        </div>
      </div>
    </div>
  );
}
