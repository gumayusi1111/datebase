import React from 'react';
import { getData } from '../services/storage';

/**
 * 数据列表组件 - 显示所有保存的数据或搜索结果
 * @param {Object} props - 组件属性
 * @param {Array} props.searchResults - 搜索结果（如果有）
 */
const DataList = ({ searchResults }) => {
  // 如果有搜索结果则显示搜索结果，否则显示所有数据
  const dataToDisplay = searchResults || getData();
  
  return (
    <div className="data-list-container">
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
  );
};

export default DataList;
