// pages/ingredient/ingredient.js
const { getIngredients, addIngredient, updateIngredient, deleteIngredient, getRecipes } = require('../../utils/storage');
const { showToast, showModal, generateId, daysBetween, formatDate } = require('../../utils/util');
const { matchRecipesByIngredients } = require('../../utils/util');

Page({
  data: {
    ingredients: [],
    showModal: false,
    isEdit: false,
    currentIngredient: {
      name: '',
      quantity: 0,
      unit: '',
      expiryDate: ''
    },
    showRecipesModal: false,
    availableRecipes: []
  },

  onLoad() {
    this.loadIngredients();
  },

  onShow() {
    this.loadIngredients();
  },

  // 加载食材
  loadIngredients() {
    const ingredients = getIngredients();
    
    // 计算剩余天数
    const today = new Date();
    const processedIngredients = ingredients.map(ing => {
      if (ing.expiryDate) {
        const expiryDate = new Date(ing.expiryDate);
        const daysLeft = daysBetween(today, expiryDate);
        return {
          ...ing,
          daysLeft,
          expiryDate: formatDate(ing.expiryDate, 'YYYY-MM-DD')
        };
      }
      return {
        ...ing,
        expiryDate: ing.expiryDate ? formatDate(ing.expiryDate, 'YYYY-MM-DD') : ''
      };
    });

    // 按过期时间排序（快过期的在前）
    processedIngredients.sort((a, b) => {
      if (!a.expiryDate) return 1;
      if (!b.expiryDate) return -1;
      return new Date(a.expiryDate) - new Date(b.expiryDate);
    });

    this.setData({
      ingredients: processedIngredients
    });
  },

  // 添加食材
  addIngredient() {
    this.setData({
      showModal: true,
      isEdit: false,
      currentIngredient: {
        name: '',
        quantity: 0,
        unit: '',
        expiryDate: ''
      }
    });
  },

  // 编辑食材
  editIngredient(e) {
    const id = e.currentTarget.dataset.id;
    const ingredient = this.data.ingredients.find(ing => ing.id === id);
    if (ingredient) {
      this.setData({
        showModal: true,
        isEdit: true,
        currentIngredient: {
          ...ingredient,
          expiryDate: ingredient.expiryDate || ''
        }
      });
    }
  },

  // 删除食材
  async deleteIngredient(e) {
    const id = e.currentTarget.dataset.id;
    const confirmed = await showModal('确认删除', '确定要删除这个食材吗？');
    if (confirmed) {
      deleteIngredient(id);
      showToast('删除成功', 'success');
      this.loadIngredients();
    }
  },

  // 输入处理
  onNameInput(e) {
    this.setData({
      'currentIngredient.name': e.detail.value
    });
  },

  onQuantityInput(e) {
    this.setData({
      'currentIngredient.quantity': parseFloat(e.detail.value) || 0
    });
  },

  onUnitInput(e) {
    this.setData({
      'currentIngredient.unit': e.detail.value
    });
  },

  onExpiryDateChange(e) {
    this.setData({
      'currentIngredient.expiryDate': e.detail.value
    });
  },

  // 保存食材
  saveIngredient() {
    const ingredient = { ...this.data.currentIngredient };
    
    // 验证食材名称
    if (!ingredient.name || !ingredient.name.trim()) {
      showToast('请输入食材名称');
      return;
    }

    if (ingredient.name.trim().length > 50) {
      showToast('食材名称过长，请控制在50字以内');
      return;
    }

    // 验证数量
    const quantity = parseFloat(ingredient.quantity);
    if (isNaN(quantity) || quantity < 0) {
      showToast('请输入有效的数量');
      return;
    }
    ingredient.quantity = quantity;

    // 验证单位长度
    if (ingredient.unit && ingredient.unit.length > 20) {
      showToast('单位过长，请控制在20字以内');
      return;
    }

    // 验证保质期格式
    if (ingredient.expiryDate) {
      const expiryDate = new Date(ingredient.expiryDate);
      if (isNaN(expiryDate.getTime())) {
        showToast('保质期格式不正确');
        return;
      }
    }

    try {
      if (this.data.isEdit) {
        // 更新
        const originalIngredient = this.data.ingredients.find(ing => ing.id === this.data.currentIngredient.id);
        if (originalIngredient) {
          updateIngredient(originalIngredient.id, ingredient);
          showToast('更新成功', 'success');
        } else {
          showToast('食材不存在');
          return;
        }
      } else {
        // 添加
        ingredient.id = generateId();
        ingredient.addTime = new Date().toISOString();
        addIngredient(ingredient);
        showToast('添加成功', 'success');
      }

      this.closeModal();
      this.loadIngredients();
    } catch (err) {
      console.error('保存食材失败：', err);
      showToast('保存失败，请重试');
    }
  },

  // 关闭弹窗
  closeModal() {
    this.setData({
      showModal: false,
      currentIngredient: {
        name: '',
        quantity: 0,
        unit: '',
        expiryDate: ''
      }
    });
  },

  // 阻止事件冒泡
  stopPropagation() {},

  // 查看可做菜谱
  viewAvailableRecipes() {
    const recipes = getRecipes();
    const ingredients = getIngredients();
    const available = matchRecipesByIngredients(recipes, ingredients);
    
    if (available.length === 0) {
      showToast('暂无可用菜谱');
      return;
    }

    this.setData({
      showRecipesModal: true,
      availableRecipes: available
    });
  },

  // 关闭菜谱弹窗
  closeRecipesModal() {
    this.setData({
      showRecipesModal: false
    });
  },

  // 查看菜谱详情
  viewRecipe(e) {
    const id = e.currentTarget.dataset.id;
    this.closeRecipesModal();
    wx.navigateTo({
      url: `/pages/recipe/detail/detail?id=${id}`
    });
  }
});
