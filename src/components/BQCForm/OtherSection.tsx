// import React from 'react';
import type { BQCData } from '@/types';
import { DIVISIBILITY_OPTIONS } from '@/utils/constants';
import { formatCurrency, calculateEMD } from '@/utils/calculations';
import { ExplanatoryNote } from '../ExplanatoryNote';

interface OtherSectionProps {
  data: BQCData;
  onChange: (updates: Partial<BQCData>) => void;
  calculatedValues: {
    emdAmount: number;
  };
}

export function OtherSection({ data, onChange, calculatedValues }: OtherSectionProps) {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">4. OTHER TERMS & CONDITIONS</h2>
        <p className="text-gray-600 font-medium">Additional terms, security requirements, and special conditions</p>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h3 className="text-xl font-semibold text-gray-900">Terms & Conditions</h3>
          <p className="text-gray-600 mt-1">Configure additional terms, security requirements, and special conditions</p>
        </div>
        <div className="card-body space-y-8">
        {/* Escalation Clause - Hidden for Group 4 (E&P SERVICES) */}
        {data.groupName !== '4 - E&P SERVICES' && (
          <div className="form-group">
            <label htmlFor="escalationClause" className="form-label text-lg">
              Escalation Clause
            </label>
            <textarea
              id="escalationClause"
              rows={4}
              className="form-input text-base"
              placeholder="Enter escalation clause details"
              value={data.escalationClause}
              onChange={(e) => onChange({ escalationClause: e.target.value })}
            />
          </div>
        )}

        {/* Additional Details */}
        <div className="form-group">
          <label htmlFor="additionalDetails" className="form-label text-lg">
            Additional Details
          </label>
          <textarea
            id="additionalDetails"
            rows={4}
            className="form-input text-base"
            placeholder="Enter additional details and special conditions"
            value={data.additionalDetails}
            onChange={(e) => onChange({ additionalDetails: e.target.value })}
          />
        </div>

        {/* Explanatory Note for Additional Details */}
        <ExplanatoryNote
          label="Additional Details"
          checked={data.hasAdditionalExplanatoryNote || false}
          onCheckedChange={(checked) => onChange({ hasAdditionalExplanatoryNote: checked })}
          value={data.additionalExplanatoryNote || ''}
          onValueChange={(value) => onChange({ additionalExplanatoryNote: value })}
          placeholder="Add any additional information about terms and conditions..."
        />

        {/* Divisibility */}
        <div className="form-group">
          <label htmlFor="divisibility" className="form-label text-lg">
            Divisibility
          </label>
          <select
            id="divisibility"
            className="form-input h-12 text-base"
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
            <h4 className="text-md font-medium text-gray-900 mb-4">Divisibility</h4>
            
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
          
          {data.evaluationMethodology === 'least cash outflow' ? (
            /* least cash outflow - Show calculated EMD */
            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-lg font-semibold text-yellow-900">
                  EMD: {calculatedValues.emdAmount === 0 ? 'Nil' : formatCurrency(calculatedValues.emdAmount, 'Lacs')}
                </p>
              </div>
              <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="text-blue-600">ℹ️</div>
                  <p className="text-blue-800 font-medium">Lot-wise EMD Table</p>
                </div>
                <p className="text-blue-700 text-sm">
                  To view the lot-wise EMD table, please switch to <strong>"Lot-wise"</strong> evaluation methodology in the Preamble tab.
                </p>
                <p className="text-blue-600 text-xs mt-2">
                  Current methodology: <strong>{data.evaluationMethodology || 'least cash outflow'}</strong>
                </p>
              </div>
            </div>
          ) : (
            /* Lot-wise - Show actual EMD calculations */
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <svg className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <h5 className="text-md font-semibold text-emerald-900">Lot-wise EMD</h5>
              </div>
              
              {data.lots && data.lots.length > 0 ? (
                <div className="space-y-4">
                  {/* EMD Table */}
                  <div className="bg-white/80 rounded-lg border border-emerald-200 overflow-hidden">
                    <div className="grid grid-cols-3 gap-2 p-4 bg-gradient-to-r from-emerald-100 to-green-100 font-semibold text-emerald-900 text-sm">
                      <div className="col-span-1">Lot</div>
                      <div className="col-span-1">CEC Estimate</div>
                      <div className="col-span-1">EMD Amount</div>
                    </div>

                    {/* Table Rows */}
                    {data.lots.map((lot) => {
                      // Ensure tender type is properly set - if undefined, show warning
                      const tenderType = data.tenderType || 'Goods';
                      if (!data.tenderType) {
                        console.warn('Tender type is undefined! Defaulting to Goods');
                      }
                      const lotEMD = calculateEMD(lot.cecEstimateInclGst || 0, tenderType);
                      
                      // Debug the CEC value display
                      const cecDisplayValue = lot.cecEstimateInclGst || 0;
                      
                      return (
                        <div key={lot.id} className="grid grid-cols-3 gap-2 p-3 border-t border-emerald-100 hover:bg-emerald-50/50 transition-colors duration-200">
                          {/* Lot Number */}
                          <div className="col-span-1">
                            <div className="font-medium text-emerald-900 text-sm">
                              {lot.lotNumber}
                            </div>
                          </div>

                          {/* CEC Estimate */}
                          <div className="col-span-1">
                            <div className="text-sm text-emerald-700">
                              ₹{cecDisplayValue > 0 ? Math.round(cecDisplayValue * 10) / 10 : '0.0'}Cr
                            </div>
                          </div>

                          {/* EMD Amount */}
                          <div className="col-span-1">
                            <div className="text-sm h-8 w-full px-3 py-1 bg-yellow-50 border border-yellow-200 rounded flex items-center text-yellow-700 font-medium">
                              {lotEMD === 0 ? 'Nil' : `Rs. ${Math.round(lotEMD * 10) / 10} Lacs`}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Summary Row */}
                    <div className="grid grid-cols-3 gap-2 p-3 bg-gradient-to-r from-emerald-100 to-green-100 border-t-2 border-emerald-300 font-bold text-emerald-900 text-sm">
                      <div className="col-span-1">TOTAL</div>
                      <div className="col-span-1">
                        {(() => {
                          const totalCEC = data.lots.reduce((total, lot) => total + (lot.cecEstimateInclGst || 0), 0);
                          return totalCEC > 0 ? `₹${Math.round(totalCEC * 10) / 10}Cr` : '₹0.0Cr';
                        })()}
                      </div>
                      <div className="col-span-1">
                        {(() => {
                          const totalEMD = data.lots.reduce((total, lot) => total + calculateEMD(lot.cecEstimateInclGst || 0, data.tenderType || 'Goods'), 0);
                          return totalEMD === 0 ? 'Nil' : `Rs. ${Math.round(totalEMD * 10) / 10} Lacs`;
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-white/60 rounded-lg border border-emerald-100">
                  <div className="text-4xl mb-4">📋</div>
                  <p className="text-emerald-700 font-medium mb-2">No lots added yet</p>
                  <p className="text-emerald-600 text-sm">Add lots in the Preamble tab to view EMD calculations</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Explanatory Note for EMD */}
        <ExplanatoryNote
          label="EMD"
          checked={data.hasEMDExplanatoryNote || false}
          onCheckedChange={(checked) => onChange({ hasEMDExplanatoryNote: checked })}
          value={data.emdExplanatoryNote || ''}
          onValueChange={(value) => onChange({ emdExplanatoryNote: value })}
          placeholder="Add any additional information about EMD requirements..."
        />

        {/* Performance Security */}
        <div>
          <div className="flex items-center space-x-3 mb-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.hasPerformanceSecurity || false}
                onChange={(e) => onChange({ hasPerformanceSecurity: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-900">
                Performance Security (any variance from ITB)
              </span>
            </label>
          </div>
          
          {data.hasPerformanceSecurity && (
            <div className="space-y-3">
              <textarea
                id="performanceSecurity"
                rows={4}
                className="form-input text-base"
                placeholder="Enter performance security details (any variance from ITB)"
                value={data.performanceSecurity || ''}
                onChange={(e) => onChange({ performanceSecurity: e.target.value })}
              />
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
