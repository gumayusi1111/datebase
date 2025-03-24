import React, { useState } from 'react';
import './App.css';
import DataInput from './components/DataInput';
import AIQueryPanel from './components/AIQueryPanel';

/**
 * 应用主组件 - 组织和管理所有子组件
 */
function App() {
  // 用于强制刷新数据列表的键
  const [refreshKey, setRefreshKey] = useState(0);
  // 当前活动选项卡
  const [activeTab, setActiveTab] = useState('add'); // 'add' 或 'query'
  
  /**
   * 处理数据添加事件
   * 当新数据添加时，刷新数据列表
   */
  const handleDataAdded = () => {
    // 强制刷新数据列表
    setRefreshKey(prevKey => prevKey + 1);
  };
  
  return (
    <div className="App">
      <header className="App-header">
        <h1>个人数据库</h1>
        <p>存储、检索和智能查询您的个人数据</p>
      </header>
      
      <main>
        {/* 选项卡导航 */}
        <div className="tabs">
          <button 
            className={`tab-button ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            <i className="fas fa-plus-circle"></i> 添加数据
          </button>
          <button 
            className={`tab-button ${activeTab === 'query' ? 'active' : ''}`}
            onClick={() => setActiveTab('query')}
          >
            <i className="fas fa-search"></i> 查询数据
          </button>
        </div>
        
        {/* 选项卡内容 */}
        <div className="tab-content">
          {/* 添加数据选项卡 */}
          {activeTab === 'add' && (
            <div className="tab-pane">
              <DataInput onDataAdded={handleDataAdded} />
            </div>
          )}
          
          {/* 查询数据选项卡 */}
          {activeTab === 'query' && (
            <div className="tab-pane full-width">
              <div className="query-container">
                <div className="ai-section">
                  <h2 className="section-title">
                    <i className="fas fa-robot"></i> 智能对话
                  </h2>
                  <AIQueryPanel refreshKey={refreshKey} />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer>
        <p>个人数据库 &copy; {new Date().getFullYear()} | 使用React和DeepSeek-R1 AI构建</p>
      </footer>
    </div>
  );
}

export default App;
