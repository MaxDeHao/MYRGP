/**
 * 战斗系统
 */

class Battle {
  constructor(characters, updateHealthBarsCallback) {
    this.characters = characters;
    this.teams = this.divideIntoTeams(characters);
    this.battleLog = [];
    this.round = 0;
    this.finished = false;
    this.winner = null;
    this.updateHealthBarsCallback = updateHealthBarsCallback; // 保存回调
    // 从 main.js 获取速度设置
    const battleSpeedInput = document.getElementById('battle-speed');
    this.battleSpeedMs = parseInt(battleSpeedInput.value) || 100; // 获取并存储速度
  }

  // 将角色分为两队
  divideIntoTeams(characters) {
    // 根据名字的哈希值确定分组，确保相同名字总是分到相同队伍
    const sortedChars = [...characters].sort((a, b) => a.hash - b.hash);
    
    // 分为两队
    const teams = [
      [], // 队伍1
      []  // 队伍2
    ];
    
    // 交替分配角色到两个队伍
    sortedChars.forEach((char, index) => {
      teams[index % 2].push(char);
    });
    
    return teams;
  }

  // 开始战斗
  async start() {
    this.battleLog = [];
    this.round = 0;
    this.finished = false;
    this.winner = null;
    
    // 显示角色信息
    this.showCharacterInfo();
    
    // 战斗循环
    while (!this.finished && this.round < 50) { // 设置最大回合数防止无限循环
      await this.executeRound();
    }
    
    // 显示战斗结果
    this.showResult();
    
    return {
      winner: this.winner,
      log: this.battleLog
    };
  }

  // 显示角色信息
  showCharacterInfo() {
    this.battleLog.push('<div class="battle-round">【角色信息】</div>');
    
    this.teams.forEach((team, teamIndex) => {
      this.battleLog.push(`<div class="team-info">【队伍 ${teamIndex + 1}】</div>`);
      
      team.forEach(char => {
        const info = char.getStatusDescription();
        this.battleLog.push(
          `<div class="character">
            <div class="character-name">${info.name} (${info.type} - ${info.element})</div>
            <div class="character-stats">
              <span class="stat">生命: ${info.hp}</span>
              <span class="stat">攻击: ${info.atk}</span>
              <span class="stat">防御: ${info.def}</span>
              <span class="stat">速度: ${info.spd}</span>
              <span class="stat">智力: ${info.int}</span>
              <span class="stat">幸运: ${info.luk}</span>
            </div>
            <div>性格: ${info.personality}</div>
          </div>`
        );
      });
    });
    
    this.battleLog.push('<hr>');
  }

  // 执行一个回合
  async executeRound() {
    this.round++;
    this.battleLog.push(`<div class="battle-round">【第 ${this.round} 回合】</div>`);
    
    // 获取所有存活角色
    const allAliveCharacters = this.getAllAliveCharacters();
    
    // 根据速度排序决定行动顺序
    const actionOrder = [...allAliveCharacters].sort((a, b) => b.spd - a.spd);
    
    // 每个角色依次行动
    for (const character of actionOrder) {
      if (character.isDead) continue; // 跳过已死亡角色
      
      // 回合开始时的处理（减少技能冷却、处理buff/debuff等）
      character.onTurnStart();
      
      // 检查是否有麻痹等导致无法行动的debuff
      if (this.checkSkipTurn(character)) {
        this.battleLog.push(`<div class="action">${character.name} 无法行动！</div>`);
        continue;
      }
      
      // 选择目标
      const targets = this.selectTargets(character);
      if (!targets || targets.length === 0) continue;
      
      let skill;
      if (character.isPlayer) {
        // 为玩家生成3个随机可用技能
        character.availableSkills = this.generateAvailableSkills(character, 3);
        
        // 等待玩家选择技能
        skill = await this.waitForPlayerSkillSelection(character);
      } else {
        // AI角色选择技能
        skill = character.selectSkill(targets);
      }
      
      // 执行技能
      if (skill.isAOE) {
        skill.execute(character, targets, this.battleLog);
      } else {
        // 如果是混乱状态，有几率攻击自己或队友
        const target = this.getConfusedTarget(character, targets[0]);
        skill.execute(character, target, this.battleLog);
        
        // 检查反击
        this.checkCounterAttack(target, character);
      }
      
      // 检查是否有角色死亡
      this.checkDeaths();
      
      // 检查战斗是否结束
      if (this.checkBattleEnd()) {
        this.finished = true;
        break;
      }
      
      // 调用血条更新，并传递当前行动的角色和技能
      if (this.updateHealthBarsCallback) {
        this.updateHealthBarsCallback(this.getAllAliveCharacters(), character, skill);
      }

      // 添加短暂延迟，使用用户设定的速度
      await delay(this.battleSpeedMs);
    }
    
    return !this.finished;
  }

