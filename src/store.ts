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

// Level 1: Simple 4-5 letter words
const level1Words = [
  'BALL',
  'TREE',
  'HOUSE',
  'BREAD',
  'WATER',
  'HAPPY',
  'SMILE',
  'LIGHT',
  'WORLD',
  'HEART',
  'MUSIC',
  'PAPER',
  'GRASS',
  'SOUND',
  'PEACE',
]

// Level 2: Common 6-7 letter words
const level2Words = [
  'ANIMAL',
  'BRIDGE',
  'CASTLE',
  'DRAGON',
  'ESCAPE',
  'FLOWER',
  'GUITAR',
  'HELMET',
  'INSECT',
  'JUNGLE',
  'KITCHEN',
  'LIBRARY',
  'MONSTER',
  'NATURE',
  'ORANGE',
]

// Level 3: 7-8 letter words
const level3Words = [
  'BEDROOM',
  'CHICKEN',
  'DOLPHIN',
  'EVENING',
  'FREEDOM',
  'GARBAGE',
  'HOTDOG',
  'ICEBERG',
  'JOURNEY',
  'KEYBOARD',
  'LEMON',
  'MAILBOX',
  'NECKLACE',
  'OCTOPUS',
  'PENGUIN',
]

// Level 4: 8-9 letter words
const level4Words = [
  'AIRPLANE',
  'BIRTHDAY',
  'CHILDREN',
  'DAUGHTER',
  'ELEPHANT',
  'FESTIVAL',
  'GOLDFISH',
  'HOMEWORK',
  'INVENTOR',
  'KANGAROO',
  'LAUGHTER',
  'MOUNTAIN',
  'NOTEBOOK',
  'OPPOSITE',
  'PAINTING',
]

// Level 5: 9-10 letter words
const level5Words = [
  'ADVENTURE',
  'BUTTERFLY',
  'CELEBRATE',
  'DANGEROUS',
  'EDUCATION',
  'FANTASTIC',
  'GYMNASIUM',
  'HAMBURGER',
  'IMPORTANT',
  'JELLYFISH',
  'LANDSCAPE',
  'MAGICIAN',
  'NECKLACES',
  'OPERATION',
  'PINEAPPLE',
]

// Level 6: 10-11 letter words
const level6Words = [
  'BASKETBALL',
  'CATERPILLAR',
  'UNDERSTAND',
  'EVERYWHERE',
  'FINGERNAIL',
  'GRANDMOTHER',
  'HOUSEKEEPING',
  'INDEPENDENT',
  'JOURNALIST',
  'KALEIDOSCOPE',
  'LAWNMOWER',
  'MARKETPLACE',
  'NEIGHBORHOOD',
  'OBSERVATION',
  'PLAYGROUND',
]

// Level 7: Complex 11-12 letter words
const level7Words = [
  'BREATHTAKING',
  'CHAMPIONSHIP',
  'DISADVANTAGE',
  'EXTRAORDINARY',
  'FURTHERMORE',
  'GEOGRAPHICAL',
  'HEADQUARTERS',
  'INTELLIGENCE',
  'Jacksonville',
  'KINDERGARTEN',
  'LABORATORIES',
  'MATHEMATICAL',
  'NEIGHBORHOOD',
  'OVERWHELMING',
  'PHOTOGRAPHER',
]

// Level 8: Very complex 12-13 letter words
const level8Words = [
  'ADMINISTRATOR',
  'BIODEGRADABLE',
  'CONSCIOUSNESS',
  'DISTINGUISHED',
  'ELECTROMAGNETIC',
  'FUNDAMENTALLY',
  'GRANDDAUGHTER',
  'HETEROGENEOUS',
  'IMPLEMENTATION',
  'JURISPRUDENCE',
  'KNOWLEDGEABLE',
  'LIGHTHEARTED',
  'MANUFACTURING',
  'NOTWITHSTANDING',
  'ORGANIZATIONAL',
]

// Level 9: Extremely complex 13-14 letter words (original level 2)
const level9Words = [
  'SOPHISTICATED',
  'IMPROBABLE',
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
  'CONSTITUTIONAL',
]

// Level 10: Impossibly complex 14+ letter words
const level10Words = [
  'DEINSTITUTIONALIZATION',
  'COUNTERREVOLUTIONARY',
  'PSYCHOPHARMACOLOGY',
  'IMMUNOELECTROPHORESIS',
  'TETRAIODOPHENOLPHTHALEIN',
  'PNEUMONOULTRAMICROSCOPICSILICOCONIOSIS',
  'ANTIDISESTABLISHMENTARIANISM',
  'PSEUDOPSEUDOHYPOPARATHYROIDISM',
  'FLOCCINAUCINIHILIPILIFICATION',
  'SUPERCALIFRAGILISTICEXPIALIDOCIOUS',
  'HONORIFICABILITUDINITATIBUS',
  'THYROPARATHYROIDECTOMIZED',
  'RADIOIMMUNOELECTROPHORESIS',
  'SPECTROPHOTOMETRICALLY',
  'HEPATICOCHOLANGIOGASTROSTOMY',
]

const wordLevels = {
  1: level1Words,
  2: level2Words,
  3: level3Words,
  4: level4Words,
  5: level5Words,
  6: level6Words,
  7: level7Words,
  8: level8Words,
  9: level9Words,
  10: level10Words,
}

export const gameStateStore = atom<{
  currentLevel: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
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
