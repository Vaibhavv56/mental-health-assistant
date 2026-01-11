'use client'

import { useState } from 'react'
import { AlertCircle } from 'lucide-react'

interface AnxietyTrackerProps {
  onBack: () => void
}

export default function AnxietyTracker({ onBack }: AnxietyTrackerProps) {
  const [level, setLevel] = useState(5)
  const [triggers, setTriggers] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const commonTriggers = ['Work', 'Social', 'Health', 'Finances', 'Relationships', 'Exams', 'Future', 'Family']

  const toggleTrigger = (trigger: string) => {
    setTriggers(prev =>
      prev.includes(trigger)
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/tracking/anxiety', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level,
          triggers: triggers.length > 0 ? triggers : null,
          notes: notes.trim() || null,
        }),
      })

      if (response.ok) {
        setLevel(5)
        setTriggers([])
        setNotes('')
        alert('Anxiety level logged successfully!')
      }
    } catch (error) {
      console.error('Failed to save anxiety:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <AlertCircle className="w-8 h-8 text-orange-500" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Anxiety Tracker</h2>
          <p className="text-gray-600">Track your anxiety levels</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Anxiety Level: {level}/10
          </label>
          <input
            type="range"
            min="0"
            max="10"
            value={level}
            onChange={(e) => setLevel(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Triggers (Optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {commonTriggers.map((trigger) => (
              <button
                key={trigger}
                type="button"
                onClick={() => toggleTrigger(trigger)}
                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                  triggers.includes(trigger)
                    ? 'border-orange-500 bg-orange-50 text-orange-900'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {trigger}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What's causing this anxiety?"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            rows={3}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Log Anxiety Level'}
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

