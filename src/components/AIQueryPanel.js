import React, { useState, useRef, useEffect } from 'react';
import { queryAI } from '../services/aiService';
import { searchData, getData } from '../services/storage';

/**
 * AI查询面板组件 - 允许用户通过AI查询他们的数据
 * @param {Object} props - 组件属性
 * @param {number} props.refreshKey - 刷新键
 */
const AIQueryPanel = ({ refreshKey }) => {
  // 管理对话历史
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '你好！我是你的个人数据助手。你可以：\n1. 直接向我提问关于你存储的数据\n2. 使用 "/搜索 关键词" 来搜索特定内容', isIntro: true }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 用于自动滚动到最新消息
  const messagesEndRef = useRef(null);
  
  // 当refreshKey变化时，重新加载介绍消息
  useEffect(() => {
    if (refreshKey > 0) {
      setMessages([
        { role: 'assistant', content: '你好！我是你的个人数据助手。你可以：\n1. 直接向我提问关于你存储的数据\n2. 使用 "/搜索 关键词" 来搜索特定内容', isIntro: true }
      ]);
    }
  }, [refreshKey]);
  
  // 自动滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // 当消息更新时滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  /**
   * 处理关键词搜索
   */
  const handleSearch = async (keyword) => {
    // 执行搜索
    const results = searchData(keyword);
    
    // 构建搜索结果消息
    let resultMessage;
    if (results.length === 0) {
      resultMessage = { 
        role: 'assistant', 
        content: `没有找到包含 "${keyword}" 的记录。`, 
        isSearchResult: true 
      };
    } else {
      // 构建搜索结果文本
      const resultsText = results.map(item => {
        let content = `📝 **${item.title}**\n${item.text}\n📅 ${new Date(item.timestamp).toLocaleString()}`;
        
        // 添加媒体信息
        if (item.image) content += '\n🖼️ [包含图片]';
        if (item.audio) content += '\n🔊 [包含音频]';
        
        return content;
      }).join('\n\n---\n\n');
      
      resultMessage = { 
        role: 'assistant', 
        content: `找到 ${results.length} 条匹配 "${keyword}" 的记录：\n\n${resultsText}`, 
        isSearchResult: true,
        results: results // 保存原始结果数据
      };
    }
    
    // 添加到消息历史
    setMessages(prev => [...prev, resultMessage]);
  };
  
  /**
   * 处理发送消息
   */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // 添加用户消息到对话历史
    const userMessage = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    
    // 清空输入框
    setInputValue('');
    
    // 显示加载状态
    setLoading(true);
    
    try {
      // 检查是否是搜索命令
      if (inputValue.startsWith('/搜索 ')) {
        const keyword = inputValue.substring(4).trim();
        if (keyword) {
          await handleSearch(keyword);
        } else {
          // 如果没有提供关键词
          const errorMessage = { 
            role: 'assistant', 
            content: '请提供搜索关键词，例如：/搜索 会议',
            isError: true
          };
          setMessages(prev => [...prev, errorMessage]);
        }
      } else {
        // 正常AI查询
        const response = await queryAI(inputValue);
        
        // 添加AI回答到对话历史
        const aiMessage = { role: 'assistant', content: response };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      // 处理错误
      const errorMessage = { 
        role: 'assistant', 
        content: '抱歉，我遇到了问题。请稍后再试。',
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      // 结束加载状态
      setLoading(false);
    }
  };
  
  /**
   * 渲染消息内容，支持基本的Markdown格式
   */
  const renderMessageContent = (content) => {
    // 处理粗体文本
    const boldText = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 处理换行
    const withLineBreaks = boldText.replace(/\n/g, '<br />');
    
    return <div dangerouslySetInnerHTML={{ __html: withLineBreaks }} />;
  };
  
  /**
   * 渲染搜索结果中的媒体内容
   */
  const renderSearchResultMedia = (message) => {
    if (!message.results) return null;
    
    return (
      <div className="search-result-media">
        {message.results.map((item, index) => (
          <div key={index} className="result-media-item">
            {item.image && (
              <div className="result-image">
                <img src={item.image} alt={item.title} />
              </div>
            )}
            {item.audio && (
              <div className="result-audio">
                <audio controls src={item.audio} />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="chat-container">
      {/* 对话历史 */}
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'} ${message.isError ? 'error-message' : ''} ${message.isSearchResult ? 'search-result-message' : ''} ${message.isIntro ? 'intro-message' : ''}`}
          >
            {message.role === 'user' ? (
              <div className="message-avatar user-avatar">
                <i className="fas fa-user"></i>
              </div>
            ) : (
              <div className="message-avatar assistant-avatar">
                <i className={message.isSearchResult ? "fas fa-search" : "fas fa-robot"}></i>
              </div>
            )}
            <div className="message-content">
              {renderMessageContent(message.content)}
              
              {/* 如果是搜索结果且有媒体，显示媒体内容 */}
              {message.isSearchResult && renderSearchResultMedia(message)}
              
              {message.role === 'assistant' && !message.isError && (
                <div className="message-time">
                  <small>{new Date().toLocaleTimeString()}</small>
                </div>
              )}
            </div>
          </div>
        ))}
        {/* 加载中指示器 */}
        {loading && (
          <div className="message assistant-message loading-message">
            <div className="message-avatar assistant-avatar">
              <i className="fas fa-robot"></i>
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        {/* 用于自动滚动的引用 */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* 消息输入框 */}
      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="输入问题或使用 /搜索 关键词"
          disabled={loading}
          className="chat-input"
        />
        <button 
          type="submit" 
          disabled={loading || !inputValue.trim()}
          className="send-button"
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </form>
      
      {/* 快捷命令提示 */}
      <div className="chat-commands">
        <div className="command-item" onClick={() => setInputValue('/搜索 ')}>
          <i className="fas fa-search"></i> 搜索
        </div>
        <div className="command-item" onClick={() => {
          setMessages([
            { role: 'assistant', content: '你好！我是你的个人数据助手。你可以：\n1. 直接向我提问关于你存储的数据\n2. 使用 "/搜索 关键词" 来搜索特定内容', isIntro: true }
          ]);
        }}>
          <i className="fas fa-redo-alt"></i> 重置对话
        </div>
      </div>
    </div>
  );
};

export default AIQueryPanel;
