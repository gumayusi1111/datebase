import React from 'react';
import ThemeToggle from '../components/ThemeToggle';
import './Settings.css';

const Settings = () => {
  return (
    <div className="settings-page">
      <h1>设置</h1>
      
      <div className="settings-section">
        <h2>外观</h2>
        <ThemeToggle />
        {/* 其他外观设置... */}
      </div>
      
      {/* 其他设置部分... */}
    </div>
  );
};

export default Settings; 