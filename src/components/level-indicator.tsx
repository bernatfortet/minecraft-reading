import React from 'react'
import { useStore } from '@nanostores/react'
import { gameStateStore, switchToLevel, startSessionBonus } from '../store'

export function LevelIndicator() {
  const gameState = useStore(gameStateStore)

  function handleLevelClick(level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10) {
    switchToLevel(level)
  }

  function getLevelColor(level: number, isSelected: boolean) {
    if (isSelected) {
      if (level <= 3) return 'bg-green-500 border-green-600 text-white'
      if (level <= 6) return 'bg-yellow-500 border-yellow-600 text-white'
      if (level <= 8) return 'bg-orange-500 border-orange-600 text-white'
      return 'bg-red-500 border-red-600 text-white'
    } else {
      if (level <= 3) return 'bg-gray-200 border-gray-400 text-gray-700 hover:bg-green-100 hover:border-green-300'
      if (level <= 6) return 'bg-gray-200 border-gray-400 text-gray-700 hover:bg-yellow-100 hover:border-yellow-300'
      if (level <= 8) return 'bg-gray-200 border-gray-400 text-gray-700 hover:bg-orange-100 hover:border-orange-300'
      return 'bg-gray-200 border-gray-400 text-gray-700 hover:bg-red-100 hover:border-red-300'
    }
  }

  function getLevelTitle(level: number) {
    if (level <= 3) return `Level ${level} - Easy (${level <= 1 ? '4-5' : level <= 2 ? '6-7' : '7-8'} letters)`
    if (level <= 6) return `Level ${level} - Medium (${level <= 4 ? '8-9' : level <= 5 ? '9-10' : '10-11'} letters)`
    if (level <= 8) return `Level ${level} - Hard (${level <= 7 ? '11-12' : '12-13'} letters)`
    return `Level ${level} - ${level === 9 ? 'Extreme' : 'Impossible'} (${level === 9 ? '13-14' : '15+'} letters)`
  }

  return (
    <div className='fixed left-4 top-1/2 transform -translate-y-1/2 flex flex-col'>
      <div className='text-xs font-bold text-gray-600 mb-2 text-center'>LEVELS</div>

      {/* Bonus level button */}
      <div className='mb-2'>
        <button
          className={`
            w-full h-8 px-2 text-xs font-bold border-2 rounded cursor-pointer transition-colors
            ${
              gameState.gameMode === 'bonus' || gameState.gameMode === 'session-start-bonus'
                ? 'bg-purple-500 border-purple-600 text-white'
                : 'bg-purple-100 border-purple-300 text-purple-700 hover:bg-purple-200'
            }
          `}
          onClick={startSessionBonus}
          title='Practice words that need work'
        >
          {gameState.gameMode === 'bonus' || gameState.gameMode === 'session-start-bonus' ? '🎁 BONUS' : '🎁 PRACTICE'}
        </button>
      </div>

      {/* Vertical stack of level boxes */}
      <div className='flex flex-col gap-1'>
        {Array.from({ length: 10 }, (_, i) => {
          const level = (i + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
          const isSelected = gameState.currentLevel === level && gameState.gameMode === 'regular'

          return (
            <div
              key={level}
              className={`
                w-16 h-8 
                border-2 
                flex items-center justify-center 
                cursor-pointer 
                font-bold text-xs
                transition-colors
                ${getLevelColor(level, isSelected)}
              `}
              onClick={() => handleLevelClick(level)}
              title={getLevelTitle(level)}
            >
              {level}
            </div>
          )
        })}
      </div>

      {/* Difficulty legend */}
      <div className='mt-2 text-xs text-gray-500'>
        <div className='flex items-center gap-1 mb-1'>
          <div className='w-2 h-2 bg-green-400 rounded'></div>
          <span>Easy</span>
        </div>
        <div className='flex items-center gap-1 mb-1'>
          <div className='w-2 h-2 bg-yellow-400 rounded'></div>
          <span>Medium</span>
        </div>
        <div className='flex items-center gap-1 mb-1'>
          <div className='w-2 h-2 bg-orange-400 rounded'></div>
          <span>Hard</span>
        </div>
        <div className='flex items-center gap-1'>
          <div className='w-2 h-2 bg-red-400 rounded'></div>
          <span>Extreme</span>
        </div>
      </div>
    </div>
  )
}
