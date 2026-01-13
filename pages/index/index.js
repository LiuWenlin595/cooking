// pages/index/index.js
const app = getApp();
const { getRecipes, getOrders, getIngredients } = require('../../utils/storage');
const { formatDate, matchRecipesByIngredients } = require('../../utils/util');

Page({
  data: {
    shopInfo: null,
    currentKitchen: null,
    recommendedRecipes: [],
    recentOrders: [],
    availableRecipes: []
  },

  onLoad() {
    this.loadShopInfo();
    this.loadRecommendedRecipes();
    this.loadRecentOrders();
    this.loadAvailableRecipes();
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.loadShopInfo();
    this.loadRecentOrders();
    this.loadAvailableRecipes();
  },

  // 加载店铺信息
  loadShopInfo() {
    const shopInfo = app.globalData.shopInfo;
    const currentKitchen = app.globalData.currentKitchen;
    this.setData({
      shopInfo,
      currentKitchen
    });
  },

  // 加载推荐菜谱
  loadRecommendedRecipes() {
    const recipes = getRecipes();
    // 推荐必点菜或前6个菜谱
    const recommended = recipes
      .filter(r => r.isRequired)
      .slice(0, 6);
    
    // 如果必点菜不足6个，补充其他菜谱
    if (recommended.length < 6) {
      const others = recipes
        .filter(r => !r.isRequired)
        .slice(0, 6 - recommended.length);
      recommended.push(...others);
    }

    this.setData({
      recommendedRecipes: recommended.slice(0, 6)
    });
  },

  // 加载最近订单
  loadRecentOrders() {
    const orders = getOrders();
    // 按时间倒序排序
    const sortedOrders = [...orders].sort((a, b) => {
      const timeA = new Date(a.createTime).getTime();
      const timeB = new Date(b.createTime).getTime();
      return timeB - timeA; // 倒序
    });
    
    const recent = sortedOrders.slice(0, 5).map(order => {
      const statusMap = {
        pending: '待处理',
        preparing: '制作中',
        ready: '已完成'
      };
      return {
        ...order,
        statusText: statusMap[order.status] || '未知',
        createTime: formatDate(order.createTime, 'MM-DD HH:mm')
      };
    });
    this.setData({
      recentOrders: recent
    });
  },

  // 加载可做菜谱
  loadAvailableRecipes() {
    const recipes = getRecipes();
    const ingredients = getIngredients();
    const available = matchRecipesByIngredients(recipes, ingredients);
    this.setData({
      availableRecipes: available.slice(0, 6)
    });
  },

  // 查看菜谱详情
  viewRecipe(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/recipe/detail/detail?id=${id}`
    });
  },

  // 查看订单详情
  viewOrder(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/order/detail/detail?id=${id}`
    });
  },

  // 跳转到点菜页面
  goToOrder() {
    wx.switchTab({
      url: '/pages/recipe/list/list'
    });
  },

  // 跳转到菜谱列表
  goToRecipeList() {
    wx.switchTab({
      url: '/pages/recipe/list/list'
    });
  },

  // 跳转到食材管理
  goToIngredient() {
    wx.navigateTo({
      url: '/pages/ingredient/ingredient'
    });
  },

  // 跳转到饮食计划
  goToMealPlan() {
    wx.navigateTo({
      url: '/pages/mealplan/mealplan'
    });
  },

  // 跳转到订单列表
  goToOrderList() {
    wx.switchTab({
      url: '/pages/order/list/list'
    });
  }
});
