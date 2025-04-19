/**
 * 工具函数集合
 */

// 基于名字生成确定性的哈希值
function generateHash(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  return Math.abs(hash);
}

// 基于哈希值创建确定性的随机数生成器
class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }

  // 生成0到1之间的随机数
  random() {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  // 生成指定范围内的随机整数
  randomInt(min, max) {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  // 从数组中随机选择一个元素
  randomChoice(array) {
    return array[this.randomInt(0, array.length - 1)];
  }

  // 根据权重随机选择
  weightedRandom(weights) {
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = this.random() * totalWeight;
    
    for (let i = 0; i < weights.length; i++) {
      if (random < weights[i]) {
        return i;
      }
      random -= weights[i];
    }
    return weights.length - 1;
  }

  // 打乱数组
  shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.randomInt(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

// 格式化战斗日志
function formatBattleLog(text, type) {
  if (type) {
    return `<span class="${type}">${text}</span>`;
  }
  return text;
}

// 添加动画效果
function animateElement(element, animationClass, duration = 1000) {
  element.classList.add(animationClass);
  setTimeout(() => {
    element.classList.remove(animationClass);
  }, duration);
}

// 延迟执行函数
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}