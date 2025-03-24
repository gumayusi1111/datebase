import axios from 'axios';
import { getData } from './storage';

// API 端点
const API_URL = 'http://localhost:3001/api';

/**
 * 向 AI 发送查询并获取回答
 * @param {string} question - 用户问题
 * @returns {Promise<string>} AI的回答
 */
const queryAI = async (question) => {
  try {
    // 获取所有存储的数据 - 用于错误回退
    const personalData = await getData();
    
    // 获取认证令牌
    const token = localStorage.getItem('token');
    console.log('认证令牌:', token ? '已设置' : '未设置');
    
    // 调用后端代理 API
    console.log('通过后端代理调用 AI API...', `${API_URL}/ai/query`);
    const response = await axios.post(
      `${API_URL}/ai/query`, 
      { question },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    // 返回 AI 的回答
    return response.data.answer;
  } catch (error) {
    console.error('AI 查询错误:', error);
    
    // 提供更详细的错误信息
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误数据:', error.response.data);
      return `查询出错: ${error.response.data.error || '未知错误'}`;
    } else if (error.request) {
      console.error('没有收到响应:', error.request);
      return '服务器没有响应，请检查网络连接或服务器状态。';
    } else {
      console.error('请求错误:', error.message);
      return `请求错误: ${error.message}`;
    }
  }
};

export { queryAI };
