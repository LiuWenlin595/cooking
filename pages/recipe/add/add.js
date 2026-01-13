// pages/recipe/add/add.js
const { getRecipeById, addRecipe, updateRecipe, getRecipes } = require('../../../utils/storage');
const { chooseImage, showToast, generateId } = require('../../../utils/util');

Page({
  data: {
    recipeId: null,
    isEdit: false,
    recipe: {
      name: '',
      category: '',
      description: '',
      image: '',
      servings: 1,
      cookTime: '',
      difficulty: '',
      ingredients: [],
      steps: [],
      nutrition: {
        calories: '',
        protein: '',
        fat: '',
        carbs: ''
      },
      isRequired: false
    },
    categories: ['家常菜', '川菜', '粤菜', '湘菜', '鲁菜', '苏菜', '浙菜', '闽菜', '徽菜', '汤品', '甜品', '小吃', '其他'],
    categoryIndex: -1,
    difficulties: ['简单', '中等', '困难'],
    difficultyIndex: -1
  },

  onLoad(options) {
    if (options.id) {
      // 编辑模式
      this.setData({
        recipeId: options.id,
        isEdit: true
      });
      this.loadRecipe();
    } else {
      // 添加模式，初始化一个空的用料和步骤
      this.setData({
        'recipe.ingredients': [{ name: '', amount: '' }],
        'recipe.steps': [{ text: '', image: '' }]
      });
    }
  },

  // 加载菜谱（编辑模式）
  loadRecipe() {
    const recipe = getRecipeById(this.data.recipeId);
    if (!recipe) {
      showToast('菜谱不存在');
      wx.navigateBack();
      return;
    }

    // 设置分类索引
    const categoryIndex = this.data.categories.indexOf(recipe.category);
    const difficultyIndex = this.data.difficulties.indexOf(recipe.difficulty);

    this.setData({
      recipe: {
        ...recipe,
        nutrition: recipe.nutrition || {
          calories: '',
          protein: '',
          fat: '',
          carbs: ''
        },
        ingredients: recipe.ingredients && recipe.ingredients.length > 0 
          ? recipe.ingredients 
          : [{ name: '', amount: '' }],
        steps: recipe.steps && recipe.steps.length > 0 
          ? recipe.steps 
          : [{ text: '', image: '' }]
      },
      categoryIndex: categoryIndex >= 0 ? categoryIndex : -1,
      difficultyIndex: difficultyIndex >= 0 ? difficultyIndex : -1
    });
  },

  // 选择图片
  async chooseImage() {
    try {
      const paths = await chooseImage(1);
      this.setData({
        'recipe.image': paths[0]
      });
    } catch (err) {
      showToast('选择图片失败');
    }
  },

  // 选择步骤图片
  async chooseStepImage(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    try {
      const paths = await chooseImage(1);
      const steps = this.data.recipe.steps;
      steps[index].image = paths[0];
      this.setData({
        'recipe.steps': steps
      });
    } catch (err) {
      showToast('选择图片失败');
    }
  },

  // 输入处理
  onNameInput(e) {
    this.setData({
      'recipe.name': e.detail.value
    });
  },

  onDescriptionInput(e) {
    this.setData({
      'recipe.description': e.detail.value
    });
  },

  onServingsInput(e) {
    this.setData({
      'recipe.servings': parseInt(e.detail.value) || 1
    });
  },

  onCookTimeInput(e) {
    this.setData({
      'recipe.cookTime': e.detail.value
    });
  },

  onCategoryChange(e) {
    const index = parseInt(e.detail.value);
    this.setData({
      categoryIndex: index,
      'recipe.category': this.data.categories[index]
    });
  },

  onDifficultyChange(e) {
    const index = parseInt(e.detail.value);
    this.setData({
      difficultyIndex: index,
      'recipe.difficulty': this.data.difficulties[index]
    });
  },

  onRequiredChange(e) {
    this.setData({
      'recipe.isRequired': e.detail.value
    });
  },

  // 用料管理
  addIngredient() {
    const ingredients = [...this.data.recipe.ingredients, { name: '', amount: '' }];
    this.setData({
      'recipe.ingredients': ingredients
    });
  },

  removeIngredient(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    const ingredients = this.data.recipe.ingredients;
    if (ingredients.length <= 1) {
      showToast('至少保留一个用料');
      return;
    }
    ingredients.splice(index, 1);
    this.setData({
      'recipe.ingredients': ingredients
    });
  },

  onIngredientNameInput(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    const ingredients = [...this.data.recipe.ingredients];
    ingredients[index].name = e.detail.value;
    this.setData({
      'recipe.ingredients': ingredients
    });
  },

  onIngredientAmountInput(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    const ingredients = [...this.data.recipe.ingredients];
    ingredients[index].amount = e.detail.value;
    this.setData({
      'recipe.ingredients': ingredients
    });
  },

  // 步骤管理
  addStep() {
    const steps = [...this.data.recipe.steps, { text: '', image: '' }];
    this.setData({
      'recipe.steps': steps
    });
  },

  removeStep(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    const steps = this.data.recipe.steps;
    if (steps.length <= 1) {
      showToast('至少保留一个步骤');
      return;
    }
    steps.splice(index, 1);
    this.setData({
      'recipe.steps': steps
    });
  },

  onStepTextInput(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    const steps = [...this.data.recipe.steps];
    steps[index].text = e.detail.value;
    this.setData({
      'recipe.steps': steps
    });
  },

  // 营养信息输入
  onNutritionInput(e) {
    const key = e.currentTarget.dataset.key;
    const value = e.detail.value;
    const nutrition = { ...this.data.recipe.nutrition };
    nutrition[key] = value;
    this.setData({
      'recipe.nutrition': nutrition
    });
  },

  // 保存菜谱
  saveRecipe() {
    const recipe = { ...this.data.recipe };

    // 验证必填项
    if (!recipe.name || !recipe.name.trim()) {
      showToast('请输入菜名');
      return;
    }

    // 验证菜名长度
    if (recipe.name.trim().length > 50) {
      showToast('菜名过长，请控制在50字以内');
      return;
    }

    // 处理用料：过滤空值，统一格式
    if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) {
      recipe.ingredients = [];
    }
    
    recipe.ingredients = recipe.ingredients
      .filter(ing => ing && (ing.name || (typeof ing === 'string' && ing.trim())))
      .map(ing => {
        if (typeof ing === 'string') {
          return {
            name: ing.trim(),
            amount: ''
          };
        }
        return {
          name: (ing.name || '').trim(),
          amount: (ing.amount || '').trim()
        };
      })
      .filter(ing => ing.name.length > 0);

    if (recipe.ingredients.length === 0) {
      showToast('请至少添加一个用料');
      return;
    }

    // 处理步骤：过滤空值，统一格式
    if (!recipe.steps || !Array.isArray(recipe.steps)) {
      recipe.steps = [];
    }
    
    recipe.steps = recipe.steps
      .filter(step => step && (step.text || (typeof step === 'string' && step.trim())))
      .map(step => {
        if (typeof step === 'string') {
          return {
            text: step.trim(),
            image: ''
          };
        }
        return {
          text: (step.text || '').trim(),
          image: step.image || ''
        };
      })
      .filter(step => step.text.length > 0);

    if (recipe.steps.length === 0) {
      showToast('请至少添加一个制作步骤');
      return;
    }

    // 验证份量
    if (recipe.servings && (recipe.servings < 1 || recipe.servings > 100)) {
      showToast('份量应在1-100之间');
      return;
    }

    // 清理营养信息中的空值
    const nutrition = {};
    if (recipe.nutrition) {
      Object.keys(recipe.nutrition).forEach(key => {
        const value = recipe.nutrition[key];
        if (value !== null && value !== undefined && value !== '') {
          nutrition[key] = value;
        }
      });
    }
    recipe.nutrition = Object.keys(nutrition).length > 0 ? nutrition : null;

    // 确保其他字段有默认值
    recipe.description = (recipe.description || '').trim();
    recipe.category = recipe.category || '';
    recipe.cookTime = (recipe.cookTime || '').trim();
    recipe.difficulty = recipe.difficulty || '';
    recipe.servings = recipe.servings || 1;
    recipe.isRequired = recipe.isRequired || false;

    // 保存
    try {
      if (this.data.isEdit) {
        const updated = updateRecipe(this.data.recipeId, recipe);
        if (!updated) {
          showToast('更新失败，菜谱不存在');
          return;
        }
        showToast('更新成功', 'success');
      } else {
        recipe.id = generateId();
        recipe.createTime = new Date().toISOString();
        addRecipe(recipe);
        showToast('添加成功', 'success');
      }

      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      console.error('保存菜谱失败：', err);
      showToast('保存失败，请重试');
    }
  }
});
