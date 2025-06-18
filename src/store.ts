import { atom } from 'nanostores'
import { soundManager } from './utils/sound'
import { recordSuccessfulCompletion, recordToolUsage } from './utils/performance-tracker'
import { getSessionStartBonusWords, getLevelBonusWords, shouldShowSessionStartBonus, shouldShowLevelBonus } from './utils/bonus-levels'

export const selectedToolStore = atom<string>('magnet')

export type LetterGroup = {
  letters: string[]
  isGrouped: boolean
}

export type WordState = {
  originalWord: string
  letterGroups: LetterGroup[]
}

// level 1: simple 4-5 letter words
const level1Words = [
  'ball',
  'tree',
  'house',
  'bread',
  'water',
  'happy',
  'smile',
  'light',
  'world',
  'heart',
  'music',
  'paper',
  'grass',
  'sound',
  'peace',
]

// level 2: common 6-7 letter words
const level2Words = [
  'animal',
  'bridge',
  'castle',
  'dragon',
  'escape',
  'flower',
  'guitar',
  'helmet',
  'insect',
  'jungle',
  'kitchen',
  'library',
  'monster',
  'nature',
  'orange',
]

// level 3: 7-8 letter words
const level3Words = [
  'bedroom',
  'chicken',
  'dolphin',
  'evening',
  'freedom',
  'garbage',
  'hotdog',
  'iceberg',
  'journey',
  'keyboard',
  'lemon',
  'mailbox',
  'necklace',
  'octopus',
  'penguin',
]

// level 4: 8-9 letter words
const level4words = [
  'airplane',
  'birthday',
  'children',
  'daughter',
  'elephant',
  'festival',
  'goldfish',
  'homework',
  'inventor',
  'kangaroo',
  'laughter',
  'mountain',
  'notebook',
  'opposite',
  'painting',
]

// level 5: 9-10 letter words
const level5words = [
  'adventure',
  'butterfly',
  'celebrate',
  'dangerous',
  'education',
  'fantastic',
  'gymnasium',
  'hamburger',
  'important',
  'jellyfish',
  'landscape',
  'magician',
  'necklaces',
  'operation',
  'pineapple',
]

// level 6: 10-11 letter words
const level6words = [
  'basketball',
  'caterpillar',
  'understand',
  'everywhere',
  'fingernail',
  'grandmother',
  'housekeeping',
  'independent',
  'journalist',
  'kaleidoscope',
  'lawnmower',
  'marketplace',
  'neighborhood',
  'observation',
  'playground',
]

// level 7: complex 11-12 letter words
const level7words = [
  'breathtaking',
  'championship',
  'disadvantage',
  'extraordinary',
  'furthermore',
  'geographical',
  'headquarters',
  'intelligence',
  'jacksonville',
  'kindergarten',
  'laboratories',
  'mathematical',
  'neighborhood',
  'overwhelming',
  'photographer',
]

// level 8: very complex 12-13 letter words
const level8words = [
  'administrator',
  'biodegradable',
  'consciousness',
  'distinguished',
  'electromagnetic',
  'fundamentally',
  'granddaughter',
  'heterogeneous',
  'implementation',
  'jurisprudence',
  'knowledgeable',
  'lighthearted',
  'manufacturing',
  'notwithstanding',
  'organizational',
]

// level 9: extremely complex 13-14 letter words (original level 2)
const level9words = [
  'sophisticated',
  'improbable',
  'revolutionary',
  'incomprehensible',
  'metamorphosis',
  'procrastination',
  'entrepreneurial',
  'pharmaceutical',
  'pseudoscientific',
  'responsibility',
  'uncharacteristic',
  'misunderstanding',
  'interdisciplinary',
  'environmentalist',
  'constitutional',
]

