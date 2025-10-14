import { useState } from 'react';
import type { LotData } from '@/types';
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

interface LotWiseTableProps {
  lots: LotData[];
  onLotsChange: (lots: LotData[]) => void;
}

export function LotWiseTable({ lots, onLotsChange }: LotWiseTableProps) {
  const [editingLot, setEditingLot] = useState<string | null>(null);

  const addNewLot = () => {
    const newLot: LotData = {
      id: `lot-${Date.now()}`,
      lotNumber: `Lot ${lots.length + 1}`,
      description: '',
      cecEstimateInclGst: 0,
      cecEstimateExclGst: 0,
      contractPeriodMonths: 12,
      hasAmc: false,
      amcValue: 0,
      amcPeriod: '',
      mseRelaxation: false,
      quantitySupplied: 0,
    };
    onLotsChange([...lots, newLot]);
    setEditingLot(newLot.id);
  };

  const updateLot = (lotId: string, updates: Partial<LotData>) => {
    const updatedLots = lots.map(lot => 
      lot.id === lotId ? { ...lot, ...updates } : lot
    );
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

  const getPastPerformance = (lot: LotData) => {
    // Past Performance calculation: 30% of Quantity Supplied
    // MSE: 15% relaxation (30% - 15% = 25.5% of Quantity Supplied)
    const basePercentage = 0.30;
    const quantitySupplied = lot.quantitySupplied || 0;
    
    if (lot.mseRelaxation) {
      // Apply 15% relaxation: 30% * (1 - 0.15) = 25.5%
      return Math.round(quantitySupplied * basePercentage * (1 - 0.15));
    } else {
      // Standard 30% of Quantity Supplied
      return Math.round(quantitySupplied * basePercentage);
    }
  };

  const getEMDAmount = (lot: LotData) => {
    // EMD calculation based on the provided table - returns values in Lakhs
    const cecValue = lot.cecEstimateInclGst || 0;
    
    // Note: This assumes tenderType is available in lot data or uses a default
    // For now, we'll use Service logic as it's the most comprehensive
    if (cecValue >= 0.5 && cecValue <= 1.0) {
      return 1; // Services/Works: 1 Lakh
    } else if (cecValue > 1.0 && cecValue <= 5.0) {
      return 2.5; // 2.5 Lakhs
    } else if (cecValue > 5.0 && cecValue <= 10.0) {
      return 5; // 5 Lakhs
    } else if (cecValue > 10.0 && cecValue <= 15.0) {
      return 7.5; // 7.5 Lakhs
    } else if (cecValue > 15.0 && cecValue <= 25.0) {
      return 10; // 10 Lakhs
    } else if (cecValue > 25.0) {
      return 20; // 20 Lakhs
    }
    return 0; // For values < 0.5 Cr
  };

  const getTurnoverRequirement = (lot: LotData) => {
    // 30% of (CEC including GST - AMC)
    const baseAmount = lot.cecEstimateInclGst - (lot.hasAmc ? lot.amcValue : 0);
    return baseAmount * 0.3;
  };


  const getTotalPastPerformance = () => {
    return lots.reduce((total, lot) => total + getPastPerformance(lot), 0);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">📊</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900">Lot-wise CEC Estimates</h3>
            <p className="text-sm text-blue-700">Manage individual lot estimates and contract periods</p>
          </div>
        </div>
        
        <button
          onClick={addNewLot}
          className="btn-primary flex items-center space-x-2 text-sm"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Lot</span>
        </button>
      </div>

      {lots.length === 0 ? (
        <div className="text-center py-12 bg-white/60 rounded-lg border border-blue-100">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-blue-700 font-medium mb-2">No lots added yet</p>
          <p className="text-blue-600 text-sm mb-4">Add lots to manage CEC estimates separately</p>
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
          <div className="bg-white/80 rounded-lg border border-blue-200 overflow-hidden">
            <div className="grid grid-cols-14 gap-2 p-4 bg-gradient-to-r from-blue-100 to-indigo-100 font-semibold text-blue-900 text-xs">
              <div className="col-span-1">Lot</div>
              <div className="col-span-2">Description</div>
              <div className="col-span-1">CEC (Incl.)</div>
              <div className="col-span-1">CEC (Excl.)</div>
              <div className="col-span-1">Months</div>
              <div className="col-span-1">AMC</div>
              <div className="col-span-1">MSE</div>
              <div className="col-span-1">Past Perf.</div>
              <div className="col-span-1">Qty. Supplied</div>
              <div className="col-span-1">EMD</div>
              <div className="col-span-1">Turnover</div>
              <div className="col-span-2">Actions</div>
            </div>

            {/* Table Rows */}
            {lots.map((lot) => (
              <div key={lot.id} className="grid grid-cols-14 gap-2 p-3 border-t border-blue-100 hover:bg-blue-50/50 transition-colors duration-200">
                {/* Lot Number */}
                <div className="col-span-1">
                  {editingLot === lot.id ? (
                    <input
                      type="text"
                      value={lot.lotNumber}
                      onChange={(e) => updateLot(lot.id, { lotNumber: e.target.value })}
                      onBlur={() => setEditingLot(null)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditingLot(null)}
                      className="form-input text-xs h-7 border-blue-200 focus:border-blue-500"
                      autoFocus
                      aria-label={`Lot number for ${lot.lotNumber}`}
                      title={`Lot number for ${lot.lotNumber}`}
                    />
                  ) : (
                    <div 
                      className="font-medium text-blue-900 cursor-pointer hover:text-blue-700 text-xs"
                      onClick={() => setEditingLot(lot.id)}
                    >
                      {lot.lotNumber}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <input
                    type="text"
                    value={lot.description}
                    onChange={(e) => updateLot(lot.id, { description: e.target.value })}
                    placeholder="Description"
                    className="form-input text-xs h-7 w-full border-blue-200 focus:border-blue-500"
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
                    placeholder="0"
                    step="0.01"
                    min="0"
                    className="form-input text-xs h-7 w-full border-blue-200 focus:border-blue-500"
                    aria-label={`CEC including GST for ${lot.lotNumber}`}
                    title={`CEC including GST for ${lot.lotNumber}`}
                  />
                </div>

                {/* CEC Excl GST */}
                <div className="col-span-1">
                  <input
                    type="number"
                    value={lot.cecEstimateExclGst || ''}
                    onChange={(e) => updateLot(lot.id, { cecEstimateExclGst: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    step="0.01"
                    min="0"
                    className="form-input text-xs h-7 w-full border-blue-200 focus:border-blue-500"
                    aria-label={`CEC excluding GST for ${lot.lotNumber}`}
                    title={`CEC excluding GST for ${lot.lotNumber}`}
                  />
                </div>

                {/* Contract Months */}
                <div className="col-span-1">
                  <input
                    type="number"
                    value={lot.contractPeriodMonths || ''}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      updateLot(lot.id, { contractPeriodMonths: value });
                    }}
                    placeholder="12"
                    step="1"
                    min="1"
                    max="240"
                    className={`form-input text-xs h-7 w-full ${
                      (lot.contractPeriodMonths || 0) < 1 
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200' 
                        : 'border-blue-200 focus:border-blue-500'
                    }`}
                    title={
                      (lot.contractPeriodMonths || 0) < 1 
                        ? 'Contract period must be at least 1 month' 
                        : `Contract period for ${lot.lotNumber} (annualization only applies for periods &gt; 12 months)`
                    }
                  />
                  {(lot.contractPeriodMonths || 0) < 1 && (
                    <div className="absolute z-10 mt-1 text-xs text-red-600 font-medium">
                      Min: 1 month
                    </div>
                  )}
                </div>

                {/* AMC */}
                <div className="col-span-1">
                  <div className="flex flex-col space-y-1">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={lot.hasAmc}
                        onChange={(e) => updateLot(lot.id, { hasAmc: e.target.checked })}
                        className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        aria-label={`Enable AMC for ${lot.lotNumber}`}
                        title={`Enable AMC for ${lot.lotNumber}`}
                      />
                      <span className="ml-1 text-xs text-blue-700">AMC</span>
                    </label>
                    {lot.hasAmc && (
                      <input
                        type="number"
                        value={lot.amcValue || ''}
                        onChange={(e) => updateLot(lot.id, { amcValue: parseFloat(e.target.value) || 0 })}
                        placeholder="AMC Value"
                        step="0.01"
                        min="0"
                        className="form-input text-xs h-6 w-full border-blue-200 focus:border-blue-500"
                        aria-label={`AMC value for ${lot.lotNumber}`}
                        title={`AMC value for ${lot.lotNumber}`}
                      />
                    )}
                  </div>
                </div>

                {/* MSE Relaxation */}
                <div className="col-span-1">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={lot.mseRelaxation || false}
                      onChange={(e) => updateLot(lot.id, { mseRelaxation: e.target.checked })}
                      className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      aria-label={`MSE relaxation for ${lot.lotNumber}`}
                      title={`Apply MSE relaxation (15%) for ${lot.lotNumber}`}
                    />
                  </div>
                </div>

                {/* Past Performance */}
                <div className="col-span-1">
                  <div className="text-xs font-semibold text-blue-900 bg-blue-100 rounded px-1 py-1 text-center">
                    {getPastPerformance(lot).toLocaleString()} Units
                  </div>
                  {lot.mseRelaxation && (
                    <div className="text-xs text-green-600 font-medium text-center mt-0.5">
                      MSE -15%
                    </div>
                  )}
                </div>

                {/* Quantity Supplied */}
                <div className="col-span-1">
                  <input
                    type="number"
                    value={lot.quantitySupplied || ''}
                    onChange={(e) => updateLot(lot.id, { quantitySupplied: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    step="1"
                    min="0"
                    className="form-input text-xs h-7 w-full border-blue-200 focus:border-blue-500"
                    aria-label={`Quantity supplied for ${lot.lotNumber}`}
                    title={`Quantity supplied for ${lot.lotNumber}`}
                  />
                </div>

                {/* EMD */}
                <div className="col-span-1">
                  <div className="text-xs font-semibold text-emerald-900 bg-emerald-100 rounded px-1 py-1 text-center">
                    ₹{getEMDAmount(lot).toFixed(1)}L
                  </div>
                </div>

                {/* Turnover Requirement */}
                <div className="col-span-1">
                  <div className="text-xs font-semibold text-purple-900 bg-purple-100 rounded px-1 py-1 text-center">
                    ₹{getTurnoverRequirement(lot).toFixed(1)}Cr
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center space-x-1">
                  <button
                    onClick={() => setEditingLot(lot.id)}
                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors duration-200"
                    title="Edit lot"
                  >
                    <PencilIcon className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => deleteLot(lot.id)}
                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors duration-200"
                    title="Delete lot"
                  >
                    <TrashIcon className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}

            {/* Summary Row */}
            <div className="grid grid-cols-14 gap-2 p-3 bg-gradient-to-r from-blue-100 to-indigo-100 border-t-2 border-blue-300 font-bold text-blue-900 text-xs">
              <div className="col-span-3">TOTACrS</div>
              <div className="col-span-1">₹{getTotalCECInclGst().toFixed(1)}Cr</div>
              <div className="col-span-1">₹{getTotalCECExclGst().toFixed(1)}Cr</div>
              <div className="col-span-1">-</div>
              <div className="col-span-1">-</div>
              <div className="col-span-1">-</div>
              <div className="col-span-1">₹{getTotalPastPerformance().toFixed(1)}Cr</div>
              <div className="col-span-1">₹{lots.reduce((total, lot) => total + (lot.quantitySupplied || 0), 0).toFixed(1)}Cr</div>
              <div className="col-span-1">-</div>
              <div className="col-span-1">-</div>
              <div className="col-span-2">-</div>
            </div>
          </div>

          {/* GST Summary */}
          <div className="bg-white/60 rounded-lg border border-blue-100 p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total GST Amount</p>
                <p className="text-lg font-bold text-blue-900">
                  ₹{(getTotalCECInclGst() - getTotalCECExclGst()).toFixed(2)}Cr
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Lots</p>
                <p className="text-lg font-bold text-blue-900">{lots.length}</p>
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Avg. Contract Period</p>
                <p className="text-lg font-bold text-blue-900">
                  {lots.length > 0 ? (lots.reduce((sum, lot) => sum + (lot.contractPeriodMonths || 0), 0) / lots.length).toFixed(1) : 0} months
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
