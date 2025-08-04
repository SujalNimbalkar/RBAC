import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Header.css';

interface HeaderProps {
  activeTab: string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, searchTerm, setSearchTerm }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'home': return 'Home';
      case 'my-tasks': return 'My Tasks';
      case 'inbox': return 'Inbox';
      case 'portfolios': return 'Portfolios';
      default: return 'Dashboard';
    }
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <h1>{getPageTitle()}</h1>
      </div>
      <div className="header-right">
        <div className="search-container">
          <input
            type="text"
            placeholder="Go to any project or task..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button className="new-btn">+ New</button>
        <button className="help-btn">?</button>
        <div className="user-avatar">
          <span>{currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}</span>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header; 