import type { Player } from '../entities/Player'

export type EnemyDef = {
  id: string
  hp: number
  speed: number
  damage: number
  attackCooldown: number
  width: number
  height: number
  color: number
  spriteKey?: string
}

export type SkillDef = {
  id: string
  name: string
  description: string
  apply: (player: Player) => void
}

export type WeaponDef = {
  id: string
  bulletSpeed: number
  damage: number
  fireInterval: number
  bulletWidth: number
  bulletHeight: number
  color: number
  spriteKey?: string
  soundKey?: string
}

export type RoomDef = {
  enemies: { enemyId: string; count: number }[]
}

export type StageDef = {
  id: string
  name: string
  difficulty: number   // 1〜3（★の数）
  isLocked: boolean
  backgroundColor: number
  bgmKey?: string
  backgroundKey?: string
  rooms: RoomDef[]
}
