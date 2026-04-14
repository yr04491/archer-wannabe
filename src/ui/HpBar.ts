import Phaser from 'phaser'

export class HpBar {
  private bar: Phaser.GameObjects.Rectangle
  private text: Phaser.GameObjects.Text
  private readonly maxWidth: number = 200

  constructor(scene: Phaser.Scene, x: number, y: number) {
    scene.add
      .rectangle(x, y, this.maxWidth, 20, 0x333333)
      .setScrollFactor(0)
      .setDepth(10)
      .setOrigin(0, 0.5)

    this.bar = scene.add
      .rectangle(x, y, this.maxWidth, 20, 0x44ff44)
      .setScrollFactor(0)
      .setDepth(11)
      .setOrigin(0, 0.5)

    this.text = scene.add
      .text(x + this.maxWidth + 8, y, '', {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'Arial',
      })
      .setScrollFactor(0)
      .setDepth(11)
      .setOrigin(0, 0.5)
  }

  update(current: number, max: number): void {
    const ratio = current / max
    this.bar.setSize(this.maxWidth * ratio, 20)

    if (ratio > 0.7) this.bar.setFillStyle(0x44ff44)
    else if (ratio > 0.3) this.bar.setFillStyle(0xffff44)
    else this.bar.setFillStyle(0xff4444)

    this.text.setText(`${current}/${max}`)
  }
}
