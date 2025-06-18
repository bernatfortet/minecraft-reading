'use client'
import { SelectedWord } from '~/components/selected-word'
import { Toolbar } from '~/components/toolbar'
import { LevelIndicator } from '~/components/level-indicator'
import { ScoreDisplay } from '~/components/score-display'

export default function Home() {
  return (
    <div className='flex flex-col h-screen overflow-hidden bg-[#f0eee4]'>
      <LevelIndicator />
      <ScoreDisplay />
      <div className='w-full flex flex-1 items-center justify-center text-4xl font-bold'>
        <SelectedWord />
      </div>
      <Toolbar />
    </div>
  )
}
