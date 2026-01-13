// pages/order/detail/detail.js
const app = getApp();
const { getOrderById, updateOrder, addOrder, getRecipeById } = require('../../../utils/storage');
const { formatDate, showToast, generateId } = require('../../../utils/util');

Page({
  data: {
    orderId: null,
    recipeId: null,
    isCreateMode: false,
    order: null,
    isAdmin: false,
    showCreateModal: false,
    remark: ''
  },

  onLoad(options) {
    if (options.action === 'create' && options.recipeId) {
      // 创建订单模式
      this.setData({
        isCreateMode: true,
        recipeId: options.recipeId
      });
      this.initCreateOrder();
    } else if (options.id) {
      // 查看订单模式
      this.setData({
        orderId: options.id
      });
      this.loadOrder();
    } else {
      showToast('参数错误');
      wx.navigateBack();
    }

    this.checkAdmin();
  },

  // 检查管理员权限
  checkAdmin() {
    const isAdmin = app.checkIsAdmin();
    this.setData({
      isAdmin
    });
  },

  // 初始化创建订单
  initCreateOrder() {
    const recipe = getRecipeById(this.data.recipeId);
    if (!recipe) {
      showToast('菜谱不存在');
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }

    const order = {
      items: [
        {
          id: generateId(),
          recipeId: recipe.id,
          name: recipe.name || '未知菜品',
          quantity: 1
        }
      ],
      status: 'pending',
      statusText: '待处理',
      createTime: formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
      customerName: (app.globalData.userInfo && app.globalData.userInfo.nickName) ? app.globalData.userInfo.nickName : '匿名用户'
    };

    this.setData({
      order
    });
  },

  // 加载订单
  loadOrder() {
    const order = getOrderById(this.data.orderId);
    if (!order) {
      showToast('订单不存在');
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }

    const statusMap = {
      pending: '待处理',
      preparing: '制作中',
      ready: '已完成'
    };

    // 确保订单数据完整性
    const orderData = {
      ...order,
      statusText: statusMap[order.status] || '未知',
      createTime: order.createTime ? formatDate(order.createTime, 'YYYY-MM-DD HH:mm:ss') : '',
      completeTime: order.completeTime ? formatDate(order.completeTime, 'YYYY-MM-DD HH:mm:ss') : '',
      items: order.items || [],
      customerName: order.customerName || '匿名用户',
      remark: order.remark || ''
    };

    this.setData({
      order: orderData
    });
  },

  // 备注输入
  onRemarkInput(e) {
    this.setData({
      remark: e.detail.value
    });
  },

  // 创建订单
  createOrder() {
    this.setData({
      showCreateModal: true
    });
  },

  // 确认创建订单
  confirmCreateOrder() {
    if (!this.data.order || !this.data.order.items || this.data.order.items.length === 0) {
      showToast('订单信息不完整');
      return;
    }

    const order = {
      id: generateId(),
      orderNo: 'ORD' + Date.now(),
      items: this.data.order.items.map(item => ({
        id: item.id || generateId(),
        recipeId: item.recipeId || '',
        name: item.name || '未知菜品',
        quantity: item.quantity || 1
      })),
      status: 'pending',
      createTime: new Date().toISOString(),
      customerName: (app.globalData.userInfo && app.globalData.userInfo.nickName) ? app.globalData.userInfo.nickName : '匿名用户',
      remark: this.data.remark.trim() || null,
      kitchenId: (app.globalData.currentKitchen && app.globalData.currentKitchen.id) ? app.globalData.currentKitchen.id : null
    };

    try {
      addOrder(order);
      showToast('下单成功', 'success');

      // 检查是否开启通知
      const notificationEnabled = wx.getStorageSync('notificationEnabled') !== false;
      if (notificationEnabled) {
        // 这里可以添加通知逻辑，比如发送模板消息
        console.log('订单通知：', order);
      }

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      console.error('创建订单失败：', err);
      showToast('创建订单失败，请重试');
    }
  },

  // 查看菜谱
  viewRecipe(e) {
    const recipeId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/recipe/detail/detail?id=${recipeId}`
    });
  },

  // 接单
  acceptOrder() {
    updateOrder(this.data.orderId, { status: 'preparing' });
    showToast('接单成功', 'success');
    this.loadOrder();
  },

  // 完成订单
  completeOrder() {
    updateOrder(this.data.orderId, {
      status: 'ready',
      completeTime: new Date().toISOString()
    });
    showToast('订单已完成', 'success');
    this.loadOrder();
  },

  // 关闭弹窗
  closeModal() {
    this.setData({
      showCreateModal: false
    });
  },

  // 阻止事件冒泡
  stopPropagation() {}
});
