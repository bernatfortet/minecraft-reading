import React from 'react'
import { useStore } from '@nanostores/react'
import { gameStateStore, wordTimingStore, getCurrentLevelInfo } from '../store'
import { getWordsNeedingWork, getMasteredWords } from '../utils/word-memory'
import { getWordMasteryInfo } from '../utils/performance-tracker'

export function ScoreDisplay() {
  const gameState = useStore(gameStateStore)
  const timing = useStore(wordTimingStore)

  const currentWordInfo = getWordMasteryInfo(timing.currentWord)
  const wordsNeedingWork = getWordsNeedingWork()
  const masteredWords = getMasteredWords()

  const currentTime = timing.startTime ? Math.floor((Date.now() - timing.startTime.getTime()) / 1000) : 0

  return (
    <div className='fixed top-4 right-4 bg-white/90 backdrop-blur-sm border-2 border-gray-300 rounded-lg p-3 text-sm shadow-lg'>
      <div className='font-bold text-gray-800 mb-2'>📊 Progress</div>

      {/* Current Word Stats */}
      <div className='mb-2 text-xs'>
        <div className='font-medium text-gray-700'>Current Word: {timing.currentWord}</div>
        <div className='text-gray-600'>
          Time: {currentTime}s | Attempts: {currentWordInfo.attempts} | Success: {currentWordInfo.consecutiveSuccesses}/3
        </div>
        <div
          className={`
          text-xs px-1 rounded inline-block
          ${
            currentWordInfo.masteryStatus === 'mastered'
              ? 'bg-green-100 text-green-800'
              : currentWordInfo.masteryStatus === 'learning'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }
        `}
        >
          {currentWordInfo.masteryStatus}
        </div>
      </div>

      {/* Session Overview */}
      <div className='border-t border-gray-200 pt-2 text-xs'>
        <div className='grid grid-cols-2 gap-2'>
          <div>
            <div className='font-medium text-green-700'>✅ Mastered</div>
            <div className='text-green-600'>{masteredWords.length} words</div>
          </div>
          <div>
            <div className='font-medium text-orange-700'>📚 Learning</div>
            <div className='text-orange-600'>{wordsNeedingWork.length} words</div>
          </div>
        </div>
      </div>

      {/* Level Progress */}
      <div className='border-t border-gray-200 pt-2 text-xs'>
        {gameState.gameMode === 'bonus' || gameState.gameMode === 'session-start-bonus' ? (
          <div>
            <div className='font-medium text-purple-700'>
              🎁 {gameState.gameMode === 'session-start-bonus' ? 'Session Bonus' : `Level ${gameState.bonusSourceLevel} Bonus`}
            </div>
            <div className='text-purple-600'>
              Word {gameState.wordIndex + 1} of {gameState.bonusWords.length}
            </div>
          </div>
        ) : (
          <div>
            <div className='font-medium text-gray-700'>Level {gameState.currentLevel}</div>
            <div className='text-gray-600'>
              Word {gameState.wordIndex + 1} of {getCurrentLevelInfo().totalWords}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
