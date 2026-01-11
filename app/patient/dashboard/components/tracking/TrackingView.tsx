'use client'

import { useState } from 'react'
import { Smile, Moon, AlertCircle, TrendingUp, ArrowLeft } from 'lucide-react'
import MoodTracker from './MoodTracker'
import SleepTracker from './SleepTracker'
import AnxietyTracker from './AnxietyTracker'

interface TrackingViewProps {
  onClose: () => void
}

export default function TrackingView({ onClose }: TrackingViewProps) {
  const [selectedTracker, setSelectedTracker] = useState<string | null>(null)

  const trackers = [
    {
      id: 'mood',
      title: 'Mood Tracker',
      description: 'Emoji-based mood selection with intensity slider',
      icon: Smile,
      color: 'bg-yellow-500',
    },
    {
      id: 'sleep',
      title: 'Sleep Tracker',
      description: 'Track sleep duration and quality',
      icon: Moon,
      color: 'bg-indigo-500',
    },
    {
      id: 'anxiety',
      title: 'Anxiety Tracker',
      description: 'Track anxiety levels and triggers',
      icon: AlertCircle,
      color: 'bg-orange-500',
    },
  ]

  const renderTrackerComponent = () => {
    switch (selectedTracker) {
      case 'mood':
        return <MoodTracker onBack={() => setSelectedTracker(null)} />
      case 'sleep':
        return <SleepTracker onBack={() => setSelectedTracker(null)} />
      case 'anxiety':
        return <AnxietyTracker onBack={() => setSelectedTracker(null)} />
      default:
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">My Health</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trackers.map((tracker) => {
                const Icon = tracker.icon
                return (
                  <button
                    key={tracker.id}
                    onClick={() => setSelectedTracker(tracker.id)}
                    className={`relative flex flex-col items-center justify-center p-8 rounded-xl shadow-lg text-white transition-transform transform hover:scale-105 ${tracker.color}`}
                  >
                    <Icon className="w-12 h-12 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">{tracker.title}</h3>
                    <p className="text-sm text-center opacity-90">{tracker.description}</p>
                  </button>
                )
              })}
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> Track your daily mood, sleep, and anxiety levels. View graphs and trends in your dashboard.
              </p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="h-full flex flex-col">
      {selectedTracker && (
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => setSelectedTracker(null)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to My Health
          </button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        {renderTrackerComponent()}
      </div>
    </div>
  )
}

