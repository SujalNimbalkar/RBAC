import React from 'react';
import './Sidebar.css';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-header">
        <div className="logo-section">
          <h2>RBAC3</h2>
          <button className="menu-toggle">☰</button>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <ul className="nav-list">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'home' ? 'active' : ''}`} 
                onClick={() => setActiveTab('home')}
              >
                <span className="nav-icon">🏠</span>
                Home
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'my-tasks' ? 'active' : ''}`} 
                onClick={() => setActiveTab('my-tasks')}
              >
                <span className="nav-icon">✓</span>
                My Tasks
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'inbox' ? 'active' : ''}`} 
                onClick={() => setActiveTab('inbox')}
              >
                <span className="nav-icon">📥</span>
                Inbox
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'portfolios' ? 'active' : ''}`} 
                onClick={() => setActiveTab('portfolios')}
              >
                <span className="nav-icon">📁</span>
                Portfolios
              </button>
            </li>
          </ul>
        </div>

        <div className="nav-section">
          <h3 className="section-title">Favorites</h3>
          <ul className="nav-list">
            <li className="nav-item">
              <button className="nav-link">
                <span className="color-dot blue"></span>
                Recruiting weekly meeting
              </button>
            </li>
            <li className="nav-item">
              <button className="nav-link">
                <span className="color-dot yellow"></span>
                Weekly meeting
                <span className="lock-icon">🔒</span>
              </button>
            </li>
            <li className="nav-item">
              <button className="nav-link">
                <span className="color-dot red"></span>
                Editorial Calendar
              </button>
            </li>
            <li className="nav-item">
              <button className="nav-link">
                <span className="color-dot orange"></span>
                Website Design Requests
              </button>
            </li>
            <li className="nav-item">
              <button className="nav-link">
                <span className="color-dot purple"></span>
                Website Launch 2.0
              </button>
            </li>
          </ul>
          <button className="show-more-btn">Show more</button>
        </div>

        <div className="nav-section">
          <h3 className="section-title">Reports</h3>
          <ul className="nav-list">
            <li className="nav-item">
              <button className="nav-link">Tasks I've Created</button>
            </li>
            <li className="nav-item">
              <button className="nav-link">Tasks I've Assigned to Others</button>
            </li>
            <li className="nav-item">
              <button className="nav-link">Recently Completed Tasks</button>
            </li>
            <li className="nav-item">
              <button className="nav-link">Custom Field Order</button>
            </li>
            <li className="nav-item">
              <button className="nav-link">Marketing & Recruiting Collab...</button>
            </li>
          </ul>
        </div>

        <div className="nav-section">
          <h3 className="section-title">Teams</h3>
          <div className="team-section">
            <div className="team-header">
              <div className="team-avatars">
                <span className="avatar">👤</span>
                <span className="avatar">👤</span>
                <span className="avatar">👤</span>
              </div>
              <span className="team-name">Marketing</span>
              <button className="add-btn">+</button>
            </div>
            <ul className="team-projects">
              <li className="nav-item">
                <button className="nav-link">Annual conference plan</button>
              </li>
              <li className="nav-item">
                <button className="nav-link">Marketing goals</button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <button className="sidebar-collapse">◀</button>
    </aside>
  );
};

export default Sidebar; 