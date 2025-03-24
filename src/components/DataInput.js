import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid'; // 用于生成唯一ID
import { saveData } from '../services/storage';

/**
 * 数据输入组件 - 允许用户添加新的数据记录
 * @param {Object} props - 组件属性
 * @param {Function} props.onDataAdded - 数据添加后的回调函数
 */
const DataInput = ({ onDataAdded }) => {
  // 使用useState钩子管理表单状态
  const [title, setTitle] = useState(''); // 标题
  const [text, setText] = useState('');   // 文本内容
  const [image, setImage] = useState(null); // 图片（Base64格式）
  const [audio, setAudio] = useState(null); // 音频（Base64格式）
  const [isSubmitting, setIsSubmitting] = useState(false); // 提交状态
  const [imageFileName, setImageFileName] = useState(''); // 图片文件名
  const [audioFileName, setAudioFileName] = useState(''); // 音频文件名

  /**
   * 处理图片文件选择
   * 将图片转换为Base64格式以便存储
   */
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFileName(file.name);
      
      const reader = new FileReader();
      // 文件读取完成后的回调
      reader.onloadend = () => {
        setImage(reader.result); // 设置Base64编码的图片
      };
      // 开始读取文件
      reader.readAsDataURL(file);
    }
  };

  /**
   * 处理音频文件选择
   * 将音频转换为Base64格式以便存储
   */
  const handleAudioChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioFileName(file.name);
      
      const reader = new FileReader();
      // 文件读取完成后的回调
      reader.onloadend = () => {
        setAudio(reader.result); // 设置Base64编码的音频
      };
      // 开始读取文件
      reader.readAsDataURL(file);
    }
  };

  /**
   * 清除已选择的图片
   */
  const clearImage = () => {
    setImage(null);
    setImageFileName('');
  };

  /**
   * 清除已选择的音频
   */
  const clearAudio = () => {
    setAudio(null);
    setAudioFileName('');
  };

  /**
   * 处理表单提交
   * 保存数据并重置表单
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // 阻止表单默认提交行为
    
    setIsSubmitting(true); // 设置提交状态
    
    // 创建新的数据项
    const newItem = {
      id: uuidv4(), // 生成唯一ID
      title,
      text,
      image,
      audio,
      timestamp: new Date().toISOString() // 记录当前时间
    };
    
    // 保存数据
    saveData(newItem);
    
    // 模拟网络延迟，显示提交状态
    setTimeout(() => {
      // 重置表单
      setTitle('');
      setText('');
      setImage(null);
      setImageFileName('');
      setAudio(null);
      setAudioFileName('');
      setIsSubmitting(false);
      
      // 通知父组件数据已添加
      if (onDataAdded) onDataAdded();
    }, 500);
  };

  // 渲染表单
  return (
    <div className="data-input-container">
      <h2 className="section-title">
        <i className="fas fa-plus-circle"></i> 添加新记录
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">
            <i className="fas fa-heading"></i> 标题
          </label>
          <input 
            id="title"
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="输入记录标题..."
            required 
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="content">
            <i className="fas fa-align-left"></i> 内容
          </label>
          <textarea 
            id="content"
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            placeholder="输入记录内容..."
            required 
          />
        </div>
        
        <div className="form-group">
          <label>
            <i className="fas fa-image"></i> 图片 (可选)
          </label>
          <div className="file-input-container">
            <div className="file-input-wrapper">
              <label className="file-input-label">
                <i className="fas fa-upload"></i> 选择图片
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                />
              </label>
              {imageFileName && (
                <div className="file-status">
                  <span>{imageFileName}</span>
                  <button 
                    type="button" 
                    onClick={clearImage}
                    style={{
                      backgroundColor: 'transparent', 
                      color: '#dc3545',
                      padding: '5px',
                      marginLeft: '10px'
                    }}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              )}
            </div>
            
            {/* 如果有图片则显示预览 */}
            {image && (
              <div className="preview-container">
                <div className="image-preview">
                  <img src={image} alt="预览" />
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="form-group">
          <label>
            <i className="fas fa-microphone"></i> 语音 (可选)
          </label>
          <div className="file-input-container">
            <div className="file-input-wrapper">
              <label className="file-input-label">
                <i className="fas fa-upload"></i> 选择音频
                <input 
                  type="file" 
                  accept="audio/*" 
                  onChange={handleAudioChange} 
                />
              </label>
              {audioFileName && (
                <div className="file-status">
                  <span>{audioFileName}</span>
                  <button 
                    type="button" 
                    onClick={clearAudio}
                    style={{
                      backgroundColor: 'transparent', 
                      color: '#dc3545',
                      padding: '5px',
                      marginLeft: '10px'
                    }}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              )}
            </div>
            
            {/* 如果有音频则显示播放控件 */}
            {audio && (
              <div className="preview-container">
                <div className="audio-preview">
                  <audio controls src={audio} />
                </div>
              </div>
            )}
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="submit-button"
        >
          {isSubmitting ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> 保存中...
            </>
          ) : (
            <>
              <i className="fas fa-save"></i> 保存记录
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default DataInput;
