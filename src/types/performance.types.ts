export type WordPerformance = {
  word: string
  level: number // original level (1-10)
  lastAttemptTime: Date
  timeToComplete: number // milliseconds of last attempt
  usedTools: boolean // true if any tool was used in last attempt
  consecutiveSuccesses: number // successful attempts in a row (under 5s, no tools)
  totalAttempts: number
  masteryStatus: 'new' | 'learning' | 'mastered'
}

export type SessionStats = {
  wordsAttempted: number
  toolsUsedCount: number
  averageTime: number
  successfulWords: number
  sessionStartTime: Date
}
