import type { BQCData } from '@/types';
import { GROUP_OPTIONS, TENDER_TYPES, PLATFORM_OPTIONS, EVALUATION_METHODOLOGY_OPTIONS } from '@/utils/constants';
import { Tooltip } from '../Tooltip';
import { LotWiseTable } from '../LotWiseTable';

interface PreambleSectionProps {
  data: BQCData;
  onChange: (updates: Partial<BQCData>) => void;
}

export function PreambleSection({ data, onChange }: PreambleSectionProps) {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">1. PREAMBLE</h2>
        <p className="text-gray-600 font-medium">Basic tender information and procurement details</p>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h3 className="text-xl font-semibold text-gray-900">Tender Information</h3>
          <p className="text-gray-600 mt-1">Enter the basic details for your BQC document</p>
        </div>
        <div className="card-body space-y-8">
        {/* Reference Number */}
        <div className="form-group">
          <label htmlFor="refNumber" className="form-label text-lg">
            Reference Number *
          </label>
          <input
            type="text"
            id="refNumber"
            className="form-input h-12 text-base"
            placeholder="Enter reference number (e.g., TENDER/2024/001)"
            value={data.refNumber}
            onChange={(e) => onChange({ refNumber: e.target.value })}
          />
        </div>

        {/* Subject */}
        <div className="form-group">
          <label htmlFor="subject" className="form-label text-lg">
            Subject *
          </label>
          <textarea
            id="subject"
            rows={4}
            className="form-input text-base"
            placeholder="Enter detailed subject description"
            value={data.subject || ''}
            onChange={(e) => onChange({ subject: e.target.value })}
          />
        </div>

        {/* Procurement Group */}
        <div className="form-group">
          <label htmlFor="groupName" className="form-label text-lg">
            Procurement Group *
          </label>
          <select
            id="groupName"
            className="form-input h-12 text-base"
            value={data.groupName.split(' - ')[0]}
            onChange={(e) => {
              const selectedGroup = GROUP_OPTIONS.find(g => g.key === e.target.value);
              if (selectedGroup) {
                onChange({ groupName: `${selectedGroup.key} - ${selectedGroup.value}` });
              }
            }}
          >
            {GROUP_OPTIONS.map((group) => (
              <option key={group.key} value={group.key}>
                {group.key} - {group.value}
              </option>
            ))}
          </select>
        </div>

        {/* Tender Description */}
        <div className="form-group">
          <label htmlFor="tenderDescription" className="form-label text-lg">
            Tender Description *
          </label>
          <textarea
            id="tenderDescription"
            rows={3}
            className="form-input text-base"
            placeholder="Provide a comprehensive description of the tender"
            value={data.tenderDescription}
            onChange={(e) => onChange({ tenderDescription: e.target.value })}
          />
        </div>

        {/* PR Reference */}
        <div className="form-group">
          <label htmlFor="prReference" className="form-label text-lg">
            PR Reference *
          </label>
          <input
            type="text"
            id="prReference"
            className="form-input h-12 text-base"
            placeholder="Enter PR reference number"
            value={data.prReference}
            onChange={(e) => onChange({ prReference: e.target.value })}
          />
        </div>

        {/* Tender Type */}
        <div className="form-group">
          <label htmlFor="tenderType" className="form-label text-lg">
            Type of Tender *
          </label>
          <select
            id="tenderType"
            className="form-input h-12 text-base"
            value={data.tenderType}
            onChange={(e) => onChange({ tenderType: e.target.value as BQCData['tenderType'] })}
          >
            {TENDER_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Evaluation Methodology */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <h4 className="text-md font-semibold text-purple-900">Evaluation Method</h4>
            <Tooltip content="Choose evaluation method" position="right" />
          </div>
          
          <div className="form-group">
            <label htmlFor="evaluationMethodology" className="form-label text-purple-800">
              Methodology *
            </label>
            <select
              id="evaluationMethodology"
              className="form-input border-purple-200 focus:border-purple-500 focus:ring-purple-200"
              value={data.evaluationMethodology || 'least cash outflow'}
              onChange={(e) => {
                const selectedMethod = e.target.value as BQCData['evaluationMethodology'];
                onChange({ evaluationMethodology: selectedMethod });
              }}
            >
              {EVALUATION_METHODOLOGY_OPTIONS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-purple-600">
              {(data.evaluationMethodology || 'least cash outflow') === 'least cash outflow' 
                ? 'Single CEC estimate for entire tender'
                : 'Separate CEC estimates for individual lots'
              }
            </p>
          </div>
        </div>

        {/* CEC Estimates - Conditional Rendering */}
        {data.evaluationMethodology === 'least cash outflow' ? (
          /* least cash outflow - Single CEC Estimates */
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <h4 className="text-md font-semibold text-emerald-900">CEC Estimates (least cash outflow)</h4>
              <Tooltip content="Contract Estimate Committee approved estimates for entire tender" position="right" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label htmlFor="cecEstimateInclGst" className="form-label text-emerald-800">
                  CEC Estimate (incl. GST) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="cecEstimateInclGst"
                    className="form-input pr-16 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-200"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={data.cecEstimateInclGst || ''}
                    onChange={(e) => onChange({ cecEstimateInclGst: parseFloat(e.target.value) || 0 })}
                  />
                  <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-sm font-medium text-emerald-600">
                    ₹ Crore
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="cecEstimateExclGst" className="form-label text-emerald-800">
                  CEC Estimate (excl. GST) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="cecEstimateExclGst"
                    className="form-input pr-16 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-200"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    value={data.cecEstimateExclGst || ''}
                    onChange={(e) => onChange({ cecEstimateExclGst: parseFloat(e.target.value) || 0 })}
                  />
                  <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-sm font-medium text-emerald-600">
                    ₹ Crore
                  </span>
                </div>
              </div>
            </div>
            
            {/* GST Calculation Display */}
            {data.cecEstimateInclGst && data.cecEstimateExclGst && (
              <div className="mt-4 p-3 bg-white/60 rounded-lg border border-emerald-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-700 font-medium">GST Amount:</span>
                  <span className="text-emerald-900 font-semibold">
                    ₹ {(data.cecEstimateInclGst - data.cecEstimateExclGst).toFixed(2)} Crore
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Lot-wise - Table Format */
          <LotWiseTable 
            lots={data.lots || []}
            onLotsChange={(lots) => onChange({ lots })}
            tenderType={data.tenderType}
          />
        )}

        {/* Enhanced CEC Date */}
        <div className="form-group">
          <label htmlFor="cecDate" className="form-label flex items-center space-x-2">
            <span>CEC Date *</span>
            <Tooltip content="Date when Contract Estimate Committee approved the estimates" position="right" />
          </label>
          <input
            type="date"
            id="cecDate"
            className="form-input"
            value={data.cecDate}
            onChange={(e) => onChange({ cecDate: e.target.value })}
          />
        </div>

        {/* Budget Details */}
        <div>
          <label htmlFor="budgetDetails" className="form-label">
            Budget Details *
          </label>
          <input
            type="text"
            id="budgetDetails"
            className="form-input"
            placeholder="WBS/Revex"
            value={data.budgetDetails}
            onChange={(e) => onChange({ budgetDetails: e.target.value })}
          />
        </div>

        {/* Tender Platform */}
        <div>
          <label htmlFor="tenderPlatform" className="form-label">
            Tender Platform *
          </label>
          <select
            id="tenderPlatform"
            className="form-input"
            value={data.tenderPlatform}
            onChange={(e) => onChange({ tenderPlatform: e.target.value as BQCData['tenderPlatform'] })}
          >
            {PLATFORM_OPTIONS.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
        </div>

      </div>
      </div>
    </div>
  );
}
