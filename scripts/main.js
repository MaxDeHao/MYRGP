/**
 * 名字竞技场主程序
 */

// DOM元素
const namesInput = document.getElementById('names-input');
const startBattleBtn = document.getElementById('start-battle');
const battleArea = document.getElementById('battle-area');
const battleLog = document.getElementById('battle-log');
const battleResult = document.getElementById('battle-result');
const battleSpeedInput = document.getElementById('battle-speed'); // 新增：获取速度输入元素
const healthBarsContainer = document.getElementById('health-bars'); // 新增：获取血条容器

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  // 绑定开始战斗按钮事件
  startBattleBtn.addEventListener('click', startBattle);
});

// 开始战斗
async function startBattle() {
  // 获取输入的名字，并处理队伍
  const lines = namesInput.value.trim().split('\n');
  const characters = [];
  let teamId = 1;
  let currentTeamNames = [];
  
  // 第一个名字为玩家角色

  lines.forEach(line => {
    const name = line.trim();
    if (name === '') {
      // 遇到空行，处理上一队
      if (currentTeamNames.length > 0) {
        currentTeamNames.forEach(n => characters.push(new Character(n, teamId)));
        teamId++;
        currentTeamNames = [];
      }
    } else {
      // 第一个输入的名字为玩家角色
      const isPlayer = characters.length === 0;
      characters.push(new Character(name, teamId, isPlayer));
    }
  });

  // 如果没有输入名字，显示提示
  if (characters.length === 0) {
    alert('请输入至少一个名字！');
    return;
  }
  
  // 为玩家生成一个随机对手
  if (characters.length === 1) {
    const aiNames = generateRandomNames(1);
    characters.push(new Character(aiNames[0], 2, false));
  }

  // 如果只有两个人，强制分为两队
  if (characters.length === 2 && characters[0].teamId === characters[1].teamId) {
    characters[1].teamId = 2; // 将第二个角色分到第二队
  }

  // 检查是否有足够的名字
  if (characters.length < 2) {
    alert('请至少输入两个名字！');
    return;
  }

  // 检查是否所有角色都在同一队（当人数>=3时）
  const uniqueTeamIds = new Set(characters.map(c => c.teamId));
  if (characters.length >= 3 && uniqueTeamIds.size === 1) {
      alert('当人数大于等于3时，请使用空行分隔队伍！');
      return;
  }

  // 显示战斗区域
  battleArea.style.display = 'block';
  battleLog.innerHTML = '';
  battleResult.innerHTML = '';

  // 添加加载动画
  battleLog.innerHTML = '<div class="loading">战斗准备中...</div>';

  // 创建战斗实例，传入更新血条的回调函数
  const battle = new Battle(characters, updateHealthBars);

  // 初始显示血条
  updateHealthBars(characters);

  // 开始战斗
  const result = await battle.start();

  // 显示战斗日志
  battleLog.innerHTML = result.log.join('');

  // 添加动画效果
  animateElement(battleArea, 'fade-in');

  // 滚动到底部
  battleLog.scrollTop = battleLog.scrollHeight;

  // 高亮显示获胜者
  setTimeout(() => {
    const winnerElements = document.querySelectorAll('.winner');
    winnerElements.forEach(el => {
      animateElement(el, 'highlight', 2000);
    });
  }, 500);
}

// 更新血条显示
function updateHealthBars(characters, actingCharacter = null, usedSkill = null) {
  healthBarsContainer.innerHTML = ''; // 清空现有血条
  characters.forEach(char => {
    const healthPercentage = (char.currentHp / char.maxHp) * 100;
    let barClass = 'health-bar-fill';
    if (healthPercentage < 50) barClass += ' low';
    if (healthPercentage < 20) barClass += ' critical';

    const info = char.getStatusDescription(); // 获取角色详细信息
    const skillDisplay = (actingCharacter && actingCharacter.name === char.name && usedSkill) ? `<span class="used-skill">使用了: ${usedSkill.name}</span>` : '';

    const healthBarHTML = `
      <div class="health-bar-container">
        <div class="health-bar-info">
          <div class="health-bar-label">${char.name} (${char.currentHp}/${char.maxHp}) ${skillDisplay}</div>
          <div class="character-details">
            <span>类型: ${info.type}</span> | 
            <span>元素: ${info.element}</span> | 
            <span>攻击: ${info.atk}</span> | 
            <span>防御: ${info.def}</span> | 
            <span>速度: ${info.spd}</span> | 
            <span>智力: ${info.int}</span> | 
            <span>幸运: ${info.luk}</span>
          </div>
        </div>
        <div class="health-bar">
          <div class="health-bar-track">
            <div class="${barClass}" style="width: ${healthPercentage}%;"></div>
          </div>
        </div>
      </div>
    `;
    healthBarsContainer.innerHTML += healthBarHTML;
  });
}

// 生成随机名字（用于测试）
function generateRandomNames(count = 5) {
  const prefixes = ['勇敢的', '聪明的', '强壮的', '神秘的', '邪恶的', '善良的', '古老的', '年轻的'];
  const nouns = ['战士', '法师', '刺客', '射手', '骑士', '龙', '精灵', '巫师', '国王', '王子'];
  
  const names = [];
  for (let i = 0; i < count; i++) {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    names.push(`${prefix}${noun}${i}`);
  }
  
  return names;
}

// 添加示例名字（用于测试）
function addExampleNames() {
  const exampleNames = generateRandomNames(6);
  namesInput.value = exampleNames.join('\n');
}