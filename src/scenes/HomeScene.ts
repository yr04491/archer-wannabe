import Phaser from 'phaser'
import { STAGES } from '../data/stages'
import type { StageDef } from '../types'

type Tab = 'stage' | 'skill'

export class HomeScene extends Phaser.Scene {
  private currentTab: Tab = 'stage'
  private selectedStageIndex: number = 0
  private tabStageContent!: Phaser.GameObjects.Container
  private tabSkillContent!: Phaser.GameObjects.Container
  private startButton!: Phaser.GameObjects.Container
  private tabStageLabel!: Phaser.GameObjects.Text
  private tabSkillLabel!: Phaser.GameObjects.Text
  private tabStageLine!: Phaser.GameObjects.Rectangle
  private tabSkillLine!: Phaser.GameObjects.Rectangle

  constructor() {
    super({ key: 'HomeScene' })
  }

  create(): void {
    const { width, height } = this.scale

    // 背景
    this.add.rectangle(width / 2, height / 2, width, height, 0x111122)

    // タイトルロゴ
    this.add
      .text(width / 2, 44, 'ARCHER GAME', {
        fontSize: '28px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    // タブUI（シーンに直接追加・常時表示）
    this.createTabs()

    // タブコンテンツ（Container内に全て収める）
    this.tabStageContent = this.buildStageContent()
    this.tabSkillContent = this.buildSkillContent()

    // スタートボタン
    this.startButton = this.buildStartButton()

    // 初期タブ
    this.switchTab('stage')
  }

  private createTabs(): void {
    const { width } = this.scale
    const tabY = 100
    const tabW = width / 2

    this.add.rectangle(width / 2, tabY, width, 44, 0x222233)

    this.tabStageLabel = this.add
      .text(tabW / 2, tabY, 'ステージ選択', {
        fontSize: '18px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setInteractive()
    this.tabStageLabel.on('pointerdown', () => this.switchTab('stage'))

    this.tabSkillLabel = this.add
      .text(tabW + tabW / 2, tabY, 'スキル', {
        fontSize: '18px',
        color: '#aaaaaa',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setInteractive()
    this.tabSkillLabel.on('pointerdown', () => this.switchTab('skill'))

    this.tabStageLine = this.add.rectangle(tabW / 2, tabY + 18, tabW - 20, 3, 0xffffff)
    this.tabSkillLine = this.add.rectangle(tabW + tabW / 2, tabY + 18, tabW - 20, 3, 0xffffff)

    this.add.rectangle(width / 2, tabY + 22, width, 1, 0x444455)
  }

  private buildStageContent(): Phaser.GameObjects.Container {
    const { width } = this.scale
    const container = this.add.container(0, 0)
    const cardW = width - 48
    const cardH = 90
    const startY = 190

    STAGES.forEach((stage: StageDef, index: number) => {
      const cardY = startY + index * (cardH + 16)
      const isSelected = index === this.selectedStageIndex
      const locked = stage.isLocked

      const bg = this.add
        .rectangle(
          width / 2, cardY, cardW, cardH,
          locked ? 0x333333 : isSelected ? 0x3355aa : 0x223366,
        )
        .setStrokeStyle(2, locked ? 0x555555 : isSelected ? 0x88aaff : 0x4466bb)

      if (!locked) {
        bg.setInteractive()
        bg.on('pointerover', () => {
          if (this.selectedStageIndex !== index) bg.setFillStyle(0x2a4490)
        })
        bg.on('pointerout', () => {
          bg.setFillStyle(this.selectedStageIndex === index ? 0x3355aa : 0x223366)
        })
        bg.on('pointerdown', () => this.selectStage(index))
      }

      const nameText = this.add
        .text(
          width / 2 - cardW / 2 + 20, cardY - 16,
          locked ? `🔒 ${stage.name}` : stage.name,
          {
            fontSize: '20px',
            color: locked ? '#888888' : '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold',
          },
        )
        .setOrigin(0, 0.5)

      const detail = locked
        ? '???'
        : `部屋数: ${stage.rooms.length}　難易度: ${'★'.repeat(stage.difficulty)}${'☆'.repeat(3 - stage.difficulty)}`

      const detailText = this.add
        .text(
          width / 2 - cardW / 2 + 20, cardY + 16,
          detail,
          {
            fontSize: '15px',
            color: locked ? '#666666' : '#aaccff',
            fontFamily: 'Arial',
          },
        )
        .setOrigin(0, 0.5)

      // 全てcontainerに追加
      container.add([bg, nameText, detailText])
    })

    return container
  }

  private buildSkillContent(): Phaser.GameObjects.Container {
    const { width, height } = this.scale
    const container = this.add.container(0, 0)

    const icon = this.add
      .text(width / 2, height * 0.42, '🚧', { fontSize: '48px' })
      .setOrigin(0.5)

    const label = this.add
      .text(width / 2, height * 0.55, '準備中', {
        fontSize: '28px',
        color: '#aaaaaa',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    const sub = this.add
      .text(width / 2, height * 0.62, 'スキル選択は近日実装予定です', {
        fontSize: '16px',
        color: '#666666',
        fontFamily: 'Arial',
      })
      .setOrigin(0.5)

    container.add([icon, label, sub])
    return container
  }

  private buildStartButton(): Phaser.GameObjects.Container {
    const { width, height } = this.scale
    const container = this.add.container(0, 0)

    const bg = this.add
      .rectangle(width / 2, height - 60, 240, 54, 0xffffff)
      .setInteractive()

    const label = this.add
      .text(width / 2, height - 60, 'スタート', {
        fontSize: '22px',
        color: '#000000',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    bg.on('pointerover', () => bg.setFillStyle(0xdddddd))
    bg.on('pointerout', () => bg.setFillStyle(0xffffff))
    bg.on('pointerdown', () => {
      const stage = STAGES[this.selectedStageIndex]
      if (!stage || stage.isLocked) return
      this.scene.start('GameScene', {
        stageIndex: this.selectedStageIndex,
        roomIndex: 0,
        acquiredSkills: [],
      })
    })

    container.add([bg, label])
    return container
  }

  private selectStage(index: number): void {
    this.selectedStageIndex = index
    this.tabStageContent.destroy()
    this.tabStageContent = this.buildStageContent()
    if (this.currentTab !== 'stage') this.tabStageContent.setVisible(false)
  }

  private switchTab(tab: Tab): void {
    this.currentTab = tab

    if (tab === 'stage') {
      this.tabStageContent.setVisible(true)
      this.tabSkillContent.setVisible(false)
      this.startButton.setVisible(true)
      this.tabStageLabel.setColor('#ffffff')
      this.tabSkillLabel.setColor('#aaaaaa')
      this.tabStageLine.setVisible(true)
      this.tabSkillLine.setVisible(false)
    } else {
      this.tabStageContent.setVisible(false)
      this.tabSkillContent.setVisible(true)
      this.startButton.setVisible(false)
      this.tabStageLabel.setColor('#aaaaaa')
      this.tabSkillLabel.setColor('#ffffff')
      this.tabStageLine.setVisible(false)
      this.tabSkillLine.setVisible(true)
    }
  }
}
