import React, { useState } from 'react'
import { useStore } from '@nanostores/react'
import {
  selectedToolStore,
  wordStateStore,
  splitAtPosition,
  mergeAdjacentGroups,
  separateAllLetters,
  nextWord,
  getCurrentLevelInfo,
} from '../store'

// import { Column, Row } from '~/styles'

export function SelectedWord() {
  const selectedTool = useStore(selectedToolStore)
  const wordState = useStore(wordStateStore)
  const [hoverState, setHoverState] = useState<{
    globalPosition: number
    side: 'left' | 'right'
  } | null>(null)

  const [dragState, setDragState] = useState<{
    isDragging: boolean
    startGroupIndex: number
    currentGroupIndex: number
  } | null>(null)

  const isSwordSelected = selectedTool === 'sword'
  const isPistonSelected = selectedTool === 'magnet'
  const isNextSelected = selectedTool === 'next'

  const levelInfo = getCurrentLevelInfo()

  function handleLetterClick(globalPosition: number, side: 'left' | 'right') {
    console.log('🎯 Letter clicked at position:', globalPosition, 'side:', side)

    if (isSwordSelected) {
      const splitPosition = side === 'left' ? globalPosition : globalPosition + 1
      splitAtPosition(splitPosition)
    } else if (selectedTool === 'pickaxe') {
      separateAllLetters()
    } else if (isNextSelected) {
      nextWord()
    }
  }

  function handleGapClick(gapIndex: number) {
    console.log('🔧 Gap clicked at index:', gapIndex)

    if (isPistonSelected) {
      mergeAdjacentGroups(gapIndex)
    } else if (isNextSelected) {
      nextWord()
    }
  }

  function handleGroupMouseDown(groupIndex: number) {
    if (isPistonSelected) {
      setDragState({
        isDragging: true,
        startGroupIndex: groupIndex,
        currentGroupIndex: groupIndex,
      })
      console.log('🔧 Started piston drag from group:', groupIndex)
    }
  }

  function handleGroupMouseEnter(groupIndex: number) {
    if (dragState?.isDragging && isPistonSelected) {
      setDragState({
        ...dragState,
        currentGroupIndex: groupIndex,
      })
    }
  }

  function handleGroupMouseUp() {
    if (dragState?.isDragging && isPistonSelected) {
      const startIndex = Math.min(dragState.startGroupIndex, dragState.currentGroupIndex)
      const endIndex = Math.max(dragState.startGroupIndex, dragState.currentGroupIndex)

      console.log('🔧 Piston drag completed from group', startIndex, 'to', endIndex)

      // Merge all groups in the range
      mergeGroupRange(startIndex, endIndex)
    }

    setDragState(null)
  }

  function mergeGroupRange(startIndex: number, endIndex: number) {
    if (startIndex === endIndex) {
      // Single group selected, no merging needed
      return
    }

    const currentState = wordStateStore.get()
    const groups = currentState.letterGroups

    // Collect all letters from the range
    const allLetters: string[] = []
    for (let i = startIndex; i <= endIndex; i++) {
      if (groups[i]) {
        allLetters.push(...groups[i].letters)
      }
    }

    // Create new merged group
    const mergedGroup = {
      letters: allLetters,
      isGrouped: true,
    }

    // Create new groups array with the merged range
    const newGroups = [...groups.slice(0, startIndex), mergedGroup, ...groups.slice(endIndex + 1)]

    wordStateStore.set({
      ...currentState,
      letterGroups: newGroups,
    })
  }

  function handleLetterMouseMove(globalPosition: number, event: React.MouseEvent) {
    if (!isSwordSelected) return

    const target = event.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const letterWidth = rect.width
    const isCloserToRight = mouseX > letterWidth / 2

    // For first letter (position 0), only allow right side
    const side = globalPosition === 0 ? 'right' : isCloserToRight ? 'right' : 'left'

    setHoverState({ globalPosition, side })
  }

  function handleMouseLeave() {
    setHoverState(null)
    // Don't clear drag state on mouse leave, only on mouse up
  }

  function isGroupInDragRange(groupIndex: number): boolean {
    if (!dragState?.isDragging) return false

    const startIndex = Math.min(dragState.startGroupIndex, dragState.currentGroupIndex)
    const endIndex = Math.max(dragState.startGroupIndex, dragState.currentGroupIndex)

    return groupIndex >= startIndex && groupIndex <= endIndex
  }

  function renderLetterGroups() {
    let globalPosition = 0
    const elements: React.ReactNode[] = []

    wordState.letterGroups.forEach((group, groupIndex) => {
      const isInDragRange = isGroupInDragRange(groupIndex)

      // Render the letter group
      const groupElement = (
        <div
          key={`group-${groupIndex}`}
          className={`
            flex items-center
            ${isPistonSelected ? 'cursor-grab' : ''}
            ${isInDragRange ? 'bg-blue-200 border-2 border-blue-400 rounded px-1' : ''}
          `}
          onMouseDown={() => handleGroupMouseDown(groupIndex)}
          onMouseEnter={() => handleGroupMouseEnter(groupIndex)}
          onMouseUp={handleGroupMouseUp}
        >
          {group.letters.map((letter, letterIndex) => {
            const currentGlobalPosition = globalPosition
            globalPosition++

            const isHovered = hoverState?.globalPosition === currentGlobalPosition
            const showCursorLeft =
              isSwordSelected &&
              hoverState?.globalPosition === currentGlobalPosition &&
              hoverState?.side === 'left' &&
              currentGlobalPosition > 0 // Don't show cursor before first letter
            const showCursorRight = isSwordSelected && hoverState?.globalPosition === currentGlobalPosition && hoverState?.side === 'right'

            return (
              <div key={letterIndex} className='relative flex items-center'>
                {/* Cursor before letter */}
                {showCursorLeft && <div className='w-0.5 h-12 bg-red-500 animate-pulse mr-1' />}

                {/* Letter */}
                <span
                  className={`
                    text-4xl font-bold cursor-pointer px-1 relative font-mono
                    ${isSwordSelected ? 'hover:bg-red-100' : ''}
                    ${selectedTool === 'pickaxe' ? 'hover:bg-green-100' : ''}
                    ${isNextSelected ? 'hover:bg-orange-100' : ''}
                    ${isPistonSelected && !dragState?.isDragging ? 'hover:bg-blue-100' : ''}
                    ${isHovered ? 'bg-yellow-100' : ''}
                  `}
                  onMouseMove={(e) => handleLetterMouseMove(currentGlobalPosition, e)}
                  onClick={() => handleLetterClick(currentGlobalPosition, hoverState?.side || 'right')}
                >
                  {letter}
                </span>

                {/* Cursor after letter */}
                {showCursorRight && <div className='w-0.5 h-12 bg-red-500 animate-pulse ml-1' />}
              </div>
            )
          })}
        </div>
      )

      elements.push(groupElement)

      // Add gap between groups (except after the last group)
      if (groupIndex < wordState.letterGroups.length - 1) {
        const isGapInDragRange = isInDragRange || isGroupInDragRange(groupIndex + 1)

        const gapElement = (
          <div
            key={`gap-${groupIndex}`}
            className={`
              w-8 h-12 flex items-center justify-center
              ${
                isPistonSelected && !dragState?.isDragging
                  ? 'cursor-pointer hover:bg-blue-100 border-2 border-dashed border-transparent hover:border-blue-300'
                  : ''
              }
              ${isNextSelected ? 'cursor-pointer hover:bg-orange-100' : ''}
              ${isGapInDragRange ? 'bg-blue-200 border-2 border-blue-400' : ''}
            `}
            onClick={() => handleGapClick(groupIndex)}
            title={
              isPistonSelected && !dragState?.isDragging
                ? 'Click to merge groups or drag across groups'
                : isNextSelected
                ? 'Click for next word'
                : ''
            }
          >
            {isPistonSelected && !dragState?.isDragging && <div className='w-1 h-8 bg-blue-300 opacity-50' />}
            {isNextSelected && <div className='text-orange-500 text-sm'>→</div>}
            {isGapInDragRange && <div className='text-blue-600 text-xs'>⟷</div>}
          </div>
        )
        elements.push(gapElement)
      }
    })

    return elements
  }

  return (
    <div
      className={`
        w-full flex flex-col items-center justify-center
        ${isSwordSelected ? 'cursor-crosshair' : ''}
        ${isNextSelected ? 'cursor-pointer' : ''}
        ${dragState?.isDragging ? 'select-none' : ''}
      `}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleGroupMouseUp}
    >
      {/* Word counter */}
      <div className='text-sm text-gray-500 mb-2'>
        Level {levelInfo.level} - Word {levelInfo.wordIndex + 1} of {levelInfo.totalWords}: {levelInfo.currentWord}
      </div>

      <div className='flex items-center'>{renderLetterGroups()}</div>

      {/* Tool instructions */}
      <div className='fixed bottom-4 left-4 text-sm text-gray-600'>
        {isSwordSelected && '⚔️ Click on letter side to split'}
        {isPistonSelected && '🔧 Click gap to merge or drag across groups'}
        {selectedTool === 'pickaxe' && '⛏️ Click to separate all letters'}
        {isNextSelected && '🔄 Click anywhere for next word'}
      </div>
    </div>
  )
}
