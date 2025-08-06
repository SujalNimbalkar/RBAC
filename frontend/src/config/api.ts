// API Configuration
export const API_CONFIG = {
  // Use environment variable if available, otherwise use production URL
  BASE_URL: process.env.REACT_APP_API_URL || 'https://rbac-ma5a.onrender.com',
  ENDPOINTS: {
    AUTH: '/api/auth',
    TASKS: '/api/tasks',
    PROJECTS: '/api/projects',
    RBAC: '/api/rbac',
    PRODUCTION: '/api/production',
    HEALTH: '/api/health',
    CRON: '/api/cron'
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Export commonly used URLs
export const API_URLS = {
  PRODUCTION_TASKS: buildApiUrl('/api/production/tasks'),
  PRODUCTION_MONTHLY: buildApiUrl('/api/production/monthly'),
  PRODUCTION_WEEKLY: buildApiUrl('/api/production/weekly'),
  PRODUCTION_DAILY: buildApiUrl('/api/production/daily'),
  PRODUCTION_REPORTS: buildApiUrl('/api/production/reports'),
};