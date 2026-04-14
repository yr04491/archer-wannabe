import Phaser from 'phaser'
import { Player } from '../entities/Player'
import { Enemy } from '../entities/Enemy'
import { Projectile } from '../entities/Projectile'
import { VirtualPad } from '../ui/VirtualPad'
import { HpBar } from '../ui/HpBar'
import { STAGES } from '../data/stages'
import { getEnemyDef } from '../data/enemies'
import { getWeaponDef } from '../data/weapons'
import { SKILLS } from '../data/skills'

interface GameSceneData {
  stageIndex: number
  roomIndex: number
  acquiredSkills: string[]
}

export class GameScene extends Phaser.Scene {
  private player!: Player
  private enemies!: Phaser.Physics.Arcade.Group
  private projectiles!: Phaser.Physics.Arcade.Group
  private virtualPad!: VirtualPad
  private hpBar!: HpBar
  private fireTimer: number = 0
  private stageIndex: number = 0
  private roomIndex: number = 0
  private acquiredSkills: string[] = []
  private isClearing: boolean = false

  constructor() {
    super({ key: 'GameScene' })
  }

  init(data: GameSceneData): void {
    this.stageIndex = data.stageIndex ?? 0
    this.roomIndex = data.roomIndex ?? 0
    this.acquiredSkills = data.acquiredSkills ?? []
    this.isClearing = false
  }

