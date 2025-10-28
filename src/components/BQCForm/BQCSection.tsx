import type { BQCData } from '@/types';
import { MANUFACTURER_TYPES, COMMERCIAL_EVALUATION_OPTIONS } from '@/utils/constants';
import { formatCurrency, formatPercentage, formatTurnoverAmount, calculateBQCEMD, formatEMDAmount } from '@/utils/calculations';
import { ExplanatoryNote } from '../ExplanatoryNote';
import { useState } from 'react';

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
  const [showMseCalculations, setShowMseCalculations] = useState(true);
  const [showNonMseCalculations, setShowNonMseCalculations] = useState(true);
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
                  value={data.similarWorkDefinition || 'Bidder should have executed the job of Pipeline Works for Hydrocarbons/Petrochemicals/ Fertilizers/Chemicals/ Fire Fighting system, with or without associated works.'}
                  onChange={(e) => onChange({ similarWorkDefinition: e.target.value })}
                />
              </div>

              {/* BQC/PQC for Procurement of Works and Services - Only for Lot-wise methodology */}
              {data.evaluationMethodology === 'Lot-wise' && (
                <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                  <h6 className="text-lg font-semibold text-blue-900 mb-2">3.1.2. BQC/PQC for Procurement of Works and Services</h6>
                  <h6 className="text-lg font-semibold text-blue-900 mb-4">3.1.1 PROVEN TRACK RECORD</h6>
                  <p className="text-sm text-blue-800 mb-4">
                    The bidder shall have experience of having successfully executed similar works in the last Seven (7) years in any Oil & Gas Industry in India. The Value (Rs) of the similar work/s executed (proof of execution to be submitted) should be as follows:
                  </p>
                  
                    {data.lots && data.lots.length > 0 ? (
                    <div className="bg-white rounded-lg border border-blue-200 overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Sr. No.
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Section / Description
                                  </th>
                                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                One similar work of total value not less than (Rs. in Lakhs)
                                  </th>
                                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Two similar works EACH of value not less than (Rs. in Lakhs)
                                  </th>
                                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Three similar works EACH of value not less than (Rs. in Lakhs)
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {data.lots.map((lot, index) => {
                                  const baseAmount = lot.cecEstimateInclGst || 0;
                                  
                                  // Parse contract period from text or use numeric value
                                  let contractMonths = lot.contractPeriodMonths || 12;
                                  if (lot.contractPeriodText) {
                                    const textMatch = lot.contractPeriodText.match(/(\d+)/);
                                    if (textMatch) {
                                      contractMonths = parseInt(textMatch[1]);
                                      // Handle years conversion
                                      if (lot.contractPeriodText.toLowerCase().includes('year')) {
                                        contractMonths = contractMonths * 12;
                                      }
                                    }
                                  }
                                  
                                  const contractYears = contractMonths / 12;
                                  const annualizedAmount = contractYears > 1 ? baseAmount / contractYears : baseAmount;
                                  const finalAmount = lot.mseRelaxation ? annualizedAmount * 0.85 : annualizedAmount;
                                  
                              // Convert to Lakhs for display (1 Crore = 100 Lakhs)
                              const amountInLakhs = finalAmount * 100;
                              
                              const optionA = amountInLakhs * 0.8; // 80% - One work
                              const optionB = amountInLakhs * 0.5; // 50% - Two works each
                              const optionC = amountInLakhs * 0.4; // 40% - Three works each
                                  
                                  return (
                                    <tr key={index} className="hover:bg-gray-50">
                                      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {index + 1}
                                  </td>
                                  <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {lot.lotNumber || `Lot ${index + 1}`}
                                      </td>
                                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                                    {Math.round(optionA * 100) / 100}
                                      </td>
                                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                                    {Math.round(optionB * 100) / 100}
                                      </td>
                                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                                    {Math.round(optionC * 100) / 100}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                        </div>
                      </div>
                    ) : (
                    <div className="bg-white rounded-lg border border-blue-200 p-4">
                      <p className="text-sm text-blue-700">
                        Add lots in the Preamble tab to view proven track record requirements
                      </p>
                      </div>
                    )}
                  
                  <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium">
                      <strong>Note:</strong> Bidder can quote for any one or more than one LOT based on their capability/choice. If the Bidder quotes for more than one LOT, the similar works criteria should not be less than the cumulative amount applicable for the LOTs quoted.
                    </p>
                  </div>
                </div>
              )}

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

              {/* Calculation Preview for Least Cash Outflow */}
              {data.evaluationMethodology === 'least cash outflow' && (
                <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                  <h6 className="text-lg font-semibold text-blue-900 mb-4">Similar Works Calculation</h6>
                  
                  {/* Base Information */}
                  <div className="bg-white rounded-lg border border-blue-200 p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Base Amount */}
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Base Amount</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(data.cecEstimateInclGst)}
                        </p>
                      </div>
                      
                      {/* Contract Period */}
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Contract Period</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {data.contractDurationYears || 1} year{(data.contractDurationYears || 1) !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600 mb-1">Annualized Amount</p>
                      <p className="text-xl font-semibold text-blue-900">
                        {formatCurrency(data.cecEstimateInclGst / (data.contractDurationYears || 1))}
                      </p>
                    </div>
                  </div>

                  {/* Non-MSE Calculations - Always show for least cash outflow */}
                  <div className="bg-white rounded-lg border border-blue-200 overflow-hidden mb-4">
                    <div className="bg-blue-50 px-4 py-2 border-b border-blue-200">
                      <h6 className="text-sm font-semibold text-blue-900">Standard Requirements</h6>
                    </div>
                    <div className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-sm text-gray-600">One Similar Work (80%):</span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency((data.cecEstimateInclGst / (data.contractDurationYears || 1)) * 0.8)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-sm text-gray-600">Two Similar Works Each (50%):</span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency((data.cecEstimateInclGst / (data.contractDurationYears || 1)) * 0.5)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-gray-600">Three Similar Works Each (40%):</span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency((data.cecEstimateInclGst / (data.contractDurationYears || 1)) * 0.4)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* MSE Calculations - Only show when MSE relaxation is checked */}
                  {data.mseRelaxation && (
                    <div className="bg-white rounded-lg border border-green-200 overflow-hidden">
                      <div className="bg-green-50 px-4 py-2 border-b border-green-200">
                        <h6 className="text-sm font-semibold text-green-900">MSE Relaxation Calculations (15% Reduction)</h6>
                      </div>
                      <div className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center py-2 border-b border-gray-200">
                            <span className="text-sm text-gray-600">One Similar Work (80%):</span>
                            <span className="text-sm font-medium text-green-700">
                              {formatCurrency(((data.cecEstimateInclGst / (data.contractDurationYears || 1)) * 0.85) * 0.8)}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center py-2 border-b border-gray-200">
                            <span className="text-sm text-gray-600">Two Similar Works Each (50%):</span>
                            <span className="text-sm font-medium text-green-700">
                              {formatCurrency(((data.cecEstimateInclGst / (data.contractDurationYears || 1)) * 0.85) * 0.5)}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-gray-600">Three Similar Works Each (40%):</span>
                            <span className="text-sm font-medium text-green-700">
                              {formatCurrency(((data.cecEstimateInclGst / (data.contractDurationYears || 1)) * 0.85) * 0.4)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

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

        {/* Past Performance Section for Goods */}
        {data.tenderType === 'Goods' && (
          <div className="form-group">
            <h4 className="text-lg font-semibold text-gray-900 mb-6">Past Performance Requirements</h4>
            
            <div className="border border-gray-200 rounded-xl p-6 mb-6 bg-gradient-to-br from-purple-50 to-pink-50">
              <h5 className="text-lg font-semibold text-gray-900 mb-4">Quantity Supplied Requirements</h5>
              <p className="text-sm text-gray-700 mb-4">
                The bidder should have supplied similar goods in the last Seven (7) years. The quantity supplied should be at least 30% of the total quantity required for each lot.
              </p>
              
              {/* Toggle Controls */}
              <div className="mb-4 p-4 bg-white rounded-lg border border-purple-200">
                <h6 className="text-sm font-semibold text-purple-900 mb-3">Display Options</h6>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showNonMse"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={showNonMseCalculations}
                      onChange={(e) => setShowNonMseCalculations(e.target.checked)}
                    />
                    <label htmlFor="showNonMse" className="ml-2 text-sm text-gray-700 font-medium">
                      Show Non-MSE (30%)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showMse"
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      checked={showMseCalculations}
                      onChange={(e) => setShowMseCalculations(e.target.checked)}
                    />
                    <label htmlFor="showMse" className="ml-2 text-sm text-gray-700 font-medium">
                      Show MSE (25.5%)
                    </label>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Toggle the visibility of MSE and Non-MSE calculations in the table below
                </p>
              </div>
              
              {data.evaluationMethodology === 'Lot-wise' && data.lots && data.lots.length > 0 ? (
                <div className="bg-white rounded-lg border border-purple-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sr. No.
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Section / Description
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity Required
                          </th>
                          {showNonMseCalculations && (
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Non-MSE (30%)
                            </th>
                          )}
                          {showMseCalculations && (
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              MSE (25.5%)
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {data.lots.map((lot, index) => {
                          const quantityRequired = lot.quantitySupplied || 0;
                          const nonMseRequirement = Math.round(quantityRequired * 0.3);
                          const mseRequirement = Math.round(quantityRequired * 0.255); // 30% * (1 - 0.15) = 25.5%
                          
                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                {index + 1}
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                {lot.lotNumber || `Lot ${index + 1}`}
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                                {quantityRequired.toLocaleString()}
                              </td>
                              {showNonMseCalculations && (
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                                  {nonMseRequirement.toLocaleString()}
                                </td>
                              )}
                              {showMseCalculations && (
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                                  {mseRequirement.toLocaleString()}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                        
                        {/* Total Row */}
                        <tr className="bg-gray-50 font-semibold">
                          <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {data.lots.length + 1}
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            TOTAL FOR ALL LOTS
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                            {data.lots.reduce((total, lot) => total + (lot.quantitySupplied || 0), 0).toLocaleString()}
                          </td>
                          {showNonMseCalculations && (
                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                              {Math.round(data.lots.reduce((total, lot) => total + ((lot.quantitySupplied || 0) * 0.3), 0)).toLocaleString()}
                            </td>
                          )}
                          {showMseCalculations && (
                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                              {Math.round(data.lots.reduce((total, lot) => total + ((lot.quantitySupplied || 0) * 0.255), 0)).toLocaleString()}
                            </td>
                          )}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-purple-200 p-4">
                  <p className="text-sm text-purple-700">
                    Add lots with quantity information in the Preamble tab to view past performance requirements
                  </p>
                </div>
              )}
              
              <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                <p className="text-sm text-purple-800 font-medium">
                  <strong>Note:</strong> MSE (Micro and Small Enterprises) bidders get 15% relaxation on past performance requirements. 
                  Non-MSE bidders need to show 30% of total quantity, while MSE bidders need to show 25.5% of total quantity.
                </p>
              </div>
            </div>

            {/* Explanatory Note for Past Performance */}
            <ExplanatoryNote
              label="Past Performance Requirements"
              checked={data.hasPastPerformanceExplanatoryNote || false}
              onCheckedChange={(checked) => onChange({ hasPastPerformanceExplanatoryNote: checked })}
              value={data.pastPerformanceExplanatoryNote || ''}
              onValueChange={(value) => onChange({ pastPerformanceExplanatoryNote: value })}
              placeholder="Add any additional information about past performance requirements..."
            />
          </div>
        )}

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
          <h4 className="text-md font-medium text-gray-900 mb-4">3.2 FINANCIAL CRITERIA</h4>
          
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
          
          {/* Annual Turnover Section - Only for Lot-wise */}
          {data.evaluationMethodology === 'Lot-wise' && (
            <div className="mb-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg">
              <h6 className="text-lg font-semibold text-green-900 mb-4">3.2.1 ANNUAL TURNOVER</h6>
              <p className="text-sm text-green-800 mb-4">
                The bidder should have achieved a minimum Average Annual financial turnover as per below table (LOT-WISE) as per Audited Balance sheet and P&L Statement in the last three* accounting years prior to due date of bid submission.
              </p>
              
              {data.lots && data.lots.length > 0 ? (
                <div className="bg-white rounded-lg border border-green-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sr. No.
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Section / Description
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Annualized Estimated Value (Rs. In Lakhs)
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Average Annual Turnover (Rs. In Lakhs)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {data.lots.map((lot, index) => {
                          const baseAmount = lot.cecEstimateInclGst || 0;
                          
                          // Parse contract period from text or use numeric value
                          let contractMonths = lot.contractPeriodMonths || 12;
                          if (lot.contractPeriodText) {
                            const textMatch = lot.contractPeriodText.match(/(\d+)/);
                            if (textMatch) {
                              contractMonths = parseInt(textMatch[1]);
                              // Handle years conversion
                              if (lot.contractPeriodText.toLowerCase().includes('year')) {
                                contractMonths = contractMonths * 12;
                              }
                            }
                          }
                          
                          const contractYears = contractMonths / 12;
                          const annualizedAmount = contractYears > 1 ? baseAmount / contractYears : baseAmount;
                          
                          // Convert to Lakhs for display (1 Crore = 100 Lakhs)
                          const annualizedValueInLakhs = annualizedAmount * 100;
                          
                          // Calculate turnover requirement (30% of annualized value)
                          const turnoverRequirement = annualizedValueInLakhs * 0.3;
                          
                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                {index + 1}
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                {lot.lotNumber || `Lot ${index + 1}`}
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                                {Math.round(annualizedValueInLakhs * 100) / 100}
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                                {Math.round(turnoverRequirement * 100) / 100}
                              </td>
                            </tr>
                          );
                        })}
                        
                        {/* Total Row */}
                        <tr className="bg-gray-50 font-semibold">
                          <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {data.lots.length + 1}
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            TOTAL FOR ALL LOTS
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                            {Math.round(data.lots.reduce((total, lot) => {
                              const baseAmount = lot.cecEstimateInclGst || 0;
                              let contractMonths = lot.contractPeriodMonths || 12;
                              if (lot.contractPeriodText) {
                                const textMatch = lot.contractPeriodText.match(/(\d+)/);
                                if (textMatch) {
                                  contractMonths = parseInt(textMatch[1]);
                                  if (lot.contractPeriodText.toLowerCase().includes('year')) {
                                    contractMonths = contractMonths * 12;
                                  }
                                }
                              }
                              const contractYears = contractMonths / 12;
                              const annualizedAmount = contractYears > 1 ? baseAmount / contractYears : baseAmount;
                              return total + (annualizedAmount * 100);
                            }, 0) * 100) / 100}
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                            {Math.round(data.lots.reduce((total, lot) => {
                              const baseAmount = lot.cecEstimateInclGst || 0;
                              let contractMonths = lot.contractPeriodMonths || 12;
                              if (lot.contractPeriodText) {
                                const textMatch = lot.contractPeriodText.match(/(\d+)/);
                                if (textMatch) {
                                  contractMonths = parseInt(textMatch[1]);
                                  if (lot.contractPeriodText.toLowerCase().includes('year')) {
                                    contractMonths = contractMonths * 12;
                                  }
                                }
                              }
                              const contractYears = contractMonths / 12;
                              const annualizedAmount = contractYears > 1 ? baseAmount / contractYears : baseAmount;
                              const turnoverRequirement = (annualizedAmount * 100) * 0.3;
                              return total + turnoverRequirement;
                            }, 0) * 100) / 100}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-green-200 p-4">
                  <p className="text-sm text-green-700">
                    Add lots in the Preamble tab to view annual turnover requirements
                  </p>
                </div>
              )}
              
              <div className="mt-4 p-3 bg-green-100 rounded-lg">
                <p className="text-sm text-green-800 font-medium">
                  <strong>Note:</strong> Bidder can quote for any one or more than one LOT based on their capability/choice. If the Bidder quotes for more than one LOT, the average value of Turnover should not be less than the cumulative amount applicable for the LOTs quoted.
                </p>
              </div>
            </div>
          )}
          
          {data.evaluationMethodology === 'least cash outflow' && (
            /* least cash outflow - Show calculated turnover with separate MSE sections */
            <div className="bg-green-50 p-4 rounded-lg">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Annual Turnover Requirement</h5>
              <p className="text-lg font-semibold text-green-900 mb-3">
                {calculatedValues.turnoverRequirement.description}: {formatTurnoverAmount(calculatedValues.turnoverRequirement.amount)}
              </p>
              
            </div>
          )}

          {/* Net Worth Section */}
          <div className="mb-6 p-4 bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg">
            <h6 className="text-lg font-semibold text-orange-900 mb-4">3.2.2 NET WORTH</h6>
            <p className="text-sm text-orange-800 mb-4">
              The bidder should have positive net worth as per the latest audited financial statement.
            </p>
          </div>



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
