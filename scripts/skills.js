/**
 * 技能系统 - 包含40+种多样化技能
 */

// 技能类型：攻击、治疗、增益、减益、特殊
const ALL_SKILLS = [
  // ===== 攻击技能 =====
  {
    name: '烈焰斩击',
    type: 'attack',
    power: 1.5,
    elementAffinity: ['火'],
    typeAffinity: ['战士', '圣骑士'],
    description: '带有火焰属性的强力斩击',
    cooldown: 2,
    currentCooldown: 0,
    execute: (user, target, battleLog) => {
      const baseDamage = Math.floor(user.atk * 1.5);
      let damage = Math.max(1, baseDamage - target.def * 0.7);
      
      // 元素亲和加成
      if (user.element === '火') {
        damage = Math.floor(damage * 1.2);
        battleLog.push(`${formatBattleLog('元素亲和', 'buff')}：火属性伤害提升！`);
      }
      
      // 暴击判定
      const critChance = user.luk / 200;
      if (Math.random() < critChance) {
        damage = Math.floor(damage * 1.5);
        battleLog.push(`${formatBattleLog('暴击', 'critical')}！`);
      }
      
      target.currentHp -= damage;
      battleLog.push(`${user.name} 使用了 ${formatBattleLog('烈焰斩击', 'skill-used')}，对 ${target.name} 造成了 ${formatBattleLog(damage, 'damage')} 点火焰伤害！`);
      
      // 有几率造成灼烧效果
      if (Math.random() < 0.3) {
        const burn = {
          name: '灼烧',
          duration: 2,
          onTurn: (affected) => {
            const burnDamage = Math.floor(user.int * 0.3);
            affected.currentHp -= burnDamage;
            battleLog.push(`${affected.name} 受到 ${formatBattleLog('灼烧', 'debuff')} 效果影响，损失了 ${formatBattleLog(burnDamage, 'damage')} 点生命值！`);
          }
        };
        target.addDebuff(burn);
        battleLog.push(`${target.name} 被 ${formatBattleLog('灼烧', 'debuff')} 了！`);
      }
      
      return { damage };
    }
  },
  {
    name: '寒冰箭',
    type: 'attack',
    power: 1.3,
    elementAffinity: ['水'],
    typeAffinity: ['法师', '射手'],
    description: '发射一支冰冻之箭',
    cooldown: 1,
    currentCooldown: 0,
    execute: (user, target, battleLog) => {
      const baseDamage = Math.floor(user.int * 1.3);
      let damage = Math.max(1, baseDamage - target.def * 0.5);
      
      // 元素亲和加成
      if (user.element === '水') {
        damage = Math.floor(damage * 1.2);
        battleLog.push(`${formatBattleLog('元素亲和', 'buff')}：水属性伤害提升！`);
      }
      
      target.currentHp -= damage;
      battleLog.push(`${user.name} 使用了 ${formatBattleLog('寒冰箭', 'skill-used')}，对 ${target.name} 造成了 ${formatBattleLog(damage, 'damage')} 点冰霜伤害！`);
      
      // 有几率造成减速效果
      if (Math.random() < 0.4) {
        const slow = {
          name: '减速',
          duration: 2,
          effect: {
            spd: Math.floor(target.spd * 0.3)
          },
          onApply: (affected) => {
            affected.spd -= slow.effect.spd;
          },
          onRemove: (affected) => {
            affected.spd += slow.effect.spd;
          }
        };
        target.addDebuff(slow);
        slow.onApply(target);
        battleLog.push(`${target.name} 被 ${formatBattleLog('减速', 'debuff')} 了！`);
      }
      
      return { damage };
    }
  },
  {
    name: '暗影突袭',
    type: 'attack',
    power: 1.8,
    elementAffinity: ['暗'],
    typeAffinity: ['刺客', '死灵法师'],
    description: '从暗影中突袭，造成高额伤害',
    cooldown: 3,
    currentCooldown: 0,
    execute: (user, target, battleLog) => {
      const baseDamage = Math.floor((user.atk + user.spd) * 0.9);
      let damage = Math.max(1, baseDamage - target.def * 0.4);
      
      // 元素亲和加成
      if (user.element === '暗') {
        damage = Math.floor(damage * 1.2);
        battleLog.push(`${formatBattleLog('元素亲和', 'buff')}：暗属性伤害提升！`);
      }
      
      // 背刺效果：如果目标有debuff，伤害提高
      if (target.debuffs.length > 0) {
        damage = Math.floor(damage * 1.3);
        battleLog.push(`${formatBattleLog('背刺', 'buff')}：目标虚弱，伤害提升！`);
      }
      
      target.currentHp -= damage;
      battleLog.push(`${user.name} 使用了 ${formatBattleLog('暗影突袭', 'skill-used')}，对 ${target.name} 造成了 ${formatBattleLog(damage, 'damage')} 点暗影伤害！`);
      
      return { damage };
    }
  },
  {
    name: '雷霆一击',
    type: 'attack',
    power: 2.0,
    elementAffinity: ['风'],
    typeAffinity: ['战士', '武僧'],
    description: '蓄力后释放强大的雷电攻击',
    cooldown: 4,
    currentCooldown: 0,
    execute: (user, target, battleLog) => {
      const baseDamage = Math.floor(user.atk * 2.0);
      let damage = Math.max(1, baseDamage - target.def * 0.6);
      
      // 元素亲和加成
      if (user.element === '风') {
        damage = Math.floor(damage * 1.2);
        battleLog.push(`${formatBattleLog('元素亲和', 'buff')}：风属性伤害提升！`);
      }
      
      // 暴击率提高
      const critChance = user.luk / 100;
      if (Math.random() < critChance) {
        damage = Math.floor(damage * 2.0);
        battleLog.push(`${formatBattleLog('暴击', 'critical')}！`);
      }
      
      target.currentHp -= damage;
      battleLog.push(`${user.name} 使用了 ${formatBattleLog('雷霆一击', 'skill-used')}，对 ${target.name} 造成了 ${formatBattleLog(damage, 'damage')} 点雷电伤害！`);
      
      // 有几率造成麻痹效果
      if (Math.random() < 0.25) {
        const paralyze = {
          name: '麻痹',
          duration: 1,
          effect: {
            skipTurn: true
          }
        };
        target.addDebuff(paralyze);
        battleLog.push(`${target.name} 被 ${formatBattleLog('麻痹', 'debuff')} 了！下回合无法行动！`);
      }
      
      return { damage };
    }
  },
  {
    name: '大地震击',
    type: 'attack',
    power: 1.4,
    elementAffinity: ['地'],
    typeAffinity: ['坦克', '战士'],
    description: '引发地震攻击所有敌人',
    cooldown: 3,
    currentCooldown: 0,
    isAOE: true,
    execute: (user, targets, battleLog) => {
      let totalDamage = 0;
      
      targets.forEach(target => {
        if (!target.isDead) {
          const baseDamage = Math.floor(user.atk * 1.4);
          let damage = Math.max(1, baseDamage - target.def * 0.8);
          
          // 元素亲和加成
          if (user.element === '地') {
            damage = Math.floor(damage * 1.2);
          }
          
          target.currentHp -= damage;
          totalDamage += damage;
          battleLog.push(`${target.name} 受到了 ${formatBattleLog(damage, 'damage')} 点地震伤害！`);
        }
      });
      
      battleLog.unshift(`${user.name} 使用了 ${formatBattleLog('大地震击', 'skill-used')}，大地震动！`);
      
      if (user.element === '地') {
        battleLog.push(`${formatBattleLog('元素亲和', 'buff')}：地属性伤害提升！`);
      }
      
      return { damage: totalDamage };
    }
  },
  {
    name: '神圣审判',
    type: 'attack',
    power: 1.6,
    elementAffinity: ['光'],
    typeAffinity: ['圣骑士', '辅助'],
    description: '召唤神圣之光审判敌人',
    cooldown: 3,
    currentCooldown: 0,
    execute: (user, target, battleLog) => {
      const baseDamage = Math.floor(user.int * 1.6);
      let damage = Math.max(1, baseDamage - target.def * 0.5);
      
      // 元素亲和加成
      if (user.element === '光') {
        damage = Math.floor(damage * 1.2);
        battleLog.push(`${formatBattleLog('元素亲和', 'buff')}：光属性伤害提升！`);
      }
      
      // 对暗属性目标伤害提高
      if (target.element === '暗') {
        damage = Math.floor(damage * 1.5);
        battleLog.push(`${formatBattleLog('属性克制', 'buff')}：对暗属性目标伤害提升！`);
      }
      
      target.currentHp -= damage;
      battleLog.push(`${user.name} 使用了 ${formatBattleLog('神圣审判', 'skill-used')}，对 ${target.name} 造成了 ${formatBattleLog(damage, 'damage')} 点神圣伤害！`);
      
      // 自身获得少量治疗
      const healAmount = Math.floor(damage * 0.2);
      user.currentHp = Math.min(user.maxHp, user.currentHp + healAmount);
      battleLog.push(`${user.name} 获得了 ${formatBattleLog(healAmount, 'heal')} 点生命值回复！`);
      
      return { damage, heal: healAmount };
    }
  },
  {
    name: '毒液喷射',
    type: 'attack',
    power: 1.2,
    elementAffinity: ['暗'],
    typeAffinity: ['刺客', '死灵法师'],
    description: '喷射毒液，造成持续伤害',
    cooldown: 2,
    currentCooldown: 0,
    execute: (user, target, battleLog) => {
      const baseDamage = Math.floor(user.int * 1.2);
      let damage = Math.max(1, baseDamage - target.def * 0.4);
      
      target.currentHp -= damage;
      battleLog.push(`${user.name} 使用了 ${formatBattleLog('毒液喷射', 'skill-used')}，对 ${target.name} 造成了 ${formatBattleLog(damage, 'damage')} 点伤害！`);
      
      // 添加中毒效果
      const poison = {
        name: '中毒',
        duration: 3,
        onTurn: (affected) => {
          const poisonDamage = Math.floor(user.int * 0.4);
          affected.currentHp -= poisonDamage;
          battleLog.push(`${affected.name} 受到 ${formatBattleLog('中毒', 'debuff')} 效果影响，损失了 ${formatBattleLog(poisonDamage, 'damage')} 点生命值！`);
        }
      };
      target.addDebuff(poison);
      battleLog.push(`${target.name} 被 ${formatBattleLog('中毒', 'debuff')} 了！`);
      
      return { damage };
    }
  },
  {
    name: '连续打击',
    type: 'attack',
    power: 0.6,
    typeAffinity: ['武僧', '刺客'],
    description: '快速连续攻击敌人多次',
    cooldown: 2,
    currentCooldown: 0,
    execute: (user, target, battleLog) => {
      const hitCount = user.random.randomInt(3, 5);
      let totalDamage = 0;
      
      battleLog.push(`${user.name} 使用了 ${formatBattleLog('连续打击', 'skill-used')}！`);
      
      for (let i = 0; i < hitCount; i++) {
        const baseDamage = Math.floor(user.atk * 0.6);
        let damage = Math.max(1, baseDamage - target.def * 0.3);
        
        // 每次连击暴击率独立计算
        const critChance = user.luk / 300;
        if (Math.random() < critChance) {
          damage = Math.floor(damage * 1.5);
          battleLog.push(`第 ${i+1} 击 ${formatBattleLog('暴击', 'critical')}！`);
        }
        
        target.currentHp -= damage;
        totalDamage += damage;
        battleLog.push(`第 ${i+1} 击对 ${target.name} 造成了 ${formatBattleLog(damage, 'damage')} 点伤害！`);
      }
      
      battleLog.push(`${formatBattleLog('连续打击', 'skill-used')} 总共造成了 ${formatBattleLog(totalDamage, 'damage')} 点伤害！`);
      
      return { damage: totalDamage };
    }
  },
  {
    name: '精准射击',
    type: 'attack',
    power: 1.7,
    typeAffinity: ['射手'],
    description: '瞄准弱点进行精准射击',
    cooldown: 2,
    currentCooldown: 0,
    execute: (user, target, battleLog) => {
      const baseDamage = Math.floor(user.atk * 1.7);
      let damage = Math.max(1, baseDamage - target.def * 0.3); // 无视部分防御
      
      // 高暴击率
      const critChance = user.luk / 100 + 0.2;
      if (Math.random() < critChance) {
        damage = Math.floor(damage * 1.8);
        battleLog.push(`${formatBattleLog('暴击', 'critical')}！命中要害！`);
      }
      
      target.currentHp -= damage;
      battleLog.push(`${user.name} 使用了 ${formatBattleLog('精准射击', 'skill-used')}，对 ${target.name} 造成了 ${formatBattleLog(damage, 'damage')} 点伤害！`);
      
      return { damage };
    }
  },
  {
    name: '元素爆发',
    type: 'attack',
    power: 2.0,
    typeAffinity: ['法师', '德鲁伊'],
    description: '引发强大的元素爆发',
    cooldown: 4,
    currentCooldown: 0,
    isAOE: true,
    execute: (user, targets, battleLog) => {
      let totalDamage = 0;
      
      // 根据角色元素类型确定爆发属性
      const elementName = user.element;
      
      battleLog.push(`${user.name} 使用了 ${formatBattleLog('元素爆发', 'skill-used')}，引发强大的${elementName}元素爆发！`);
      
      targets.forEach(target => {
        if (!target.isDead) {
          const baseDamage = Math.floor(user.int * 2.0);
          let damage = Math.max(1, baseDamage - target.def * 0.4);
          
          // 元素亲和加成
          if (user.element === elementName) {
            damage = Math.floor(damage * 1.3);
          }
          
          // 元素相克系统
          if ((user.element === '火' && target.element === '风') ||
              (user.element === '水' && target.element === '火') ||
              (user.element === '风' && target.element === '地') ||
              (user.element === '地' && target.element === '水') ||
              (user.element === '光' && target.element === '暗') ||
              (user.element === '暗' && target.element === '光')) {
            damage = Math.floor(damage * 1.5);
            battleLog.push(`${formatBattleLog('属性克制', 'buff')}：对 ${target.name} 的伤害提升！`);
          }
          
          target.currentHp -= damage;
          totalDamage += damage;
          battleLog.push(`${target.name} 受到了 ${formatBattleLog(damage, 'damage')} 点${elementName}元素伤害！`);
        }
      });
      
      return { damage: totalDamage };
    }
  },
  
  // ===== 治疗技能 =====
  {
    name: '治愈之光',
    type: 'heal',
    power: 1.5,
    elementAffinity: ['光'],
    typeAffinity: ['辅助', '圣骑士'],
    description: '释放治愈之光恢复生命',
    cooldown: 3,
    currentCooldown: 0,
    execute: (user, target, battleLog) => {
      const baseHeal = Math.floor(user.int * 1.5);
      let healAmount = baseHeal;
      
      // 元素亲和加成
      if (user.element === '光') {
        healAmount = Math.floor(healAmount * 1.3);
        battleLog.push(`${formatBattleLog('元素亲和', 'buff')}：治疗效果提升！`);
      }
      
      // 如果目标生命值很低，治疗效果提升
      if (target.currentHp / target.maxHp < 0.3) {
        healAmount = Math.floor(healAmount * 1.5);
        battleLog.push(`${formatBattleLog('紧急治疗', 'buff')}：治疗效果大幅提升！`);
      }
      
      target.currentHp = Math.min(target.maxHp, target.currentHp + healAmount);
      battleLog.push(`${user.name} 使用了 ${formatBattleLog('治愈之光', 'skill-used')}，为 ${target.name} 恢复了 ${formatBattleLog(healAmount, 'heal')} 点生命值！`);
      
      // 有几率清除debuff
      if (Math.random() < 0.3 && target.debuffs.length > 0) {
        const removedDebuff = target.debuffs.pop();
        if (removedDebuff.onRemove) {
          removedDebuff.onRemove(target);
        }
        battleLog.push(`${formatBattleLog('净化', 'buff')}：${target.name} 的 ${removedDebuff.name} 状态被移除了！`);
      }
      
      return { heal: healAmount };
    }
  },
  {
    name: '生命汲取',
    type: 'attack',
    power: 1.2,
    elementAffinity: ['暗'],
    typeAffinity: ['死灵法师', '法师'],
    description: '吸取敌人生命值',
    cooldown: 2,
    currentCooldown: 0,
    execute: (user, target, battleLog) => {
      const baseDamage = Math.floor(user.int * 1.2);
      let damage = Math.max(1, baseDamage - target.def * 0.5);
      
      // 元素亲和加成
      if (user.element === '暗') {
        damage = Math.floor(damage * 1.2);
        battleLog.push(`${formatBattleLog('元素亲和', 'buff')}：暗属性伤害提升！`);
      }
      
      target.currentHp -= damage;
      battleLog.push(`${user.name} 使用了 ${formatBattleLog('生命汲取', 'skill-used')}，对 ${target.name} 造成了 ${formatBattleLog(damage, 'damage')} 点暗影伤害！`);
      
      // 吸取生命
      const healAmount = Math.floor(damage * 0.6);
      user.currentHp = Math.min(user.maxHp, user.currentHp + healAmount);
      battleLog.push(`${user.name} 从 ${target.name} 身上汲取了 ${formatBattleLog(healAmount, 'heal')} 点生命值！`);
      
      return { damage, heal: healAmount };
    }
  },
  {
    name: '自然之愈',
    type: 'heal',
    power: 1.0,
    elementAffinity: ['地', '水'],
    typeAffinity: ['德鲁伊', '辅助'],
    description: '释放自然能量治疗并提供持续恢复',
    cooldown: 3,
    currentCooldown: 0,
    execute: (user, target, battleLog) => {
      const baseHeal = Math.floor(user.int * 1.0);
      let healAmount = baseHeal;
      
      // 元素亲和加成
      if (user.element === '地' || user.element === '水') {
        healAmount = Math.floor(healAmount * 1.2);
        battleLog.push(`${formatBattleLog('元素亲和', 'buff')}：治疗效果提升！`);
      }
      
      target.currentHp = Math.min(target.maxHp, target.currentHp + healAmount);
      battleLog.push(`${user.name} 使用了 ${formatBattleLog('自然之愈', 'skill-used')}，为 ${target.name} 恢复了 ${formatBattleLog(healAmount, 'heal')} 点生命值！`);
      
      // 添加持续恢复效果
      const regen = {
        name: '生命再生',
        duration: 3,
        onTurn: (affected) => {
          const regenAmount = Math.floor(user.int * 0.3);
          affected.currentHp = Math.min(affected.maxHp, affected.currentHp + regenAmount);
          battleLog.push(`${affected.name} 受到 ${formatBattleLog('生命再生', 'buff')} 效果影响，恢复了 ${formatBattleLog(regenAmount, 'heal')} 点生命值！`);
        }
      };
      target.addBuff(regen);
      battleLog.push(`${target.name} 获得了 ${formatBattleLog('生命再生', 'buff')} 效果！`);
      
      return { heal: healAmount };
    }
  },
  {
    name: '群体治疗',
    type: 'heal',
    power: 1.0,
    elementAffinity: ['光', '水'],
    typeAffinity: ['辅助', '德鲁伊'],
    description: '治疗所有友方单位',
    cooldown: 4,
    currentCooldown: 0,
    isAOE: true,
    targetAllies: true,
    execute: (user, targets, battleLog) => {
      let totalHeal = 0;
      
      battleLog.push(`${user.name} 使用了 ${formatBattleLog('群体治疗', 'skill-used')}！`);
      
      // 元素亲和加成
      let healMod = 1.0;
      if (user.element === '光' || user.element === '水') {
        healMod = 1.2;
        battleLog.push(`${formatBattleLog('元素亲和', 'buff')}：治疗效果提升！`);
      }
      
      targets.forEach(target => {
        if (!target.isDead) {
          const healAmount = Math.floor(user.int * 1.0 * healMod);
          target.currentHp = Math.min(target.maxHp, target.currentHp + healAmount);
          totalHeal += healAmount;
          battleLog.push(`${target.name} 恢复了 ${formatBattleLog(healAmount, 'heal')} 点生命值！`);
        }
      });
      
      return { heal: totalHeal };
    }
  },
  
  // ===== 增益技能 =====
  {
    name: '战斗怒吼',
    type: 'buff',
    buffType: 'atk',
    typeAffinity: ['战士', '坦克'],
    description: '提高自身和友方攻击力',
    cooldown: 3,
    currentCooldown: 0,
    isAOE: true,
    targetAllies: true,
    execute: (user, targets, battleLog) => {
      battleLog.push(`${user.name} 使用了 ${formatBattleLog('战斗怒吼', 'skill-used')}！`);
      
      targets.forEach(target => {
        if (!target.isDead) {
          const atkBoost = Math.floor(target.atk * 0.3);
          
          const buff = {
            name: '攻击提升',
            duration: 3,
            effect: {
              atk: atkBoost
            },
            onApply: (affected) => {
              affected.atk += buff.effect.atk;
            },
            onRemove: (affected) => {
              affected.atk -= buff.effect.atk;
            }
          };
          
          target.addBuff(buff);
          buff.onApply(target);
          battleLog.push(`${target.name} 的攻击力提升了 ${formatBattleLog(atkBoost, 'buff')} 点！`);
        }
      });
      
      return { buffApplied: true };
    }
  },
  {
    name: '钢铁之肤',
    type: 'buff',
    buffType: 'def',
    typeAffinity: ['坦克', '圣骑士'],
    description: '强化皮肤，提高防御力',
    cooldown: 3,
    currentCooldown: 0,
    execute: (user, target, battleLog) => {
      const defBoost = Math.floor(target.def * 0.4);
      
      const buff = {
        name: '防御提升',
        duration: 3,
        effect: {
          def: defBoost
        },
        onApply: (affected) => {
          affected.def += buff.effect.def;
        },
        onRemove: (affected) => {
          affected.def -= buff.effect.def;
        }
      };
      
      target.addBuff(buff);
      buff.onApply(target);
      battleLog.push(`${user.name} 使用了 ${formatBattleLog('钢铁之肤', 'skill-used')}，${target.name} 的防御力提升了 ${formatBattleLog(defBoost, 'buff')} 点！`);
      
      return { buffApplied: true };
    }
  },
  {
    name: '迅捷术',
    type: 'buff',
    buffType: 'spd',
    typeAffinity: ['刺客', '射手'],
    description: '提高移动和攻击速度',
    cooldown: 3,
    currentCooldown: 0,
    execute: (user, target, battleLog) => {
      const spdBoost = Math.floor(target.spd * 0.5);
      
      const buff = {
        name: '速度提升',
        duration: 3,
        effect: {
          spd: spdBoost
        },
        onApply: (affected) => {
          affected.spd += buff.effect.spd;
        },
        onRemove: (affected) => {
          affected.spd -= buff.effect.spd;
        }
      };
      
      target.addBuff(buff);
      buff.onApply(target);
      battleLog.push(`${user.name} 使用了 ${formatBattleLog('迅捷术', 'skill-used')}，${target.name} 的速度提升了 ${formatBattleLog(spdBoost, 'buff')} 点！`);
      
      return { buffApplied: true };
    }
  },
  {
    name: '智慧祝福',
    type: 'buff',
    buffType: 'int',
    typeAffinity: ['法师', '辅助'],
    description: '提高智力和法术威力',
    cooldown: 3,
    currentCooldown: 0,
    execute: (user, target, battleLog) => {
      const intBoost = Math.floor(target.int * 0.4);
      
      const buff = {
        name: '智力提升',
        duration: 3,
        effect: {
          int: intBoost
        },
        onApply: (affected) => {
          affected.int += buff.effect.int;
        },
        onRemove: (affected) => {
          affected.int -= buff.effect.int;
        }
      };
      
      target.addBuff(buff);
      buff.onApply(target);
      battleLog.push(`${user.name} 使用了 ${formatBattleLog('智慧祝福', 'skill-used')}，${target.name} 的智力提升了 ${formatBattleLog(intBoost, 'buff')} 点！`);
      
      return { buffApplied: true };
    }
  },
  {
    name: '幸运光环',
    type: 'buff',
    buffType: 'luk',
    typeAffinity: ['辅助', '射手'],
    description: '提高幸运值和暴击率',
    cooldown: 3,
    currentCooldown: 0,
    execute: (user, target, battleLog) => {
      const lukBoost = Math.floor(target.luk * 0.5);
      
      const buff = {
        name: '幸运提升',
        duration: 3,
        effect: {
          luk: lukBoost
        },
        onApply: (affected) => {
          affected.luk += buff.effect.luk;
        },
        onRemove: (affected) => {
          affected.luk -= buff.effect.luk;
        }
      };
      
      target.addBuff(buff);
      buff.onApply(target);
      battleLog.push(`${user.name} 使用了 ${formatBattleLog('幸运光环', 'skill-used')}，${target.name} 的幸运值提升了 ${formatBattleLog(lukBoost, 'buff')} 点！`);
      
      return { buffApplied: true };
    }
  },
  {
    name: '元素亲和',
    type: 'buff',
    buffType: 'special',
    typeAffinity: ['法师', '德鲁伊'],
    description: '增强元素伤害',
    cooldown: 4,
    currentCooldown: 0,
    execute: (user, target, battleLog) => {
      const buff = {
        name: '元素增幅',
        duration: 3,
        effect: {
          elementalDamage: 0.5 // 增加50%元素伤害
        }
      };
      
      target.addBuff(buff);
      battleLog.push(`${user.name} 使用了 ${formatBattleLog('元素亲和', 'skill-used')}，${target.name} 的元素伤害提升了 ${formatBattleLog('50%', 'buff')}！`);
      
      return { buffApplied: true };
    }
  },
  
  // ===== 减益技能 =====
  {
    name: '虚弱诅咒',
    type: 'debuff',
    buffType: 'atk',
    elementAffinity: ['暗'],
    typeAffinity: ['死灵法师', '法师'],
    description: '降低目标攻击力',
    cooldown: 3,
    currentCooldown: 0,
    execute: (user, target, battleLog) => {
      const atkReduction = Math.floor(target.atk * 0.3);
      
      const debuff = {
        name: '攻击降低',
        duration: 3,
        effect: {
          atk: atkReduction
        },
        onApply: (affected) => {
          affected.atk -= debuff.effect.atk;
        },
        onRemove: (affected) => {
          affected.atk += debuff.effect.atk;
        }
      };
      
      target.addDebuff(debuff);
      debuff.onApply(target);
      battleLog.push(`${user.name} 使用了 ${formatBattleLog('虚弱诅咒', 'skill-used')}，${target.name} 的攻击力降低了 ${formatBattleLog(atkReduction, 'debuff')} 点！`);
      
      return { debuffApplied: true };
    }
  },
  {
    name: '腐蚀护甲',
    type: 'debuff',
    buffType: 'def',
    elementAffinity: ['水', '暗'],
    typeAffinity: ['法师', '死灵法师'],
    description: '腐蚀目标护甲，降低防御力',
    cooldown: 3,
    currentCooldown: 0,
    execute: (user, target, battleLog) => {
      const defReduction = Math.floor(target.def * 0.4);
      
      const debuff = {
        name: '防御降低',
        duration: 3,
        effect: {
          def: defReduction
        },
        onApply: (affected) => {
          affected.def -= debuff.effect.def;
        },
        onRemove: (affected) => {
          affected.def += debuff.effect.def;
        }
      };
      
      target.addDebuff(debuff);
      debuff.onApply(target);
      battleLog.push(`${user.name} 使用了 ${formatBattleLog('腐蚀护甲', 'skill-used')}，${target.name} 的防御力降低了 ${formatBattleLog(defReduction, 'debuff')} 点！`);
      
      return { debuffApplied: true };
    }
  },
  {
    name: '混乱之触',
    type: 'debuff',
    buffType: 'special',
    elementAffinity: ['暗', '风'],
    typeAffinity: ['法师', '刺客'],
    description: '使目标陷入混乱，有几率攻击自己',
    cooldown: 4,
    currentCooldown: 0,
    execute: (user, target, battleLog) => {
      const debuff = {
        name: '混乱',
        duration: 2,
        effect: {
          confusion: true
        }
      };
      
      target.addDebuff(debuff);
      battleLog.push(`${user.name} 使用了 ${formatBattleLog('混乱之触', 'skill-used')}，${target.name} 陷入了 ${formatBattleLog('混乱', 'debuff')} 状态！`);
      
      return { debuffApplied: true };
    }
  },
  {
    name: '恐惧尖啸',
    type: 'debuff',
    buffType: 'special',
    elementAffinity: ['暗'],
    typeAffinity: ['死灵法师', '坦克'],
    description: '发出恐怖尖啸，降低所有敌人的属性',
    cooldown: 4,
    currentCooldown: 0,
    isAOE: true,
    execute: (user, targets, battleLog) => {
      battleLog.push(`${user.name} 使用了 ${formatBattleLog('恐惧尖啸', 'skill-used')}！`);
      
      targets.forEach(target => {
        if (!target.isDead) {
          const statReduction = Math.floor(target.luk * 0.2);
          
          const debuff = {
            name: '恐惧',
            duration: 2,
            effect: {
              atk: statReduction,
              def: statReduction,
              spd: statReduction
            },
            onApply: (affected) => {
              affected.atk -= debuff.effect.atk;
              affected.def -= debuff.effect.def;
              affected.spd -= debuff.effect.spd;
            },
            onRemove: (affected) => {
              affected.atk += debuff.effect.atk;
              affected.def += debuff.effect.def;
              affected.spd += debuff.effect.spd;
            }
          };
          
          target.addDebuff(debuff);
          debuff.onApply(target);
          battleLog.push(`${target.name} 陷入了 ${formatBattleLog('恐惧', 'debuff')} 状态，多项属性降低了 ${formatBattleLog(statReduction, 'debuff')} 点！`);
        }
      });
      
      return { debuffApplied: true };
    }
  },
  
  // ===== 特殊技能 =====
  {
    name: '反击姿态',
    type: 'special',
    typeAffinity: ['战士', '武僧'],
    description: '进入反击姿态，受到攻击时自动反击',
    cooldown: 4,
    currentCooldown: 0,
    execute: (user, target, battleLog) => {
      const buff = {
        name: '反击姿态',
        duration: 3,
        effect: {
          counterAttack: true
        }
      };
      
      user.addBuff(buff);
      battleLog.push(`${user.name} 使用了 ${formatBattleLog('反击姿态', 'skill-used')}，进入了 ${formatBattleLog('反击', 'buff')} 状态！`);
      
      return { buffApplied: true };
    }
  },
  {
    name: '嘲讽',
    type: 'special',
    typeAffinity: ['坦克', '战士'],
    description: '嘲讽敌人，吸引攻击',
    cooldown: 3,
    currentCooldown: 0,
    execute: (user, target, battleLog) => {
      const debuff = {
        name: '嘲讽',
        duration: 2,
        effect: {
          taunt: user.name
        }
      };
      
      target.addDebuff(debuff);
      battleLog.push(`${user.name} 使用了 ${formatBattleLog('嘲讽', 'skill-used')}，${target.name} 被 ${formatBattleLog('嘲讽', 'debuff')} 了！`);
      
      return { debuffApplied: true };
    }
  },
  {
    name: '生命链接',
    type: 'special',
    typeAffinity: ['辅助', '德鲁伊'],
    description: '与目标建立生命链接，共享治疗效果',
    cooldown: 4,
    currentCooldown: 0,
    execute: (user, target, battleLog) => {
      const buff = {
        name: '生命链接',
        duration: 4,
        effect: {
          lifeLink: user.name
        }
      };
      
      target.addBuff(buff);
      battleLog.push(`${user.name} 使用了 ${formatBattleLog('生命链接', 'skill-used')}，与 ${target.name} 建立了 ${formatBattleLog('生命链接', 'buff')}！`);
      
      return { buffApplied: true };
    }
  },
  {
    name: '元素转换',
    type: 'special',
    typeAffinity: ['法师', '德鲁伊'],
    description: '临时改变自身元素属性',
    cooldown: 5,
    currentCooldown: 0,
    execute: (user, target, battleLog) => {
      const elements = ['火', '水', '风', '地', '光', '暗'];
      const currentElement = user.element;
      let newElement;
      
      do {
        newElement = elements[user.random.randomInt(0, elements.length - 1)];
      } while (newElement === currentElement);
      
      const oldElement = user.element;
      user.element = newElement;
      
      const buff = {
        name: '元素转换',
        duration: 3,
        onRemove: (affected) => {
          affected.element = oldElement;
          battleLog.push(`${affected.name} 的元素属性恢复为 ${formatBattleLog(oldElement, 'buff')}！`);
        }
      };
      
      user.addBuff(buff);
      battleLog.push(`${user.name} 使用了 ${formatBattleLog('元素转换', 'skill-used')}，元素属性从 ${formatBattleLog(oldElement, 'buff')} 变为了 ${formatBattleLog(newElement, 'buff')}！`);
      
      return { buffApplied: true };
    }
  },
  {
    name: '命运骰子',
    type: 'special',
    typeAffinity: ['辅助'],
    description: '投掷命运骰子，随机增强或减弱目标',
    cooldown: 3,
    currentCooldown: 0,
    execute: (user, target, battleLog) => {
      const roll = user.random.randomInt(1, 6);
      battleLog.push(`${user.name} 使用了 ${formatBattleLog('命运骰子', 'skill-used')}，掷出了 ${formatBattleLog(roll, 'buff')} 点！`);
      
      if (roll > 3) { // 好结果
        const statBoost = Math.floor(user.luk * 0.3);
        const stats = ['atk', 'def', 'spd', 'int', 'luk'];
        const stat = stats[user.random.randomInt(0, stats.length - 1)];
        
        const buff = {
          name: '命运祝福',
          duration: 3,
          effect: {},
          onApply: (affected) => {
            affected[stat] += statBoost;
          },
          onRemove: (affected) => {
            affected[stat] -= statBoost;
          }
        };
        buff.effect[stat] = statBoost;
        
        target.addBuff(buff);
        buff.onApply(target);
        battleLog.push(`${target.name} 获得了 ${formatBattleLog('命运祝福', 'buff')}，${stat} 提升了 ${formatBattleLog(statBoost, 'buff')} 点！`);
        
        return { buffApplied: true };
      } else { // 坏结果
        const statReduction = Math.floor(user.luk * 0.2);
        const stats = ['atk', 'def', 'spd', 'int', 'luk'];
        const stat = stats[user.random.randomInt(0, stats.length - 1)];
        
        const debuff = {
          name: '命运诅咒',
          duration: 2,
          effect: {},
          onApply: (affected) => {
            affected[stat] -= statReduction;
          },
          onRemove: (affected) => {
            affected[stat] += statReduction;
          }
        };
        debuff.effect[stat] = statReduction;
        
        target.addDebuff(debuff);
        debuff.onApply(target);
        battleLog.push(`${target.name} 受到了 ${formatBattleLog('命运诅咒', 'debuff')}，${stat} 降低了 ${formatBattleLog(statReduction, 'debuff')} 点！`);
        
        return { debuffApplied: true };
      }
    }
  },
  {
    name: '绝地反击',
    type: 'special',
    typeAffinity: ['战士', '圣骑士'],
    description: '生命值越低，伤害越高',
    cooldown: 4,
    currentCooldown: 0,
    execute: (user, target, battleLog) => {
      const hpPercentage = user.currentHp / user.maxHp;
      const damageMod = 2.0 + (1.0 - hpPercentage) * 3.0; // 血量越低伤害越高
      
      const baseDamage = Math.floor(user.atk * damageMod);
      let damage = Math.max(1, baseDamage - target.def * 0.5);
      
      // 必定暴击
      damage = Math.floor(damage * 1.5);
      battleLog.push(`${formatBattleLog('暴击', 'critical')}！`);
      
      target.currentHp -= damage;
      battleLog.push(`${user.name} 使用了 ${formatBattleLog('绝地反击', 'skill-used')}，对 ${target.name} 造成了 ${formatBattleLog(damage, 'damage')} 点伤害！`);
      
      return { damage };
    }
  },
  {
    name: '灵魂收割',
    type: 'special',
    elementAffinity: ['暗'],
    typeAffinity: ['死灵法师', '刺客'],
    description: '对生命值低的目标造成致命一击',
    cooldown: 5,
    currentCooldown: 0,
    execute: (user, target, battleLog) => {
      const targetHpPercentage = target.currentHp / target.maxHp;
      let damage;
      
      if (targetHpPercentage < 0.3) { // 目标生命值低于30%时造成致命伤害
        damage = Math.floor(target.currentHp * 0.8); // 造成当前生命值80%的伤害
        battleLog.push(`${formatBattleLog('致命收割', 'critical')}！`);
      } else {
        damage = Math.floor(user.int * 1.5);
      }
      
      target.currentHp -= damage;
      battleLog.push(`${user.name} 使用了 ${formatBattleLog('灵魂收割', 'skill-used')}，对 ${target.name} 造成了 ${formatBattleLog(damage, 'damage')} 点伤害！`);
      
      return { damage };
    }
  }
];