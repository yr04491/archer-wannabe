import Phaser from 'phaser'
import { TitleScene } from './scenes/TitleScene'
import { HomeScene } from './scenes/HomeScene'
import { GameScene } from './scenes/GameScene'
import { SkillScene } from './scenes/SkillScene'
import { ResultScene } from './scenes/ResultScene'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 480,
  height: 854,
  backgroundColor: '#000000',
  antialias: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    zoom: Math.min(Math.round(window.devicePixelRatio || 1), 2),
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  scene: [TitleScene, HomeScene, GameScene, SkillScene, ResultScene],
}

new Phaser.Game(config)
