import React, { useState } from 'react';
import { searchData, getData } from '../services/storage';

/**
 * 搜索栏组件 - 允许用户搜索已保存的数据并显示结果
 * @param {Object} props - 组件属性
 * @param {Function} props.onSearchResults - 搜索结果回调函数
 * @param {Array} props.searchResults - 当前搜索结果
 * @param {number} props.refreshKey - 刷新键
 */
const SearchBar = ({ onSearchResults, searchResults, refreshKey }) => {
  // 管理搜索查询状态
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // 获取要显示的数据
  const dataToDisplay = searchResults || getData();
  
  /**
   * 处理搜索表单提交
   */
  const handleSearch = (e) => {
    e.preventDefault(); // 阻止表单默认提交行为
    
    setIsSearching(true);
    
    // 模拟网络延迟，显示搜索状态
    setTimeout(() => {
      // 执行搜索并通过回调函数返回结果
      const results = searchData(query);
      onSearchResults(results);
      setIsSearching(false);
    }, 300);
  };
  
  /**
   * 清除搜索结果
   */
  const handleClear = () => {
    // 清空搜索框
    setQuery('');
    // 清除搜索结果（传递null表示显示所有数据）
    onSearchResults(null);
  };
  
  return (
    <div className="search-container">
      <form onSubmit={handleSearch} className="search-form">
        <input 
          type="text" 
          placeholder="搜索记录..." 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
        />
        <div className="search-buttons">
          <button type="submit" disabled={isSearching}>
            {isSearching ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> 搜索中...
              </>
            ) : (
              <>
                <i className="fas fa-search"></i> 搜索
              </>
            )}
          </button>
          <button 
            type="button" 
            onClick={handleClear} 
            className="clear-button"
          >
            <i className="fas fa-times"></i> 清除
          </button>
        </div>
      </form>
      
      {/* 搜索结果显示 */}
      <div className="search-results">
        {/* 如果有搜索结果则显示结果数量 */}
        {searchResults && (
          <div className="results-info">
            找到 {searchResults.length} 条匹配记录
          </div>
        )}
        
        {/* 如果没有数据则显示提示信息 */}
        {dataToDisplay.length === 0 ? (
          <div className="no-data">
            <i className="fas fa-info-circle"></i>
            <p>没有找到记录</p>
          </div>
        ) : (
          // 否则显示数据列表
          <div className="data-items">
            {/* 遍历所有数据项并显示 */}
            {dataToDisplay.map(item => (
              <div key={item.id} className="data-item">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                
                {/* 如果有图片则显示 */}
                {item.image && (
                  <div className="item-image">
                    <img src={item.image} alt={item.title} />
                  </div>
                )}
                
                {/* 如果有音频则显示播放控件 */}
                {item.audio && (
                  <div className="item-audio">
                    <audio controls src={item.audio} />
                  </div>
                )}
                
                {/* 显示时间戳 */}
                <div className="item-timestamp">
                  <i className="far fa-clock"></i> {new Date(item.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
