import React, { useState, useRef, useEffect } from 'react';
import { saveData } from '../services/storage';
import { getCurrentUser } from '../services/auth';
import { v4 as uuidv4 } from 'uuid'; // 需要安装: npm install uuid
import { getTagStats, updateTagStats } from '../services/tagService';

/**
 * 数据输入组件 - 允许用户添加新的数据记录
 * @param {Object} props - 组件属性
 * @param {Function} props.onDataAdded - 数据添加成功后的回调函数
 */
const DataInput = ({ onDataAdded }) => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [tags, setTags] = useState([]);
  const [customTag, setCustomTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [imagePreview, setImagePreview] = useState(null);
  const [audioRecording, setAudioRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [location, setLocation] = useState(null);
  
  // 预设标签列表 - 现在是动态的，基于使用频率
  const [presetTags, setPresetTags] = useState(['学习', '工作', '生活', '旅游', '健康', '娱乐', '美食', '技术']);
  
  const imageInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  
  // 加载标签统计数据
  useEffect(() => {
    const loadTagStats = async () => {
      try {
        const stats = await getTagStats();
        if (stats && Object.keys(stats).length > 0) {
          // 根据使用频率排序标签
          const sortedTags = Object.entries(stats)
            .sort((a, b) => b[1] - a[1])
            .map(entry => entry[0]);
          
          // 合并排序后的标签和默认标签
          const defaultTags = ['学习', '工作', '生活', '旅游', '健康', '娱乐', '美食', '技术'];
          const mergedTags = [...sortedTags];
          
          // 添加默认标签中不在排序列表中的标签
          defaultTags.forEach(tag => {
            if (!mergedTags.includes(tag)) {
              mergedTags.push(tag);
            }
          });
          
          // 限制显示的标签数量
          setPresetTags(mergedTags.slice(0, 12));
        }
      } catch (error) {
        console.error('加载标签统计失败:', error);
      }
    };
    
    loadTagStats();
  }, []);
  
  // 获取当前位置
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          
          // 尝试获取位置名称
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`)
            .then(response => response.json())
            .then(data => {
              if (data.display_name) {
                setLocation(prev => ({
                  ...prev,
                  name: data.display_name.split(',').slice(0, 3).join(',')
                }));
              }
            })
            .catch(error => console.error('获取位置名称失败:', error));
        },
        (error) => {
          console.error('获取位置失败:', error);
        }
      );
    }
  }, []);
  
  // 检查登录状态
  useEffect(() => {
    const user = getCurrentUser();
    console.log('当前登录用户:', user);
    if (!user) {
      setMessage({ text: '请先登录后再添加记录', type: 'error' });
    }
  }, []);
  
  // 处理图片选择
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setMessage({ text: '请选择图片文件', type: 'error' });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };
  
  // 开始录音
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioRecording({
          blob: audioBlob,
          url: audioUrl
        });
        
        // 尝试进行语音识别
        if ('webkitSpeechRecognition' in window) {
          const recognition = new window.webkitSpeechRecognition();
          recognition.lang = 'zh-CN';
          recognition.continuous = true;
          recognition.interimResults = false;
          
          recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
              .map(result => result[0].transcript)
              .join('');
            setTranscript(transcript);
            setText(prev => prev + ' ' + transcript);
          };
          
          recognition.onerror = (event) => {
            console.error('语音识别错误:', event.error);
          };
          
          recognition.start();
        }
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // 开始计时
      let seconds = 0;
      timerRef.current = setInterval(() => {
        seconds++;
        setRecordingTime(seconds);
      }, 1000);
      
    } catch (error) {
      console.error('录音失败:', error);
      setMessage({ text: '无法访问麦克风', type: 'error' });
    }
  };
  
  // 停止录音
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      
      // 停止计时
      clearInterval(timerRef.current);
    }
  };
  
  // 格式化录音时间
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // 清除图片
  const clearImage = () => {
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };
  
  // 清除录音
  const clearAudio = () => {
    setAudioRecording(null);
    setTranscript('');
  };
  
  // 添加标签
  const addTag = (tag) => {
    if (!tags.includes(tag) && tag.trim() !== '') {
      setTags([...tags, tag]);
      
      // 如果是新标签且不在预设列表中，添加到预设列表
      if (!presetTags.includes(tag)) {
        setPresetTags(prev => [tag, ...prev.slice(0, 11)]);
      }
    }
  };
  
  // 移除标签
  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // 处理自定义标签输入
  const handleCustomTagChange = (e) => {
    setCustomTag(e.target.value);
  };
  
  // 添加自定义标签
  const handleAddCustomTag = () => {
    if (customTag.trim() && !tags.includes(customTag.trim())) {
      addTag(customTag.trim());
      setCustomTag('');
    }
  };
  
  // 处理自定义标签输入的回车键
  const handleCustomTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomTag();
    }
  };
  
  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setMessage({ text: '请输入标题', type: 'error' });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const user = getCurrentUser();
      console.log('提交表单时的用户:', user);
      
      if (!user) {
        setIsSubmitting(false);
        setMessage({ text: '请先登录', type: 'error' });
        return;
      }
      
      console.log('准备保存数据，标签:', tags);
      
      // 创建新数据项
      const newItem = {
        id: uuidv4(),
        title,
        text,
        tags,
        timestamp: Date.now(),
        user: user.username,
        media: []
      };
      
      // 添加位置信息
      if (location) {
        newItem.location = location;
      }
      
      // 添加图片
      if (imagePreview) {
        newItem.media.push({
          type: 'image',
          url: imagePreview
        });
      }
      
      // 添加音频
      if (audioRecording) {
        newItem.media.push({
          type: 'audio',
          url: audioRecording.url,
          blob: audioRecording.blob,
          transcript
        });
      }
      
      // 保存数据
      await saveData(newItem);
      
      // 更新标签使用统计
      if (tags.length > 0) {
        console.log('更新标签统计:', tags);
        await updateTagStats(tags);
        
        // 重新加载标签统计
        const stats = await getTagStats();
        console.log('获取到的标签统计:', stats);
        if (stats) {
          const sortedTags = Object.entries(stats)
            .sort((a, b) => b[1] - a[1])
            .map(entry => entry[0]);
          
          console.log('排序后的标签:', sortedTags);
          
          // 限制显示的标签数量
          setPresetTags(sortedTags.slice(0, 12));
        }
      }
      
      // 更新成功消息
      setMessage({
        text: '记录保存成功！',
        type: 'success'
      });
      
      // 重置表单
      setTitle('');
      setText('');
      setTags([]);
      setCustomTag('');
      clearImage();
      clearAudio();
      
      // 通知父组件
      if (onDataAdded) {
        onDataAdded(newItem);
      }
      
      // 3秒后自动清除成功消息
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 3000);
    } catch (error) {
      console.error('保存失败:', error);
      setMessage({
        text: '保存失败，请稍后再试',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="data-input-container">
      <h2 className="section-title">
        <i className="fas fa-edit"></i> 添加新记录
      </h2>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          <i className={`fas fa-${message.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
          {message.text}
        </div>
      )}
      
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
            placeholder="输入记录标题"
            disabled={isSubmitting}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="text">
            <i className="fas fa-align-left"></i> 内容
          </label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="输入详细内容"
            disabled={isSubmitting}
            rows={6}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="tags">
            <i className="fas fa-tags"></i> 标签
          </label>
          
          <div className="tags-container">
            <div className="preset-tags">
              {presetTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  className={`tag-button ${tags.includes(tag) ? 'active' : ''}`}
                  onClick={() => tags.includes(tag) ? removeTag(tag) : addTag(tag)}
                  disabled={isSubmitting}
                >
                  {tag}
                </button>
              ))}
            </div>
            
            <div className="custom-tag-input">
              <input
                type="text"
                value={customTag}
                onChange={handleCustomTagChange}
                onKeyDown={handleCustomTagKeyDown}
                placeholder="添加自定义标签"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                disabled={!customTag.trim() || isSubmitting}
                className="add-tag-button"
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>
            
            {tags.length > 0 && (
              <div className="selected-tags">
                {tags.map(tag => (
                  <span key={tag} className="tag">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="remove-tag"
                      disabled={isSubmitting}
                      aria-label={`删除标签 ${tag}`}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="media-section">
          <div className="media-controls">
            <div className="media-control">
              <label htmlFor="image-upload" className="media-label">
                <i className="fas fa-image"></i> 图片
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isSubmitting}
                ref={imageInputRef}
                className="file-input"
              />
              <button
                type="button"
                className="media-button"
                onClick={() => imageInputRef.current.click()}
                disabled={isSubmitting}
              >
                <i className="fas fa-upload"></i> 选择图片
              </button>
            </div>
            
            <div className="media-control">
              <label className="media-label">
                <i className="fas fa-microphone"></i> 录音
              </label>
              {!isRecording ? (
                <button
                  type="button"
                  className="media-button"
                  onClick={startRecording}
                  disabled={isSubmitting || audioRecording}
                >
                  <i className="fas fa-microphone"></i> 开始录音
                </button>
              ) : (
                <button
                  type="button"
                  className="media-button recording"
                  onClick={stopRecording}
                  disabled={isSubmitting}
                >
                  <i className="fas fa-stop"></i> 停止录音 ({formatTime(recordingTime)})
                </button>
              )}
            </div>
          </div>
          
          <div className="media-previews">
            {imagePreview && (
              <div className="media-preview image-preview">
                <img src={imagePreview} alt="预览" />
                <button
                  type="button"
                  className="clear-media"
                  onClick={clearImage}
                  disabled={isSubmitting}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}
            
            {audioRecording && (
              <div className="media-preview audio-preview">
                <audio src={audioRecording.url} controls></audio>
                {transcript && (
                  <div className="transcript">
                    <p><strong>语音识别结果:</strong></p>
                    <p>{transcript}</p>
                  </div>
                )}
                <button
                  type="button"
                  className="clear-media"
                  onClick={clearAudio}
                  disabled={isSubmitting}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}
          </div>
        </div>
        
        {location && location.name && (
          <div className="location-info">
            <i className="fas fa-map-marker-alt"></i> 当前位置: {location.name}
          </div>
        )}
        
        <div className="form-actions">
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
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
        </div>
      </form>
    </div>
  );
};

export default DataInput;
