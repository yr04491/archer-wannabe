import Phaser from 'phaser'
import type { EnemyDef } from '../types'

export class Enemy extends Phaser.GameObjects.Rectangle {
  hp: number
  maxHp: number
  speed: number
  damage: number
  attackCooldown: number
  private attackTimer: number = 0
  private hpBar: Phaser.GameObjects.Rectangle
  private hpBarBg: Phaser.GameObjects.Rectangle

  constructor(scene: Phaser.Scene, x: number, y: number, def: EnemyDef) {
    super(scene, x, y, def.width, def.height, def.color)
    this.hp = def.hp
    this.maxHp = def.hp
    this.speed = def.speed
    this.damage = def.damage
    this.attackCooldown = def.attackCooldown

    scene.add.existing(this)
    scene.physics.add.existing(this)
    const body = this.body as Phaser.Physics.Arcade.Body
    body.setSize(def.width, def.height)
    body.setCollideWorldBounds(true)

    // HPバー背景
    this.hpBarBg = scene.add.rectangle(x, y - def.height / 2 - 8, def.width, 4, 0x333333)
    // HPバー本体
    this.hpBar = scene.add.rectangle(x, y - def.height / 2 - 8, def.width, 4, 0xff4444)
  }

  moveToward(targetX: number, targetY: number, others?: Phaser.GameObjects.GameObject[]): void {
    const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY)
    let vx = Math.cos(angle) * this.speed
    let vy = Math.sin(angle) * this.speed

    // 近くの敵から離れる分離ステアリング
    if (others) {
      const separationRadius = this.width * 2
      for (const obj of others) {
        const other = obj as Enemy
        if (other === this) continue
        const dist = Phaser.Math.Distance.Between(this.x, this.y, other.x, other.y)
        if (dist < separationRadius && dist > 0) {
          const sepAngle = Phaser.Math.Angle.Between(other.x, other.y, this.x, this.y)
          const force = (1 - dist / separationRadius) * this.speed * 2
          vx += Math.cos(sepAngle) * force
          vy += Math.sin(sepAngle) * force
        }
      }
    }

    const body = this.body as Phaser.Physics.Arcade.Body
    body.setVelocity(vx, vy)
  }

  tryAttack(delta: number): boolean {
    this.attackTimer += delta / 1000
    if (this.attackTimer >= this.attackCooldown) {
      this.attackTimer = 0
      return true
    }
    return false
  }

  takeDamage(amount: number): void {
    this.hp = Math.max(0, this.hp - amount)
    this.updateHpBar()
  }

  private updateHpBar(): void {
    const ratio = this.hp / this.maxHp
    this.hpBar.setSize(this.width * ratio, 4)
    this.hpBar.setX(this.x - (this.width * (1 - ratio)) / 2)
  }

  update(): void {
    const offsetY = this.height / 2 + 8
    this.hpBarBg.setPosition(this.x, this.y - offsetY)
    this.hpBar.setPosition(
      this.x - (this.width * (1 - this.hp / this.maxHp)) / 2,
      this.y - offsetY,
    )
  }

  isDead(): boolean {
    return this.hp <= 0
  }

  destroy(fromScene?: boolean): void {
    this.hpBar.destroy()
    this.hpBarBg.destroy()
    super.destroy(fromScene)
  }
}
