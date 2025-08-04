import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import HomePage from './HomePage';
import TasksPage from './TasksPage';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="dashboard-main">
        {/* Header */}
        <Header 
          activeTab={activeTab} 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
        />

        {/* Main Content */}
        <main className="dashboard-content">
          {activeTab === 'home' && <HomePage />}
          
          {activeTab === 'my-tasks' && <TasksPage searchTerm={searchTerm} />}

          {activeTab === 'inbox' && (
            <div className="inbox-container">
              <h2>Inbox</h2>
              <p>Inbox features coming soon...</p>
            </div>
          )}

          {activeTab === 'portfolios' && (
            <div className="portfolios-container">
              <h2>Portfolios</h2>
              <p>Portfolio management features coming soon...</p>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="reports-container">
              <h2>Reports</h2>
              <p>Reporting and analytics features coming soon...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard; 