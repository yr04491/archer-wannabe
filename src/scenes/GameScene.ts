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

const MARGIN = 4   // ステージ枠の余白(px)
const STATUS_H = 50 // ステータスバーの高さ

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
  private isPaused: boolean = false
  private pauseOverlay!: Phaser.GameObjects.Container

  constructor() {
    super({ key: 'GameScene' })
  }

  init(data: GameSceneData): void {
    this.stageIndex = data.stageIndex ?? 0
    this.roomIndex = data.roomIndex ?? 0
    this.acquiredSkills = data.acquiredSkills ?? []
    this.isClearing = false
    this.isPaused = false
  }

  create(): void {
    const { width, height } = this.scale
    const stage = STAGES[this.stageIndex]

    // 背景
    this.add.rectangle(width / 2, height / 2, width, height, stage.backgroundColor)

    // ステージ枠線（余白付き）
    const frameTop = STATUS_H + MARGIN
    const frameH = height - STATUS_H - MARGIN * 2
    this.add
      .rectangle(width / 2, frameTop + frameH / 2, width - MARGIN * 2, frameH)
      .setStrokeStyle(1, 0x888888, 0.6)
      .setFillStyle(0x000000, 0)
      .setDepth(1)

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

    // 敵同士・プレイヤーとの分離はステアリングで処理（コライダーなし）

    // 物理の境界（余白を考慮）
    this.physics.world.setBounds(
      MARGIN, STATUS_H + MARGIN,
      width - MARGIN * 2, height - STATUS_H - MARGIN * 2,
    )

    // ---- UI ----
    // ステータスバー背景
    this.add
      .rectangle(width / 2, STATUS_H / 2, width, STATUS_H, 0x000000, 0.6)
      .setScrollFactor(0)
      .setDepth(9)

    this.hpBar = new HpBar(this, 16, STATUS_H / 2)
    this.hpBar.update(this.player.hp, this.player.maxHp)

    const totalRooms = stage.rooms.length
    this.add
      .text(width / 2, STATUS_H / 2, `部屋 ${this.roomIndex + 1}/${totalRooms}`, {
        fontSize: '20px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      })
      .setScrollFactor(0)
      .setDepth(10)
      .setOrigin(0.5)

    // ポーズボタン
    this.createPauseButton()

    // ポーズオーバーレイ（初期は非表示）
    this.pauseOverlay = this.createPauseOverlay()
    this.pauseOverlay.setVisible(false)

    // バーチャルパッド
    const padX = 80
    const padY = height - 100
    this.virtualPad = new VirtualPad(this, padX, padY)
  }

  private createPauseButton(): void {
    const { width } = this.scale
    const btn = this.add
      .text(width - 16, STATUS_H / 2, '⏸', {
        fontSize: '24px',
        color: '#ffffff',
      })
      .setOrigin(1, 0.5)
      .setScrollFactor(0)
      .setDepth(10)
      .setInteractive()

    btn.on('pointerdown', () => this.togglePause())
  }

  private createPauseOverlay(): Phaser.GameObjects.Container {
    const { width, height } = this.scale
    const container = this.add.container(0, 0).setDepth(50)

    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.75)

    const title = this.add
      .text(width / 2, height * 0.35, 'PAUSE', {
        fontSize: '48px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    const resumeBg = this.add
      .rectangle(width / 2, height * 0.52, 220, 54, 0xffffff)
      .setInteractive()
    const resumeLabel = this.add
      .text(width / 2, height * 0.52, '再開', {
        fontSize: '22px',
        color: '#000000',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
    resumeBg.on('pointerdown', () => this.togglePause())

    const titleBg = this.add
      .rectangle(width / 2, height * 0.65, 220, 54, 0x555555)
      .setInteractive()
    const titleLabel = this.add
      .text(width / 2, height * 0.65, 'タイトルへ', {
        fontSize: '22px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
    titleBg.on('pointerdown', () => {
      this.physics.world.resume()
      this.scene.start('TitleScene')
    })

    container.add([bg, title, resumeBg, resumeLabel, titleBg, titleLabel])
    return container
  }

  private togglePause(): void {
    this.isPaused = !this.isPaused
    if (this.isPaused) {
      this.physics.world.pause()
      this.tweens.pauseAll()
      this.pauseOverlay.setVisible(true)
    } else {
      this.physics.world.resume()
      this.tweens.resumeAll()
      this.pauseOverlay.setVisible(false)
    }
  }

  update(_time: number, delta: number): void {
    if (this.isClearing || this.isPaused) return

    // プレイヤー移動
    const speed = this.player.moveSpeed
    const body = this.player.body as Phaser.Physics.Arcade.Body
    body.setVelocity(
      this.virtualPad.dx * speed,
      this.virtualPad.dy * speed,
    )

    // 敵の更新（敵同士 + プレイヤーへの反発ステアリング適用）
    const allEnemies = this.enemies.getChildren()
    const playerRepulsor = [{ x: this.player.x, y: this.player.y, radius: 40 }]
    for (const obj of allEnemies) {
      const enemy = obj as Enemy
      enemy.moveToward(this.player.x, this.player.y, allEnemies, playerRepulsor)
      enemy.update()

      // 接触中の敵が攻撃インターバルを満たしたらダメージ
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y)
      if (dist < 32) {
        if (enemy.tryAttack(delta)) {
          this.showDamageNumber(this.player.x, this.player.y, enemy.damage)
          this.player.takeDamage(enemy.damage)
          if (this.player.isDead()) {
            this.gameOver()
            return
          }
        }
      }
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

  private showDamageNumber(x: number, y: number, amount: number): void {
    const text = this.add
      .text(x, y - 20, `-${amount}`, {
        fontSize: '24px',
        color: '#ff4444',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(20)

    this.tweens.add({
      targets: text,
      y: y - 70,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    })
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
      x = Phaser.Math.Between(MARGIN + 20, width - MARGIN - 20)
      y = Phaser.Math.Between(STATUS_H + MARGIN + 20, height - MARGIN - 20)
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