// level 10: impossibly complex 14+ letter words
const level10words = [
  'deinstitutionalization',
  'counterrevolutionary',
  'psychopharmacology',
  'immunoelectrophoresis',
  'tetraiodophenolphthalein',
  'pneumonoultramicroscopic',
  'antidisestablishmentarianism',
  'pseudopseudohypoparathyroidism',
  'floccinaucinihilipilification',
  'supercalifragilisticexpialidocious',
  'dichlorodifluoromethane',
  'thyroparathyroidectomized',
  'radioimmunoelectrophoresis',
  'spectrophotometrically',
  'hepaticocholangiogastrostomy',
]

const wordLevels = {
  1: level1Words,
  2: level2Words,
  3: level3Words,
  4: level4words,
  5: level5words,
  6: level6words,
  7: level7words,
  8: level8words,
  9: level9words,
  10: level10words,
}

export const gameStateStore = atom<{
  currentLevel: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  wordIndex: number
  gameMode: 'regular' | 'bonus' | 'session-start-bonus'
  bonusWords: string[]
  bonusSourceLevel?: number // which level the bonus words came from
}>({
  currentLevel: 1,
  wordIndex: 0,
  gameMode: 'regular',
  bonusWords: [],
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

// Timing store to track word start time
export const wordTimingStore = atom<{
  startTime: Date | null
  currentWord: string
}>({
  startTime: new Date(),
  currentWord: level1Words[0],
})

// Initialize game - check for session bonus on app start
export function initializeGame() {
  if (shouldShowSessionStartBonus()) {
    console.log('🏁 Starting session with bonus words')
    startSessionBonus()
  } else {
    console.log('🏁 Starting regular session')
  }
}

// Call initialization on load
if (typeof window !== 'undefined') {
  // Small delay to ensure stores are ready
  setTimeout(initializeGame, 100)
}

// Helper function to record tool usage
function recordCurrentWordToolUsage() {
  const timing = wordTimingStore.get()
  const gameState = gameStateStore.get()

  if (timing.startTime && timing.currentWord) {
    const timeToComplete = Date.now() - timing.startTime.getTime()
    recordToolUsage(timing.currentWord, gameState.currentLevel, timeToComplete)
  }
}

// Helper functions to manipulate word state
export function splitAtPosition(position: number) {
  // Record tool usage
  recordCurrentWordToolUsage()

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
  // Record tool usage
  recordCurrentWordToolUsage()

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

  // Record tool usage
  recordCurrentWordToolUsage()

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
  const timing = wordTimingStore.get()

  // Record successful completion if timing is available
  if (timing.startTime && timing.currentWord) {
    const timeToComplete = Date.now() - timing.startTime.getTime()
    recordSuccessfulCompletion(timing.currentWord, currentGameState.currentLevel, timeToComplete)
  }

  // Handle bonus level progression
  if (currentGameState.gameMode === 'bonus' || currentGameState.gameMode === 'session-start-bonus') {
    const nextIndex = currentGameState.wordIndex + 1

    if (nextIndex >= currentGameState.bonusWords.length) {
      // Bonus level complete - move to next stage
      console.log('🎁 Bonus level completed!')
      completeBonusLevel()
      return
    }

    // Continue with next bonus word
    const nextWordText = currentGameState.bonusWords[nextIndex]

    gameStateStore.set({
      ...currentGameState,
      wordIndex: nextIndex,
    })

    wordStateStore.set(createInitialWordState(nextWordText))
    wordTimingStore.set({
      startTime: new Date(),
      currentWord: nextWordText,
    })

    console.log('📝 Next bonus word:', nextWordText, `(${nextIndex + 1}/${currentGameState.bonusWords.length})`)
    return
  }

  // Regular level progression
  const currentWords = wordLevels[currentGameState.currentLevel]
  const nextIndex = (currentGameState.wordIndex + 1) % currentWords.length
  const nextWordText = currentWords[nextIndex]

  // Check if we should start a level bonus before continuing
  if (nextIndex === 0) {
    // Completed the level
    console.log('🎯 Level', currentGameState.currentLevel, 'completed!')
    if (startLevelBonus(currentGameState.currentLevel)) {
      // Level bonus started
      return
    }
  }

  // Play sound for word progression
  soundManager.play('pageFlip')

  // Update game state index
  gameStateStore.set({
    ...currentGameState,
    wordIndex: nextIndex,
  })

  // Reset word state with new word and start timing
  wordStateStore.set(createInitialWordState(nextWordText))
  wordTimingStore.set({
    startTime: new Date(),
    currentWord: nextWordText,
  })

  console.log('📝 Next word:', nextWordText)
}

export function switchToLevel(level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10) {
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
    gameMode: 'regular',
    bonusWords: [],
    bonusSourceLevel: undefined,
  })

  // Reset word state with first word of new level and start timing
  wordStateStore.set(createInitialWordState(firstWord))
  wordTimingStore.set({
    startTime: new Date(),
    currentWord: firstWord,
  })

  console.log('🎯 Switched to level', level, '- First word:', firstWord)
}

