// Sound utility for playing game sounds
class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map()
  private volume: number = 0.5
  private initialized: boolean = false

  constructor() {
    // Don't preload sounds during SSR
  }

  private preloadSounds() {
    // Only run in browser environment
    if (typeof window === 'undefined' || typeof Audio === 'undefined') {
      return
    }

    const soundFiles = {
      toolSelect: '/sounds/Select_pattern2.ogg.mp3',
      levelComplete: '/sounds/Challenge_complete.ogg',
      pageFlip: '/sounds/Page_turn1.ogg',
      success: '/sounds/Totem_of_Undying.ogg',
      swordSwing: '/sounds/minecraft-sword-swing.mp3',
      pickaxeHit: '/sounds/Axe_strip3.ogg.mp3',
      // Add more sounds here as needed
    }

    Object.entries(soundFiles).forEach(([key, path]) => {
      const audio = new Audio(path)
      audio.volume = this.volume
      audio.preload = 'auto'
      this.sounds.set(key, audio)
    })

    this.initialized = true
  }

  public play(soundKey: string) {
    try {
      // Initialize sounds if not already done (lazy loading)
      if (!this.initialized) {
        this.preloadSounds()
      }

      const sound = this.sounds.get(soundKey)
      if (sound) {
        // Reset to beginning if already playing
        sound.currentTime = 0
        sound.play().catch((error) => {
          console.log('🔇 Sound play failed (user interaction required):', error)
        })
      } else {
        console.warn('🔇 Sound not found:', soundKey)
      }
    } catch (error) {
      console.error('🚨 Sound error:', error)
    }
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume))

    // Only update existing sounds if they're loaded
    if (this.initialized) {
      this.sounds.forEach((sound) => {
        sound.volume = this.volume
      })
    }
  }

  public getVolume(): number {
    return this.volume
  }
}

// Create singleton instance
export const soundManager = new SoundManager()

// React hook for playing sounds
export function useSound() {
  const playSound = (soundKey: string) => {
    soundManager.play(soundKey)
  }

  const setVolume = (volume: number) => {
    soundManager.setVolume(volume)
  }

  const getVolume = () => {
    return soundManager.getVolume()
  }

  return {
    play: playSound,
    setVolume,
    getVolume,
  }
}
