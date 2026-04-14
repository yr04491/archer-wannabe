import type { SkillDef } from '../types'
import type { Player } from '../entities/Player'

export const SKILLS: SkillDef[] = [
  {
    id: 'attack_speed_up',
    name: '連射強化',
    description: '攻撃間隔\n-20%',
    apply: (player: Player) => {
      player.fireInterval = Math.max(0.2, player.fireInterval * 0.8)
    },
  },
  {
    id: 'damage_up',
    name: '攻撃力強化',
    description: 'ダメージ\n+5',
    apply: (player: Player) => {
      player.bulletDamage += 5
    },
  },
  {
    id: 'hp_recover',
    name: 'HP回復',
    description: 'HP\n+30',
    apply: (player: Player) => {
      player.hp = Math.min(player.maxHp, player.hp + 30)
    },
  },
]
