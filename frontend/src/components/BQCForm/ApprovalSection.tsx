import type { BQCData } from '@/types';

interface ApprovalSectionProps {
  data: BQCData;
  onChange: (updates: Partial<BQCData>) => void;
}

export function ApprovalSection({ data, onChange }: ApprovalSectionProps) {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">5. APPROVAL & AUTHORIZATION</h2>
        <p className="text-gray-600 font-medium">Document approval hierarchy and authorization details</p>
      </div>
      
      <div className="card">
        <div className="card-header">
          <h3 className="text-xl font-semibold text-gray-900">Approval Details</h3>
          <p className="text-gray-600 mt-1">Enter the names and designations of approving authorities</p>
        </div>
        <div className="card-body space-y-8">
        {/* Proposed By */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Proposed By</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label htmlFor="proposedBy" className="form-label text-lg">
                Name *
              </label>
              <input
                type="text"
                id="proposedBy"
                className="form-input h-12 text-base"
                placeholder="Enter full name"
                value={data.proposedBy}
                onChange={(e) => onChange({ proposedBy: e.target.value })}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="proposedByDesignation" className="form-label text-lg">
                Designation *
              </label>
              <input
                type="text"
                id="proposedByDesignation"
                className="form-input h-12 text-base"
                placeholder="Enter designation"
                value={data.proposedByDesignation}
                onChange={(e) => onChange({ proposedByDesignation: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Recommended By */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Recommended By</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label htmlFor="recommendedBy" className="form-label text-lg">
                Name
              </label>
              <input
                type="text"
                id="recommendedBy"
                className="form-input h-12 text-base"
                placeholder="Enter full name"
                value={data.recommendedBy}
                onChange={(e) => onChange({ recommendedBy: e.target.value })}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="recommendedByDesignation" className="form-label text-lg">
                Designation
              </label>
              <input
                type="text"
                id="recommendedByDesignation"
                className="form-input h-12 text-base"
                placeholder="Enter designation"
                value={data.recommendedByDesignation}
                onChange={(e) => onChange({ recommendedByDesignation: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Concurred By */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Concurred By</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label htmlFor="concurredBy" className="form-label text-lg">
                Name
              </label>
              <input
                type="text"
                id="concurredBy"
                className="form-input h-12 text-base"
                placeholder="Enter full name"
                value={data.concurredBy}
                onChange={(e) => onChange({ concurredBy: e.target.value })}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="concurredByDesignation" className="form-label text-lg">
                Designation
              </label>
              <input
                type="text"
                id="concurredByDesignation"
                className="form-input h-12 text-base"
                placeholder="Enter designation"
                value={data.concurredByDesignation}
                onChange={(e) => onChange({ concurredByDesignation: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Approved By */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Approved By</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label htmlFor="approvedBy" className="form-label text-lg">
                Name *
              </label>
              <input
                type="text"
                id="approvedBy"
                className="form-input h-12 text-base"
                placeholder="Enter full name"
                value={data.approvedBy}
                onChange={(e) => onChange({ approvedBy: e.target.value })}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="approvedByDesignation" className="form-label text-lg">
                Designation *
              </label>
              <input
                type="text"
                id="approvedByDesignation"
                className="form-input h-12 text-base"
                placeholder="Enter designation"
                value={data.approvedByDesignation}
                onChange={(e) => onChange({ approvedByDesignation: e.target.value })}
              />
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
