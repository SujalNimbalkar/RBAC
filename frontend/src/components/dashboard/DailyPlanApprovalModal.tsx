import React, { useState, useEffect } from 'react';
import { buildApiUrl } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import './DailyPlanApprovalModal.css';

interface ProductionEntry {
  id: string;
  deptName: string;
  operatorName: string;
  work: string;
  h1Plan: number;
  h2Plan: number;
  otPlan: number;
  target: number;
}

interface DailyProductionPlan {
  id: string;
  title: string;
  dayNumber: number;
  date: Date;
  weekNumber: number;
  month: number;
  year: number;
  status: 'pending' | 'inProgress' | 'completed' | 'rejected';
  assignedTo: string;
  assignedRole: string;
  weeklyPlanId: string;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  entries: ProductionEntry[];
}

interface DailyPlanApprovalModalProps {
  plan: DailyProductionPlan | null;
  isOpen: boolean;
  onClose: () => void;
  onApproval: (approved: boolean, reason?: string) => void;
}

const DailyPlanApprovalModal: React.FC<DailyPlanApprovalModalProps> = ({
  plan,
  isOpen,
  onClose,
  onApproval
}) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${buildApiUrl('/api/production/daily')}/${plan?.id}/approve?_t=${Date.now()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        onApproval(true);
        onClose();
      } else {
        setError(data.error || 'Failed to approve plan');
      }
    } catch (err) {
      console.error('Error approving plan:', err);
      setError(err instanceof Error ? err.message : 'Failed to approve plan');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Rejection reason is required');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${buildApiUrl('/api/production/daily')}/${plan?.id}/reject?_t=${Date.now()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ reason: rejectionReason })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        onApproval(false, rejectionReason);
        onClose();
      } else {
        setError(data.error || 'Failed to reject plan');
      }
    } catch (err) {
      console.error('Error rejecting plan:', err);
      setError(err instanceof Error ? err.message : 'Failed to reject plan');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  if (!isOpen || !plan) return null;

  return (
    <div className="approval-modal-overlay" onClick={onClose}>
      <div className="approval-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="approval-modal-header">
          <div>
            <h2>{plan.title}</h2>
            <div className="status-badge in-progress">⏳ IN PROGRESS</div>
          </div>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        
        <div className="approval-modal-body">
          {error && <div className="error-message">{error}</div>}
          
          <div className="plan-details">
            <div className="detail-row">
              <span className="label">Date:</span>
              <span className="value">{formatDate(plan.date)}</span>
            </div>
            <div className="detail-row">
              <span className="label">Week:</span>
              <span className="value">Week {plan.weekNumber}</span>
            </div>
            <div className="detail-row">
              <span className="label">Day:</span>
              <span className="value">Day {plan.dayNumber}</span>
            </div>
            <div className="detail-row">
              <span className="label">Submitted:</span>
              <span className="value">{plan.submittedAt ? formatDate(plan.submittedAt) : 'Not submitted'}</span>
            </div>
          </div>

          <div className="entries-section">
            <h3>Production Entries</h3>
            <div className="table-container">
              <table className="approval-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Operator</th>
                    <th>Work</th>
                    <th>H1 Plan</th>
                    <th>H2 Plan</th>
                    <th>OT Plan</th>
                    <th>Target</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.entries.map((entry, index) => (
                    <tr key={entry.id || index}>
                      <td>{entry.deptName}</td>
                      <td>{entry.operatorName}</td>
                      <td>{entry.work}</td>
                      <td>{entry.h1Plan}</td>
                      <td>{entry.h2Plan}</td>
                      <td>{entry.otPlan}</td>
                      <td>{entry.target}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {showRejectionForm && (
            <div className="rejection-form">
              <h3>Rejection Reason</h3>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                rows={3}
                required
              />
            </div>
          )}
        </div>
        
        <div className="approval-modal-footer">
          <button onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          
          {!showRejectionForm ? (
            <>
              <button 
                onClick={() => setShowRejectionForm(true)}
                className="reject-btn"
                disabled={loading}
              >
                Reject Plan
              </button>
              <button 
                onClick={handleApprove}
                className="approve-btn"
                disabled={loading}
              >
                {loading ? 'Approving...' : 'Approve Plan'}
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setShowRejectionForm(false)}
                className="cancel-btn"
                disabled={loading}
              >
                Cancel Rejection
              </button>
              <button 
                onClick={handleReject}
                className="reject-btn"
                disabled={loading}
              >
                {loading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyPlanApprovalModal; 