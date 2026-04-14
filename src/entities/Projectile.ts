import Phaser from 'phaser'
import type { WeaponDef } from '../types'

export class Projectile extends Phaser.GameObjects.Rectangle {
  damage: number

  constructor(scene: Phaser.Scene, x: number, y: number, def: WeaponDef) {
    super(scene, x, y, def.bulletWidth, def.bulletHeight, def.color)
    this.damage = def.damage
    scene.add.existing(this)
    scene.physics.add.existing(this)
  }

  fire(targetX: number, targetY: number, speed: number): void {
    const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY)
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed)
  }

  isOutOfBounds(width: number, height: number): boolean {
    return this.x < 0 || this.x > width || this.y < 0 || this.y > height
  }
}
