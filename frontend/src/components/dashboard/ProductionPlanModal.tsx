import React, { useState, useEffect } from 'react';
import { buildApiUrl } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';
import './ProductionPlanModal.css';
import DailyPlanApprovalModal from './DailyPlanApprovalModal';
import { canApproveDailyPlans } from '../../utils/roleUtils';

interface ProductionTask {
  id: string;
  type: 'monthly' | 'weekly' | 'daily' | 'report';
  title: string;
  status: 'pending' | 'inProgress' | 'completed' | 'rejected';
  assignedTo: string;
  assignedRole: string;
  planId: string;
  deadline: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductionItem {
  itemCode: string;
  itemName: string;
  customerName: string;
  monthlyQuantity: number;
  weeklyQuantities?: Record<string, number>;
}

interface ProductionEntry {
  deptName: string;
  operatorName: string;
  work: string;
  h1Plan: number;
  h2Plan: number;
  otPlan: number;
  target: number;
}

interface MonthlyPlanSubmission {
  month: number;
  year: number;
  items: ProductionItem[];
}

interface WeeklyPlanSubmission {
  weekNumber: number;
  weekStartDate: string;
  weekEndDate: string;
  items: Omit<ProductionItem, 'id'>[];
}

interface DailyPlanSubmission {
  dayNumber: number;
  date: string;
  entries: Omit<ProductionEntry, 'id'>[];
}



interface ProductionPlanModalProps {
  task: ProductionTask | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const ProductionPlanModal: React.FC<ProductionPlanModalProps> = ({
  task,
  isOpen,
  onClose,
  onSubmit
}) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [planData, setPlanData] = useState<any>(null);
  const [dailyPlanData, setDailyPlanData] = useState<any>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

  // Fetch daily plan data for reports
  useEffect(() => {
    const fetchDailyPlanData = async () => {
      if (!task?.planId || task.type !== 'report') return;
      
      try {
        setLoadingPlan(true);
        
        // For reports, we need to first fetch the report to get the dailyPlanId
        console.log('Fetching daily report to get dailyPlanId...');
        let response = await fetch(`${buildApiUrl('/api/production/reports')}/${task.planId}?_t=${Date.now()}`, {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });

        if (response.ok) {
          const reportData = await response.json();
          if (reportData.success && reportData.data.dailyPlanId) {
            console.log('Found dailyPlanId:', reportData.data.dailyPlanId);
            
            // Now fetch the actual daily plan using the dailyPlanId
            const planResponse = await fetch(`${buildApiUrl('/api/production/daily')}/${reportData.data.dailyPlanId}?_t=${Date.now()}`, {
              headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
              }
            });

            if (planResponse.ok) {
              const planData = await planResponse.json();
              if (planData.success) {
                // Merge daily plan data with report data
                const mergedData = {
                  ...planData.data,
                  entries: planData.data.entries?.map((planEntry: any, index: number) => {
                    const reportEntry = reportData.data.entries?.[index] || {};
                    return {
                      ...planEntry,
                      h1Actual: reportEntry.h1Actual || 0,
                      h2Actual: reportEntry.h2Actual || 0,
                      otActual: reportEntry.otActual || 0,
                      actualProduction: reportEntry.actualProduction || 0,
                      qualityDefects: reportEntry.qualityDefect || 0,
                      reason: reportEntry.reason || '',
                      correctiveActions: reportEntry.correctiveActions || '',
                      responsiblePerson: reportEntry.responsiblePerson || '',
                      targetCompletionDate: reportEntry.targetCompletionDate || ''
                    };
                  }) || []
                };

                setDailyPlanData(mergedData);
                
                // Initialize form data with merged data
                setFormData({
                  entries: mergedData.entries?.map((entry: any) => {
                    const h1Actual = entry.h1Actual || 0;
                    const h2Actual = entry.h2Actual || 0;
                    const otActual = entry.otActual || 0;
                    const actualProduction = h1Actual + h2Actual + otActual;
                    
                    return {
                      h1Actual: h1Actual,
                      h2Actual: h2Actual,
                      otActual: otActual,
                      actualProduction: actualProduction,
                      qualityDefects: entry.qualityDefects || 0,
                      reason: entry.reason || '',
                      correctiveActions: entry.correctiveActions || '',
                      responsiblePerson: entry.responsiblePerson || '',
                      targetCompletionDate: entry.targetCompletionDate || ''
                    };
                  }) || [],
                  notes: reportData.data.notes || ''
                });
              }
            } else {
              console.error('Failed to fetch daily plan data:', planResponse.status);
            }
          } else {
            console.error('No dailyPlanId found in report data');
            return;
          }
        } else {
          console.error('Failed to fetch daily report:', response.status);
          return;
        }
      } catch (err) {
        console.error('Error fetching daily plan data:', err);
      } finally {
        setLoadingPlan(false);
      }
    };

    fetchDailyPlanData();
  }, [task?.planId, task?.type]);

