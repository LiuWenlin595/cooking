// app.js
App({
  globalData: {
    userInfo: null,
    shopInfo: null,
    currentKitchen: null,
    isAdmin: false
  },

  onLaunch() {
    // 初始化本地存储数据
    this.initLocalData();
    // 尝试从本地存储加载用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.globalData.userInfo = userInfo;
    }
  },

  // 初始化本地数据
  initLocalData() {
    // 初始化店铺信息
    const shopInfo = wx.getStorageSync('shopInfo');
    if (!shopInfo) {
      const defaultShop = {
        id: 'shop_001',
        name: '我的小店',
        avatar: '',
        background: '',
        intro: '欢迎来到我的小店',
        kitchens: [
          {
            id: 'kitchen_001',
            name: '主厨房',
            isDefault: true,
            admins: []
          }
        ],
        currentKitchenId: 'kitchen_001'
      };
      wx.setStorageSync('shopInfo', defaultShop);
      this.globalData.shopInfo = defaultShop;
      this.globalData.currentKitchen = defaultShop.kitchens[0];
    } else {
      this.globalData.shopInfo = shopInfo;
      const currentKitchen = shopInfo.kitchens.find(k => k.id === shopInfo.currentKitchenId);
      this.globalData.currentKitchen = currentKitchen || shopInfo.kitchens[0];
    }

    // 初始化菜谱数据
    const recipes = wx.getStorageSync('recipes');
    if (!recipes) {
      wx.setStorageSync('recipes', []);
    }

    // 初始化订单数据
    const orders = wx.getStorageSync('orders');
    if (!orders) {
      wx.setStorageSync('orders', []);
    }

    // 初始化食材数据
    const ingredients = wx.getStorageSync('ingredients');
    if (!ingredients) {
      wx.setStorageSync('ingredients', []);
    }

    // 初始化饮食计划数据
    const mealPlans = wx.getStorageSync('mealPlans');
    if (!mealPlans) {
      wx.setStorageSync('mealPlans', []);
    }
  },

  // 获取用户信息（需要在用户主动触发时调用，如点击按钮）
  getUserInfo() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          this.globalData.userInfo = res.userInfo;
          wx.setStorageSync('userInfo', res.userInfo);
          resolve(res.userInfo);
        },
        fail: (err) => {
          // 用户拒绝授权，使用本地存储的信息
          const userInfo = wx.getStorageSync('userInfo');
          if (userInfo) {
            this.globalData.userInfo = userInfo;
            resolve(userInfo);
          } else {
            reject(err);
          }
        }
      });
    });
  },

  // 更新店铺信息
  updateShopInfo(shopInfo) {
    this.globalData.shopInfo = shopInfo;
    wx.setStorageSync('shopInfo', shopInfo);
  },

  // 切换厨房
  switchKitchen(kitchenId) {
    const shopInfo = this.globalData.shopInfo;
    const kitchen = shopInfo.kitchens.find(k => k.id === kitchenId);
    if (kitchen) {
      shopInfo.currentKitchenId = kitchenId;
      this.globalData.currentKitchen = kitchen;
      this.updateShopInfo(shopInfo);
    }
  },

  // 检查是否为管理员
  checkIsAdmin() {
    const shopInfo = this.globalData.shopInfo;
    const currentKitchen = this.globalData.currentKitchen;
    if (!currentKitchen) return false;
    
    const userInfo = this.globalData.userInfo;
    if (!userInfo) return false;

    // 检查当前用户是否在管理员列表中
    const isAdmin = currentKitchen.admins.some(admin => 
      admin.nickName === userInfo.nickName || admin.openid === userInfo.openid
    );
    
    this.globalData.isAdmin = isAdmin;
    return isAdmin;
  }
});
