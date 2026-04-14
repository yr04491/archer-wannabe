import Phaser from 'phaser'
import { SKILLS } from '../data/skills'

interface ResultSceneData {
  isCleared: boolean
  reachedRoom?: number
  acquiredSkills: string[]
}

export class ResultScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ResultScene' })
  }

  create(data: ResultSceneData): void {
    const { width, height } = this.scale

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85)

    if (data.isCleared) {
      const title = this.add
        .text(width / 2, height * 0.2, 'STAGE CLEAR', {
          fontSize: '48px',
          color: '#ffd700',
          fontFamily: 'Arial',
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
        .setAlpha(0)

      this.tweens.add({ targets: title, alpha: 1, duration: 500 })

      this.add
        .text(width / 2, height * 0.38, '獲得したスキル:', {
          fontSize: '22px',
          color: '#ffffff',
          fontFamily: 'Arial',
        })
        .setOrigin(0.5)

      const skillNames = data.acquiredSkills.map((id) => {
        const skill = SKILLS.find((s) => s.id === id)
        return `・${skill?.name ?? id}`
      })

      this.add
        .text(width / 2, height * 0.50, skillNames.join('\n'), {
          fontSize: '20px',
          color: '#ffffff',
          fontFamily: 'Arial',
          align: 'center',
        })
        .setOrigin(0.5)
    } else {
      const title = this.add
        .text(width / 2, height * 0.25, 'GAME OVER', {
          fontSize: '48px',
          color: '#ff4444',
          fontFamily: 'Arial',
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
        .setAlpha(0)

      this.tweens.add({ targets: title, alpha: 1, duration: 500 })

      this.add
        .text(width / 2, height * 0.42, `到達した部屋: ${data.reachedRoom ?? 1}`, {
          fontSize: '24px',
          color: '#ffffff',
          fontFamily: 'Arial',
        })
        .setOrigin(0.5)

      this.createButton(width / 2, height * 0.6, 'リトライ', () => {
        this.scene.start('GameScene', {
          stageIndex: 0,
          roomIndex: 0,
          acquiredSkills: [],
        })
      })
    }

    this.createButton(width / 2, height * 0.75, 'タイトルへ', () => {
      this.scene.start('TitleScene')
    })
  }

  private createButton(x: number, y: number, label: string, onClick: () => void): void {
    const bg = this.add
      .rectangle(x, y, 200, 50, 0xffffff)
      .setInteractive()

    this.add
      .text(x, y, label, {
        fontSize: '20px',
        color: '#000000',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    bg.on('pointerover', () => bg.setFillStyle(0xdddddd))
    bg.on('pointerout', () => bg.setFillStyle(0xffffff))
    bg.on('pointerdown', onClick)
  }
}
