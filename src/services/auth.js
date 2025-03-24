import axios from 'axios';

const API_URL = 'http://localhost:3001/api';
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

// 导出常量
export { TOKEN_KEY, USER_KEY };

/**
 * 注册新用户
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @param {string} displayName - 显示名称
 * @returns {Promise} - 包含用户信息的Promise
 */
export const register = async (username, password, displayName) => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      username,
      password,
      displayName
    });
    
    const { token, user } = response.data;
    
    // 保存令牌和用户信息到本地存储
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
    // 设置默认Authorization头
    setAuthHeader(token);
    
    return user;
  } catch (error) {
    console.error('注册失败:', error);
    throw error;
  }
};

/**
 * 登录
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {Promise} - 包含用户信息的Promise
 */
export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { username, password });
    const { token, user } = response.data;
    
    // 保存令牌和用户信息到本地存储
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
    // 设置默认Authorization头
    setAuthHeader(token);
    
    console.log('登录成功，保存的用户:', user);
    console.log('登录成功，保存的令牌:', token);
    
    return user;
  } catch (error) {
    console.error('登录失败:', error);
    throw error;
  }
};

/**
 * 登出
 */
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  
  // 移除默认Authorization头
  axios.defaults.headers.common['Authorization'] = '';
};

/**
 * 获取当前登录用户
 * @returns {Object|null} 当前用户信息或null
 */
export const getCurrentUser = () => {
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) {
    console.log('未找到用户信息');
    return null;
  }
  
  try {
    const user = JSON.parse(userJson);
    console.log('当前用户:', user);
    return user;
  } catch (error) {
    console.error('解析用户信息失败:', error);
    return null;
  }
};

/**
 * 获取认证令牌
 * @returns {string|null} 认证令牌或null
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * 检查用户是否已登录
 * @returns {boolean} - 是否已登录
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * 设置认证头
 * @param {string} token - JWT令牌
 */
export const setAuthHeader = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// 初始化 - 如果有令牌，设置默认头
const token = getToken();
if (token) {
  setAuthHeader(token);
} 