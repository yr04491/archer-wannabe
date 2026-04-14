import Phaser from 'phaser'
import { SKILLS } from '../data/skills'

interface SkillSceneData {
  stageIndex: number
  roomIndex: number
  acquiredSkills: string[]
  playerHp: number
  playerMaxHp: number
  fireInterval: number
  bulletDamage: number
}

export class SkillScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SkillScene' })
  }

  init(_data: SkillSceneData): void {}

  create(data: SkillSceneData): void {
    const { width, height } = this.scale

    // オーバーレイ
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)

    this.add
      .text(width / 2, height * 0.2, 'スキルを選ぼう', {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    const cardWidth = 120
    const cardHeight = 160
    const gap = 20
    const totalWidth = cardWidth * 3 + gap * 2
    const startX = (width - totalWidth) / 2 + cardWidth / 2

    for (let i = 0; i < SKILLS.length; i++) {
      const skill = SKILLS[i]
      const cardX = startX + i * (cardWidth + gap)
      const cardY = height * 0.55

      const card = this.add
        .rectangle(cardX, cardY, cardWidth, cardHeight, 0x333355)
        .setStrokeStyle(2, 0xffffff)
        .setInteractive()

      this.add
        .text(cardX, cardY - 40, skill.name, {
          fontSize: '18px',
          color: '#ffffff',
          fontFamily: 'Arial',
          fontStyle: 'bold',
          align: 'center',
          wordWrap: { width: cardWidth - 10 },
        })
        .setOrigin(0.5)

      this.add
        .text(cardX, cardY + 10, skill.description, {
          fontSize: '20px',
          color: '#ffff88',
          fontFamily: 'Arial',
          align: 'center',
          wordWrap: { width: cardWidth - 10 },
        })
        .setOrigin(0.5)

      card.on('pointerover', () => card.setFillStyle(0x5555aa))
      card.on('pointerout', () => card.setFillStyle(0x333355))
      card.on('pointerdown', () => {
        this.tweens.add({
          targets: card,
          alpha: 0,
          duration: 150,
          onComplete: () => {
            const newSkills = [...data.acquiredSkills, skill.id]
            this.scene.start('GameScene', {
              stageIndex: data.stageIndex,
              roomIndex: data.roomIndex,
              acquiredSkills: newSkills,
            })
          },
        })
      })
    }
  }
}
