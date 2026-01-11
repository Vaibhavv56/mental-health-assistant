'use client'

import { useState, useEffect } from 'react'
import { Heart, CheckCircle, ArrowLeft } from 'lucide-react'

interface NameFeelingChallengeProps {
  onBack: () => void
}

const emotions = ['Happy', 'Sad', 'Anxious', 'Calm', 'Frustrated', 'Grateful', 'Lonely', 'Excited', 'Tired', 'Hopeful']
const intensities = ['Very Low', 'Low', 'Moderate', 'High', 'Very High']

export default function NameFeelingChallenge({ onBack }: NameFeelingChallengeProps) {
  const [selectedEmotion, setSelectedEmotion] = useState('')
  const [selectedIntensity, setSelectedIntensity] = useState('')
  const [context, setContext] = useState('')
  const [submittedToday, setSubmittedToday] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if already submitted today
    const lastSubmission = localStorage.getItem('nameFeelingLastSubmission')
    const today = new Date().toDateString()
    if (lastSubmission === today) {
      setSubmittedToday(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEmotion || !selectedIntensity) return

    setLoading(true)
    try {
      // Save to API
      await fetch('/api/activities/name-feeling', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emotion: selectedEmotion,
          intensity: selectedIntensity,
          context: context.trim(),
        }),
      })

      localStorage.setItem('nameFeelingLastSubmission', new Date().toDateString())
      localStorage.setItem('emotionAwareBadge', 'true')
      setSubmittedToday(true)
    } catch (error) {
      console.error('Failed to save feeling:', error)
    } finally {
      setLoading(false)
    }
  }

  if (submittedToday) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Activities
        </button>
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank you for checking in! 💚</h2>
          <p className="text-gray-600 mb-4">You've earned your "Emotion Aware" badge for today.</p>
          <p className="text-sm text-gray-500">Check back tomorrow for another check-in!</p>
        </div>
      </div>
    )
  }

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
        <Heart className="w-8 h-8 text-pink-500" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Name the Feeling</h2>
          <p className="text-gray-600">Daily check-in to identify and track your emotions</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How are you feeling right now?
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {emotions.map((emotion) => (
              <button
                key={emotion}
                type="button"
                onClick={() => setSelectedEmotion(emotion)}
                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                  selectedEmotion === emotion
                    ? 'bg-pink-100 border-pink-500 text-pink-900'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {emotion}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Intensity (0-10 scale)
          </label>
          <div className="flex flex-wrap gap-2">
            {intensities.map((intensity) => (
              <button
                key={intensity}
                type="button"
                onClick={() => setSelectedIntensity(intensity)}
                className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                  selectedIntensity === intensity
                    ? 'bg-pink-100 border-pink-500 text-pink-900'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {intensity}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What's on your mind? (Optional)
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Briefly share what's contributing to this feeling..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            rows={3}
          />
        </div>

        <button
          type="submit"
          disabled={!selectedEmotion || !selectedIntensity || loading}
          className="w-full px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Complete Check-in'}
        </button>
      </form>

      <p className="text-sm text-gray-500 text-center mt-4">
        This is optional. You can skip anytime or check in again tomorrow.
      </p>
    </div>
  )
}

