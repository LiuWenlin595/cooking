// pages/profile/profile.js
const app = getApp();
const { getRecipes, getOrders, getIngredients, getMealPlans } = require('../../utils/storage');
const { showToast, showModal, exportData } = require('../../utils/util');

Page({
  data: {
    userInfo: null,
    isAdmin: false,
    stats: {
      recipeCount: 0,
      orderCount: 0,
      ingredientCount: 0,
      planCount: 0
    }
  },

  onLoad() {
    this.loadUserInfo();
    this.checkAdmin();
    this.loadStats();
  },

  onShow() {
    this.loadStats();
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo');
    this.setData({
      userInfo: userInfo || {}
    });
  },

  // 检查管理员权限
  checkAdmin() {
    const isAdmin = app.checkIsAdmin();
    this.setData({
      isAdmin
    });
  },

  // 加载统计信息
  loadStats() {
    const recipes = getRecipes();
    const orders = getOrders();
    const ingredients = getIngredients();
    const mealPlans = getMealPlans();

    this.setData({
      stats: {
        recipeCount: recipes.length,
        orderCount: orders.length,
        ingredientCount: ingredients.length,
        planCount: mealPlans.length
      }
    });
  },

  // 跳转到店铺管理
  goToShop() {
    wx.navigateTo({
      url: '/pages/shop/shop'
    });
  },

  // 导出数据
  exportData() {
    const recipes = getRecipes();
    const orders = getOrders();
    const ingredients = getIngredients();
    const mealPlans = getMealPlans();
    const shopInfo = app.globalData.shopInfo;

    const data = {
      shopInfo,
      recipes,
      orders,
      ingredients,
      mealPlans,
      exportTime: new Date().toISOString()
    };

    exportData(data, 'cooking-app-data.json');
  },

  // 导入数据
  async importData() {
    const confirmed = await showModal('导入数据', '导入数据将覆盖现有数据，确定要继续吗？');
    if (!confirmed) return;

    // 在小程序中，可以通过剪贴板导入
    wx.getClipboardData({
      success: (res) => {
        try {
          const data = JSON.parse(res.data);
          
          if (data.shopInfo) {
            app.updateShopInfo(data.shopInfo);
          }
          if (data.recipes) {
            wx.setStorageSync('recipes', data.recipes);
          }
          if (data.orders) {
            wx.setStorageSync('orders', data.orders);
          }
          if (data.ingredients) {
            wx.setStorageSync('ingredients', data.ingredients);
          }
          if (data.mealPlans) {
            wx.setStorageSync('mealPlans', data.mealPlans);
          }

          showToast('导入成功', 'success');
          this.loadStats();
        } catch (err) {
          showToast('数据格式错误');
        }
      },
      fail: () => {
        showToast('读取剪贴板失败');
      }
    });
  },

  // 清空数据
  async clearData() {
    const confirmed = await showModal('确认清空', '清空数据将删除所有菜谱、订单、食材和计划，此操作不可恢复，确定要继续吗？');
    if (!confirmed) return;

    wx.setStorageSync('recipes', []);
    wx.setStorageSync('orders', []);
    wx.setStorageSync('ingredients', []);
    wx.setStorageSync('mealPlans', []);

    showToast('数据已清空', 'success');
    this.loadStats();
  },

  // 分享小程序
  shareApp() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
    showToast('请点击右上角分享');
  }
});
