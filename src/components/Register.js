import React, { useState } from 'react';
import { register } from '../services/auth';

/**
 * 注册组件 - 允许用户创建新账户
 * @param {Object} props - 组件属性
 * @param {Function} props.onRegisterSuccess - 注册成功后的回调函数
 * @param {Function} props.onSwitchToLogin - 切换到登录页面的回调函数
 */
const Register = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  /**
   * 处理注册表单提交
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 表单验证
    if (!username || !password || !confirmPassword || !displayName) {
      setError('所有字段都是必填的');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }
    
    if (password.length < 6) {
      setError('密码长度至少为6个字符');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const user = await register(username, password, displayName);
      if (onRegisterSuccess) {
        onRegisterSuccess(user);
      }
    } catch (err) {
      setError(err.response?.data?.error || '注册失败，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">
          <i className="fas fa-user-plus"></i> 用户注册
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
              placeholder="输入用户名 (用于登录)"
              disabled={isLoading}
              autoComplete="username"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="displayName">
              <i className="fas fa-id-card"></i> 显示名称
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="输入显示名称 (如何称呼您)"
              disabled={isLoading}
              autoComplete="name"
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
              placeholder="输入密码 (至少6个字符)"
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">
              <i className="fas fa-lock"></i> 确认密码
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="再次输入密码"
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>
          
          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> 注册中...
              </>
            ) : (
              <>
                <i className="fas fa-user-plus"></i> 创建账号
              </>
            )}
          </button>
        </form>
        
        <div className="auth-switch">
          <span>已有账号？</span>
          <button 
            className="switch-button" 
            onClick={onSwitchToLogin}
            disabled={isLoading}
          >
            <i className="fas fa-sign-in-alt"></i> 返回登录
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register; 