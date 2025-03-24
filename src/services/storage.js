// 使用localStorage存储数据
// localStorage是浏览器提供的简单存储机制，可以在用户浏览器中保存数据

/**
 * 保存一条新数据到本地存储
 * @param {Object} item - 要保存的数据项
 */
const saveData = (item) => {
  // 获取现有数据
  const existingData = getData();
  // 添加新数据
  existingData.push(item);
  // 保存回localStorage
  localStorage.setItem('personalData', JSON.stringify(existingData));
};

/**
 * 从本地存储获取所有数据
 * @returns {Array} 所有存储的数据项
 */
const getData = () => {
  // 从localStorage获取数据
  const data = localStorage.getItem('personalData');
  // 如果有数据则解析JSON，否则返回空数组
  return data ? JSON.parse(data) : [];
};

/**
 * 根据查询字符串搜索数据
 * @param {string} query - 搜索查询
 * @returns {Array} 匹配的数据项
 */
const searchData = (query) => {
  // 获取所有数据
  const data = getData();
  // 过滤出包含查询字符串的数据项
  return data.filter(item => 
    item.text.toLowerCase().includes(query.toLowerCase()) ||
    item.title.toLowerCase().includes(query.toLowerCase())
  );
};

// 导出这些函数以便其他组件使用
export { saveData, getData, searchData };
