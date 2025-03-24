import React, { useState } from 'react';
import { login } from '../services/auth';

/**
 * 登录组件 - 允许用户登录系统
 * @param {Object} props - 组件属性
 * @param {Function} props.onLoginSuccess - 登录成功后的回调函数
 * @param {Function} props.onSwitchToRegister - 切换到注册页面的回调函数
 */
const Login = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  /**
   * 处理登录表单提交
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const user = await login(username, password);
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
    } catch (err) {
      setError(err.response?.data?.error || '登录失败，请检查用户名和密码');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">
          <i className="fas fa-user-lock"></i> 用户登录
        </h2>
        
        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">
              <i className="fas fa-user"></i> 用户名
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="输入用户名"
              disabled={isLoading}
              autoComplete="username"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">
              <i className="fas fa-lock"></i> 密码
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入密码"
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>
          
          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> 登录中...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt"></i> 登录
              </>
            )}
          </button>
        </form>
        
        <div className="auth-switch">
          <span>没有账号？</span>
          <button 
            className="switch-button" 
            onClick={onSwitchToRegister}
            disabled={isLoading}
          >
            <i className="fas fa-user-plus"></i> 注册新账号
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login; 