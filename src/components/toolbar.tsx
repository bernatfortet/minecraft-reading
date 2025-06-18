import React from 'react'
import { useStore } from '@nanostores/react'
import { selectedToolStore, nextWord } from '../store'
import { useSound } from '../utils/sound'
import classed from '~/styles/classed'
import { Row } from '~/styles'
import { cn } from '~/utils/cn'

const tools = [
  { name: 'magnet', image: '/Piston.webp' },
  { name: 'sword', image: '/Enchanted_Netherite_Sword.webp' },
  { name: 'pickaxe', image: '/Enchanted_Netherite_Pickaxe.webp' },
]

export function Toolbar() {
  const selectedTool = useStore(selectedToolStore)
  const { play } = useSound()

  function handleToolSelect(toolName: string) {
    // Don't play sound if already selected
    if (selectedTool !== toolName) {
      play('toolSelect')
      console.log('🔊 Tool selected:', toolName)
    }

    selectedToolStore.set(toolName)
  }

  return (
    <Row className='w-full justify-center gap-x-10'>
      <ToolbarContainer>
        {tools.map((tool) => {
          const isSelected = selectedTool === tool.name
          return (
            <div
              key={tool.name}
              className={cn(
                'w-24 h-24 bg-[#8B8B8B]',
                'border-3 border-[#373737] border-b-white border-r-white hover:border-white',
                'flex items-center justify-center cursor-pointer',
                isSelected && 'ring-1 ring-white !border-white hover:border-white',
              )}
              onClick={() => handleToolSelect(tool.name)}
              title={tool.name}
            >
              <img src={tool.image} alt={tool.name} className='w-16 h-16 object-contain' />
            </div>
          )
        })}
      </ToolbarContainer>

      <ToolbarContainer>
        <div
          className='w-24 h-24 bg-[#8B8B8B] border-2 border-gray-500 hover:border-white flex items-center justify-center cursor-pointer'
          onClick={() => {
            nextWord()
            console.log('➡️ Next word')
          }}
          title='Next word'
        >
          <span className='text-4xl'>➡️</span>
        </div>
      </ToolbarContainer>
    </Row>
  )
}

const ToolbarContainer = classed(
  'div',
  'flex flex-row mb-[20vh] self-center rounded-[2px] gap-1 p-2 bg-[#C6C6C6] border-t-white border-l-white border-2  shadow-lg border-b-[#555555] border-r-[#555555]',
)
