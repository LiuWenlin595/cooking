// pages/order/list/list.js
const app = getApp();
const { getOrders, updateOrder } = require('../../../utils/storage');
const { formatDate, showToast } = require('../../../utils/util');

Page({
  data: {
    orders: [],
    filteredOrders: [],
    currentStatus: '',
    statusList: [
      { label: '待处理', value: 'pending' },
      { label: '制作中', value: 'preparing' },
      { label: '已完成', value: 'ready' }
    ],
    isAdmin: false
  },

  onLoad() {
    this.checkAdmin();
    this.loadOrders();
  },

  onShow() {
    // 每次显示时刷新订单列表
    this.loadOrders();
  },

  // 检查管理员权限
  checkAdmin() {
    const isAdmin = app.checkIsAdmin();
    this.setData({
      isAdmin
    });
  },

  // 加载订单
  loadOrders() {
    const orders = getOrders();
    const statusMap = {
      pending: '待处理',
      preparing: '制作中',
      ready: '已完成'
    };

    // 先按原始时间排序（使用 ISO 字符串）
    orders.sort((a, b) => {
      const timeA = new Date(a.createTime).getTime();
      const timeB = new Date(b.createTime).getTime();
      return timeB - timeA; // 倒序
    });

    const formattedOrders = orders.map(order => ({
      ...order,
      statusText: statusMap[order.status] || '未知',
      createTime: formatDate(order.createTime, 'MM-DD HH:mm'),
      totalQuantity: order.items.reduce((sum, item) => sum + (item.quantity || 0), 0)
    }));

    this.setData({
      orders: formattedOrders,
      filteredOrders: formattedOrders
    });

    // 如果有状态筛选，重新筛选
    if (this.data.currentStatus) {
      this.filterOrders();
    }
  },

  // 状态筛选
  filterByStatus(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({
      currentStatus: status
    });
    this.filterOrders();
  },

  // 筛选订单
  filterOrders() {
    let filtered = [...this.data.orders];
    
    if (this.data.currentStatus) {
      filtered = filtered.filter(order => order.status === this.data.currentStatus);
    }
    
    this.setData({
      filteredOrders: filtered
    });
  },

  // 查看订单详情
  viewOrder(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/order/detail/detail?id=${id}`
    });
  },

  // 接单
  acceptOrder(e) {
    const id = e.currentTarget.dataset.id;
    updateOrder(id, { status: 'preparing' });
    showToast('接单成功', 'success');
    this.loadOrders();
  },

  // 完成订单（出餐）
  completeOrder(e) {
    const id = e.currentTarget.dataset.id;
    updateOrder(id, { 
      status: 'ready',
      completeTime: new Date().toISOString()
    });
    showToast('订单已完成', 'success');
    this.loadOrders();
  }
});
