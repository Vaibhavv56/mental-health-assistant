'use client'

import { useState, useRef } from 'react'
import { Music, Play, Pause, Volume2, ArrowLeft } from 'lucide-react'

interface CalmingSoundsProps {
  onBack: () => void
}

const sounds = [
  { id: 'rain', name: 'Rain', url: '/sounds/rain.mp3' },
  { id: 'ocean', name: 'Ocean Waves', url: '/sounds/ocean.mp3' },
  { id: 'forest', name: 'Forest', url: '/sounds/forest.mp3' },
  { id: 'white-noise', name: 'White Noise', url: '/sounds/white-noise.mp3' },
  { id: 'brown-noise', name: 'Brown Noise', url: '/sounds/brown-noise.mp3' },
]

export default function CalmingSounds({ onBack }: CalmingSoundsProps) {
  const [selectedSound, setSelectedSound] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handlePlay = (soundId: string) => {
    if (selectedSound === soundId && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    } else {
      // For demo, we'll use a placeholder approach since we don't have actual audio files
      setSelectedSound(soundId)
      setIsPlaying(true)
      // In a real implementation, you would load the actual audio file here
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
        <Music className="w-8 h-8 text-indigo-500" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Calming Sounds & Music</h2>
          <p className="text-gray-600">Relax with ambient sounds and music</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {sounds.map((sound) => {
          const isActive = selectedSound === sound.id && isPlaying
          return (
            <button
              key={sound.id}
              onClick={() => handlePlay(sound.id)}
              className={`bg-white rounded-xl border-2 p-6 hover:shadow-md transition-all ${
                isActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <Music className={`w-6 h-6 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                {isActive ? (
                  <Pause className="w-5 h-5 text-indigo-600" />
                ) : (
                  <Play className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <h3 className="font-semibold text-gray-900 text-left">{sound.name}</h3>
            </button>
          )
        })}
      </div>

      {selectedSound && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <Volume2 className="w-5 h-5 text-gray-500" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-gray-600 w-12">{Math.round(volume * 100)}%</span>
          </div>
        </div>
      )}

      <p className="text-sm text-gray-500 text-center mt-6">
        Note: Audio files need to be added to the /public/sounds directory. This is a demo interface.
      </p>

      <audio ref={audioRef} volume={volume} />
    </div>
  )
}

