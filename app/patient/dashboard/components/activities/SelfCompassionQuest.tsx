'use client'

import { useState, useEffect } from 'react'
import { Star, CheckCircle, ArrowLeft } from 'lucide-react'

interface SelfCompassionQuestProps {
  onBack: () => void
}

const missions = [
  { id: 'kind-statement', title: 'Kind Self-Statement', description: 'Write one kind thing about yourself' },
  { id: 'notice-effort', title: 'Notice Your Effort', description: 'Acknowledge something you tried today' },
  { id: 'kind-message', title: 'Kind Message', description: 'Write a compassionate message to yourself' },
]

export default function SelfCompassionQuest({ onBack }: SelfCompassionQuestProps) {
  const [completedMissions, setCompletedMissions] = useState<string[]>([])
  const [badges, setBadges] = useState<string[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('selfCompassionBadges')
    if (saved) {
      setBadges(JSON.parse(saved))
    }
    const savedMissions = localStorage.getItem('completedMissions')
    if (savedMissions) {
      setCompletedMissions(JSON.parse(savedMissions))
    }
  }, [])

  const handleCompleteMission = (missionId: string) => {
    const newCompleted = [...completedMissions, missionId]
    setCompletedMissions(newCompleted)
    localStorage.setItem('completedMissions', JSON.stringify(newCompleted))

    // Award badge
    if (!badges.includes(missionId)) {
      const newBadges = [...badges, missionId]
      setBadges(newBadges)
      localStorage.setItem('selfCompassionBadges', JSON.stringify(newBadges))

      // Save to API
      fetch('/api/activities/badge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badgeType: missionId }),
      }).catch(console.error)
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
        <Star className="w-8 h-8 text-yellow-500" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Self-Compassion Quest</h2>
          <p className="text-gray-600">Gentle missions to build self-kindness</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {missions.map((mission) => {
          const isCompleted = completedMissions.includes(mission.id)
          return (
            <div
              key={mission.id}
              className={`bg-white rounded-xl border-2 p-6 ${
                isCompleted ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <Star className={`w-6 h-6 ${isCompleted ? 'text-yellow-500' : 'text-gray-300'}`} />
                {isCompleted && <CheckCircle className="w-5 h-5 text-yellow-500" />}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{mission.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{mission.description}</p>
              <button
                onClick={() => handleCompleteMission(mission.id)}
                disabled={isCompleted}
                className={`w-full px-4 py-2 rounded-lg transition-colors ${
                  isCompleted
                    ? 'bg-yellow-100 text-yellow-800 cursor-default'
                    : 'bg-yellow-500 text-white hover:bg-yellow-600'
                }`}
              >
                {isCompleted ? 'Completed' : 'Complete Mission'}
              </button>
            </div>
          )
        })}
      </div>

      {badges.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Your Badges</h3>
          <div className="flex flex-wrap gap-3">
            {badges.map((badge) => (
              <div key={badge} className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-yellow-300">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-900">
                  {missions.find((m) => m.id === badge)?.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-sm text-gray-500 text-center mt-6">
        Complete missions at your own pace. No expiry, no pressure.
      </p>
    </div>
  )
}

