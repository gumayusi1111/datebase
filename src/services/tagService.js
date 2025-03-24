import { fetchTagStats } from './api';
import { getCurrentUser } from './auth';

// 标签统计的本地存储键
const TAG_STATS_KEY = 'tag_stats';

/**
 * 获取标签使用统计
 * @returns {Object} 标签使用频率统计
 */
export const getTagStats = async () => {
  try {
    // 尝试从后端获取标签统计
    const stats = await fetchTagStats();
    return stats;
  } catch (error) {
    console.error('从后端获取标签统计失败，使用本地存储:', error);
    
    // 如果后端获取失败，使用本地存储的备份
    const user = getCurrentUser();
    if (!user) return {};
    
    const statsKey = `${TAG_STATS_KEY}_${user.username}`;
    const statsJson = localStorage.getItem(statsKey);
    
    // 如果本地存储也没有数据，返回空对象
    return statsJson ? JSON.parse(statsJson) : {};
  }
};

/**
 * 更新标签使用统计
 * @param {Array} tags - 使用的标签数组
 */
export const updateTagStats = async (tags) => {
  try {
    const user = getCurrentUser();
    if (!user) return;
    
    // 本地备份
    const statsKey = `${TAG_STATS_KEY}_${user.username}`;
    const stats = await getTagStats();
    
    // 更新每个标签的使用次数
    tags.forEach(tag => {
      stats[tag] = (stats[tag] || 0) + 1;
    });
    
    // 保存更新后的统计到本地存储
    localStorage.setItem(statsKey, JSON.stringify(stats));
    
    // 后端会在保存数据时自动更新标签统计
  } catch (error) {
    console.error('更新标签统计失败:', error);
  }
};

/**
 * 重置标签统计
 */
export const resetTagStats = async () => {
  try {
    const user = getCurrentUser();
    if (!user) return;
    
    const statsKey = `${TAG_STATS_KEY}_${user.username}`;
    localStorage.removeItem(statsKey);
  } catch (error) {
    console.error('重置标签统计失败:', error);
  }
}; 