'use client'

import { useState } from 'react'
import { Search, CheckCircle, ArrowLeft } from 'lucide-react'

interface GroundingScavengerHuntProps {
  onBack: () => void
}

const items = [
  { id: 'blue', label: 'Something blue' },
  { id: 'soft', label: 'Something soft' },
  { id: 'smooth', label: 'Something smooth' },
  { id: 'round', label: 'Something round' },
  { id: 'green', label: 'Something green' },
  { id: 'textured', label: 'Something textured' },
]

export default function GroundingScavengerHunt({ onBack }: GroundingScavengerHuntProps) {
  const [foundItems, setFoundItems] = useState<string[]>([])

  const handleFound = (itemId: string) => {
    if (!foundItems.includes(itemId)) {
      setFoundItems([...foundItems, itemId])
    }
  }

  const allFound = foundItems.length === items.length

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Activities
      </button>
      <div className="flex items-center gap-3 mb-6">
        <Search className="w-8 h-8 text-orange-500" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Grounding Scavenger Hunt</h2>
          <p className="text-gray-600">Find items around you to stay present</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <p className="text-gray-700 mb-6">
          Look around you (or imagine) and find each item. This helps ground you in the present moment.
        </p>

        <div className="space-y-3">
          {items.map((item) => {
            const isFound = foundItems.includes(item.id)
            return (
              <button
                key={item.id}
                onClick={() => handleFound(item.id)}
                className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                  isFound
                    ? 'bg-green-50 border-green-400'
                    : 'bg-gray-50 border-gray-200 hover:border-orange-300'
                }`}
              >
                <span className={`font-medium ${isFound ? 'text-green-900' : 'text-gray-900'}`}>
                  {item.label}
                </span>
                {isFound && <CheckCircle className="w-5 h-5 text-green-600" />}
              </button>
            )
          })}
        </div>
      </div>

      {allFound && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <p className="text-green-900 font-medium">Great job! You found all the items! 🌟</p>
        </div>
      )}

      <p className="text-sm text-gray-500 text-center">
        You can do this mentally or by actually looking around. Fully skippable - use when you need it.
      </p>
    </div>
  )
}

