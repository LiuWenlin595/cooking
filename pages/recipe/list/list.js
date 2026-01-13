// pages/recipe/list/list.js
const app = getApp();
const { getRecipes } = require('../../../utils/storage');
const { showToast } = require('../../../utils/util');

Page({
  data: {
    recipes: [],
    filteredRecipes: [],
    searchKeyword: '',
    currentCategory: '',
    categories: [],
    isAdmin: false
  },

  onLoad() {
    this.checkAdmin();
    this.loadRecipes();
  },

  onShow() {
    // 每次显示时刷新数据
    this.loadRecipes();
  },

  // 检查管理员权限
  checkAdmin() {
    const isAdmin = app.checkIsAdmin();
    this.setData({
      isAdmin
    });
  },

  // 加载菜谱
  loadRecipes() {
    const recipes = getRecipes();
    const categories = [...new Set(recipes.map(r => r.category).filter(Boolean))];
    
    this.setData({
      recipes,
      categories,
      filteredRecipes: recipes
    });
    
    // 如果有搜索关键词或分类，重新筛选
    if (this.data.searchKeyword || this.data.currentCategory) {
      this.filterRecipes();
    }
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
    this.filterRecipes();
  },

  // 分类筛选
  filterByCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      currentCategory: category
    });
    this.filterRecipes();
  },

  // 筛选菜谱
  filterRecipes() {
    let filtered = [...this.data.recipes];
    
    // 按关键词搜索
    if (this.data.searchKeyword) {
      const keyword = this.data.searchKeyword.toLowerCase();
      filtered = filtered.filter(recipe => 
        recipe.name.toLowerCase().includes(keyword) ||
        (recipe.description && recipe.description.toLowerCase().includes(keyword)) ||
        (recipe.category && recipe.category.toLowerCase().includes(keyword))
      );
    }
    
    // 按分类筛选
    if (this.data.currentCategory) {
      filtered = filtered.filter(recipe => recipe.category === this.data.currentCategory);
    }
    
    this.setData({
      filteredRecipes: filtered
    });
  },

  // 查看菜谱详情
  viewRecipe(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/recipe/detail/detail?id=${id}`
    });
  },

  // 随机点菜
  randomRecipe() {
    const recipes = this.data.filteredRecipes;
    if (recipes.length === 0) {
      showToast('暂无可用菜谱');
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * recipes.length);
    const randomRecipe = recipes[randomIndex];
    
    wx.navigateTo({
      url: `/pages/recipe/detail/detail?id=${randomRecipe.id}&from=random`
    });
  },

  // 添加菜谱
  addRecipe() {
    wx.navigateTo({
      url: '/pages/recipe/add/add'
    });
  }
});