  useEffect(() => {
    if (task && isOpen) {
      // Initialize form data based on task type
      initializeFormData();
    }
  }, [task, isOpen]);

  const initializeFormData = async () => {
    if (!task) return;

    try {
      setLoading(true);
      setError(null);

      switch (task.type) {
        case 'monthly':
          // Fetch existing monthly plan data if available
          try {
            const response = await fetch(`${buildApiUrl('/api/production/monthly')}/${task.planId}?_t=${Date.now()}`, {
              headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
              }
            });

            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data) {
                setFormData({
                  month: data.data.month,
                  year: data.data.year,
                  items: data.data.items || [{ itemCode: '', itemName: '', customerName: '', monthlyQuantity: 0 }]
                });
              } else {
                setFormData({
                  month: new Date().getMonth() + 1,
                  year: new Date().getFullYear(),
                  items: [{ itemCode: '', itemName: '', customerName: '', monthlyQuantity: 0 }]
                });
              }
            } else {
              setFormData({
                month: new Date().getMonth() + 1,
                year: new Date().getFullYear(),
                items: [{ itemCode: '', itemName: '', customerName: '', monthlyQuantity: 0 }]
              });
            }
          } catch (err) {
            console.error('Error fetching monthly plan data:', err);
            setFormData({
              month: new Date().getMonth() + 1,
              year: new Date().getFullYear(),
              items: [{ itemCode: '', itemName: '', customerName: '', monthlyQuantity: 0 }]
            });
          }
          break;
        case 'weekly':
          // Fetch existing weekly plan data if available
          try {
            const response = await fetch(`${buildApiUrl('/api/production/weekly')}/${task.planId}?_t=${Date.now()}`, {
              headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
              }
            });

            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data) {
                setFormData({
                  weekNumber: data.data.weekNumber,
                  weekStartDate: data.data.weekStartDate,
                  weekEndDate: data.data.weekEndDate,
                  items: data.data.items || [{ itemCode: '', itemName: '', customerName: '', monthlyQuantity: 0, weeklyQuantities: {} }]
                });
              } else {
                setFormData({
                  weekNumber: 1,
                  weekStartDate: '',
                  weekEndDate: '',
                  items: [{ itemCode: '', itemName: '', customerName: '', monthlyQuantity: 0, weeklyQuantities: {} }]
                });
              }
            } else {
              setFormData({
                weekNumber: 1,
                weekStartDate: '',
                weekEndDate: '',
                items: [{ itemCode: '', itemName: '', customerName: '', monthlyQuantity: 0, weeklyQuantities: {} }]
              });
            }
          } catch (err) {
            console.error('Error fetching weekly plan data:', err);
            setFormData({
              weekNumber: 1,
              weekStartDate: '',
              weekEndDate: '',
              items: [{ itemCode: '', itemName: '', customerName: '', monthlyQuantity: 0, weeklyQuantities: {} }]
            });
          }
          break;
        case 'daily':
          // Fetch existing daily plan data if available
          try {
            const response = await fetch(`${buildApiUrl('/api/production/daily')}/${task.planId}?_t=${Date.now()}`, {
              headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
              }
            });

            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data) {
                const entries = data.data.entries || [{ deptName: '', operatorName: '', work: '', h1Plan: 0, h2Plan: 0, otPlan: 0, target: 0 }];
                // Calculate target for each entry
                const calculatedEntries = entries.map((entry: any) => ({
                  ...entry,
                  target: (entry.h1Plan || 0) + (entry.h2Plan || 0) + (entry.otPlan || 0)
                }));
                setFormData({
                  dayNumber: data.data.dayNumber,
                  date: data.data.date,
                  entries: calculatedEntries
                });
              } else {
                // Fallback to empty form if no data found
                setFormData({
                  date: new Date().toISOString().split('T')[0],
                  entries: [{ deptName: '', operatorName: '', work: '', h1Plan: 0, h2Plan: 0, otPlan: 0, target: 0 }]
                });
              }
            } else {
              // Fallback to empty form if fetch fails
              setFormData({
                date: new Date().toISOString().split('T')[0],
                entries: [{ deptName: '', operatorName: '', work: '', h1Plan: 0, h2Plan: 0, otPlan: 0, target: 0 }]
              });
            }
          } catch (err) {
            console.error('Error fetching daily plan data:', err);
            // Fallback to empty form
            setFormData({
              date: new Date().toISOString().split('T')[0],
              entries: [{ deptName: '', operatorName: '', work: '', h1Plan: 0, h2Plan: 0, otPlan: 0, target: 0 }]
            });
          }
          break;
        case 'report':
          // For reports, we'll initialize with empty entries that will be populated from daily plan data
          setFormData({
            entries: [],
            notes: ''
          });
          break;
        default:
          setFormData({});
      }
    } catch (err) {
      console.error('Error initializing form data:', err);
      setError('Failed to initialize form data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (task?.status === 'completed') return; // Prevent changes to completed plans
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: string, index: number, value: any) => {
    if (task?.status === 'completed') return; // Prevent changes to completed plans
    setFormData((prev: any) => ({
      ...prev,
      [field]: (prev[field] || []).map((item: any, i: number) => 
        i === index ? { ...item, ...value } : item
      )
    }));
  };

  const addItem = () => {
    if (task?.status === 'completed') return; // Prevent changes to completed plans
    setFormData((prev: any) => ({
      ...prev,
      items: [...(prev.items || []), {
        itemCode: '',
        itemName: '',
        customerName: '',
        monthlyQuantity: 0,
        weeklyQuantities: task?.type === 'weekly' ? { 'week1-7': 0 } : undefined
      }]
    }));
  };

  const removeItem = (index: number) => {
    if (task?.status === 'completed') return; // Prevent changes to completed plans
    setFormData((prev: any) => ({
      ...prev,
      items: (prev.items || []).filter((_: any, i: number) => i !== index)
    }));
  };



  // Check if user can approve daily plans
  const canApprove = () => {
    return canApproveDailyPlans(currentUser?.email || undefined, currentUser?.uid || undefined);
  };

  const handleViewForApproval = async () => {
    if (!task) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${buildApiUrl('/api/production/daily')}/${task.planId}?_t=${Date.now()}`, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPlanData(data.data);
          setShowApprovalModal(true);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
    } catch (err) {
      console.error('Error fetching plan data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load plan data for approval');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = (approved: boolean, reason?: string) => {
    // Refresh the task list after approval/rejection
    onSubmit({ approved, reason });
    setShowApprovalModal(false);
    setPlanData(null);
    
    // Show success message
    if (approved) {
      alert('Daily plan approved successfully! Daily production report task has been created.');
    } else {
      alert(`Daily plan rejected. Reason: ${reason}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let endpoint = '';
      let submitData = {};

      switch (task?.type) {
        case 'monthly':
          endpoint = `/api/production/monthly/${task.planId}/submit`;
          submitData = formData;
          break;
        case 'weekly':
          endpoint = `/api/production/weekly/${task.planId}/submit`;
          // Remove id field from items to match backend expectation
          submitData = {
            weekNumber: formData.weekNumber,
            weekStartDate: formData.weekStartDate,
            weekEndDate: formData.weekEndDate,
            items: formData.items?.map((item: any) => ({
              itemCode: item.itemCode,
              itemName: item.itemName,
              customerName: item.customerName,
              monthlyQuantity: item.monthlyQuantity,
              weeklyQuantities: item.weeklyQuantities
            })) || []
          };
          break;
        case 'daily':
          endpoint = `/api/production/daily/${task.planId}/submit`;
          // Convert form data to match backend expectation
          submitData = {
            dayNumber: 1, // This should be calculated based on the date
            date: formData.date,
            entries: formData.entries || []
          };
          break;
        case 'report':
          endpoint = `/api/production/reports/${task.planId}/submit`;
          // For reports, we need to collect the actual production data
          submitData = {
            entries: formData.entries || [],
            notes: formData.notes || ''
          };
          
          // Validate action plan fields for entries with production < 85%
          if (formData.entries) {
            for (let i = 0; i < formData.entries.length; i++) {
              const entry = formData.entries[i];
              const dailyPlanEntry = dailyPlanData?.entries?.[i];
              
              if (dailyPlanEntry && entry.actualProduction && dailyPlanEntry.target) {
                const percentage = (entry.actualProduction / dailyPlanEntry.target) * 100;
                
                if (percentage < 85 && percentage > 0) {
                  // Check if action plan fields are filled
                  if (!entry.reason || entry.reason.trim() === '') {
                    throw new Error(`Reason for low production is mandatory for ${dailyPlanEntry.deptName} - ${dailyPlanEntry.operatorName} (Production: ${percentage.toFixed(1)}%)`);
                  }
                  if (!entry.correctiveActions || entry.correctiveActions.trim() === '') {
                    throw new Error(`Corrective actions are mandatory for ${dailyPlanEntry.deptName} - ${dailyPlanEntry.operatorName} (Production: ${percentage.toFixed(1)}%)`);
                  }
                  if (!entry.responsiblePerson || entry.responsiblePerson.trim() === '') {
                    throw new Error(`Responsible person is mandatory for ${dailyPlanEntry.deptName} - ${dailyPlanEntry.operatorName} (Production: ${percentage.toFixed(1)}%)`);
                  }
                  if (!entry.targetCompletionDate || entry.targetCompletionDate.trim() === '') {
                    throw new Error(`Target completion date is mandatory for ${dailyPlanEntry.deptName} - ${dailyPlanEntry.operatorName} (Production: ${percentage.toFixed(1)}%)`);
                  }
                }
              }
            }
          }
          break;
      }

      console.log('Submitting data:', JSON.stringify(submitData, null, 2));
      const response = await fetch(`${buildApiUrl(endpoint)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // If parsing fails, use the original error text
          if (errorText) {
            errorMessage = errorText;
          }
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (data.success) {
        onSubmit(data.data);
        onClose();
      } else {
        setError(data.error || 'Failed to submit plan');
      }
    } catch (err) {
      console.error('Error submitting plan:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit plan');
    } finally {
      setLoading(false);
    }
  };

  const renderMonthlyForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Month</label>
        <input
          type="number"
          min="1"
          max="12"
          value={formData.month || ''}
          onChange={(e) => handleInputChange('month', parseInt(e.target.value))}
          required
        />
      </div>
      
      <div className="form-group">
        <label>Year</label>
        <input
          type="number"
          min="2024"
          value={formData.year || ''}
          onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
          required
        />
      </div>

      <div className="form-section">
        <h3>Production Items</h3>
        {formData.items?.map((item: any, index: number) => (
          <div key={index} className="item-row">
            <input
              type="text"
              placeholder="Item Code"
              value={item.itemCode || ''}
              onChange={(e) => handleArrayChange('items', index, { itemCode: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Item Name"
              value={item.itemName || ''}
              onChange={(e) => handleArrayChange('items', index, { itemName: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Customer Name"
              value={item.customerName || ''}
              onChange={(e) => handleArrayChange('items', index, { customerName: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Monthly Quantity"
              value={item.monthlyQuantity || ''}
              onChange={(e) => handleArrayChange('items', index, { monthlyQuantity: parseInt(e.target.value) })}
              required
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="remove-btn"
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addItem} className="add-btn">
          + Add Item
        </button>
      </div>
    </form>
  );

  const renderWeeklyForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Week Number</label>
        <input
          type="number"
          min="1"
          max="52"
          value={formData.weekNumber || ''}
          onChange={(e) => handleInputChange('weekNumber', parseInt(e.target.value))}
          required
        />
      </div>
      
      <div className="form-group">
        <label>Week Start Date</label>
        <input
          type="date"
          value={formData.weekStartDate || ''}
          onChange={(e) => handleInputChange('weekStartDate', e.target.value)}
          required
        />
      </div>
      
      <div className="form-group">
        <label>Week End Date</label>
        <input
          type="date"
          value={formData.weekEndDate || ''}
          onChange={(e) => handleInputChange('weekEndDate', e.target.value)}
          required
        />
      </div>

      <div className="form-section">
        <h3>Weekly Production Items</h3>
        {formData.items?.map((item: any, index: number) => (
          <div key={index} className="item-row">
            <input
              type="text"
              placeholder="Item Code"
              value={item.itemCode || ''}
              onChange={(e) => handleArrayChange('items', index, { itemCode: e.target.value })}
              disabled={task?.status === 'completed'}
              required
            />
            <input
              type="text"
              placeholder="Item Name"
              value={item.itemName || ''}
              onChange={(e) => handleArrayChange('items', index, { itemName: e.target.value })}
              disabled={task?.status === 'completed'}
              required
            />
            <input
              type="text"
              placeholder="Customer Name"
              value={item.customerName || ''}
              onChange={(e) => handleArrayChange('items', index, { customerName: e.target.value })}
              disabled={task?.status === 'completed'}
              required
            />
            {task?.type === 'monthly' && (
              <input
                type="number"
                placeholder="Monthly Quantity"
                value={item.monthlyQuantity || ''}
                onChange={(e) => handleArrayChange('items', index, { monthlyQuantity: parseInt(e.target.value) || 0 })}
                required
              />
            )}
            {task?.type === 'weekly' && (
              <input
                type="number"
                placeholder="Weekly Quantity"
                value={(() => {
                  if (!item.weeklyQuantities || typeof item.weeklyQuantities !== 'object') return '';
                  const values = Object.values(item.weeklyQuantities);
                  return values.length > 0 ? String(values[0] || '') : '';
                })()}
                onChange={(e) => {
                  const weekKey = Object.keys(item.weeklyQuantities || {})[0] || 'week1-7';
                  handleArrayChange('items', index, { 
                    weeklyQuantities: { [weekKey]: parseInt(e.target.value) || 0 }
                  });
                }}
                disabled={task?.status === 'completed'}
                required
              />
            )}
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="remove-btn"
              disabled={task?.status === 'completed'}
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addItem} className="add-btn">
          + Add Item
        </button>
      </div>
    </form>
  );

  const addEntry = () => {
    if (task?.status === 'completed') return;
    setFormData((prev: any) => ({
      ...prev,
      entries: [...(prev.entries || []), {
        deptName: '',
        operatorName: '',
        work: '',
        h1Plan: 0,
        h2Plan: 0,
        otPlan: 0,
        target: 0 // Will be auto-calculated when values are entered
      }]
    }));
  };

  const removeEntry = (index: number) => {
    if (task?.status === 'completed') return;
    setFormData((prev: any) => ({
      ...prev,
      entries: (prev.entries || []).filter((_: any, i: number) => i !== index)
    }));
  };

  const handleEntryChange = (index: number, field: string, value: any) => {
    if (task?.status === 'completed') return;
    setFormData((prev: any) => ({
      ...prev,
      entries: (prev.entries || []).map((entry: any, i: number) => {
        if (i !== index) return entry;
        
        const updatedEntry = { ...entry, [field]: value };
        
        // Auto-calculate Target for daily plan (H1 Plan + H2 Plan + OT Plan)
        if (task?.type === 'daily' && ['h1Plan', 'h2Plan', 'otPlan'].includes(field)) {
          const h1Plan = field === 'h1Plan' ? value : (entry.h1Plan || 0);
          const h2Plan = field === 'h2Plan' ? value : (entry.h2Plan || 0);
          const otPlan = field === 'otPlan' ? value : (entry.otPlan || 0);
          updatedEntry.target = h1Plan + h2Plan + otPlan;
        }
        
        // Auto-calculate Actual Production for daily report (H1 Actual + H2 Actual + OT Actual)
        if (task?.type === 'report' && ['h1Actual', 'h2Actual', 'otActual'].includes(field)) {
          const h1Actual = field === 'h1Actual' ? value : (entry.h1Actual || 0);
          const h2Actual = field === 'h2Actual' ? value : (entry.h2Actual || 0);
          const otActual = field === 'otActual' ? value : (entry.otActual || 0);
          updatedEntry.actualProduction = h1Actual + h2Actual + otActual;
        }
        
        return updatedEntry;
      })
    }));
  };

  const renderDailyForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="form-section">
        <div className="section-header">
          <h3>Daily Production Plan</h3>
          <button type="button" onClick={addEntry} className="add-btn">+ Add Entry</button>
        </div>
        
        <div className="table-container">
          <table className="production-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Operator</th>
                <th>Work</th>
                <th>H1 Plan</th>
                <th>H2 Plan</th>
                <th>OT Plan</th>
                <th>Target (Auto)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {formData.entries?.map((entry: any, index: number) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      value={entry.deptName || ''}
                      onChange={(e) => handleEntryChange(index, 'deptName', e.target.value)}
                      placeholder="Department"
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={entry.operatorName || ''}
                      onChange={(e) => handleEntryChange(index, 'operatorName', e.target.value)}
                      placeholder="Operator"
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={entry.work || ''}
                      onChange={(e) => handleEntryChange(index, 'work', e.target.value)}
                      placeholder="Work Description"
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={entry.h1Plan || ''}
                      onChange={(e) => handleEntryChange(index, 'h1Plan', parseInt(e.target.value) || 0)}
                      placeholder="H1 Plan"
                      min="0"
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={entry.h2Plan || ''}
                      onChange={(e) => handleEntryChange(index, 'h2Plan', parseInt(e.target.value) || 0)}
                      placeholder="H2 Plan"
                      min="0"
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={entry.otPlan || ''}
                      onChange={(e) => handleEntryChange(index, 'otPlan', parseInt(e.target.value) || 0)}
                      placeholder="OT Plan"
                      min="0"
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={entry.target || 0}
                      placeholder="Auto-calculated"
                      min="0"
                      required
                      readOnly
                      className="readonly-input"
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => removeEntry(index)}
                      className="remove-btn"
                      disabled={formData.entries?.length === 1}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </form>
  );

  const renderReportForm = () => {
    if (loadingPlan) {
      return <div className="loading">Loading daily plan data...</div>;
    }

    if (!dailyPlanData) {
      return <div className="error-message">Failed to load daily plan data</div>;
    }

    return (
      <form onSubmit={handleSubmit}>
        <div className="report-form">
          <div className="form-section">
            <h3>Daily Production Report</h3>
            <p className="info-text">This report is based on the approved daily production plan.</p>
            
            <div className="plan-summary">
              <h4>Plan Summary</h4>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="label">Date:</span>
                  <span className="value">{new Date(dailyPlanData.date).toLocaleDateString()}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Week:</span>
                  <span className="value">Week {dailyPlanData.weekNumber}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Day:</span>
                  <span className="value">Day {dailyPlanData.dayNumber}</span>
                </div>
              </div>
            </div>

            <div className="entries-section">
              <h4>Production Entries</h4>
              <div className="table-container">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>Operator</th>
                      <th>Work</th>
                      <th>H1 Plan</th>
                      <th>H2 Plan</th>
                      <th>OT Plan</th>
                      <th>Target</th>
                      <th>H1 Actual</th>
                      <th>H2 Actual</th>
                      <th>OT Actual</th>
                      <th>Actual Production (Auto)</th>
                      <th>Quality Defects</th>
                      <th>Production %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyPlanData.entries?.map((entry: any, index: number) => (
                      <tr key={index}>
                        <td>{entry.deptName}</td>
                        <td>{entry.operatorName}</td>
                        <td>{entry.work}</td>
                        <td>{entry.h1Plan}</td>
                        <td>{entry.h2Plan}</td>
                        <td>{entry.otPlan}</td>
                        <td>{entry.target}</td>
                        <td>
                          <input
                            type="number"
                            placeholder="H1 Actual"
                            min="0"
                            className="actual-input"
                            value={formData.entries?.[index]?.h1Actual || ''}
                            onChange={(e) => handleEntryChange(index, 'h1Actual', parseInt(e.target.value) || 0)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            placeholder="H2 Actual"
                            min="0"
                            className="actual-input"
                            value={formData.entries?.[index]?.h2Actual || ''}
                            onChange={(e) => handleEntryChange(index, 'h2Actual', parseInt(e.target.value) || 0)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            placeholder="OT Actual"
                            min="0"
                            className="actual-input"
                            value={formData.entries?.[index]?.otActual || ''}
                            onChange={(e) => handleEntryChange(index, 'otActual', parseInt(e.target.value) || 0)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            placeholder="Auto-calculated"
                            min="0"
                            className="actual-input readonly-input"
                            value={formData.entries?.[index]?.actualProduction || 0}
                            readOnly
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            placeholder="Defects"
                            min="0"
                            className="actual-input"
                            value={formData.entries?.[index]?.qualityDefects || ''}
                            onChange={(e) => handleEntryChange(index, 'qualityDefects', parseInt(e.target.value) || 0)}
                          />
                        </td>
                        <td>
                          <span className="percentage">
                            {formData.entries?.[index]?.actualProduction && entry.target 
                              ? Math.round((formData.entries[index].actualProduction / entry.target) * 100)
                              : '--'}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Plan Section - Show only for entries with production < 85% */}
            {formData.entries?.some((entry: any, index: number) => {
              const percentage = entry.actualProduction && dailyPlanData.entries[index]?.target 
                ? (entry.actualProduction / dailyPlanData.entries[index].target) * 100 
                : 0;
              return percentage < 85 && percentage > 0;
            }) && (
              <div className="action-plan-section">
                <h4>Action Plan for Low Production</h4>
                <p className="warning-text">⚠️ Production below 85% requires ALL action plan fields to be filled (Reason, Corrective Actions, Responsible Person, and Target Completion Date).</p>
                
                {formData.entries?.map((entry: any, index: number) => {
                  const percentage = entry.actualProduction && dailyPlanData.entries[index]?.target 
                    ? (entry.actualProduction / dailyPlanData.entries[index].target) * 100 
                    : 0;
                  
                  if (percentage >= 85 || percentage === 0) return null;
                  
                  return (
                    <div key={index} className="action-plan-entry">
                      <h5>Department: {dailyPlanData.entries[index]?.deptName} - Operator: {dailyPlanData.entries[index]?.operatorName}</h5>
                      <p>Production: {entry.actualProduction || 0} / {dailyPlanData.entries[index]?.target} ({percentage.toFixed(1)}%)</p>
                      
                      <div className="action-plan-fields">
                        <div className="form-group">
                          <label className="required-label">Reason for Low Production</label>
                          <textarea
                            placeholder="Explain the reason for low production..."
                            rows={3}
                            className={`reason-textarea ${(!entry.reason || entry.reason.trim() === '') ? 'required-field' : ''}`}
                            value={entry.reason || ''}
                            onChange={(e) => handleEntryChange(index, 'reason', e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="form-group">
                          <label className="required-label">Corrective Actions</label>
                          <textarea
                            placeholder="Describe the corrective actions to be taken..."
                            rows={3}
                            className={`corrective-actions-textarea ${(!entry.correctiveActions || entry.correctiveActions.trim() === '') ? 'required-field' : ''}`}
                            value={entry.correctiveActions || ''}
                            onChange={(e) => handleEntryChange(index, 'correctiveActions', e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="form-row">
                          <div className="form-group">
                            <label className="required-label">Responsible Person</label>
                            <input
                              type="text"
                              placeholder="Name of responsible person"
                              className={(!entry.responsiblePerson || entry.responsiblePerson.trim() === '') ? 'required-field' : ''}
                              value={entry.responsiblePerson || ''}
                              onChange={(e) => handleEntryChange(index, 'responsiblePerson', e.target.value)}
                              required
                            />
                          </div>
                          
                          <div className="form-group">
                            <label className="required-label">Target Completion Date</label>
                            <input
                              type="date"
                              className={(!entry.targetCompletionDate || entry.targetCompletionDate.trim() === '') ? 'required-field' : ''}
                              value={entry.targetCompletionDate || ''}
                              onChange={(e) => handleEntryChange(index, 'targetCompletionDate', e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="report-notes">
              <h4>Report Notes</h4>
              <textarea
                placeholder="Enter any additional notes about the production day..."
                rows={3}
                className="notes-textarea"
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            </div>
          </div>
        </div>
      </form>
    );
  };

  const renderForm = () => {
    if (!task) return null;

    switch (task.type) {
      case 'monthly':
        return renderMonthlyForm();
      case 'weekly':
        return renderWeeklyForm();
      case 'daily':
        return renderDailyForm();
      case 'report':
        return renderReportForm();
      default:
        return <div>Unsupported task type</div>;
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{task.title}</h2>
            {task.status === 'completed' && (
              <div className="status-badge completed">✓ Completed</div>
            )}
            {task.status === 'pending' && (
              <div className="status-badge pending">⏳ Pending</div>
            )}
            {task.status === 'inProgress' && (
              <div className="status-badge in-progress">🔄 In Progress</div>
            )}
          </div>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        
                 <div className="modal-body">
           {error && <div className="error-message">{error}</div>}
           
           {task?.status === 'completed' && (
             <div className="info-message">
               This plan has been completed and submitted. You can view the details but cannot make changes.
             </div>
           )}
           
           {loading ? (
             <div className="loading">Loading plan data...</div>
           ) : (
             renderForm()
           )}
         </div>
        
        <div className="modal-footer">
          <button onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          
          {/* Show different buttons based on user role and task status */}
          {task?.type === 'daily' && task?.status === 'inProgress' && canApprove() ? (
            // Plant Head viewing a daily plan for approval
            <button 
              onClick={handleViewForApproval}
              className="approve-btn"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Review for Approval'}
            </button>
          ) : task?.status === 'completed' ? (
            // Plan already completed
            <button 
              onClick={onClose} 
              className="submit-btn"
              disabled={true}
            >
              Plan Already Completed
            </button>
          ) : (
            // Regular submit button for other cases
            <button 
              onClick={handleSubmit} 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Plan'}
            </button>
          )}
        </div>
      </div>
      
      {/* Approval Modal for Plant Head */}
      <DailyPlanApprovalModal
        plan={planData}
        isOpen={showApprovalModal}
        onClose={() => {
          setShowApprovalModal(false);
          setPlanData(null);
        }}
        onApproval={handleApproval}
      />
    </div>
  );
};

export default ProductionPlanModal; 