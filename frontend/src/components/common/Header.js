import React, { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import './Common.css';

const Header = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1>Quiz Planner</h1>
          </Link>
          
          {currentUser ? (
            <>
              <nav className="main-nav">
                <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
                  Dashboard
                </NavLink>
                <NavLink to="/materials" className={({ isActive }) => isActive ? 'active' : ''}>
                  Study Materials
                </NavLink>
                <NavLink to="/quizzes" className={({ isActive }) => isActive ? 'active' : ''}>
                  Quizzes
                </NavLink>
              </nav>
              
              <div className="user-actions">
                <span className="user-greeting">Hello, {currentUser.name || 'User'}</span>
                <button onClick={handleLogout} className="btn btn-outline-light btn-sm">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <nav className="auth-nav">
              <NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''}>
                Login
              </NavLink>
              <NavLink to="/register" className={({ isActive }) => isActive ? 'active' : ''}>
                Register
              </NavLink>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;