import type { EnemyDef } from '../types'

export const ENEMIES: EnemyDef[] = [
  {
    id: 'slime',
    hp: 30,
    speed: 60,
    damage: 8,
    attackCooldown: 1.0,
    width: 28,
    height: 28,
    color: 0xff4444,
  },
]

export function getEnemyDef(id: string): EnemyDef {
  const def = ENEMIES.find((e) => e.id === id)
  if (!def) throw new Error(`Enemy not found: ${id}`)
  return def
}
