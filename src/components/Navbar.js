import React from 'react';
import { THEMES, getThemePreference, setThemePreference } from '../services/themeService';
import './Navbar.css';

const Navbar = () => {
  const [theme, setTheme] = React.useState(getThemePreference());
  
  const toggleTheme = () => {
    const currentTheme = getThemePreference();
    let newTheme;
    
    if (currentTheme === THEMES.SYSTEM) {
      newTheme = window.matchMedia('(prefers-color-scheme: dark)').matches 
        ? THEMES.LIGHT 
        : THEMES.DARK;
    } else {
      newTheme = currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
    }
    
    setThemePreference(newTheme);
    setTheme(newTheme);
  };
  
  return (
    <nav className="navbar">
      {/* 其他导航项... */}
      
      <button 
        className="theme-toggle-button" 
        onClick={toggleTheme}
        aria-label={`切换到${theme === THEMES.DARK ? '浅色' : '深色'}模式`}
      >
        {theme === THEMES.DARK ? (
          <i className="icon-sun" title="切换到浅色模式"></i>
        ) : (
          <i className="icon-moon" title="切换到深色模式"></i>
        )}
      </button>
    </nav>
  );
};

export default Navbar; 