// 使用localStorage存储数据
// localStorage是浏览器提供的简单存储机制，可以在用户浏览器中保存数据

import { fetchData, saveData as apiSaveData, searchData as apiSearchData } from './api';

// 本地缓存
let cachedData = null;

/**
 * 保存一条新数据
 * @param {Object} item - 要保存的数据项
 * @returns {Promise} - 保存操作的Promise
 */
const saveData = async (item) => {
  // 处理媒体文件
  const formData = new FormData();
  
  // 添加基本字段
  formData.append('id', item.id);
  formData.append('title', item.title);
  formData.append('text', item.text);
  
  // 添加标签 - 确保正确转换为JSON字符串
  if (item.tags && item.tags.length > 0) {
    console.log('保存标签:', item.tags);
    formData.append('tags', JSON.stringify(item.tags));
  }
  
  // 添加位置信息
  if (item.location) {
    formData.append('location', JSON.stringify(item.location));
  }
  
  // 处理媒体文件
  if (item.media && item.media.length > 0) {
    item.media.forEach((media, index) => {
      if (media.type === 'image' && media.url.startsWith('data:')) {
        // 将Base64图片转换为文件
        const file = dataURLtoFile(media.url, `image-${Date.now()}-${index}.jpg`);
        formData.append('image', file);
      } else if (media.type === 'audio' && media.url && media.blob) {
        // 添加音频文件
        const audioFile = new File([media.blob], `audio-${Date.now()}-${index}.wav`, { type: 'audio/wav' });
        formData.append('audio', audioFile);
        
        // 添加转写文本
        if (media.transcript) {
          formData.append('transcript', media.transcript);
        }
      }
    });
  }
  
  console.log('发送数据到服务器...');
  // 发送到服务器
  const result = await apiSaveData(formData);
  console.log('服务器响应:', result);
  
  // 清除缓存，强制下次重新获取
  cachedData = null;
  
  return result;
};

/**
 * 获取所有数据
 * @returns {Promise<Array>} - 包含所有数据项的Promise
 */
const getData = async () => {
  if (!cachedData) {
    cachedData = await fetchData();
  }
  return cachedData;
};

/**
 * 搜索数据
 * @param {string} query - 搜索查询
 * @returns {Promise<Array>} - 匹配的数据项
 */
const searchData = async (query) => {
  return apiSearchData(query);
};

// 辅助函数：将Base64数据URL转换为文件
const dataURLtoFile = (dataurl, filename) => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
};

// 导出这些函数以便其他组件使用
export { saveData, getData, searchData };
