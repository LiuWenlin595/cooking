// utils/constants.js
// 公共常量与映射表

// 订单状态映射
const STATUS_MAP = {
  pending: '待处理',
  preparing: '制作中',
  ready: '已完成'
};

// 菜谱分类默认列表
const DEFAULT_CATEGORIES = [
  '家常菜',
  '川菜',
  '粤菜',
  '湘菜',
  '鲁菜',
  '苏菜',
  '浙菜',
  '闽菜',
  '徽菜',
  '汤品',
  '甜品',
  '小吃',
  '其他'
];

// 菜谱难度列表
const DIFFICULTIES = ['简单', '中等', '困难'];

// 根据状态获取状态文案
const getStatusText = (status) => STATUS_MAP[status] || '未知';

module.exports = {
  STATUS_MAP,
  DEFAULT_CATEGORIES,
  DIFFICULTIES,
  getStatusText
};
