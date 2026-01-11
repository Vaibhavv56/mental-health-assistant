'use client'

import { useState } from 'react'
import { Smile, TrendingUp } from 'lucide-react'

const moods = [
  { emoji: '😊', name: 'Happy', value: 'happy' },
  { emoji: '😢', name: 'Sad', value: 'sad' },
  { emoji: '😰', name: 'Anxious', value: 'anxious' },
  { emoji: '😌', name: 'Calm', value: 'calm' },
  { emoji: '😤', name: 'Frustrated', value: 'frustrated' },
  { emoji: '😴', name: 'Tired', value: 'tired' },
  { emoji: '😃', name: 'Excited', value: 'excited' },
  { emoji: '😐', name: 'Neutral', value: 'neutral' },
]

interface MoodTrackerProps {
  onBack: () => void
}

export default function MoodTracker({ onBack }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<string>('')
  const [intensity, setIntensity] = useState(5)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMood) return

    setLoading(true)
    try {
      const response = await fetch('/api/tracking/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: selectedMood,
          intensity,
          notes: notes.trim() || null,
        }),
      })

      if (response.ok) {
        setSelectedMood('')
        setIntensity(5)
        setNotes('')
        alert('Mood logged successfully!')
      }
    } catch (error) {
      console.error('Failed to save mood:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Smile className="w-8 h-8 text-yellow-500" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mood Tracker</h2>
          <p className="text-gray-600">Track your daily mood</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How are you feeling?
          </label>
          <div className="grid grid-cols-4 gap-3">
            {moods.map((mood) => (
              <button
                key={mood.value}
                type="button"
                onClick={() => setSelectedMood(mood.value)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedMood === mood.value
                    ? 'border-yellow-500 bg-yellow-50 scale-105'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-4xl mb-2">{mood.emoji}</div>
                <div className="text-xs text-gray-700">{mood.name}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Intensity: {intensity}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={intensity}
            onChange={(e) => setIntensity(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What's contributing to this mood?"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            rows={3}
          />
        </div>

        <button
          type="submit"
          disabled={!selectedMood || loading}
          className="w-full px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Log Mood'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={onBack}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to Tracking
        </button>
      </div>
    </div>
  )
}

