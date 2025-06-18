import { WordPerformance } from '../types/performance.types'

const STORAGE_KEY = 'minecraft-reading-performances'

export function getStoredPerformances(): WordPerformance[] {
  try {
    // Only access localStorage in browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return []
    }

    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const parsed = JSON.parse(stored) as Array<Omit<WordPerformance, 'lastAttemptTime'> & { lastAttemptTime: string }>
    // Convert date strings back to Date objects
    return parsed.map((p) => ({
      ...p,
      lastAttemptTime: new Date(p.lastAttemptTime),
    }))
  } catch (error) {
    console.error('🚨 Error loading word performances:', error)
    return []
  }
}

export function savePerformances(performances: WordPerformance[]): void {
  try {
    // Only access localStorage in browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(performances))
    console.log('💾 Saved word performances:', performances.length, 'words')
  } catch (error) {
    console.error('🚨 Error saving word performances:', error)
  }
}

export function getWordPerformance(word: string): WordPerformance | undefined {
  const performances = getStoredPerformances()
  return performances.find((p) => p.word === word)
}

export function updateWordPerformance(wordPerformance: WordPerformance): void {
  const performances = getStoredPerformances()
  const index = performances.findIndex((p) => p.word === wordPerformance.word)

  if (index >= 0) {
    performances[index] = wordPerformance
  } else {
    performances.push(wordPerformance)
  }

  savePerformances(performances)
}

export function getWordsNeedingWork(): WordPerformance[] {
  return getStoredPerformances().filter((p) => p.masteryStatus !== 'mastered' && p.consecutiveSuccesses < 3)
}

export function getMasteredWords(): WordPerformance[] {
  return getStoredPerformances().filter((p) => p.masteryStatus === 'mastered' && p.consecutiveSuccesses >= 3)
}

export function getWordsByLevel(level: number): WordPerformance[] {
  return getStoredPerformances().filter((p) => p.level === level)
}

export function clearAllPerformances(): void {
  // Only access localStorage in browser environment
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return
  }

  localStorage.removeItem(STORAGE_KEY)
  console.log('🗑️ Cleared all word performances')
}
