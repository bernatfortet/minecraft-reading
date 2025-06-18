import React from 'react'
import { useStore } from '@nanostores/react'
import { gameStateStore, switchToLevel } from '../store'

export function LevelIndicator() {
  const gameState = useStore(gameStateStore)

  function handleLevelClick(level: 1 | 2) {
    switchToLevel(level)
  }

  return (
    <div className='fixed left-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2'>
      <div className='text-sm font-bold text-gray-600 mb-2'>LEVEL</div>

      {/* Level 1 Box */}
      <div
        className={`
          w-12 h-12 
          border-2 
          flex items-center justify-center 
          cursor-pointer 
          font-bold text-lg
          transition-colors
          ${
            gameState.currentLevel === 1
              ? 'bg-green-500 border-green-600 text-white'
              : 'bg-gray-200 border-gray-400 text-gray-700 hover:bg-green-100 hover:border-green-300'
          }
        `}
        onClick={() => handleLevelClick(1)}
        title='Level 1 - Easier Words'
      >
        1
      </div>

      {/* Level 2 Box */}
      <div
        className={`
          w-12 h-12 
          border-2 
          flex items-center justify-center 
          cursor-pointer 
          font-bold text-lg
          transition-colors
          ${
            gameState.currentLevel === 2
              ? 'bg-red-500 border-red-600 text-white'
              : 'bg-gray-200 border-gray-400 text-gray-700 hover:bg-red-100 hover:border-red-300'
          }
        `}
        onClick={() => handleLevelClick(2)}
        title='Level 2 - Challenging Words'
      >
        2
      </div>
    </div>
  )
}
