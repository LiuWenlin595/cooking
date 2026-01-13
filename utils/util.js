// utils/util.js

/**
 * 格式化时间
 */
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

/**
 * 生成唯一ID
 */
const generateId = () => {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * 格式化日期
 */
const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  const second = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second);
}

/**
 * 计算日期差（天数）
 */
const daysBetween = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000;
  const firstDate = new Date(date1);
  const secondDate = new Date(date2);
  return Math.round(Math.abs((firstDate - secondDate) / oneDay));
}

/**
 * 显示提示信息
 */
const showToast = (title, icon = 'none', duration = 2000) => {
  wx.showToast({
    title,
    icon,
    duration
  });
}

/**
 * 显示加载中
 */
const showLoading = (title = '加载中...') => {
  wx.showLoading({
    title,
    mask: true
  });
}

/**
 * 隐藏加载
 */
const hideLoading = () => {
  wx.hideLoading();
}

/**
 * 显示确认对话框
 */
const showModal = (title, content) => {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      success: (res) => {
        resolve(res.confirm);
      },
      fail: () => {
        resolve(false);
      }
    });
  });
}

/**
 * 选择图片
 */
const chooseImage = (count = 1) => {
  return new Promise((resolve, reject) => {
    wx.chooseImage({
      count,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        resolve(res.tempFilePaths);
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

/**
 * 预览图片
 */
const previewImage = (urls, current = 0) => {
  wx.previewImage({
    urls,
    current: urls[current] || urls[0]
  });
}

/**
 * 导出数据为JSON
 */
const exportData = (data, filename) => {
  const jsonStr = JSON.stringify(data, null, 2);
  // 在小程序中，可以通过复制到剪贴板或分享文件的方式导出
  wx.setClipboardData({
    data: jsonStr,
    success: () => {
      showToast('数据已复制到剪贴板');
    }
  });
}

/**
 * 匹配食材可做的菜谱
 */
const matchRecipesByIngredients = (recipes, ingredients) => {
  if (!recipes || !Array.isArray(recipes) || recipes.length === 0) {
    return [];
  }
  
  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return [];
  }

  // 获取可用食材名称（数量大于0）
  const ingredientNames = ingredients
    .filter(ing => ing && ing.name && (ing.quantity > 0 || ing.quantity === undefined))
    .map(ing => ing.name.toLowerCase().trim())
    .filter(name => name.length > 0);

  if (ingredientNames.length === 0) {
    return [];
  }

  return recipes.filter(recipe => {
    if (!recipe || !recipe.ingredients || !Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
      return false;
    }

    // 提取菜谱所需食材名称
    const recipeIngredients = recipe.ingredients
      .map(ing => {
        if (typeof ing === 'string') {
          return ing.toLowerCase().trim();
        } else if (ing && ing.name) {
          return ing.name.toLowerCase().trim();
        }
        return '';
      })
      .filter(name => name.length > 0);

    if (recipeIngredients.length === 0) {
      return false;
    }

    // 检查菜谱所需食材是否都在现有食材中（支持模糊匹配）
    return recipeIngredients.every(recipeIng => 
      ingredientNames.some(availableIng => 
        availableIng.includes(recipeIng) || recipeIng.includes(availableIng) || availableIng === recipeIng
      )
    );
  });
}

module.exports = {
  formatTime,
  formatDate,
  formatNumber,
  generateId,
  daysBetween,
  showToast,
  showLoading,
  hideLoading,
  showModal,
  chooseImage,
  previewImage,
  exportData,
  matchRecipesByIngredients
}
