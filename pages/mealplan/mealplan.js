// pages/mealplan/mealplan.js
const { getMealPlans, addMealPlan, getMealPlanByDate, getRecipes, addOrder } = require('../../utils/storage');
const { formatDate, showToast, generateId, showModal } = require('../../utils/util');
const app = getApp();

Page({
  data: {
    selectedDate: '',
    formattedDate: '',
    weekday: '',
    currentPlan: null,
    weekPlans: [],
    showRecipeModal: false,
    selectedMealType: '',
    recipes: []
  },

  onLoad() {
    const today = new Date();
    this.setSelectedDate(today);
    this.loadPlan();
    this.loadWeekPlans();
  },

  // 设置选中日期
  setSelectedDate(date) {
    const dateStr = formatDate(date, 'YYYY-MM-DD');
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekday = weekdays[date.getDay()];
    
    this.setData({
      selectedDate: dateStr,
      formattedDate: formatDate(date, 'MM月DD日'),
      weekday
    });
  },

  // 加载计划
  loadPlan() {
    const plan = getMealPlanByDate(this.data.selectedDate);
    this.setData({
      currentPlan: plan || null
    });
  },

  // 加载本周计划
  loadWeekPlans() {
    const today = new Date();
    const weekPlans = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = formatDate(date, 'YYYY-MM-DD');
      const plan = getMealPlanByDate(dateStr);
      
      if (plan) {
        const mealCount = (plan.breakfast?.length || 0) + 
                         (plan.lunch?.length || 0) + 
                         (plan.dinner?.length || 0);
        weekPlans.push({
          date: dateStr,
          dateText: formatDate(date, 'MM-DD'),
          mealCount
        });
      }
    }
    
    this.setData({
      weekPlans
    });
  },

  // 日期改变
  onDateChange(e) {
    const dateStr = e.detail.value;
    const date = new Date(dateStr);
    this.setSelectedDate(date);
    this.loadPlan();
  },

  // 前一天
  prevDate() {
    const date = new Date(this.data.selectedDate);
    date.setDate(date.getDate() - 1);
    this.setSelectedDate(date);
    this.loadPlan();
  },

  // 后一天
  nextDate() {
    const date = new Date(this.data.selectedDate);
    date.setDate(date.getDate() + 1);
    this.setSelectedDate(date);
    this.loadPlan();
  },

  // 添加饮食计划
  addMealPlan() {
    if (!this.data.currentPlan) {
      // 创建新计划
      const plan = {
        date: this.data.selectedDate,
        breakfast: [],
        lunch: [],
        dinner: []
      };
      addMealPlan(plan);
      this.setData({
        currentPlan: plan
      });
    }
    this.addMeal('breakfast');
  },

  // 添加餐食
  addMeal(e) {
    const mealType = e.currentTarget ? e.currentTarget.dataset.type : e;
    const recipes = getRecipes();
    
    if (recipes.length === 0) {
      showToast('请先添加菜谱');
      return;
    }

    this.setData({
      showRecipeModal: true,
      selectedMealType: mealType,
      recipes
    });
  },

  // 选择菜谱
  selectRecipe(e) {
    const recipeId = e.currentTarget.dataset.id;
    const recipe = this.data.recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    const plan = { ...this.data.currentPlan };
    const mealType = this.data.selectedMealType;
    
    // 检查是否已添加
    const exists = plan[mealType].some(r => r.id === recipeId);
    if (exists) {
      showToast('该菜谱已添加');
      return;
    }

    plan[mealType].push({
      id: recipe.id,
      name: recipe.name
    });

    addMealPlan(plan);
    this.setData({
      currentPlan: plan
    });
    this.closeRecipeModal();
    this.loadWeekPlans();
  },

  // 查看菜谱
  viewRecipe(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/recipe/detail/detail?id=${id}`
    });
  },

  // 清空计划
  async clearPlan() {
    const confirmed = await showModal('确认清空', '确定要清空今日的饮食计划吗？');

    if (confirmed) {
      const plan = {
        date: this.data.selectedDate,
        breakfast: [],
        lunch: [],
        dinner: []
      };
      addMealPlan(plan);
      this.setData({
        currentPlan: plan
      });
      this.loadWeekPlans();
      showToast('已清空', 'success');
    }
  },

  // 一键下单
  createOrderFromPlan() {
    const plan = this.data.currentPlan;
    if (!plan) {
      showToast('今日暂无计划');
      return;
    }

    const allRecipes = plan.breakfast.concat(plan.lunch).concat(plan.dinner);
    if (allRecipes.length === 0) {
      showToast('今日暂无计划');
      return;
    }

    // 统计菜谱数量
    const recipeMap = {};
    allRecipes.forEach(recipe => {
      if (recipeMap[recipe.id]) {
        recipeMap[recipe.id].quantity++;
      } else {
        recipeMap[recipe.id] = {
          id: generateId(),
          recipeId: recipe.id,
          name: recipe.name,
          quantity: 1
        };
      }
    });

    const order = {
      id: generateId(),
      orderNo: 'ORD' + Date.now(),
      items: Object.values(recipeMap),
      status: 'pending',
      createTime: new Date().toISOString(),
      customerName: app.globalData.userInfo ? app.globalData.userInfo.nickName : '匿名用户',
      remark: `来自${this.data.formattedDate}的饮食计划`,
      kitchenId: app.globalData.currentKitchen ? app.globalData.currentKitchen.id : null
    };

    addOrder(order);
    showToast('下单成功', 'success');
    
    setTimeout(() => {
      wx.switchTab({
        url: '/pages/order/list/list'
      });
    }, 1500);
  },

  // 关闭菜谱弹窗
  closeRecipeModal() {
    this.setData({
      showRecipeModal: false,
      selectedMealType: ''
    });
  },

  // 阻止事件冒泡
  stopPropagation() {}
});
