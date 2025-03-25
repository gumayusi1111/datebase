/**
 * 主题服务 - 管理应用的深色/浅色模式
 */

// 主题类型
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system', // 跟随系统设置
  AUTO: 'auto'      // 根据时间自动切换
};

// 存储主题设置的键名
const THEME_STORAGE_KEY = 'app_theme_preference';

// 日夜切换时间设置
const DAY_HOUR_START = 6;  // 早上6点开始日间模式
const NIGHT_HOUR_START = 18; // 晚上6点开始夜间模式

/**
 * 获取当前系统主题偏好
 * @returns {string} 'dark' 或 'light'
 */
const getSystemTheme = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches 
    ? THEMES.DARK 
    : THEMES.LIGHT;
};

/**
 * 根据当前时间确定应该使用的主题
 * @returns {string} 'dark' 或 'light'
 */
const getTimeBasedTheme = () => {
  const currentHour = new Date().getHours();
  return (currentHour >= NIGHT_HOUR_START || currentHour < DAY_HOUR_START) 
    ? THEMES.DARK 
    : THEMES.LIGHT;
};

/**
 * 获取当前主题设置
 * @returns {string} 主题设置
 */
const getThemePreference = () => {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  return savedTheme || THEMES.SYSTEM;
};

/**
 * 设置主题偏好
 * @param {string} theme - 'light', 'dark', 'system' 或 'auto'
 */
const setThemePreference = (theme) => {
  if (!Object.values(THEMES).includes(theme)) {
    console.error('无效的主题:', theme);
    return;
  }
  
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  applyTheme(theme);
};

/**
 * 应用主题到文档
 * @param {string} theme - 主题设置
 */
const applyTheme = (theme) => {
  console.log('应用主题:', theme);
  
  // 根据设置确定实际使用的主题
  let effectiveTheme;
  
  if (theme === THEMES.SYSTEM) {
    effectiveTheme = getSystemTheme();
  } else if (theme === THEMES.AUTO) {
    effectiveTheme = getTimeBasedTheme();
  } else {
    effectiveTheme = theme;
  }
  
  console.log('有效主题:', effectiveTheme);
  
  // 移除现有主题类
  document.documentElement.classList.remove(THEMES.LIGHT, THEMES.DARK);
  
  // 添加新主题类
  document.documentElement.classList.add(effectiveTheme);
  console.log('应用的类:', effectiveTheme, document.documentElement.className);
  
  // 更新meta主题颜色（用于移动设备状态栏）
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute(
      'content', 
      effectiveTheme === THEMES.DARK ? '#1a1a1a' : '#ffffff'
    );
  }
};

// 自动主题切换的定时器
let autoThemeTimer = null;

/**
 * 启动自动主题切换定时器
 */
const startAutoThemeTimer = () => {
  // 清除现有定时器
  if (autoThemeTimer) {
    clearInterval(autoThemeTimer);
  }
  
  // 立即应用一次
  if (getThemePreference() === THEMES.AUTO) {
    applyTheme(THEMES.AUTO);
  }
  
  // 设置定时器，每分钟检查一次
  autoThemeTimer = setInterval(() => {
    if (getThemePreference() === THEMES.AUTO) {
      applyTheme(THEMES.AUTO);
    }
  }, 60000); // 每分钟检查一次
};

/**
 * 初始化主题
 */
const initTheme = () => {
  // 确保在DOM加载完成后执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const savedTheme = getThemePreference();
      console.log('初始化主题:', savedTheme);
      applyTheme(savedTheme);
      startAutoThemeTimer();
    });
  } else {
    const savedTheme = getThemePreference();
    console.log('初始化主题:', savedTheme);
    applyTheme(savedTheme);
    startAutoThemeTimer();
  }
  
  // 监听系统主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    console.log('系统主题变化:', e.matches ? 'dark' : 'light');
    if (getThemePreference() === THEMES.SYSTEM) {
      applyTheme(THEMES.SYSTEM);
    }
  });
};

export { 
  THEMES, 
  getThemePreference, 
  setThemePreference, 
  initTheme,
  DAY_HOUR_START,
  NIGHT_HOUR_START
}; 