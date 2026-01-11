'use client'

import { useState } from 'react'
import { Gamepad2, Heart, Wind, Sprout, Star, Search, Music, X } from 'lucide-react'
import EmotionMatchingGame from './games/EmotionMatchingGame'
import NameFeelingChallenge from './activities/NameFeelingChallenge'
import BreathingReset from './activities/BreathingReset'
import GratitudeGarden from './activities/GratitudeGarden'
import SelfCompassionQuest from './activities/SelfCompassionQuest'
import GroundingScavengerHunt from './activities/GroundingScavengerHunt'
import CalmingSounds from './activities/CalmingSounds'

interface ActivitiesViewProps {
  onClose?: () => void
}

export default function ActivitiesView({ onClose }: ActivitiesViewProps) {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)

  const activities = [
    {
      id: 'emotion-matching',
      title: 'Emotion Matching Memory',
      description: 'Card-flip game matching emotion names with faces',
      icon: Gamepad2,
      color: 'bg-purple-500',
    },
    {
      id: 'name-feeling',
      title: 'Name the Feeling',
      description: 'Daily check-in to identify and track emotions',
      icon: Heart,
      color: 'bg-pink-500',
    },
    {
      id: 'breathing',
      title: '60-Second Reset',
      description: 'Quick breathing and grounding exercise',
      icon: Wind,
      color: 'bg-blue-500',
    },
    {
      id: 'gratitude',
      title: 'Gratitude Garden',
      description: 'Plant seeds of gratitude and watch them grow',
      icon: Sprout,
      color: 'bg-green-500',
    },
    {
      id: 'self-compassion',
      title: 'Self-Compassion Quest',
      description: 'Gentle missions to build self-kindness',
      icon: Star,
      color: 'bg-yellow-500',
    },
    {
      id: 'grounding',
      title: 'Grounding Scavenger Hunt',
      description: 'Find items around you to stay present',
      icon: Search,
      color: 'bg-orange-500',
    },
    {
      id: 'sounds',
      title: 'Calming Sounds',
      description: 'Relax with ambient sounds and music',
      icon: Music,
      color: 'bg-indigo-500',
    },
  ]

  if (selectedActivity) {
    return (
      <div className="h-full flex flex-col">
        {onClose && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <button
              onClick={() => setSelectedActivity(null)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <X className="w-5 h-5" />
              Back to Activities
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {selectedActivity === 'emotion-matching' && <EmotionMatchingGame onBack={() => setSelectedActivity(null)} />}
          {selectedActivity === 'name-feeling' && <NameFeelingChallenge onBack={() => setSelectedActivity(null)} />}
          {selectedActivity === 'breathing' && <BreathingReset onBack={() => setSelectedActivity(null)} />}
          {selectedActivity === 'gratitude' && <GratitudeGarden onBack={() => setSelectedActivity(null)} />}
          {selectedActivity === 'self-compassion' && <SelfCompassionQuest onBack={() => setSelectedActivity(null)} />}
          {selectedActivity === 'grounding' && <GroundingScavengerHunt onBack={() => setSelectedActivity(null)} />}
          {selectedActivity === 'sounds' && <CalmingSounds onBack={() => setSelectedActivity(null)} />}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Well-Being Activities</h2>
            <p className="text-gray-600 mt-1">Relaxing, optional activities to support your mental health</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((activity) => {
            const Icon = activity.icon
            return (
              <button
                key={activity.id}
                onClick={() => setSelectedActivity(activity.id)}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all text-left group"
              >
                <div className={`${activity.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{activity.title}</h3>
                <p className="text-sm text-gray-600">{activity.description}</p>
              </button>
            )
          })}
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recommended Exercises</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-2">Guided Breathing</h4>
              <p className="text-sm text-gray-600 mb-3">Audio-guided breathing exercises to help you relax</p>
              <button className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Start Exercise
              </button>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <h4 className="font-semibold text-gray-900 mb-2">CBT Thought Records</h4>
              <p className="text-sm text-gray-600 mb-3">Track and reframe negative thoughts</p>
              <button className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Start Exercise
              </button>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <h4 className="font-semibold text-gray-900 mb-2">Grounding Techniques</h4>
              <p className="text-sm text-gray-600 mb-3">Stay present with sensory grounding exercises</p>
              <button className="text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                Start Exercise
              </button>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200">
              <h4 className="font-semibold text-gray-900 mb-2">Sleep Hygiene Routines</h4>
              <p className="text-sm text-gray-600 mb-3">Improve your sleep with guided routines</p>
              <button className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                Start Exercise
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>Remember:</strong> All activities are optional. No pressure, no streaks, no penalties. 
            Use them when you need them, exit anytime.
          </p>
        </div>
      </div>
    </div>
  )
}

