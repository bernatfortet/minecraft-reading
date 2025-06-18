import React from 'react'
import { useStore } from '@nanostores/react'
import { selectedToolStore } from '../store'
import { useSound } from '../utils/sound'

const tools = [
  { name: 'magnet', image: '/Piston.webp' },
  { name: 'sword', image: '/Enchanted_Netherite_Sword.webp' },
  { name: 'pickaxe', image: '/Enchanted_Netherite_Pickaxe.webp' },
  { name: 'next', image: '/Bamboo_Button_JE3.webp' },
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
    <div className='flex flex-row mb-[20vh] self-center rounded-[2px] gap-1 p-2 bg-[#C6C6C6] border-t-white border-l-white border-2  shadow-lg border-b-[#555555] border-r-[#555555]'>
      {tools.map((tool) => {
        const isSelected = selectedTool === tool.name
        return (
          <div
            key={tool.name}
            className={`
            w-24 h-24 
            bg-[#8B8B8B] 
            border-2 border-gray-500 
            hover:border-white 
            flex items-center justify-center 
            cursor-pointer 
            ${isSelected ? ' ring-1 ring-white border-white hover:border-white' : ''}
          `}
            onClick={() => handleToolSelect(tool.name)}
            title={tool.name}
          >
            <img src={tool.image} alt={tool.name} className='w-16 h-16 object-contain' />
          </div>
        )
      })}
    </div>
  )
}
