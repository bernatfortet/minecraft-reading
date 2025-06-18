import { getWordsNeedingWork, getWordsByLevel } from './word-memory'

export function getSessionStartBonusWords(): string[] {
  const wordsNeedingWork = getWordsNeedingWork()

  // Prioritize words that need the most work (lowest consecutive successes)
  const sortedWords = wordsNeedingWork.sort((a, b) => a.consecutiveSuccesses - b.consecutiveSuccesses).slice(0, 10) // Limit to max 10 words for session start

  return sortedWords.map((w) => w.word)
}

export function getLevelBonusWords(level: number): string[] {
  const levelWords = getWordsByLevel(level)
  const wordsNeedingWork = levelWords.filter((w) => w.masteryStatus !== 'mastered' || w.consecutiveSuccesses < 3)

  // Sort by most urgent (lowest consecutive successes, then by last attempt time)
  const sortedWords = wordsNeedingWork.sort((a, b) => {
    if (a.consecutiveSuccesses !== b.consecutiveSuccesses) {
      return a.consecutiveSuccesses - b.consecutiveSuccesses
    }
    // More recent attempts first (needs more immediate practice)
    return b.lastAttemptTime.getTime() - a.lastAttemptTime.getTime()
  })

  return sortedWords.map((w) => w.word)
}

export function shouldShowSessionStartBonus(): boolean {
  const wordsNeedingWork = getWordsNeedingWork()
  return wordsNeedingWork.length > 0
}

export function shouldShowLevelBonus(level: number): boolean {
  const bonusWords = getLevelBonusWords(level)
  return bonusWords.length > 0
}

export function getBonusLevelProgress(
  bonusWords: string[],
  currentIndex: number,
): {
  completed: number
  total: number
  remaining: number
} {
  return {
    completed: currentIndex,
    total: bonusWords.length,
    remaining: bonusWords.length - currentIndex,
  }
}
