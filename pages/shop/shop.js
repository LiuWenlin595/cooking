// pages/shop/shop.js
const app = getApp();
const { chooseImage, showToast, showModal, generateId } = require('../../utils/util');

Page({
  data: {
    shopInfo: null,
    notificationEnabled: true,
    showAddKitchen: false,
    newKitchenName: '',
    showAdminModal: false,
    currentKitchenAdmins: [],
    currentKitchenId: null
  },

  onLoad() {
    this.loadShopInfo();
    this.loadNotificationSetting();
  },

  // 加载店铺信息
  loadShopInfo() {
    const shopInfo = app.globalData.shopInfo;
    this.setData({
      shopInfo: JSON.parse(JSON.stringify(shopInfo)) // 深拷贝
    });
  },

  // 加载通知设置
  loadNotificationSetting() {
    const enabled = wx.getStorageSync('notificationEnabled');
    this.setData({
      notificationEnabled: enabled !== false
    });
  },

  // 选择头像
  async chooseAvatar() {
    try {
      const paths = await chooseImage(1);
      this.setData({
        'shopInfo.avatar': paths[0]
      });
    } catch (err) {
      showToast('选择图片失败');
    }
  },

  // 选择背景图
  async chooseBackground() {
    try {
      const paths = await chooseImage(1);
      this.setData({
        'shopInfo.background': paths[0]
      });
    } catch (err) {
      showToast('选择图片失败');
    }
  },

  // 店铺名称输入
  onNameInput(e) {
    this.setData({
      'shopInfo.name': e.detail.value
    });
  },

  // 店铺简介输入
  onIntroInput(e) {
    this.setData({
      'shopInfo.intro': e.detail.value
    });
  },

  // 保存店铺信息
  saveShopInfo() {
    const shopInfo = this.data.shopInfo;
    
    // 验证店铺名称
    if (!shopInfo.name || !shopInfo.name.trim()) {
      showToast('请输入店铺名称');
      return;
    }

    if (shopInfo.name.trim().length > 30) {
      showToast('店铺名称过长，请控制在30字以内');
      return;
    }

    // 验证简介长度
    if (shopInfo.intro && shopInfo.intro.length > 200) {
      showToast('店铺简介过长，请控制在200字以内');
      return;
    }

    // 确保必要字段存在
    if (!shopInfo.kitchens || !Array.isArray(shopInfo.kitchens) || shopInfo.kitchens.length === 0) {
      showToast('至少需要一个厨房');
      return;
    }

    // 确保有默认厨房
    const hasDefault = shopInfo.kitchens.some(k => k.isDefault);
    if (!hasDefault) {
      shopInfo.kitchens[0].isDefault = true;
    }

    // 确保当前厨房ID有效
    const currentKitchenExists = shopInfo.kitchens.some(k => k.id === shopInfo.currentKitchenId);
    if (!currentKitchenExists && shopInfo.kitchens.length > 0) {
      shopInfo.currentKitchenId = shopInfo.kitchens.find(k => k.isDefault)?.id || shopInfo.kitchens[0].id;
    }

    try {
      app.updateShopInfo(shopInfo);
      showToast('保存成功', 'success');
    } catch (err) {
      console.error('保存店铺信息失败：', err);
      showToast('保存失败，请重试');
    }
  },

  // 添加厨房
  addKitchen() {
    this.setData({
      showAddKitchen: true,
      newKitchenName: ''
    });
  },

  // 厨房名称输入
  onKitchenNameInput(e) {
    this.setData({
      newKitchenName: e.detail.value
    });
  },

  // 确认添加厨房
  confirmAddKitchen() {
    const name = this.data.newKitchenName.trim();
    if (!name) {
      showToast('请输入厨房名称');
      return;
    }

    const shopInfo = this.data.shopInfo;
    const newKitchen = {
      id: generateId(),
      name: name,
      isDefault: false,
      admins: []
    };
    shopInfo.kitchens.push(newKitchen);
    
    this.setData({
      shopInfo,
      showAddKitchen: false,
      newKitchenName: ''
    });
    
    app.updateShopInfo(shopInfo);
    showToast('添加成功', 'success');
  },

  // 关闭弹窗
  closeModal() {
    this.setData({
      showAddKitchen: false
    });
  },

  // 阻止事件冒泡
  stopPropagation() {},

  // 切换厨房
  switchKitchen(e) {
    const kitchenId = e.currentTarget.dataset.id;
    app.switchKitchen(kitchenId);
    this.loadShopInfo();
    showToast('切换成功', 'success');
  },

  // 删除厨房
  async deleteKitchen(e) {
    const kitchenId = e.currentTarget.dataset.id;
    const confirmed = await showModal('确认删除', '删除厨房后，该厨房的数据将无法恢复，确定要删除吗？');
    
    if (confirmed) {
      const shopInfo = this.data.shopInfo;
      shopInfo.kitchens = shopInfo.kitchens.filter(k => k.id !== kitchenId);
      
      // 如果删除的是当前厨房，切换到默认厨房
      if (shopInfo.currentKitchenId === kitchenId) {
        const defaultKitchen = shopInfo.kitchens.find(k => k.isDefault);
        if (defaultKitchen) {
          shopInfo.currentKitchenId = defaultKitchen.id;
          app.switchKitchen(defaultKitchen.id);
        }
      }
      
      this.setData({
        shopInfo
      });
      
      app.updateShopInfo(shopInfo);
      showToast('删除成功', 'success');
    }
  },

  // 管理管理员
  manageAdmins(e) {
    const kitchenId = e.currentTarget.dataset.id;
    const kitchen = this.data.shopInfo.kitchens.find(k => k.id === kitchenId);
    
    this.setData({
      showAdminModal: true,
      currentKitchenAdmins: JSON.parse(JSON.stringify(kitchen.admins || [])),
      currentKitchenId: kitchenId
    });
  },

  // 添加管理员
  addAdmin() {
    const userInfo = app.globalData.userInfo;
    if (!userInfo) {
      showToast('请先授权用户信息');
      return;
    }

    const admins = this.data.currentKitchenAdmins;
    const exists = admins.some(admin => 
      admin.nickName === userInfo.nickName || admin.openid === userInfo.openid
    );

    if (exists) {
      showToast('该用户已是管理员');
      return;
    }

    admins.push({
      nickName: userInfo.nickName,
      openid: userInfo.openid || 'unknown',
      avatar: userInfo.avatarUrl
    });

    this.setData({
      currentKitchenAdmins: admins
    });

    // 更新到店铺信息
    const shopInfo = this.data.shopInfo;
    const kitchen = shopInfo.kitchens.find(k => k.id === this.data.currentKitchenId);
    if (kitchen) {
      kitchen.admins = admins;
      this.setData({
        shopInfo
      });
      app.updateShopInfo(shopInfo);
      showToast('添加成功', 'success');
    }
  },

  // 移除管理员
  removeAdmin(e) {
    const index = e.currentTarget.dataset.index;
    const admins = this.data.currentKitchenAdmins;
    admins.splice(index, 1);

    this.setData({
      currentKitchenAdmins: admins
    });

    // 更新到店铺信息
    const shopInfo = this.data.shopInfo;
    const kitchen = shopInfo.kitchens.find(k => k.id === this.data.currentKitchenId);
    if (kitchen) {
      kitchen.admins = admins;
      this.setData({
        shopInfo
      });
      app.updateShopInfo(shopInfo);
      showToast('移除成功', 'success');
    }
  },

  // 关闭管理员弹窗
  closeAdminModal() {
    this.setData({
      showAdminModal: false,
      currentKitchenAdmins: [],
      currentKitchenId: null
    });
  },

  // 切换通知
  toggleNotification(e) {
    const enabled = e.detail.value;
    this.setData({
      notificationEnabled: enabled
    });
    wx.setStorageSync('notificationEnabled', enabled);
    showToast(enabled ? '已开启通知' : '已关闭通知', 'success');
  }
});
