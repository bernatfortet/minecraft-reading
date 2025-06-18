import React, { useState } from 'react'
import { useStore } from '@nanostores/react'
import { selectedToolStore, wordStateStore, splitAtPosition, mergeAdjacentGroups, separateAllLetters, getCurrentLevelInfo } from '../store'
import { useSound } from '../utils/sound'
import classed from '~/styles/classed'
import { cn } from '~/utils/cn'

// import { Column, Row } from '~/styles'

export function SelectedWord() {
  const selectedTool = useStore(selectedToolStore)
  const wordState = useStore(wordStateStore)
  const { play } = useSound()
  const [hoverState, setHoverState] = useState<{
    globalPosition: number
    side: 'left' | 'right'
  } | null>(null)

  const [dragState, setDragState] = useState<{
    isDragging: boolean
    startGroupIndex: number
    currentGroupIndex: number
  } | null>(null)

  const [isHoveringLetters, setIsHoveringLetters] = useState(false)

  const isSwordSelected = selectedTool === 'sword'
  const isPistonSelected = selectedTool === 'magnet'

  const levelInfo = getCurrentLevelInfo()

  function getGroupInfoAtPosition(globalPosition: number): { groupIndex: number; letterIndex: number } | null {
    let currentGlobalPosition = 0

    for (let groupIndex = 0; groupIndex < wordState.letterGroups.length; groupIndex++) {
      const group = wordState.letterGroups[groupIndex]
      for (let letterIndex = 0; letterIndex < group.letters.length; letterIndex++) {
        if (currentGlobalPosition === globalPosition) {
          return { groupIndex, letterIndex }
        }
        currentGlobalPosition++
      }
    }
    return null
  }

  function canSplitAtPosition(globalPosition: number, side: 'left' | 'right'): boolean {
    const splitPosition = side === 'left' ? globalPosition : globalPosition + 1

    // Can't split before first letter
    if (splitPosition <= 0) return false

    // Can't split after last letter
    const totalLetters = wordState.letterGroups.reduce((sum, group) => sum + group.letters.length, 0)
    if (splitPosition >= totalLetters) return false

    // Check if the letters on both sides of the split are in the same group
    const leftLetterInfo = getGroupInfoAtPosition(splitPosition - 1)
    const rightLetterInfo = getGroupInfoAtPosition(splitPosition)

    if (!leftLetterInfo || !rightLetterInfo) return false

    // Only allow split if both letters are in the same group
    return leftLetterInfo.groupIndex === rightLetterInfo.groupIndex
  }

  function handleLetterClick(globalPosition: number, side: 'left' | 'right') {
    console.log('🎯 Letter clicked at position:', globalPosition, 'side:', side)

    if (isSwordSelected) {
      if (canSplitAtPosition(globalPosition, side)) {
        play('swordSwing')
        const splitPosition = side === 'left' ? globalPosition : globalPosition + 1
        splitAtPosition(splitPosition)
      } else {
        console.log('🚫 Cannot split at this position - letters are already separated')
      }
    } else if (selectedTool === 'pickaxe') {
      play('pickaxeHit')
      separateAllLetters()
    }
  }

  function handleGapClick(gapIndex: number) {
    console.log('🔧 Gap clicked at index:', gapIndex)

    if (isPistonSelected) {
      mergeAdjacentGroups(gapIndex)
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

    // Find the best split position near the mouse
    const bestPosition = globalPosition
    let bestSide: 'left' | 'right'

    if (globalPosition === 0) {
      // First letter: only check right side
      bestSide = 'right'
    } else if (isCloserToRight) {
      // Hovering right side: prefer split to the right, fallback to left
      if (canSplitAtPosition(globalPosition, 'right')) {
        bestSide = 'right'
      } else if (canSplitAtPosition(globalPosition, 'left')) {
        bestSide = 'left'
      } else {
        setHoverState(null)
        return
      }
    } else {
      // Hovering left side: prefer split to the left, fallback to right
      if (canSplitAtPosition(globalPosition, 'left')) {
        bestSide = 'left'
      } else if (canSplitAtPosition(globalPosition, 'right')) {
        bestSide = 'right'
      } else {
        setHoverState(null)
        return
      }
    }

    setHoverState({ globalPosition: bestPosition, side: bestSide })
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

  function getSplitPosition(): number | null {
    if (!hoverState || !isSwordSelected) return null

    const { globalPosition, side } = hoverState

    // Only return split position if the split is actually valid
    if (!canSplitAtPosition(globalPosition, side)) return null

    return side === 'left' ? globalPosition : globalPosition + 1
  }

  function renderLetterGroups() {
    let globalPosition = 0
    const elements: React.ReactNode[] = []
    const splitPosition = getSplitPosition()

    wordState.letterGroups.forEach((group, groupIndex) => {
      const isInDragRange = isGroupInDragRange(groupIndex)

      // Render the letter group
      const groupElement = (
        <div
          key={`group-${groupIndex}`}
          className={`
            flex items-center select-none
            ${isPistonSelected ? 'cursor-grab' : ''}
            ${isInDragRange ? 'bg-blue-200 border-2 border-blue-400 rounded px-1' : ''}
          `}
          onMouseDown={() => handleGroupMouseDown(groupIndex)}
          onMouseEnter={() => handleGroupMouseEnter(groupIndex)}
          onMouseUp={handleGroupMouseUp}
        >
          {group.letters.map((letter, letterIndex) => {
            const currentGlobalPosition = globalPosition

            const letterElements: React.ReactNode[] = []

            // Add caret before this letter if split position matches
            if (splitPosition === currentGlobalPosition && currentGlobalPosition > 0) {
              letterElements.push(<Caret key={`caret-${splitPosition}`} />)
            }

            // Add the letter
            letterElements.push(
              <span
                key={`letter-${currentGlobalPosition}`}
                className={`
                  text-4xl font-bold cursor-crosshair px-1 relative rounded-md font-mono select-none
                  ${selectedTool === 'pickaxe' && isHoveringLetters ? 'bg-green-100' : ''}
                  ${isPistonSelected && !dragState?.isDragging && !isSwordSelected ? 'hover:bg-blue-100' : ''}
                `}
                onMouseMove={(e) => handleLetterMouseMove(currentGlobalPosition, e)}
                onClick={() => handleLetterClick(currentGlobalPosition, hoverState?.side || 'right')}
              >
                {letter}
              </span>,
            )

            globalPosition++

            // Add caret after this letter if split position matches (for the end of word case)
            if (
              splitPosition === globalPosition &&
              globalPosition === wordState.letterGroups.reduce((sum, g) => sum + g.letters.length, 0)
            ) {
              letterElements.push(<Caret key={`caret-${splitPosition}`} />)
            }

            return <React.Fragment key={letterIndex}>{letterElements}</React.Fragment>
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
            className={cn(
              'w-8 h-12 flex items-center justify-center select-none rounded',
              isSwordSelected ? 'cursor-default' : 'cursor-crosshair',
              isPistonSelected && !dragState?.isDragging
                ? 'hover:bg-blue-100 border-2 border-dashed border-transparent hover:border-blue-300'
                : '',
              isGapInDragRange ? 'bg-blue-200 border-2 border-blue-400' : '',
            )}
            onClick={() => handleGapClick(groupIndex)}
            title={isPistonSelected && !dragState?.isDragging ? 'Click to merge groups or drag across groups' : ''}
          >
            {isPistonSelected && !dragState?.isDragging && <div className='w-1 h-8 bg-blue-300 opacity-50' />}
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
      className='w-full flex flex-col items-center justify-center select-none'
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleGroupMouseUp}
    >
      {/* Word counter */}
      <div className='text-sm text-gray-500 mb-2'>
        Level {levelInfo.level} - Word {levelInfo.wordIndex + 1} of {levelInfo.totalWords}: {levelInfo.currentWord}
        <div className='text-xs opacity-75'>
          {levelInfo.level <= 3 && '(Easy)'}
          {levelInfo.level > 3 && levelInfo.level <= 6 && '(Medium)'}
          {levelInfo.level > 6 && levelInfo.level <= 8 && '(Hard)'}
          {levelInfo.level === 9 && '(Extreme)'}
          {levelInfo.level === 10 && '(Impossible)'}
        </div>
      </div>

      <div
        className='flex items-center'
        onMouseEnter={() => selectedTool === 'pickaxe' && setIsHoveringLetters(true)}
        onMouseLeave={() => setIsHoveringLetters(false)}
      >
        {renderLetterGroups()}
      </div>

      {/* Tool instructions */}
      <div className='fixed bottom-4 left-4 text-sm text-gray-600'>
        {isSwordSelected && '⚔️ Click on letter side to split'}
        {isPistonSelected && '🔧 Click gap to merge or drag across groups'}
        {selectedTool === 'pickaxe' && '⛏️ Click to separate all letters'}
      </div>
    </div>
  )
}

const Caret = classed('div', 'w-[3px] rounded h-12 bg-red-500 animate-pulse')
