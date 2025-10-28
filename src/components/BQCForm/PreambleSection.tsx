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

        {/* CEC Estimates - Always show LotWiseTable for AMC management */}
        <LotWiseTable 
          lots={data.lots || []}
          onLotsChange={(lots) => onChange({ lots })}
          tenderType={data.tenderType}
          evaluationMethodology={data.evaluationMethodology}
          globalCECInclGst={data.cecEstimateInclGst}
          globalCECExclGst={data.cecEstimateExclGst}
          onGlobalCECChange={(updates) => onChange(updates)}
        />

        {/* Proven Track Record Requirements - Only show for Lot-wise methodology */}
        {data.evaluationMethodology === 'Lot-wise' && data.lots && data.lots.length > 0 && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">📋</span>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-green-900">3.1.1 PROVEN TRACK RECORD</h4>
                <p className="text-sm text-green-700">Similar works requirements based on lot-wise CEC estimates</p>
              </div>
            </div>

            <div className="bg-white/60 rounded-lg border border-green-100 p-4 mb-4">
              <p className="text-sm text-green-800 mb-3">
                <strong>The bidder shall have experience of having successfully executed similar works in the last Seven (7) years in any Oil & Gas Industry in India.</strong> The Value (Rs) of the similar work/s executed (proof of execution to be submitted) should be as follows:
              </p>
              <p className="text-sm text-green-700 italic">
                Note: Bidder can quote for any one or more than one LOT based on their capability/choice. If the Bidder quotes for more than one LOT, the similar works criteria should not be less than the cumulative amount applicable for the LOTs quoted.
              </p>
            </div>

            {/* Lot-wise Requirements Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-green-200">
                <thead className="bg-green-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">
                      Lot No.
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-green-800 uppercase tracking-wider">
                      CEC Estimate (Incl. GST)
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-green-800 uppercase tracking-wider">
                      Contract Period
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-green-800 uppercase tracking-wider">
                      Annualized Value
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-green-800 uppercase tracking-wider">
                      Option A (80%)
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-green-800 uppercase tracking-wider">
                      Option B (50%)
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-green-800 uppercase tracking-wider">
                      Option C (40%)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-green-200">
                  {data.lots.map((lot, index) => {
                    const cecInclGst = lot.cecEstimateInclGst || 0;
                    const contractMonths = lot.contractPeriodMonths || 12;
                    const contractYears = contractMonths / 12;
                    const annualizedValue = contractYears > 1 ? cecInclGst / contractYears : cecInclGst;
                    const finalAmount = lot.mseRelaxation ? annualizedValue * 0.85 : annualizedValue;
                    const finalAmountInLakhs = finalAmount * 100; // Convert to Lakhs

                    return (
                      <tr key={lot.id} className="hover:bg-green-50">
                        <td className="px-4 py-3 text-sm font-medium text-green-900">
                          {lot.lotNumber}
                        </td>
                        <td className="px-4 py-3 text-sm text-green-700">
                          {lot.description || 'No description'}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-green-700">
                          ₹ {cecInclGst.toFixed(2)} Crore
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-green-700">
                          {lot.contractPeriodText || `${contractMonths} months`}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-green-700">
                          ₹ {annualizedValue.toFixed(2)} Crore
                        </td>
                        <td className="px-4 py-3 text-sm text-center font-medium text-blue-700">
                          ₹ {(finalAmountInLakhs * 0.8).toFixed(2)} Lakhs
                        </td>
                        <td className="px-4 py-3 text-sm text-center font-medium text-blue-700">
                          ₹ {(finalAmountInLakhs * 0.5).toFixed(2)} Lakhs
                        </td>
                        <td className="px-4 py-3 text-sm text-center font-medium text-blue-700">
                          ₹ {(finalAmountInLakhs * 0.4).toFixed(2)} Lakhs
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* Cumulative Requirements Row */}
                {data.lots.length > 1 && (
                  <tfoot className="bg-green-100">
                    <tr className="font-bold text-green-900">
                      <td className="px-4 py-3 text-sm" colSpan={5}>
                        Cumulative Requirements (All Lots)
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-blue-800">
                        ₹ {data.lots.reduce((sum, lot) => {
                          const cecInclGst = lot.cecEstimateInclGst || 0;
                          const contractMonths = lot.contractPeriodMonths || 12;
                          const contractYears = contractMonths / 12;
                          const annualizedValue = contractYears > 1 ? cecInclGst / contractYears : cecInclGst;
                          const finalAmount = lot.mseRelaxation ? annualizedValue * 0.85 : annualizedValue;
                          const finalAmountInLakhs = finalAmount * 100;
                          return sum + (finalAmountInLakhs * 0.8);
                        }, 0).toFixed(2)} Lakhs
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-blue-800">
                        ₹ {data.lots.reduce((sum, lot) => {
                          const cecInclGst = lot.cecEstimateInclGst || 0;
                          const contractMonths = lot.contractPeriodMonths || 12;
                          const contractYears = contractMonths / 12;
                          const annualizedValue = contractYears > 1 ? cecInclGst / contractYears : cecInclGst;
                          const finalAmount = lot.mseRelaxation ? annualizedValue * 0.85 : annualizedValue;
                          const finalAmountInLakhs = finalAmount * 100;
                          return sum + (finalAmountInLakhs * 0.5);
                        }, 0).toFixed(2)} Lakhs
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-blue-800">
                        ₹ {data.lots.reduce((sum, lot) => {
                          const cecInclGst = lot.cecEstimateInclGst || 0;
                          const contractMonths = lot.contractPeriodMonths || 12;
                          const contractYears = contractMonths / 12;
                          const annualizedValue = contractYears > 1 ? cecInclGst / contractYears : cecInclGst;
                          const finalAmount = lot.mseRelaxation ? annualizedValue * 0.85 : annualizedValue;
                          const finalAmountInLakhs = finalAmount * 100;
                          return sum + (finalAmountInLakhs * 0.4);
                        }, 0).toFixed(2)} Lakhs
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* Legend */}
            <div className="mt-4 p-3 bg-white/60 rounded-lg border border-green-100">
              <h5 className="text-sm font-semibold text-green-800 mb-2">Similar Works Options:</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-green-700">
                <div>
                  <span className="font-medium text-blue-700">Option A:</span> One similar work of 80% value
                </div>
                <div>
                  <span className="font-medium text-blue-700">Option B:</span> Two similar works each of 50% value
                </div>
                <div>
                  <span className="font-medium text-blue-700">Option C:</span> Three similar works each of 40% value
                </div>
              </div>
            </div>
          </div>
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
