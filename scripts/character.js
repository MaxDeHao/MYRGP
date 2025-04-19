/**
 * 角色生成与属性系统
 */

class Character {
  constructor(name, teamId = 1, isPlayer = false) { // 添加 isPlayer 参数
    this.name = name;
    this.teamId = teamId;
    this.isPlayer = isPlayer; // 标记是否为玩家角色
    this.hash = generateHash(name);
    this.random = new SeededRandom(this.hash);
    
    // 生成角色属性
    this.generateAttributes();
    
    // 生成角色技能
    this.skills = this.generateSkills();
    
    // 战斗状态
    this.currentHp = this.maxHp;
    this.isDead = false;
    this.buffs = [];
    this.debuffs = [];
    this.actionCount = 0;
    
    // 玩家角色的可选技能
    this.availableSkills = [];
  }

  // 生成角色属性
  generateAttributes() {
    // 角色类型
    const characterTypes = [
      { type: '战士', hpMod: 1.2, atkMod: 1.1, defMod: 1.1, spdMod: 0.9, intMod: 0.8, lukMod: 1.0 },
      { type: '法师', hpMod: 0.8, atkMod: 0.7, defMod: 0.8, spdMod: 1.0, intMod: 1.4, lukMod: 1.1 },
      { type: '刺客', hpMod: 0.9, atkMod: 1.2, defMod: 0.7, spdMod: 1.3, intMod: 1.0, lukMod: 1.1 },
      { type: '坦克', hpMod: 1.4, atkMod: 0.8, defMod: 1.3, spdMod: 0.7, intMod: 0.9, lukMod: 0.9 },
      { type: '射手', hpMod: 0.9, atkMod: 1.3, defMod: 0.8, spdMod: 1.1, intMod: 1.0, lukMod: 1.0 },
      { type: '辅助', hpMod: 1.0, atkMod: 0.8, defMod: 0.9, spdMod: 1.0, intMod: 1.2, lukMod: 1.2 },
      { type: '武僧', hpMod: 1.1, atkMod: 1.0, defMod: 1.0, spdMod: 1.2, intMod: 1.1, lukMod: 0.9 },
      { type: '死灵法师', hpMod: 0.9, atkMod: 1.0, defMod: 0.9, spdMod: 0.9, intMod: 1.3, lukMod: 1.0 },
      { type: '圣骑士', hpMod: 1.3, atkMod: 1.0, defMod: 1.2, spdMod: 0.8, intMod: 1.1, lukMod: 1.0 },
      { type: '德鲁伊', hpMod: 1.1, atkMod: 0.9, defMod: 1.0, spdMod: 1.0, intMod: 1.2, lukMod: 1.1 }
    ];
    
    // 随机选择角色类型
    const typeIndex = this.random.randomInt(0, characterTypes.length - 1);
    this.type = characterTypes[typeIndex].type;
    const typeMods = characterTypes[typeIndex];
    
    // 基础属性值 (50-100)
    const baseHp = this.random.randomInt(50, 100);
    const baseAtk = this.random.randomInt(50, 100);
    const baseDef = this.random.randomInt(50, 100);
    const baseSpd = this.random.randomInt(50, 100);
    const baseInt = this.random.randomInt(50, 100);
    const baseLuk = this.random.randomInt(50, 100);
    
    // 应用类型修正
    this.maxHp = Math.round(baseHp * typeMods.hpMod * 10); // 生命值放大10倍
    this.atk = Math.round(baseAtk * typeMods.atkMod);
    this.def = Math.round(baseDef * typeMods.defMod);
    this.spd = Math.round(baseSpd * typeMods.spdMod);
    this.int = Math.round(baseInt * typeMods.intMod);
    this.luk = Math.round(baseLuk * typeMods.lukMod);
    
    // 生成元素亲和力
    const elements = ['火', '水', '风', '地', '光', '暗'];
    this.element = elements[this.random.randomInt(0, elements.length - 1)];
    
    // 生成性格特点
    const personalities = ['勇敢', '谨慎', '鲁莽', '聪明', '固执', '温和', '暴躁', '冷静', '狡猾', '正直'];
    this.personality = personalities[this.random.randomInt(0, personalities.length - 1)];
  }
  
