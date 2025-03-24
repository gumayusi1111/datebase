// 使用localStorage存储数据
// localStorage是浏览器提供的简单存储机制，可以在用户浏览器中保存数据

import { fetchData, saveData as apiSaveData, searchData as apiSearchData } from './api';

// 本地缓存
let cachedData = null;

/**
 * 保存一条新数据
 * @param {Object} item - 要保存的数据项
 */
const saveData = async (item) => {
  await apiSaveData(item);
  // 清除缓存，强制下次获取最新数据
  cachedData = null;
};

/**
 * 获取所有存储的数据
 * @returns {Array} 所有存储的数据项
 */
const getData = async () => {
  if (!cachedData) {
    cachedData = await fetchData();
  }
  return cachedData;
};

/**
 * 搜索数据
 * @param {string} query - 搜索查询字符串
 * @returns {Array} 匹配的数据项
 */
const searchData = async (query) => {
  return apiSearchData(query);
};

// 导出这些函数以便其他组件使用
export { saveData, getData, searchData };
