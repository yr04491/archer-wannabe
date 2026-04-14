import Phaser from 'phaser'

export class VirtualPad {
  private scene: Phaser.Scene
  private stick: Phaser.GameObjects.Arc
  private baseX: number
  private baseY: number
  private readonly outerRadius: number = 60
  private readonly stickRadius: number = 25
  private isActive: boolean = false
  private pointerId: number = -1

  dx: number = 0
  dy: number = 0

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene
    this.baseX = x
    this.baseY = y

    scene.add
      .arc(x, y, this.outerRadius, 0, 360, false, 0xffffff, 0.3)
      .setDepth(10)
      .setScrollFactor(0)

    this.stick = scene.add
      .arc(x, y, this.stickRadius, 0, 360, false, 0xffffff, 0.6)
      .setDepth(11)
      .setScrollFactor(0)

    this.setupInput()
  }

  private setupInput(): void {
    const canvas = this.scene.sys.game.canvas

    const onStart = (x: number, y: number, id: number) => {
      if (this.isActive) return
      const dist = Phaser.Math.Distance.Between(x, y, this.baseX, this.baseY)
      if (dist <= this.outerRadius * 1.5) {
        this.isActive = true
        this.pointerId = id
        this.updateStick(x, y)
      }
    }

    const onMove = (x: number, y: number, id: number) => {
      if (!this.isActive || this.pointerId !== id) return
      this.updateStick(x, y)
    }

    const onEnd = (id: number) => {
      if (this.pointerId !== id) return
      this.isActive = false
      this.pointerId = -1
      this.dx = 0
      this.dy = 0
      this.stick.setPosition(this.baseX, this.baseY)
    }

    // タッチイベント
    canvas.addEventListener('touchstart', (e: TouchEvent) => {
      e.preventDefault()
      for (const touch of Array.from(e.changedTouches)) {
        const rect = canvas.getBoundingClientRect()
        const scaleX = this.scene.scale.width / rect.width
        const scaleY = this.scene.scale.height / rect.height
        onStart(
          (touch.clientX - rect.left) * scaleX,
          (touch.clientY - rect.top) * scaleY,
          touch.identifier,
        )
      }
    }, { passive: false })

    canvas.addEventListener('touchmove', (e: TouchEvent) => {
      e.preventDefault()
      for (const touch of Array.from(e.changedTouches)) {
        const rect = canvas.getBoundingClientRect()
        const scaleX = this.scene.scale.width / rect.width
        const scaleY = this.scene.scale.height / rect.height
        onMove(
          (touch.clientX - rect.left) * scaleX,
          (touch.clientY - rect.top) * scaleY,
          touch.identifier,
        )
      }
    }, { passive: false })

    canvas.addEventListener('touchend', (e: TouchEvent) => {
      for (const touch of Array.from(e.changedTouches)) {
        onEnd(touch.identifier)
      }
    })

    // マウスイベント（PC用）
    canvas.addEventListener('mousedown', (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const scaleX = this.scene.scale.width / rect.width
      const scaleY = this.scene.scale.height / rect.height
      onStart(
        (e.clientX - rect.left) * scaleX,
        (e.clientY - rect.top) * scaleY,
        0,
      )
    })

    canvas.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const scaleX = this.scene.scale.width / rect.width
      const scaleY = this.scene.scale.height / rect.height
      onMove(
        (e.clientX - rect.left) * scaleX,
        (e.clientY - rect.top) * scaleY,
        0,
      )
    })

    canvas.addEventListener('mouseup', () => onEnd(0))
  }

  private updateStick(x: number, y: number): void {
    const dist = Phaser.Math.Distance.Between(x, y, this.baseX, this.baseY)
    const angle = Phaser.Math.Angle.Between(this.baseX, this.baseY, x, y)
    const clampedDist = Math.min(dist, this.outerRadius)

    const stickX = this.baseX + Math.cos(angle) * clampedDist
    const stickY = this.baseY + Math.sin(angle) * clampedDist
    this.stick.setPosition(stickX, stickY)

    this.dx = Math.cos(angle) * (clampedDist / this.outerRadius)
    this.dy = Math.sin(angle) * (clampedDist / this.outerRadius)
  }

  isMoving(): boolean {
    return this.isActive && (Math.abs(this.dx) > 0.05 || Math.abs(this.dy) > 0.05)
  }
}
