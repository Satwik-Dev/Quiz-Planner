import React from 'react';
import './Common.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="app-footer">
      <div className="container">
        <div className="footer-content">
          <p>AI-Powered Quiz Planner &copy; {currentYear}</p>
          <p>University of Maryland Baltimore County - MPS Software Engineering</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;