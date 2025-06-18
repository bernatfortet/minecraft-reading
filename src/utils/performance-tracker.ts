import { WordPerformance } from '../types/performance.types'
import { getWordPerformance, updateWordPerformance } from './word-memory'

const SUCCESS_TIME_THRESHOLD = 5000 // 5 seconds in milliseconds
const MASTERY_CONSECUTIVE_SUCCESSES = 3

export function recordWordAttempt(params: { word: string; level: number; timeToComplete: number; usedTools: boolean }): WordPerformance {
  const { word, level, timeToComplete, usedTools } = params

  // Get existing performance or create new one
  const existing = getWordPerformance(word)
  const isSuccess = timeToComplete <= SUCCESS_TIME_THRESHOLD && !usedTools

  const performance: WordPerformance = {
    word,
    level,
    lastAttemptTime: new Date(),
    timeToComplete,
    usedTools,
    totalAttempts: (existing?.totalAttempts || 0) + 1,
    consecutiveSuccesses: isSuccess ? (existing?.consecutiveSuccesses || 0) + 1 : 0,
    masteryStatus: existing?.masteryStatus || 'new',
  }

  // Update mastery status based on consecutive successes
  performance.masteryStatus = updateMasteryStatus(performance)

  // Save to storage
  updateWordPerformance(performance)

  console.log('📊 Word attempt recorded:', {
    word,
    timeToComplete,
    usedTools,
    isSuccess,
    consecutiveSuccesses: performance.consecutiveSuccesses,
    masteryStatus: performance.masteryStatus,
  })

  return performance
}

function updateMasteryStatus(performance: WordPerformance): 'new' | 'learning' | 'mastered' {
  if (performance.consecutiveSuccesses >= MASTERY_CONSECUTIVE_SUCCESSES) {
    return 'mastered'
  }

  if (performance.totalAttempts > 0) {
    return 'learning'
  }

  return 'new'
}

export function recordSuccessfulCompletion(word: string, level: number, timeToComplete: number): WordPerformance {
  return recordWordAttempt({
    word,
    level,
    timeToComplete,
    usedTools: false,
  })
}

export function recordToolUsage(word: string, level: number, timeToComplete: number): WordPerformance {
  return recordWordAttempt({
    word,
    level,
    timeToComplete,
    usedTools: true,
  })
}

export function isWordMastered(word: string): boolean {
  const performance = getWordPerformance(word)
  return performance?.masteryStatus === 'mastered' && (performance?.consecutiveSuccesses || 0) >= MASTERY_CONSECUTIVE_SUCCESSES
}

export function getWordMasteryInfo(word: string): {
  attempts: number
  consecutiveSuccesses: number
  masteryStatus: 'new' | 'learning' | 'mastered'
  lastTime: number | null
} {
  const performance = getWordPerformance(word)

  return {
    attempts: performance?.totalAttempts || 0,
    consecutiveSuccesses: performance?.consecutiveSuccesses || 0,
    masteryStatus: performance?.masteryStatus || 'new',
    lastTime: performance?.timeToComplete || null,
  }
}