  // 获取所有存活角色
  getAllAliveCharacters() {
    return [...this.teams[0], ...this.teams[1]].filter(char => !char.isDead);
  }

  // 为玩家生成可用技能
  generateAvailableSkills(character, count) {
    // 获取所有未在冷却中的技能
    const availableSkills = character.skills.filter(skill => skill.currentCooldown === 0);
    
    // 如果可用技能不足，添加普通攻击
    if (availableSkills.length < count) {
      availableSkills.push({
        name: '普通攻击',
        type: 'attack',
        power: 1.0,
        description: '普通攻击',
        execute: (user, target, battleLog) => {
          const damage = Math.max(1, Math.floor(user.atk * 1.0 - target.def * 0.5));
          target.currentHp -= damage;
          battleLog.push(`${user.name} 对 ${target.name} 使用了普通攻击，造成了 ${formatBattleLog(damage, 'damage')} 点伤害！`);
          return { damage };
        }
      });
    }
    
    // 随机选择指定数量的技能
    return character.random.shuffle(availableSkills).slice(0, count);
  }

  // 等待玩家选择技能
  async waitForPlayerSkillSelection(character) {
    return new Promise(resolve => {
      // 创建技能选择界面
      const skillSelectionDiv = document.createElement('div');
      skillSelectionDiv.className = 'skill-selection';
      skillSelectionDiv.innerHTML = `
        <div class="skill-selection-title">${character.name} 的回合，请选择技能：</div>
        <div class="skill-options"></div>
      `;
      
      const skillOptionsDiv = skillSelectionDiv.querySelector('.skill-options');
      
      // 添加技能按钮
      character.availableSkills.forEach(skill => {
        const button = document.createElement('button');
        button.className = 'skill-option';
        button.innerHTML = `
          <div class="skill-name">${skill.name}</div>
          <div class="skill-description">${skill.description}</div>
        `;
        
        button.onclick = () => {
          // 移除技能选择界面
          skillSelectionDiv.remove();
          // 返回选择的技能
          resolve(skill);
        };
        
        skillOptionsDiv.appendChild(button);
      });
      
      // 添加到战斗日志区域
      document.getElementById('battle-log').appendChild(skillSelectionDiv);
    });
  }

  // 检查是否跳过回合
  checkSkipTurn(character) {
    return character.debuffs.some(debuff => debuff.effect && debuff.effect.skipTurn);
  }

  // 选择目标
  selectTargets(character) {
    const characterTeamIndex = this.getTeamIndex(character);
    const enemyTeamIndex = 1 - characterTeamIndex;
    
    // 获取敌方存活角色
    const enemies = this.teams[enemyTeamIndex].filter(char => !char.isDead);
    if (enemies.length === 0) return null;
    
    // 获取友方存活角色（包括自己）
    const allies = this.teams[characterTeamIndex].filter(char => !char.isDead);
    
    // 随机选择一个敌人作为目标
    const targetEnemy = enemies[character.random.randomInt(0, enemies.length - 1)];
    
    // 检查目标是否被嘲讽
    const tauntedTarget = this.checkTaunt(character, enemies);
    if (tauntedTarget) return [tauntedTarget];
    
    // 根据技能类型选择目标
    const skill = character.selectSkill(enemies);
    
    if (skill.targetAllies) {
      return allies;
    } else if (skill.isAOE) {
      return enemies;
    } else {
      return [targetEnemy];
    }
  }

