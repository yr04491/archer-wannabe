import type { StageDef } from '../types'

export const STAGES: StageDef[] = [
  {
    id: 'stage_1',
    name: 'ステージ 1',
    difficulty: 1,
    isLocked: false,
    backgroundColor: 0x555555,
    rooms: [
      { enemies: [{ enemyId: 'slime', count: 3 }] },
      { enemies: [{ enemyId: 'slime', count: 5 }] },
      { enemies: [{ enemyId: 'slime', count: 8 }] },
    ],
  },
  {
    id: 'stage_2',
    name: 'ステージ 2',
    difficulty: 2,
    isLocked: true,
    backgroundColor: 0x445544,
    rooms: [],
  },
  {
    id: 'stage_3',
    name: 'ステージ 3',
    difficulty: 3,
    isLocked: true,
    backgroundColor: 0x554444,
    rooms: [],
  },
]
