import type { WeaponDef } from '../types'

export const WEAPONS: WeaponDef[] = [
  {
    id: 'straight_shot',
    bulletSpeed: 400,
    damage: 10,
    fireInterval: 1.0,
    bulletWidth: 8,
    bulletHeight: 8,
    color: 0xffff44,
  },
]

export function getWeaponDef(id: string): WeaponDef {
  const def = WEAPONS.find((w) => w.id === id)
  if (!def) throw new Error(`Weapon not found: ${id}`)
  return def
}
