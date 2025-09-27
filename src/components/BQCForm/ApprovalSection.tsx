import React from 'react';
import type { BQCData } from '@/types';

interface ApprovalSectionProps {
  data: BQCData;
  onChange: (updates: Partial<BQCData>) => void;
}

export function ApprovalSection({ data, onChange }: ApprovalSectionProps) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-medium text-gray-900">Approval</h3>
      </div>
      <div className="card-body space-y-6">
        {/* Proposed By */}
        <div>
          <label htmlFor="proposedBy" className="form-label">
            Proposed By
          </label>
          <input
            type="text"
            id="proposedBy"
            className="form-input"
            placeholder="Enter the name of the person proposing this BQC"
            value={data.proposedBy}
            onChange={(e) => onChange({ proposedBy: e.target.value })}
          />
        </div>

        {/* Recommended By */}
        <div>
          <label htmlFor="recommendedBy" className="form-label">
            Recommended By
          </label>
          <input
            type="text"
            id="recommendedBy"
            className="form-input"
            placeholder="Enter the name of the person recommending this BQC"
            value={data.recommendedBy}
            onChange={(e) => onChange({ recommendedBy: e.target.value })}
          />
        </div>

        {/* Concurred By */}
        <div>
          <label htmlFor="concurredBy" className="form-label">
            Concurred By
          </label>
          <input
            type="text"
            id="concurredBy"
            className="form-input"
            placeholder="Enter the name of the person concurring this BQC"
            value={data.concurredBy}
            onChange={(e) => onChange({ concurredBy: e.target.value })}
          />
        </div>

        {/* Approved By */}
        <div>
          <label htmlFor="approvedBy" className="form-label">
            Approved By
          </label>
          <input
            type="text"
            id="approvedBy"
            className="form-input"
            placeholder="Enter the name of the person approving this BQC"
            value={data.approvedBy}
            onChange={(e) => onChange({ approvedBy: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
