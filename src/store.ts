import { atom } from 'nanostores'
import { soundManager } from './utils/sound'

export const selectedToolStore = atom<string>('magnet')

export type LetterGroup = {
  letters: string[]
  isGrouped: boolean
}

export type WordState = {
  originalWord: string
  letterGroups: LetterGroup[]
}

const level1Words = [
  'WONDERFUL',
  'BEAUTIFUL',
  'IMPORTANT',
  'ADVENTURE',
  'DIFFERENT',
  'REMEMBER',
  'TOGETHER',
  'BIRTHDAY',
  'LAUGHTER',
  'DINOSAUR',
  'ELEPHANT',
  'BUTTERFLY',
  'HOSPITAL',
  'SANDWICH',
  'COMPUTER',
]

const level2Words = [
  'SOPHISTICATED',
  'IMPROBABLE',
  'EXTRAORDINARY',
  'REVOLUTIONARY',
  'INCOMPREHENSIBLE',
  'METAMORPHOSIS',
  'PROCRASTINATION',
  'ENTREPRENEURIAL',
  'PHARMACEUTICAL',
  'PSEUDOSCIENTIFIC',
  'RESPONSIBILITY',
  'UNCHARACTERISTIC',
  'MISUNDERSTANDING',
  'INTERDISCIPLINARY',
  'ENVIRONMENTALIST',
]

const wordLevels = {
  1: level1Words,
  2: level2Words,
}

export const gameStateStore = atom<{
  currentLevel: 1 | 2
  wordIndex: number
}>({
  currentLevel: 1,
  wordIndex: 0,
})

function createInitialWordState(word: string): WordState {
  return {
    originalWord: word,
    letterGroups: [
      {
        letters: word.split(''),
        isGrouped: true,
      },
    ],
  }
}

export const wordStateStore = atom<WordState>(createInitialWordState(level1Words[0]))

// Helper functions to manipulate word state
export function splitAtPosition(position: number) {
  const currentState = wordStateStore.get()
  const newGroups: LetterGroup[] = []

  let currentPosition = 0

  for (const group of currentState.letterGroups) {
    const groupEndPosition = currentPosition + group.letters.length

    if (position > currentPosition && position < groupEndPosition) {
      // Split this group
      const splitIndex = position - currentPosition
      const leftLetters = group.letters.slice(0, splitIndex)
      const rightLetters = group.letters.slice(splitIndex)

      if (leftLetters.length > 0) {
        newGroups.push({ letters: leftLetters, isGrouped: leftLetters.length > 1 })
      }
      if (rightLetters.length > 0) {
        newGroups.push({ letters: rightLetters, isGrouped: rightLetters.length > 1 })
      }
    } else {
      newGroups.push(group)
    }

    currentPosition = groupEndPosition
  }

  wordStateStore.set({
    ...currentState,
    letterGroups: newGroups,
  })
}

export function mergeAllGroups() {
  const currentState = wordStateStore.get()
  const allLetters = currentState.letterGroups.flatMap((group) => group.letters)

  wordStateStore.set({
    ...currentState,
    letterGroups: [
      {
        letters: allLetters,
        isGrouped: true,
      },
    ],
  })
}

export function separateAllLetters() {
  const currentState = wordStateStore.get()
  const allLetters = currentState.letterGroups.flatMap((group) => group.letters)

  wordStateStore.set({
    ...currentState,
    letterGroups: allLetters.map((letter) => ({
      letters: [letter],
      isGrouped: false,
    })),
  })
}

export function setNewWord(word: string) {
  wordStateStore.set(createInitialWordState(word))
}

export function mergeAdjacentGroups(gapIndex: number) {
  const currentState = wordStateStore.get()
  const groups = currentState.letterGroups

  // Can't merge if there aren't at least 2 groups or invalid gap index
  if (groups.length < 2 || gapIndex < 0 || gapIndex >= groups.length - 1) {
    return
  }

  const leftGroup = groups[gapIndex]
  const rightGroup = groups[gapIndex + 1]

  // Create new merged group
  const mergedGroup: LetterGroup = {
    letters: [...leftGroup.letters, ...rightGroup.letters],
    isGrouped: true,
  }

  // Create new groups array with the merged group
  const newGroups = [...groups.slice(0, gapIndex), mergedGroup, ...groups.slice(gapIndex + 2)]

  wordStateStore.set({
    ...currentState,
    letterGroups: newGroups,
  })
}

export function nextWord() {
  const currentGameState = gameStateStore.get()
  const currentWords = wordLevels[currentGameState.currentLevel]
  const nextIndex = (currentGameState.wordIndex + 1) % currentWords.length
  const nextWordText = currentWords[nextIndex]

  // Play sound for word progression
  soundManager.play('pageFlip')

  // Update game state index
  gameStateStore.set({
    ...currentGameState,
    wordIndex: nextIndex,
  })

  // Reset word state with new word
  wordStateStore.set(createInitialWordState(nextWordText))

  console.log('📝 Next word:', nextWordText)
}

export function switchToLevel(level: 1 | 2) {
  const currentGameState = gameStateStore.get()

  // Don't do anything if already on this level
  if (currentGameState.currentLevel === level) {
    return
  }

  const newWords = wordLevels[level]
  const firstWord = newWords[0]

  // Play sound for level switching
  soundManager.play('success')

  // Update game state
  gameStateStore.set({
    currentLevel: level,
    wordIndex: 0,
  })

  // Reset word state with first word of new level
  wordStateStore.set(createInitialWordState(firstWord))

  console.log('🎯 Switched to level', level, '- First word:', firstWord)
}

export function getCurrentLevelInfo() {
  const gameState = gameStateStore.get()
  const currentWords = wordLevels[gameState.currentLevel]

  return {
    level: gameState.currentLevel,
    wordIndex: gameState.wordIndex,
    totalWords: currentWords.length,
    currentWord: currentWords[gameState.wordIndex],
  }
}