  create(): void {
    const { width, height } = this.scale
    const stage = STAGES[this.stageIndex]

    // 背景
    this.add.rectangle(width / 2, height / 2, width, height, stage.backgroundColor)

    // プレイヤー
    this.player = new Player(this, width / 2, height / 2)
    this.fireTimer = 0

    // スキルを再適用
    for (const skillId of this.acquiredSkills) {
      const skill = SKILLS.find((s) => s.id === skillId)
      if (skill) skill.apply(this.player)
    }

    // グループ
    this.enemies = this.physics.add.group()
    this.projectiles = this.physics.add.group()

    // 敵スポーン
    const roomDef = stage.rooms[this.roomIndex]
    for (const entry of roomDef.enemies) {
      const def = getEnemyDef(entry.enemyId)
      for (let i = 0; i < entry.count; i++) {
        const pos = this.getSpawnPosition()
        const enemy = new Enemy(this, pos.x, pos.y, def)
        this.enemies.add(enemy)
      }
    }

    // プレイヤーを押されないように固定
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body
    playerBody.setImmovable(true)

    // 衝突判定: 弾 vs 敵
    this.physics.add.overlap(
      this.projectiles,
      this.enemies,
      (proj, enemy) => {
        const p = proj as Projectile
        const e = enemy as Enemy
        e.takeDamage(p.damage)
        p.destroy()
        if (e.isDead()) {
          e.destroy()
          this.checkRoomClear()
        }
      },
    )

    // 衝突判定: プレイヤー vs 敵（物理分離 + ダメージ）
    this.physics.add.collider(
      this.player,
      this.enemies,
      (_player, enemy) => {
        const e = enemy as Enemy
        this.player.takeDamage(e.damage) // Player の無敵時間でレート制限
        if (this.player.isDead()) this.gameOver()
      },
    )

    // 衝突判定: 敵同士（物理分離のみ）
    this.physics.add.collider(this.enemies, this.enemies)

    // UI
    const padX = 80
    const padY = height - 100
    this.virtualPad = new VirtualPad(this, padX, padY)

    this.hpBar = new HpBar(this, 16, 25)
    this.hpBar.update(this.player.hp, this.player.maxHp)

    const totalRooms = stage.rooms.length
    this.add
      .text(width - 16, 25, `部屋 ${this.roomIndex + 1}/${totalRooms}`, {
        fontSize: '20px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      })
      .setScrollFactor(0)
      .setDepth(10)
      .setOrigin(1, 0.5)

    // ステータスバー背景
    this.add
      .rectangle(width / 2, 25, width, 50, 0x000000, 0.6)
      .setScrollFactor(0)
      .setDepth(9)

    // 物理の境界
    this.physics.world.setBounds(0, 50, width, height - 50)
  }

  update(_time: number, delta: number): void {
    if (this.isClearing) return

    // プレイヤー移動
    const speed = this.player.moveSpeed
    const body = this.player.body as Phaser.Physics.Arcade.Body
    body.setVelocity(
      this.virtualPad.dx * speed,
      this.virtualPad.dy * speed,
    )

    this.player.update(delta)

    // 敵の更新（隣接敵リストを渡して分離ステアリング適用）
    const allEnemies = this.enemies.getChildren()
    for (const obj of allEnemies) {
      const enemy = obj as Enemy
      enemy.moveToward(this.player.x, this.player.y, allEnemies)
      enemy.update()
    }

    // 弾の境界チェック
    for (const obj of this.projectiles.getChildren()) {
      const proj = obj as Projectile
      if (proj.isOutOfBounds(this.scale.width, this.scale.height)) {
        proj.destroy()
      }
    }

    // 自動攻撃
    const isMoving = this.virtualPad.isMoving()
    const hasEnemies = this.enemies.getLength() > 0
    if (!isMoving && hasEnemies) {
      this.fireTimer += delta / 1000
      if (this.fireTimer >= this.player.fireInterval) {
        this.fireTimer = 0
        this.shoot()
      }
    } else {
      this.fireTimer = this.player.fireInterval
    }

    // HPバー更新
    this.hpBar.update(this.player.hp, this.player.maxHp)
  }

  private shoot(): void {
    const nearest = this.getNearestEnemy()
    if (!nearest) return

    const weaponDef = getWeaponDef('straight_shot')
    weaponDef.damage = this.player.bulletDamage

    const proj = new Projectile(this, this.player.x, this.player.y, weaponDef)
    this.projectiles.add(proj)
    proj.fire(nearest.x, nearest.y, this.player.bulletSpeed)
  }

  private getNearestEnemy(): Enemy | null {
    let nearest: Enemy | null = null
    let minDist = Infinity
    for (const obj of this.enemies.getChildren()) {
      const enemy = obj as Enemy
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y)
      if (dist < minDist) {
        minDist = dist
        nearest = enemy
      }
    }
    return nearest
  }

  private getSpawnPosition(): { x: number; y: number } {
    const { width, height } = this.scale
    const minDist = 150
    let x: number, y: number
    do {
      x = Phaser.Math.Between(40, width - 40)
      y = Phaser.Math.Between(90, height - 40)
    } while (Phaser.Math.Distance.Between(x, y, width / 2, height / 2) < minDist)
    return { x, y }
  }

  private checkRoomClear(): void {
    if (this.enemies.getLength() > 0) return
    this.isClearing = true

    const stage = STAGES[this.stageIndex]
    const isLastRoom = this.roomIndex >= stage.rooms.length - 1

    this.time.delayedCall(500, () => {
      if (isLastRoom) {
        this.scene.start('ResultScene', {
          isCleared: true,
          acquiredSkills: this.acquiredSkills,
        })
      } else {
        this.scene.start('SkillScene', {
          stageIndex: this.stageIndex,
          roomIndex: this.roomIndex + 1,
          acquiredSkills: this.acquiredSkills,
          playerHp: this.player.hp,
          playerMaxHp: this.player.maxHp,
          fireInterval: this.player.fireInterval,
          bulletDamage: this.player.bulletDamage,
        })
      }
    })
  }

  private gameOver(): void {
    this.isClearing = true
    this.time.delayedCall(500, () => {
      this.scene.start('ResultScene', {
        isCleared: false,
        reachedRoom: this.roomIndex + 1,
        acquiredSkills: this.acquiredSkills,
      })
    })
  }
}
