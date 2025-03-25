import React from 'react';
import { THEMES, getThemePreference, setThemePreference, DAY_HOUR_START, NIGHT_HOUR_START } from '../services/themeService';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const [theme, setTheme] = React.useState(getThemePreference());
  
  const handleThemeChange = (newTheme) => {
    setThemePreference(newTheme);
    setTheme(newTheme);
  };
  
  return (
    <div className="theme-toggle">
      <label className="theme-toggle-label">主题模式:</label>
      <div className="theme-options">
        <button 
          className={`theme-option ${theme === THEMES.LIGHT ? 'active' : ''}`}
          onClick={() => handleThemeChange(THEMES.LIGHT)}
          aria-label="浅色模式"
        >
          <i className="icon-sun"></i>
          <span>浅色</span>
        </button>
        
        <button 
          className={`theme-option ${theme === THEMES.DARK ? 'active' : ''}`}
          onClick={() => handleThemeChange(THEMES.DARK)}
          aria-label="深色模式"
        >
          <i className="icon-moon"></i>
          <span>深色</span>
        </button>
        
        <button 
          className={`theme-option ${theme === THEMES.SYSTEM ? 'active' : ''}`}
          onClick={() => handleThemeChange(THEMES.SYSTEM)}
          aria-label="跟随系统"
        >
          <i className="icon-computer"></i>
          <span>系统</span>
        </button>
        
        <button 
          className={`theme-option ${theme === THEMES.AUTO ? 'active' : ''}`}
          onClick={() => handleThemeChange(THEMES.AUTO)}
          aria-label="自动日夜切换"
        >
          <i className="icon-auto"></i>
          <span>自动</span>
        </button>
      </div>
      
      {theme === THEMES.AUTO && (
        <div className="theme-auto-info">
          <small>
            自动模式: {DAY_HOUR_START}:00-{NIGHT_HOUR_START}:00 为浅色模式，
            其余时间为深色模式
          </small>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle; 