  // 检查嘲讽效果
  checkTaunt(character, enemies) {
    for (const enemy of enemies) {
      const tauntDebuff = enemy.debuffs.find(d => d.effect && d.effect.taunt);
      if (tauntDebuff) {
        return enemy;
      }
    }
    return null;
  }

  // 处理混乱状态
  getConfusedTarget(character, originalTarget) {
    const confusionDebuff = character.debuffs.find(d => d.effect && d.effect.confusion);
    if (confusionDebuff && Math.random() < 0.5) {
      // 50%几率攻击自己或队友
      const characterTeamIndex = this.getTeamIndex(character);
      const allies = this.teams[characterTeamIndex].filter(char => !char.isDead);
      if (allies.length > 0) {
        const confusedTarget = allies[character.random.randomInt(0, allies.length - 1)];
        this.battleLog.push(`${formatBattleLog('混乱', 'debuff')}: ${character.name} 攻击了队友！`);
        return confusedTarget;
      }
    }
    return originalTarget;
  }

  // 检查反击效果
  checkCounterAttack(target, attacker) {
    if (target.isDead) return;
    
    const counterBuff = target.buffs.find(b => b.effect && b.effect.counterAttack);
    if (counterBuff && Math.random() < 0.7) { // 70%几率反击
      const damage = Math.max(1, Math.floor(target.atk * 0.7 - attacker.def * 0.3));
      attacker.currentHp -= damage;
      this.battleLog.push(`${formatBattleLog('反击', 'buff')}: ${target.name} 对 ${attacker.name} 进行了反击，造成了 ${formatBattleLog(damage, 'damage')} 点伤害！`);
      
      // 更新血条
      if (this.updateHealthBarsCallback) {
          this.updateHealthBarsCallback(this.getAllAliveCharacters());
      }

      // 检查是否死亡
      if (attacker.checkDeath()) {
        this.battleLog.push(`${attacker.name} ${formatBattleLog('死亡', 'death')}！`);
      }
    }
  }

  // 检查角色死亡
  checkDeaths() {
    const allCharacters = [...this.teams[0], ...this.teams[1]];
    
    allCharacters.forEach(char => {
      if (char.currentHp <= 0 && !char.isDead) {
        char.isDead = true;
        this.battleLog.push(`${char.name} ${formatBattleLog('死亡', 'death')}！`);
      }
    });
    // 检查死亡后更新血条
    if (this.updateHealthBarsCallback) {
        this.updateHealthBarsCallback(this.getAllAliveCharacters());
    }
  }

  // 检查战斗是否结束
  checkBattleEnd() {
    const team1Alive = this.teams[0].some(char => !char.isDead);
    const team2Alive = this.teams[1].some(char => !char.isDead);
    
    if (!team1Alive || !team2Alive) {
      if (team1Alive) {
        this.winner = 1;
      } else if (team2Alive) {
        this.winner = 2;
      } else {
        this.winner = 0; // 平局
      }
      return true;
    }
    
    return false;
  }

  // 获取角色所在队伍的索引
  getTeamIndex(character) {
    if (this.teams[0].includes(character)) return 0;
    if (this.teams[1].includes(character)) return 1;
    return -1;
  }

  // 显示战斗结果
  showResult() {
    this.battleLog.push('<hr>');
    if (this.winner === 0) {
      this.battleLog.push('<div class="battle-result">战斗结束，双方同归于尽！</div>');
    } else {
      this.battleLog.push(`<div class="battle-result">战斗结束，队伍 ${this.winner} 获胜！</div>`);
      
      // 显示获胜队伍的存活角色
      const winnerTeam = this.teams[this.winner - 1];
      const survivors = winnerTeam.filter(char => !char.isDead);
      
      if (survivors.length > 0) {
        this.battleLog.push('<div class="winner">胜利者：</div>');
        survivors.forEach(char => {
          const info = char.getStatusDescription();
          this.battleLog.push(
            `<div class="character">
              <div class="character-name">${info.name} (${info.type} - ${info.element})</div>
              <div class="character-stats">
                <span class="stat">生命: ${info.hp}</span>
              </div>
            </div>`
          );
        });
      }
    }
  }
}