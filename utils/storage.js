// utils/storage.js

/**
 * 存储管理工具
 */

// 菜谱相关
const getRecipes = () => {
  return wx.getStorageSync('recipes') || [];
}

const saveRecipes = (recipes) => {
  wx.setStorageSync('recipes', recipes);
}

const getRecipeById = (id) => {
  const recipes = getRecipes();
  return recipes.find(r => r.id === id);
}

const addRecipe = (recipe) => {
  const recipes = getRecipes();
  recipes.push(recipe);
  saveRecipes(recipes);
  return recipe;
}

const updateRecipe = (id, updates) => {
  const recipes = getRecipes();
  const index = recipes.findIndex(r => r.id === id);
  if (index !== -1) {
    recipes[index] = { ...recipes[index], ...updates };
    saveRecipes(recipes);
    return recipes[index];
  }
  return null;
}

const deleteRecipe = (id) => {
  const recipes = getRecipes();
  const filtered = recipes.filter(r => r.id !== id);
  saveRecipes(filtered);
  return filtered;
}

// 订单相关
const getOrders = () => {
  return wx.getStorageSync('orders') || [];
}

const saveOrders = (orders) => {
  wx.setStorageSync('orders', orders);
}

const getOrderById = (id) => {
  const orders = getOrders();
  return orders.find(o => o.id === id);
}

const addOrder = (order) => {
  const orders = getOrders();
  orders.unshift(order); // 新订单放在最前面
  saveOrders(orders);
  return order;
}

const updateOrder = (id, updates) => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === id);
  if (index !== -1) {
    orders[index] = { ...orders[index], ...updates };
    saveOrders(orders);
    return orders[index];
  }
  return null;
}

// 食材相关
const getIngredients = () => {
  return wx.getStorageSync('ingredients') || [];
}

const saveIngredients = (ingredients) => {
  wx.setStorageSync('ingredients', ingredients);
}

const addIngredient = (ingredient) => {
  const ingredients = getIngredients();
  ingredients.push(ingredient);
  saveIngredients(ingredients);
  return ingredient;
}

const updateIngredient = (id, updates) => {
  const ingredients = getIngredients();
  const index = ingredients.findIndex(i => i.id === id);
  if (index !== -1) {
    ingredients[index] = { ...ingredients[index], ...updates };
    saveIngredients(ingredients);
    return ingredients[index];
  }
  return null;
}

const deleteIngredient = (id) => {
  const ingredients = getIngredients();
  const filtered = ingredients.filter(i => i.id !== id);
  saveIngredients(filtered);
  return filtered;
}

// 饮食计划相关
const getMealPlans = () => {
  return wx.getStorageSync('mealPlans') || [];
}

const saveMealPlans = (mealPlans) => {
  wx.setStorageSync('mealPlans', mealPlans);
}

const getMealPlanByDate = (date) => {
  const mealPlans = getMealPlans();
  return mealPlans.find(mp => mp.date === date);
}

const addMealPlan = (mealPlan) => {
  const mealPlans = getMealPlans();
  const index = mealPlans.findIndex(mp => mp.date === mealPlan.date);
  if (index !== -1) {
    mealPlans[index] = mealPlan;
  } else {
    mealPlans.push(mealPlan);
  }
  saveMealPlans(mealPlans);
  return mealPlan;
}

module.exports = {
  // 菜谱
  getRecipes,
  saveRecipes,
  getRecipeById,
  addRecipe,
  updateRecipe,
  deleteRecipe,
  // 订单
  getOrders,
  saveOrders,
  getOrderById,
  addOrder,
  updateOrder,
  // 食材
  getIngredients,
  saveIngredients,
  addIngredient,
  updateIngredient,
  deleteIngredient,
  // 饮食计划
  getMealPlans,
  saveMealPlans,
  getMealPlanByDate,
  addMealPlan
}
