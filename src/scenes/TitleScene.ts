import Phaser from 'phaser'

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' })
  }

  create(): void {
    const { width, height } = this.scale

    this.add.rectangle(width / 2, height / 2, width, height, 0x222222)

    this.add
      .text(width / 2, height * 0.3, 'ARCHER GAME', {
        fontSize: '48px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    // プレイヤーキャラ（矩形）
    this.add.rectangle(width / 2, height * 0.5, 48, 48, 0x4488ff)

    const tapText = this.add
      .text(width / 2, height * 0.75, 'タップしてはじめる', {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'Arial',
      })
      .setOrigin(0.5)

    // 点滅アニメーション
    this.tweens.add({
      targets: tapText,
      alpha: 0,
      duration: 800,
      yoyo: true,
      repeat: -1,
    })

    this.input.once('pointerdown', () => {
      this.scene.start('HomeScene')
    })
  }
}
