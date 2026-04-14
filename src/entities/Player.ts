import Phaser from 'phaser'

export class Player extends Phaser.GameObjects.Rectangle {
  hp: number = 100
  maxHp: number = 100
  moveSpeed: number = 160
  fireInterval: number = 1.0
  bulletDamage: number = 10
  bulletSpeed: number = 400

  isInvincible: boolean = false
  private invincibleTimer: number = 0
  private readonly invincibleDuration: number = 0.5

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 32, 32, 0x4488ff)
    scene.add.existing(this)
    scene.physics.add.existing(this)
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setCollideWorldBounds(true)
    body.setSize(32, 32)
  }

  takeDamage(amount: number): void {
    if (this.isInvincible) return
    this.hp = Math.max(0, this.hp - amount)
    this.isInvincible = true
    this.invincibleTimer = 0
    this.setAlpha(0.5)
  }

  update(delta: number): void {
    if (this.isInvincible) {
      this.invincibleTimer += delta / 1000
      if (this.invincibleTimer >= this.invincibleDuration) {
        this.isInvincible = false
        this.setAlpha(1)
      }
    }
  }

  isDead(): boolean {
    return this.hp <= 0
  }
}
