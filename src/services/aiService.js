import axios from 'axios';
import { getData } from './storage';

// 使用DeepSeek API作为AI服务
const API_ENDPOINT = 'https://dseek.aikeji.vip/v1/chat/completions'; // DeepSeek API端点
const API_KEY = 'sk-NaFWPahksdw1EUBy4S91AVjg9kQ9BBTyn5vFlbz47PaiQ4Hs'; // DeepSeek API密钥

/**
 * 向DeepSeek AI发送查询并获取回答
 * @param {string} question - 用户问题
 * @returns {Promise<string>} AI的回答
 */
const queryAI = async (question) => {
  try {
    // 获取所有存储的数据
    const personalData = getData();
    
    // 将数据转换为AI可以理解的格式
    const context = personalData.map(item => 
      `标题: ${item.title}\n内容: ${item.text}\n时间: ${new Date(item.timestamp).toLocaleString()}`
    ).join('\n\n');
    
    // 构建发送给AI的提示
    const prompt = `基于以下个人数据回答问题:\n\n${context}\n\n问题: ${question}`;
    
    // 调用DeepSeek API
    const response = await axios.post(
      API_ENDPOINT,
      {
        model: "deepseek-r1", // DeepSeek模型名称
        messages: [
          { role: 'system', content: '你是一个帮助用户查询个人数据的助手。请基于用户提供的数据回答问题，如果数据中没有相关信息，请诚实地告诉用户。' },
          { role: 'user', content: prompt }
        ]
      },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
          'User-Agent': 'Mozilla/5.0'
        }
      }
    );
    
    // 返回AI的回答
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('AI查询错误:', error);
    
    // 提供更详细的错误信息
    if (error.response) {
      // 服务器响应了，但状态码不在2xx范围内
      console.error('错误状态码:', error.response.status);
      console.error('错误数据:', error.response.data);
      return `查询出错 (${error.response.status}): ${JSON.stringify(error.response.data)}`;
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('没有收到响应:', error.request);
      return '服务器没有响应，请检查网络连接或API端点是否正确。';
    } else {
      // 设置请求时发生了错误
      console.error('请求错误:', error.message);
      return `请求错误: ${error.message}`;
    }
  }
};

export { queryAI };
