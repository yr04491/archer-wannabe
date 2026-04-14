import Phaser from 'phaser'

export class Player extends Phaser.GameObjects.Rectangle {
  hp: number = 100
  maxHp: number = 100
  moveSpeed: number = 160
  fireInterval: number = 1.0
  bulletDamage: number = 10
  bulletSpeed: number = 400

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 32, 32, 0x4488ff)
    scene.add.existing(this)
    scene.physics.add.existing(this)
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setCollideWorldBounds(true)
    body.setSize(32, 32)
  }

  takeDamage(amount: number): void {
    this.hp = Math.max(0, this.hp - amount)
  }

  isDead(): boolean {
    return this.hp <= 0
  }
}
