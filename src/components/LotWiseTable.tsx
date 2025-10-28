import { useState, useEffect } from 'react';
import type { LotData } from '@/types';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface LotWiseTableProps {
  lots: LotData[];
  onLotsChange: (lots: LotData[]) => void;
  tenderType?: 'Goods' | 'Service' | 'Works';
  evaluationMethodology?: 'least cash outflow' | 'Lot-wise';
  globalCECInclGst?: number;
  globalCECExclGst?: number;
  onGlobalCECChange?: (updates: { cecEstimateInclGst?: number; cecEstimateExclGst?: number }) => void;
}

// Helper function to parse contract period text and extract months
const parseContractPeriod = (text: string): number => {
  const numericMatch = text.match(/(\d+)/);
  if (!numericMatch) return 12; // Default to 12 months
  
  let months = parseInt(numericMatch[1]);
  
  // Handle years conversion
  if (text.toLowerCase().includes('year')) {
    months = months * 12;
  }
  
  return months;
};


export function LotWiseTable({ 
  lots, 
  onLotsChange, 
  tenderType = 'Goods',
  evaluationMethodology = 'Lot-wise',
  globalCECInclGst = 0,
  globalCECExclGst = 0,
  onGlobalCECChange
}: LotWiseTableProps) {
  const [editingLot, setEditingLot] = useState<string | null>(null);

  // Ensure all lots have calculated values when component mounts or lots change
  useEffect(() => {
    const needsUpdate = lots.some(lot => 
      lot.cecEstimateInclGst > 0 && 
      (!lot.similarWorksOptionA || !lot.similarWorksOptionB || !lot.similarWorksOptionC)
    );
    
    if (needsUpdate) {
      const updatedLots = lots.map(lot => {
        if (lot.cecEstimateInclGst > 0 && (!lot.similarWorksOptionA || !lot.similarWorksOptionB || !lot.similarWorksOptionC)) {
          const baseAmount = lot.cecEstimateInclGst || 0;
          
          // Parse contract period from text or use numeric value
          let contractMonths = lot.contractPeriodMonths || 12;
          if (lot.contractPeriodText) {
            const numericMatch = lot.contractPeriodText.match(/(\d+)/);
            if (numericMatch) {
              contractMonths = parseInt(numericMatch[1]);
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
          const finalAmountInLakhs = finalAmount * 100;
          
          // Calculate similar works options
          const updatedLot = {
            ...lot,
            similarWorksOptionA: finalAmountInLakhs * 0.8, // 80% - One similar work
            similarWorksOptionB: finalAmountInLakhs * 0.5, // 50% - Two similar works each
            similarWorksOptionC: finalAmountInLakhs * 0.4  // 40% - Three similar works each
          };
          
          return updatedLot;
        }
        return lot;
      });
      
      onLotsChange(updatedLots);
    }
  }, [lots, onLotsChange]);

  const addNewLot = () => {
    const newLot: LotData = {
      id: `lot-${Date.now()}`,
      lotNumber: `Lot ${lots.length + 1}`,
      description: '',
      cecEstimateInclGst: 0,
      cecEstimateExclGst: 0,
      contractPeriodMonths: 12,
      contractPeriodText: '12 months',
      quantitySupplied: 0,
      mseRelaxation: false,
      hasAmc: false,
      amcValue: 0,
      amcPeriod: 'AS per tender terms and conditions',
    };
    onLotsChange([...lots, newLot]);
    setEditingLot(newLot.id);
  };

  const updateLot = (lotId: string, updates: Partial<LotData>) => {
    const updatedLots = lots.map(lot => {
      if (lot.id === lotId) {
        const updatedLot = { ...lot, ...updates };
        
        // Calculate and store similar works options when CEC values change
        if (updates.cecEstimateInclGst !== undefined || updates.contractPeriodText !== undefined || updates.mseRelaxation !== undefined) {
          const baseAmount = updatedLot.cecEstimateInclGst || 0;
          
          // Parse contract period from text or use numeric value
          let contractMonths = updatedLot.contractPeriodMonths || 12;
          if (updatedLot.contractPeriodText) {
            const numericMatch = updatedLot.contractPeriodText.match(/(\d+)/);
            if (numericMatch) {
              contractMonths = parseInt(numericMatch[1]);
              // Handle years conversion
              if (updatedLot.contractPeriodText.toLowerCase().includes('year')) {
                contractMonths = contractMonths * 12;
              }
            }
          }
          
          const contractYears = contractMonths / 12;
          const annualizedAmount = contractYears > 1 ? baseAmount / contractYears : baseAmount;
          const finalAmount = updatedLot.mseRelaxation ? annualizedAmount * 0.85 : annualizedAmount;
          
          // Convert to Lakhs for display (1 Crore = 100 Lakhs)
          const finalAmountInLakhs = finalAmount * 100;
          
          // Calculate similar works options
          updatedLot.similarWorksOptionA = finalAmountInLakhs * 0.8; // 80% - One similar work
          updatedLot.similarWorksOptionB = finalAmountInLakhs * 0.5; // 50% - Two similar works each
          updatedLot.similarWorksOptionC = finalAmountInLakhs * 0.4; // 40% - Three similar works each
        }
        
        return updatedLot;
      }
      return lot;
    });
    onLotsChange(updatedLots);
  };

  const deleteLot = (lotId: string) => {
    const updatedLots = lots.filter(lot => lot.id !== lotId);
    onLotsChange(updatedLots);
  };

  const getTotalCECInclGst = () => {
    return lots.reduce((total, lot) => total + (lot.cecEstimateInclGst || 0), 0);
  };

  const getTotalCECExclGst = () => {
    return lots.reduce((total, lot) => total + (lot.cecEstimateExclGst || 0), 0);
  };

  const getTotalGSTAmount = () => {
    return lots.reduce((total, lot) => total + ((lot.cecEstimateInclGst || 0) - (lot.cecEstimateExclGst || 0)), 0);
  };


  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
      {/* Warning message for empty CEC values */}
      {evaluationMethodology === 'Lot-wise' && lots.length > 0 && lots.every(lot => (lot.cecEstimateInclGst || 0) === 0) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="text-red-600">⚠️</div>
            <p className="text-red-700 text-sm">
              Enter CEC estimates for at least one lot to generate the document.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">📊</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900">
              {evaluationMethodology === 'least cash outflow' ? 'CEC Estimates & AMC Management' : 'Lot-wise CEC Estimates'}
            </h3>
            <p className="text-sm text-blue-700">
              {evaluationMethodology === 'least cash outflow' 
                ? 'Manage global CEC estimates and lot-wise AMC requirements'
                : 'Manage individual lot estimates and contract periods'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={addNewLot}
            className="btn-primary flex items-center space-x-2 text-sm"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Lot</span>
          </button>
          
        </div>
      </div>

      {/* Global CEC Fields for least cash outflow */}
      {evaluationMethodology === 'least cash outflow' && (
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <h4 className="text-md font-semibold text-emerald-900">Global CEC Estimates</h4>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded">least cash outflow</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label text-emerald-800">
                CEC Estimate (incl. GST) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  className="form-input pr-16 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-200"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={globalCECInclGst || ''}
                  onChange={(e) => onGlobalCECChange?.({ cecEstimateInclGst: parseFloat(e.target.value) || 0 })}
                />
                <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-sm font-medium text-emerald-600">
                  ₹ Crore
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label text-emerald-800">
                CEC Estimate (excl. GST) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  className="form-input pr-16 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-200"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={globalCECExclGst || ''}
                  onChange={(e) => onGlobalCECChange?.({ cecEstimateExclGst: parseFloat(e.target.value) || 0 })}
                />
                <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-sm font-medium text-emerald-600">
                  ₹ Crore
                </span>
              </div>
            </div>
          </div>
          
          {/* GST Calculation Display */}
          {globalCECInclGst && globalCECExclGst && (
            <div className="mt-4 p-3 bg-white/60 rounded-lg border border-emerald-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-emerald-700 font-medium">GST Amount:</span>
                <span className="text-emerald-900 font-semibold">
                  ₹ {Math.round((globalCECInclGst - globalCECExclGst) * 100) / 100} Crore
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AMC Management Section - Only show for Lot-wise methodology */}
      {evaluationMethodology === 'Lot-wise' && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <div className="h-6 w-6 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">🔧</span>
            </div>
            <div>
              <h4 className="text-md font-semibold text-amber-900">AMC/CAMC Management</h4>
              <p className="text-sm text-amber-700">Configure AMC requirements for each lot</p>
            </div>
          </div>

          {lots.length === 0 ? (
            <div className="text-center py-12 bg-white/60 rounded-lg border border-amber-100">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-amber-700 font-medium mb-2">No lots added yet</p>
              <p className="text-amber-600 text-sm mb-4">Add lots to manage AMC requirements</p>
              <button
                onClick={addNewLot}
                className="btn-primary text-sm"
              >
                Add First Lot
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Table Header */}
              <div className="bg-white/80 rounded-lg border border-amber-200 overflow-hidden">
                <div className={`grid gap-2 p-4 bg-gradient-to-r from-amber-100 to-orange-100 font-semibold text-amber-900 text-xs ${tenderType === 'Goods' ? 'grid-cols-[repeat(13,minmax(0,1fr))]' : 'grid-cols-10'}`}>
                  <div className="col-span-1">Lot</div>
                  <div className="col-span-1">Description</div>
                  <div className="col-span-1">CEC (Incl.)</div>
                  <div className="col-span-1">CEC (Excl.)</div>
                  <div className="col-span-1">GST Amount</div>
                  {tenderType === 'Goods' && (
                    <>
                      <div className="col-span-1">Quantity</div>
                      <div className="col-span-1">30% Calc</div>
                      <div className="col-span-1">MSE (15%)</div>
                    </>
                  )}
                  <div className="col-span-1">Contract Period</div>
                  <div className="col-span-1">Has AMC</div>
                  <div className="col-span-1">AMC Value</div>
                  <div className="col-span-1">AMC Period</div>
                  <div className="col-span-1">Actions</div>
                </div>
              </div>

              {/* Table Rows */}
              {lots.map((lot) => (
                <div key={lot.id} className={`grid gap-2 p-3 border-t border-amber-100 hover:bg-amber-50/50 transition-colors duration-200 ${tenderType === 'Goods' ? 'grid-cols-[repeat(13,minmax(0,1fr))]' : 'grid-cols-10'}`}>
                  {/* Lot Number */}
                  <div className="col-span-1">
                    {editingLot === lot.id ? (
                      <input
                        type="text"
                        value={lot.lotNumber}
                        onChange={(e) => updateLot(lot.id, { lotNumber: e.target.value })}
                        onBlur={() => setEditingLot(null)}
                        onKeyDown={(e) => e.key === 'Enter' && setEditingLot(null)}
                        className="form-input text-xs h-7 border-amber-200 focus:border-amber-500"
                        autoFocus
                        aria-label={`Lot number for ${lot.lotNumber}`}
                        title={`Lot number for ${lot.lotNumber}`}
                      />
                    ) : (
                      <div 
                        className="font-medium text-amber-900 cursor-pointer hover:text-amber-700 text-xs"
                        onClick={() => setEditingLot(lot.id)}
                      >
                        {lot.lotNumber}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="col-span-1">
                    <input
                      type="text"
                      value={lot.description}
                      onChange={(e) => updateLot(lot.id, { description: e.target.value })}
                      placeholder="Description"
                      className="form-input text-xs h-7 w-full border-amber-200 focus:border-amber-500"
                      aria-label={`Description for ${lot.lotNumber}`}
                      title={`Description for ${lot.lotNumber}`}
                    />
                  </div>

                  {/* CEC Incl GST */}
                  <div className="col-span-1">
                    <input
                      type="number"
                      value={lot.cecEstimateInclGst || ''}
                      onChange={(e) => updateLot(lot.id, { cecEstimateInclGst: parseFloat(e.target.value) || 0 })}
                      placeholder="Enter CEC (Cr)"
                      step="0.01"
                      min="0"
                      className={`form-input text-xs h-7 w-full border-amber-200 focus:border-amber-500 ${!lot.cecEstimateInclGst || lot.cecEstimateInclGst === 0 ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}
                      aria-label={`CEC including GST for ${lot.lotNumber}`}
                      title={`CEC including GST for ${lot.lotNumber} - Required for document generation`}
                    />
                    {(!lot.cecEstimateInclGst || lot.cecEstimateInclGst === 0) && (
                      <div className="text-xs text-red-600 mt-1">Required</div>
                    )}
                    {(lot.cecEstimateInclGst && lot.cecEstimateInclGst > 0) && (
                      <div className="text-xs text-green-600 mt-1">✅ {lot.cecEstimateInclGst} Cr</div>
                    )}
                  </div>

                  {/* CEC Excl GST */}
                  <div className="col-span-1">
                    <input
                      type="number"
                      value={lot.cecEstimateExclGst || ''}
                      onChange={(e) => updateLot(lot.id, { cecEstimateExclGst: parseFloat(e.target.value) || 0 })}
                      placeholder="Enter CEC (Cr)"
                      step="0.01"
                      min="0"
                      className={`form-input text-xs h-7 w-full border-amber-200 focus:border-amber-500 ${!lot.cecEstimateExclGst || lot.cecEstimateExclGst === 0 ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}
                      aria-label={`CEC excluding GST for ${lot.lotNumber}`}
                      title={`CEC excluding GST for ${lot.lotNumber} - Required for document generation`}
                    />
                    {(!lot.cecEstimateExclGst || lot.cecEstimateExclGst === 0) && (
                      <div className="text-xs text-red-600 mt-1">Required</div>
                    )}
                    {(lot.cecEstimateExclGst && lot.cecEstimateExclGst > 0) && (
                      <div className="text-xs text-green-600 mt-1">✅ {lot.cecEstimateExclGst} Cr</div>
                    )}
                  </div>

                  {/* GST Amount - Read Only */}
                  <div className="col-span-1">
                    <div className="text-xs h-7 w-full px-3 py-1 bg-gray-50 border border-gray-200 rounded flex items-center text-gray-700">
                      ₹{Math.round(((lot.cecEstimateInclGst || 0) - (lot.cecEstimateExclGst || 0)) * 10) / 10}Cr
                    </div>
                  </div>

                  {/* Quantity Field - For Goods only */}
                  {tenderType === 'Goods' && (
                    <div className="col-span-1">
                      <input
                        type="number"
                        value={lot.quantitySupplied || ''}
                        onChange={(e) => updateLot(lot.id, { quantitySupplied: parseFloat(e.target.value) || 0 })}
                        placeholder="Enter quantity"
                        step="1"
                        min="0"
                        className="form-input text-xs h-7 w-full border-amber-200 focus:border-amber-500"
                        title={`Quantity to be supplied for ${lot.lotNumber}`}
                      />
                    </div>
                  )}

                  {/* 30% Calculation - For Goods */}
                  {tenderType === 'Goods' && (
                    <div className="col-span-1">
                      <div className={`text-xs h-7 w-full px-3 py-1 border rounded flex items-center font-medium ${
                        lot.mseRelaxation 
                          ? 'bg-green-50 border-green-200 text-green-700' 
                          : 'bg-blue-50 border-blue-200 text-blue-700'
                      }`}>
                        {lot.mseRelaxation 
                          ? Math.round((lot.quantitySupplied || 0) * 0.15) // 15% for MSE
                          : Math.round((lot.quantitySupplied || 0) * 0.3)    // 30% for Non-MSE
                        }
                      </div>
                    </div>
                  )}

                  {/* MSE Checkbox - For Goods */}
                  {tenderType === 'Goods' && (
                    <div className="col-span-1 flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={lot.mseRelaxation || false}
                        onChange={(e) => updateLot(lot.id, { mseRelaxation: e.target.checked })}
                        className="h-4 w-4 text-green-600 border-green-300 rounded focus:ring-green-500"
                        title={`Enable MSE relaxation for ${lot.lotNumber}`}
                      />
                    </div>
                  )}

                  {/* Contract Period - Text Input */}
                  <div className="col-span-1">
                    <input
                      type="text"
                      value={lot.contractPeriodText || ''}
                      onChange={(e) => {
                        const textValue = e.target.value;
                        updateLot(lot.id, { 
                          contractPeriodText: textValue,
                          contractPeriodMonths: parseContractPeriod(textValue)
                        });
                      }}
                      placeholder="e.g., 12 months, 2 years, 18 months"
                      className="form-input text-xs h-7 w-full border-amber-200 focus:border-amber-500"
                      title={`Contract period for ${lot.lotNumber} (e.g., "12 months", "2 years", "18 months")`}
                    />
                  </div>

                  {/* Has AMC - Checkbox */}
                  <div className="col-span-1 flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={lot.hasAmc || false}
                      onChange={(e) => updateLot(lot.id, { hasAmc: e.target.checked })}
                      className="h-4 w-4 text-amber-600 border-amber-300 rounded focus:ring-amber-500"
                      title={`Enable AMC for ${lot.lotNumber}`}
                    />
                  </div>

                  {/* AMC Value */}
                  <div className="col-span-1">
                    <input
                      type="number"
                      value={lot.amcValue || ''}
                      onChange={(e) => updateLot(lot.id, { amcValue: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      step="0.01"
                      min="0"
                      disabled={!lot.hasAmc}
                      className={`form-input text-xs h-7 w-full border-amber-200 focus:border-amber-500 ${!lot.hasAmc ? 'bg-gray-100 text-gray-400' : ''}`}
                      title={`AMC value for ${lot.lotNumber} in ₹ Crore`}
                    />
                  </div>

                  {/* AMC Period */}
                  <div className="col-span-1">
                    <input
                      type="text"
                      value={lot.amcPeriod || ''}
                      onChange={(e) => updateLot(lot.id, { amcPeriod: e.target.value })}
                      placeholder="AMC period"
                      disabled={!lot.hasAmc}
                      className={`form-input text-xs h-7 w-full border-amber-200 focus:border-amber-500 ${!lot.hasAmc ? 'bg-gray-100 text-gray-400' : ''}`}
                      title={`AMC period for ${lot.lotNumber}`}
                    />
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex items-center justify-center">
                    <button
                      onClick={() => deleteLot(lot.id)}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors duration-200"
                      title="Delete lot"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Summary Row */}
              <div className={`grid gap-2 p-3 bg-gradient-to-r from-amber-100 to-orange-100 border-t-2 border-amber-300 font-bold text-amber-900 text-xs ${tenderType === 'Goods' ? 'grid-cols-[repeat(13,minmax(0,1fr))]' : 'grid-cols-10'}`}>
                <div className="col-span-1">TOTALS</div>
                <div className="col-span-1">-</div>
                <div className="col-span-1">₹{Math.round(getTotalCECInclGst() * 10) / 10}Cr</div>
                <div className="col-span-1">₹{Math.round(getTotalCECExclGst() * 10) / 10}Cr</div>
                <div className="col-span-1">₹{Math.round(getTotalGSTAmount() * 10) / 10}Cr</div>
                {tenderType === 'Goods' && (
                  <>
                    <div className="col-span-1">{lots.reduce((total, lot) => total + (lot.quantitySupplied || 0), 0)}</div>
                    <div className="col-span-1">
                      {Math.round(lots.reduce((total, lot) => {
                        const quantity = lot.quantitySupplied || 0;
                        return total + (lot.mseRelaxation ? quantity * 0.15 : quantity * 0.3);
                      }, 0))}
                    </div>
                    <div className="col-span-1">{lots.filter(lot => lot.mseRelaxation).length}</div>
                  </>
                )}
                <div className="col-span-1">-</div>
                <div className="col-span-1">{lots.filter(lot => lot.hasAmc).length}</div>
                <div className="col-span-1">₹{Math.round(lots.reduce((total, lot) => total + (lot.amcValue || 0), 0) * 10 / 10)}Cr</div>
                <div className="col-span-1">-</div>
                <div className="col-span-1">-</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
