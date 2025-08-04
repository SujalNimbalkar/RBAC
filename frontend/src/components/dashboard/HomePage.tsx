import React from 'react';
import './HomePage.css';

const HomePage: React.FC = () => {
  return (
    <div className="home-container">
      <div className="tasks-due-soon">
        <div className="section-header">
          <h2>Tasks Due Soon</h2>
          <a href="#" className="see-all-link">See all my tasks</a>
        </div>
        <div className="task-list">
          <div className="task-item">
            <input type="checkbox" className="task-checkbox" />
            <span className="task-title">TEMPLATE - COPY ME for new design requests</span>
            <span className="task-label orange">Website...</span>
            <span className="task-due">Thursday</span>
          </div>
          <div className="task-item">
            <input type="checkbox" className="task-checkbox" />
            <span className="task-title">Prototype released</span>
            <span className="task-label purple">Website...</span>
            <span className="task-due">Thursday</span>
          </div>
        </div>
      </div>

      <div className="favorites-grid">
        <h2>Favorites</h2>
        <div className="favorites-cards">
          <div className="favorite-card blue">
            <div className="card-icon">📋</div>
            <div className="card-content">
              <h3>Recruiting weekly meeting</h3>
              <p>Recruiting</p>
            </div>
          </div>
          <div className="favorite-card yellow">
            <div className="card-icon">📋</div>
            <div className="card-content">
              <h3>Weekly meeting</h3>
              <p>Private</p>
            </div>
          </div>
          <div className="favorite-card red">
            <div className="card-icon">📋</div>
            <div className="card-content">
              <h3>Editorial Calendar</h3>
              <p>Marketing</p>
            </div>
          </div>
          <div className="favorite-card orange">
            <div className="card-icon">📁</div>
            <div className="card-content">
              <h3>Website Design Requests</h3>
              <p>Marketing</p>
            </div>
          </div>
          <div className="favorite-card pink">
            <div className="card-icon">📋</div>
            <div className="card-content">
              <h3>Website Launch 2.0</h3>
              <p>Marketing</p>
            </div>
          </div>
        </div>
      </div>

      <div className="recent-projects">
        <h2>Recent Projects</h2>
        <div className="project-list">
          <div className="project-item">
            <span className="project-name">Design Requests</span>
            <div className="project-meta">
              <div className="project-avatars">
                <span className="avatar">👤</span>
                <span className="avatar">👤</span>
                <span className="avatar">👤</span>
              </div>
              <span className="project-count">13</span>
            </div>
          </div>
          <div className="project-item">
            <span className="project-name">Visited today Marketing</span>
            <div className="project-meta">
              <div className="project-avatars">
                <span className="avatar">👤</span>
                <span className="avatar">👤</span>
                <span className="avatar">👤</span>
              </div>
              <span className="project-count">13</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 