export function getCurrentLevelInfo() {
  const gameState = gameStateStore.get()

  if (gameState.gameMode === 'bonus' || gameState.gameMode === 'session-start-bonus') {
    const currentWord = gameState.bonusWords[gameState.wordIndex] || 'No bonus words'
    return {
      level: gameState.currentLevel,
      wordIndex: gameState.wordIndex,
      totalWords: gameState.bonusWords.length,
      currentWord,
      gameMode: gameState.gameMode,
      bonusSourceLevel: gameState.bonusSourceLevel,
    }
  }

  const currentWords = wordLevels[gameState.currentLevel]
  return {
    level: gameState.currentLevel,
    wordIndex: gameState.wordIndex,
    totalWords: currentWords.length,
    currentWord: currentWords[gameState.wordIndex],
    gameMode: gameState.gameMode,
  }
}

// Bonus level management functions
export function startSessionBonus() {
  if (!shouldShowSessionStartBonus()) {
    console.log('🎯 No words need work - skipping session bonus')
    return
  }

  const bonusWords = getSessionStartBonusWords()
  const firstWord = bonusWords[0]

  gameStateStore.set({
    currentLevel: 1,
    wordIndex: 0,
    gameMode: 'session-start-bonus',
    bonusWords,
  })

  wordStateStore.set(createInitialWordState(firstWord))
  wordTimingStore.set({
    startTime: new Date(),
    currentWord: firstWord,
  })

  console.log('🎁 Started session bonus with', bonusWords.length, 'words:', bonusWords)
}

export function startLevelBonus(level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10) {
  if (!shouldShowLevelBonus(level)) {
    console.log('🎯 No words need work for level', level, '- skipping level bonus')
    return false
  }

  const bonusWords = getLevelBonusWords(level)
  const firstWord = bonusWords[0]

  gameStateStore.set({
    currentLevel: level,
    wordIndex: 0,
    gameMode: 'bonus',
    bonusWords,
    bonusSourceLevel: level,
  })

  wordStateStore.set(createInitialWordState(firstWord))
  wordTimingStore.set({
    startTime: new Date(),
    currentWord: firstWord,
  })

  console.log('🎁 Started level', level, 'bonus with', bonusWords.length, 'words:', bonusWords)
  return true
}

export function completeBonusLevel() {
  const gameState = gameStateStore.get()

  if (gameState.gameMode === 'session-start-bonus') {
    // After session bonus, go to level 1
    switchToLevel(1)
  } else if (gameState.gameMode === 'bonus' && gameState.bonusSourceLevel) {
    // After level bonus, continue to next level or back to current level
    switch (gameState.bonusSourceLevel) {
      case 1:
        switchToLevel(2)
        break
      case 2:
        switchToLevel(3)
        break
      case 3:
        switchToLevel(4)
        break
      case 4:
        switchToLevel(5)
        break
      case 5:
        switchToLevel(6)
        break
      case 6:
        switchToLevel(7)
        break
      case 7:
        switchToLevel(8)
        break
      case 8:
        switchToLevel(9)
        break
      case 9:
        switchToLevel(10)
        break
      default:
        switchToLevel(1)
        break // Level 10 or any other case
    }
  }
}