  // 生成角色技能
  generateSkills() {
    // 从全局技能池中选择4-6个技能
    const skillCount = this.random.randomInt(4, 6);
    
    // 根据角色类型和属性筛选适合的技能
    let eligibleSkills = ALL_SKILLS.filter(skill => {
      // 检查技能是否适合该角色类型
      if (skill.typeAffinity && !skill.typeAffinity.includes(this.type)) {
        return false;
      }
      
      // 检查元素亲和力
      if (skill.elementAffinity && !skill.elementAffinity.includes(this.element)) {
        return false;
      }
      
      return true;
    });
    
    // 如果筛选后技能太少，放宽条件
    if (eligibleSkills.length < skillCount) {
      eligibleSkills = ALL_SKILLS;
    }
    
    // 打乱技能列表并选择指定数量
    return this.random.shuffle(eligibleSkills).slice(0, skillCount);
  }
  
  // 选择技能
  selectSkill(opponents) {
    // 根据当前状态选择最合适的技能
    // 低血量时倾向于选择治疗技能
    const hpPercentage = this.currentHp / this.maxHp;
    
    // 根据不同情况为技能分配权重
    const weights = this.skills.map(skill => {
      let weight = 10; // 基础权重
      
      // 血量低时增加治疗和防御技能权重
      if (hpPercentage < 0.3 && (skill.type === 'heal' || skill.type === 'buff' && skill.buffType === 'def')) {
        weight += 20;
      }
      
      // 血量高时增加攻击技能权重
      if (hpPercentage > 0.7 && skill.type === 'attack') {
        weight += 10;
      }
      
      // 根据技能冷却调整权重
      if (skill.currentCooldown > 0) {
        weight = 0; // 技能在冷却中，不能使用
      }
      
      return weight;
    });
    
    // 如果所有技能都在冷却中，使用普通攻击
    if (weights.every(w => w === 0)) {
      return {
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
      };
    }
    
    // 根据权重选择技能
    const skillIndex = this.random.weightedRandom(weights);
    const selectedSkill = this.skills[skillIndex];
    
    // 设置技能冷却
    if (selectedSkill.cooldown) {
      selectedSkill.currentCooldown = selectedSkill.cooldown;
    }
    
    return selectedSkill;
  }
  
  // 执行回合开始时的操作
  onTurnStart() {
    // 减少技能冷却时间
    this.skills.forEach(skill => {
      if (skill.currentCooldown > 0) {
        skill.currentCooldown--;
      }
    });
    
    // 处理buff效果
    const expiredBuffs = [];
    this.buffs.forEach((buff, index) => {
      // 应用buff效果
      if (buff.onTurn) {
        buff.onTurn(this);
      }
      
      // 减少持续时间
      buff.duration--;
      if (buff.duration <= 0) {
        expiredBuffs.push(index);
      }
    });
    
    // 移除过期的buff
    for (let i = expiredBuffs.length - 1; i >= 0; i--) {
      this.buffs.splice(expiredBuffs[i], 1);
    }
    
    // 处理debuff效果
    const expiredDebuffs = [];
    this.debuffs.forEach((debuff, index) => {
      // 应用debuff效果
      if (debuff.onTurn) {
        debuff.onTurn(this);
      }
      
      // 减少持续时间
      debuff.duration--;
      if (debuff.duration <= 0) {
        expiredDebuffs.push(index);
      }
    });
    
    // 移除过期的debuff
    for (let i = expiredDebuffs.length - 1; i >= 0; i--) {
      this.debuffs.splice(expiredDebuffs[i], 1);
    }
    
    this.actionCount++;
  }
  
  // 添加buff
  addBuff(buff) {
    this.buffs.push(buff);
  }
  
  // 添加debuff
  addDebuff(debuff) {
    this.debuffs.push(debuff);
  }
  
  // 检查是否死亡
  checkDeath() {
    if (this.currentHp <= 0) {
      this.currentHp = 0;
      this.isDead = true;
      return true;
    }
    return false;
  }
  
  // 获取角色状态描述
  getStatusDescription() {
    return {
      name: this.name,
      type: this.type,
      element: this.element,
      personality: this.personality,
      hp: `${this.currentHp}/${this.maxHp}`,
      atk: this.atk,
      def: this.def,
      spd: this.spd,
      int: this.int,
      luk: this.luk,
      buffs: this.buffs.map(b => b.name),
      debuffs: this.debuffs.map(d => d.name)
    };
  }
}