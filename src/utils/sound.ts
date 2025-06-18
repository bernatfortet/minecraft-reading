// Sound utility for playing game sounds
class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map()
  private volume: number = 0.5

  constructor() {
    this.preloadSounds()
  }

  private preloadSounds() {
    const soundFiles = {
      toolSelect: '/sounds/Select_pattern2.ogg.mp3',
      levelComplete: '/sounds/Challenge_complete.ogg',
      pageFlip: '/sounds/Page_turn1.ogg',
      success: '/sounds/Totem_of_Undying.ogg',
      // Add more sounds here as needed
    }

    Object.entries(soundFiles).forEach(([key, path]) => {
      const audio = new Audio(path)
      audio.volume = this.volume
      audio.preload = 'auto'
      this.sounds.set(key, audio)
    })
  }

  public play(soundKey: string) {
    try {
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
    this.sounds.forEach((sound) => {
      sound.volume = this.volume
    })
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
