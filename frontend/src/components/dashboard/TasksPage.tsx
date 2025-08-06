import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { buildApiUrl } from '../../config/api';
import ProductionPlanModal from './ProductionPlanModal';
import './TasksPage.css';
import { canApproveDailyPlans, canSubmitDailyPlans } from '../../utils/roleUtils';

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

interface TasksPageProps {
  searchTerm: string;
}

const TasksPage: React.FC<TasksPageProps> = ({ searchTerm }) => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState<ProductionTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<ProductionTask | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const getPriorityColor = (type: string) => {
    switch (type) {
      case 'monthly': return '#6c757d';
      case 'weekly': return '#6c757d';
      case 'daily': return '#6c757d';
      case 'report': return '#6c757d';
      default: return '#747d8c';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#28a745';
      case 'inProgress': return '#007bff';
      case 'rejected': return '#6c757d';
      case 'pending': return '#6c757d';
      default: return '#747d8c';
    }
  };

  const getStatusDisplay = (task: ProductionTask) => {
    // For daily plans that are inProgress and can be approved, show "Pending Approval"
    if (task.type === 'daily' && task.status === 'inProgress' && canApprove()) {
      return 'Pending Approval';
    }
    return task.status;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTaskClick = (task: ProductionTask) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  // Check if user can approve daily plans
  const canApprove = () => {
    return canApproveDailyPlans(currentUser?.email || undefined, currentUser?.uid || undefined);
  };

  // Check if user is production manager
  const isProductionManager = () => {
    return canSubmitDailyPlans(currentUser?.email || undefined, currentUser?.uid || undefined);
  };

  const handleDownload = async (task: ProductionTask, format: 'pdf' | 'excel') => {
    try {
      let endpoint = '';
      
      switch (task.type) {
        case 'monthly':
          endpoint = `/api/production/monthly/${task.planId}/download/${format}`;
          break;
        case 'weekly':
          endpoint = `/api/production/weekly/${task.planId}/download/${format}`;
          break;
        case 'daily':
          endpoint = `/api/production/daily/${task.planId}/download/${format}`;
          break;
        case 'report':
          endpoint = `/api/production/reports/${task.planId}/download/${format}`;
          break;
        default:
          console.error('Unknown task type:', task.type);
          return;
      }
      
      const response = await fetch(buildApiUrl(endpoint), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download ${format.toUpperCase()}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${task.title.replace(/\s+/g, '-').toLowerCase()}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error(`Error downloading ${format.toUpperCase()}:`, error);
      alert(`Failed to download ${format.toUpperCase()}`);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      let response;
      // If Plant Head, fetch only inProgress daily tasks
      if (canApprove()) {
        response = await fetch(buildApiUrl('/api/production/tasks'), {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } else {
        response = await fetch(buildApiUrl('/api/production/tasks'), {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.data.tasks) {
        let tasks = data.data.tasks;
        // For Plant Head, filter daily tasks to only inProgress and exclude daily reports
        if (canApprove()) {
          tasks = tasks.filter((t: any) => {
            // Exclude daily reports completely
            if (t.type === 'report') return false;
            // For daily plans, only show inProgress
            if (t.type === 'daily') return t.status === 'inProgress';
            // Show all other task types (monthly, weekly)
            return true;
          });
        }
        // For Production Manager, only show daily plans and reports
        else if (isProductionManager()) {
          tasks = tasks.filter((t: any) => {
            // Only show daily plans and reports
            return t.type === 'daily' || t.type === 'report';
          });
        }
        setTasks(tasks);
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSubmit = (data: any) => {
    // Refresh tasks after successful submission or approval
    fetchTasks();
    
    // If this was an approval/rejection, show appropriate message
    if (data && typeof data === 'object' && 'approved' in data) {
      if (data.approved) {
        console.log('Daily plan approved successfully!');
      } else {
        console.log(`Daily plan rejected. Reason: ${data.reason}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="tasks-container">
        <div className="tasks-header">
          <h2>My Tasks</h2>
        </div>
        <div className="loading">Loading tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tasks-container">
        <div className="tasks-header">
          <h2>My Tasks</h2>
        </div>
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="tasks-container">
      <div className="tasks-header">
        <h2>My Tasks</h2>
        <button className="add-task-btn">+ Add Task</button>
      </div>
      
      {filteredTasks.length === 0 ? (
        <div className="no-tasks">
          <p>No tasks found. Tasks will appear here when assigned to you.</p>
        </div>
      ) : (
        <div className="tasks-grid">
          {filteredTasks.map(task => (
            <div key={task.id} className="task-card">
              <div className="task-header">
                <h3>{task.title}</h3>
                <div className="task-priority" style={{ backgroundColor: getPriorityColor(task.type) }}>
                  {task.type}
                </div>
              </div>
              
              <div className="task-meta">
                <div className="task-status" style={{ backgroundColor: getStatusColor(task.status) }}>
                  {getStatusDisplay(task)}
                </div>
                <div className="task-assignee">
                  <span className="assignee-avatar">P</span>
                  {task.type === 'daily' && task.status === 'inProgress' && canApprove() ? 'Review Required' : 'Plant Head'}
                </div>
              </div>
              
              <div className="task-footer">
                <span className="task-project">Production Plan</span>
                <span className="task-due-date">Due: {formatDate(task.deadline)}</span>
              </div>
              
              <div className="task-actions">
                <button 
                  className="task-action-btn primary"
                  onClick={() => handleTaskClick(task)}
                >
                  {task.type === 'daily' && task.status === 'inProgress' && canApprove() ? 'Review' : 'View'}
                </button>
                
                <div className="download-buttons">
                  <button 
                    className="download-btn pdf"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(task, 'pdf');
                    }}
                    title="Download PDF"
                  >
                    PDF
                  </button>
                  <button 
                    className="download-btn excel"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(task, 'excel');
                    }}
                    title="Download Excel"
                  >
                    Excel
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Production Plan Modal */}
      <ProductionPlanModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handlePlanSubmit}
      />
    </div>
  );
};

export default TasksPage; 