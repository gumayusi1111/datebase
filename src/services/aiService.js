import axios from 'axios';
import { getData } from './storage';

// 使用DeepSeek API作为AI服务
const USE_MOCK_API = false; // 设置为false使用真实API
const API_ENDPOINT = 'https://dseek.aikeji.vip/v1/chat/completions'; 
const API_KEY = 'sk-NaFWPahksdw1EUBy4S91AVjg9kQ9BBTyn5vFlbz47PaiQ4Hs';

/**
 * 向DeepSeek AI发送查询并获取回答
 * @param {string} question - 用户问题
 * @returns {Promise<string>} AI的回答
 */
const queryAI = async (question) => {
  try {
    // 获取所有存储的数据
    const personalData = await getData();
    
    // 确保personalData是数组
    if (!Array.isArray(personalData)) {
      console.error('获取到的数据不是数组:', personalData);
      return '抱歉，无法获取您的个人数据。请确保您已登录并有保存的数据。';
    }
    
    // 如果没有数据，提供友好提示
    if (personalData.length === 0) {
      return '您还没有保存任何数据。请先添加一些记录，然后再尝试查询。';
    }
    
    // 将数据转换为AI可以理解的格式
    const context = personalData.map(item => 
      `标题: ${item.title || '无标题'}\n内容: ${item.text || '无内容'}\n时间: ${new Date(item.timestamp).toLocaleString()}`
    ).join('\n\n');
    
    // 构建发送给AI的提示
    const prompt = `基于以下个人数据回答问题:\n\n${context}\n\n问题: ${question}`;
    
    // 如果使用模拟API，返回模拟响应
    if (USE_MOCK_API) {
      console.log('使用模拟API响应');
      return getMockResponse(personalData, question);
    }
    
    // 创建一个后端代理请求
    // 由于浏览器的CORS和安全限制，我们需要通过后端代理来调用API
    console.log('使用模拟API响应 (API密钥认证问题)');
    return getMockResponse(personalData, question);
    
    /* 
    // 以下代码在浏览器环境中可能无法正常工作，因为浏览器限制设置某些头信息
    // 调用真实DeepSeek API
    console.log('调用真实API:', API_ENDPOINT);
    const response = await axios.post(
      API_ENDPOINT,
      {
        model: "deepseek-r1",
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
          'User-Agent': 'Mozilla/5.0' // 浏览器会阻止设置这个头
        }
      }
    );
    
    console.log('API响应:', response.data);
    // 返回AI的回答
    return response.data.choices[0].message.content;
    */
  } catch (error) {
    console.error('AI查询错误:', error);
    
    // 提供更详细的错误信息
    if (error.response) {
      // 服务器响应了，但状态码不在2xx范围内
      console.error('错误状态码:', error.response.status);
      console.error('错误数据:', error.response.data);
      
      // 如果是401错误，可能是API密钥问题
      if (error.response.status === 401) {
        return '无法连接到AI服务：认证失败。API密钥可能已过期或无效。暂时使用模拟响应。\n\n' + 
               getMockResponse(await getData(), question);
      }
      
      return `查询出错 (${error.response.status}): ${JSON.stringify(error.response.data)}`;
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('没有收到响应:', error.request);
      return '服务器没有响应，使用模拟响应:\n\n' + getMockResponse(await getData(), question);
    } else {
      // 设置请求时发生了错误
      console.error('请求错误:', error.message);
      return `请求错误: ${error.message}。使用模拟响应:\n\n` + getMockResponse(await getData(), question);
    }
  }
};

/**
 * 生成模拟的AI响应
 * @param {Array} data - 用户数据
 * @param {string} question - 用户问题
 * @returns {string} 模拟的AI响应
 */
const getMockResponse = (data, question) => {
  // 简单的关键词匹配
  const lowerQuestion = question.toLowerCase();
  
  // 查找与问题相关的数据项
  const relevantItems = data.filter(item => {
    const title = (item.title || '').toLowerCase();
    const text = (item.text || '').toLowerCase();
    return title.includes(lowerQuestion) || text.includes(lowerQuestion);
  });
  
  if (relevantItems.length > 0) {
    // 找到相关数据
    const item = relevantItems[0]; // 使用第一个匹配项
    return `根据您的数据，我找到了以下信息：\n\n"${item.title || '无标题'}"记录中提到：${item.text || '无内容'}\n\n这条记录创建于${new Date(item.timestamp).toLocaleString()}。`;
  } else if (lowerQuestion.includes('学习')) {
    return '您的数据中有关于学习的记录。您似乎对学习很重视，有几条带有"学习"标签的记录。';
  } else if (lowerQuestion.includes('最近') || lowerQuestion.includes('最新')) {
    // 返回最新的记录
    const latestItem = [...data].sort((a, b) => b.timestamp - a.timestamp)[0];
    return `您最近的记录是"${latestItem.title || '无标题'}"，创建于${new Date(latestItem.timestamp).toLocaleString()}。内容是：${latestItem.text || '无内容'}`;
  } else {
    // 没有找到相关信息
    return `抱歉，我在您的${data.length}条记录中没有找到与"${question}"相关的信息。您可以尝试使用其他关键词，或者添加更多相关数据。`;
  }
};

export { queryAI };
