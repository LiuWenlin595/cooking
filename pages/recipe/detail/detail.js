// pages/recipe/detail/detail.js
const app = getApp();
const { getRecipeById, deleteRecipe } = require('../../../utils/storage');
const { showToast, showModal, previewImage } = require('../../../utils/util');

Page({
  data: {
    recipeId: null,
    recipe: null,
    nutritionList: [],
    isAdmin: false
  },

  onLoad(options) {
    const id = options.id;
    if (!id) {
      showToast('菜谱ID不存在');
      wx.navigateBack();
      return;
    }

    this.setData({
      recipeId: id
    });

    this.checkAdmin();
    this.loadRecipe();
  },

  // 检查管理员权限
  checkAdmin() {
    const isAdmin = app.checkIsAdmin();
    this.setData({
      isAdmin
    });
  },

  // 加载菜谱
  loadRecipe() {
    const recipe = getRecipeById(this.data.recipeId);
    if (!recipe) {
      showToast('菜谱不存在');
      wx.navigateBack();
      return;
    }

    // 处理营养信息
    let nutritionList = [];
    if (recipe.nutrition) {
      nutritionList = [
        { key: 'calories', label: '热量', value: recipe.nutrition.calories || '-' },
        { key: 'protein', label: '蛋白质', value: recipe.nutrition.protein || '-' },
        { key: 'fat', label: '脂肪', value: recipe.nutrition.fat || '-' },
        { key: 'carbs', label: '碳水', value: recipe.nutrition.carbs || '-' }
      ];
    }

    this.setData({
      recipe,
      nutritionList
    });
  },

  // 预览步骤图片
  previewStepImage(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    const step = this.data.recipe.steps[index];
    if (step && step.image) {
      previewImage([step.image], 0);
    }
  },

  // 点这道菜
  orderRecipe() {
    const recipe = this.data.recipe;
    wx.navigateTo({
      url: `/pages/order/detail/detail?recipeId=${recipe.id}&action=create`
    });
  },

  // 编辑菜谱
  editRecipe() {
    wx.navigateTo({
      url: `/pages/recipe/add/add?id=${this.data.recipeId}`
    });
  },

  // 删除菜谱
  async deleteRecipe() {
    const confirmed = await showModal('确认删除', '确定要删除这个菜谱吗？');
    if (confirmed) {
      deleteRecipe(this.data.recipeId);
      showToast('删除成功', 'success');
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  }
});
