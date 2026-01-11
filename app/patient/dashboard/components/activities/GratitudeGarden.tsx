'use client'

import { useState, useEffect } from 'react'
import { Sprout, Plus, Flower2, ArrowLeft } from 'lucide-react'

interface GratitudeGardenProps {
  onBack: () => void
}

interface GratitudeSeed {
  id: string
  text: string
  createdAt: string
  growth: number
}

export default function GratitudeGarden({ onBack }: GratitudeGardenProps) {
  const [seeds, setSeeds] = useState<GratitudeSeed[]>([])
  const [showInput, setShowInput] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSeeds()
    // Simulate growth
    const interval = setInterval(() => {
      setSeeds((prev) =>
        prev.map((seed) => ({
          ...seed,
          growth: Math.min(100, seed.growth + 0.1),
        }))
      )
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchSeeds = async () => {
    try {
      const response = await fetch('/api/activities/gratitude')
      if (response.ok) {
        const data = await response.json()
        setSeeds(data.entries || [])
      }
    } catch (error) {
      console.error('Failed to fetch gratitude entries:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/activities/gratitude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input.trim() }),
      })

      if (response.ok) {
        setInput('')
        setShowInput(false)
        fetchSeeds()
      }
    } catch (error) {
      console.error('Failed to save gratitude:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Activities
      </button>
      <div className="flex items-center gap-3 mb-6">
        <Sprout className="w-8 h-8 text-green-500" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gratitude Garden</h2>
          <p className="text-gray-600">Plant seeds of gratitude and watch them grow</p>
        </div>
      </div>

      {!showInput ? (
        <button
          onClick={() => setShowInput(true)}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-400 hover:bg-green-50 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-green-700"
        >
          <Plus className="w-5 h-5" />
          Plant a New Seed
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What are you grateful for today?
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Something big or small..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-4"
            rows={3}
          />
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Planting...' : 'Plant Seed'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowInput(false)
                setInput('')
              }}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {seeds.map((seed) => (
          <div
            key={seed.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <Flower2 className="w-6 h-6 text-green-500" />
              <span className="text-xs text-gray-500">
                {new Date(seed.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-900 mb-2">{seed.text}</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${seed.growth}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {seeds.length === 0 && !showInput && (
        <div className="text-center py-12 text-gray-500">
          <Sprout className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>Your garden is empty. Plant your first seed of gratitude!</p>
        </div>
      )}
    </div>
  )
}

