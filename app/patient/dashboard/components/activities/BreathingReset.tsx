'use client'

import { useState, useEffect } from 'react'
import { Wind, Play, Pause, ArrowLeft } from 'lucide-react'

interface BreathingResetProps {
  onBack: () => void
}

export default function BreathingReset({ onBack }: BreathingResetProps) {
  const [isActive, setIsActive] = useState(false)
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale')
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isActive) return

    const cycle = [
      { phase: 'inhale' as const, duration: 4000 },
      { phase: 'hold' as const, duration: 2000 },
      { phase: 'exhale' as const, duration: 5000 },
      { phase: 'pause' as const, duration: 2000 },
    ]

    let currentStep = 0
    setPhase(cycle[currentStep].phase)

    const interval = setInterval(() => {
      currentStep = (currentStep + 1) % cycle.length
      setPhase(cycle[currentStep].phase)
      if (currentStep === 0) setCount((c) => c + 1)
    }, cycle[currentStep].duration)

    return () => clearInterval(interval)
  }, [isActive])

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
        <Wind className="w-8 h-8 text-blue-500" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">60-Second Reset</h2>
          <p className="text-gray-600">Quick breathing and grounding exercise</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-12 text-center">
        <div className="mb-8">
          <div
            className={`mx-auto rounded-full transition-all duration-1000 ${
              phase === 'inhale'
                ? 'bg-blue-500 w-64 h-64'
                : phase === 'exhale'
                ? 'bg-indigo-400 w-32 h-32'
                : 'bg-blue-400 w-48 h-48'
            }`}
          />
        </div>

        <div className="mb-6">
          <p className="text-2xl font-semibold text-gray-900 mb-2">
            {phase === 'inhale' && 'Breathe In'}
            {phase === 'hold' && 'Hold'}
            {phase === 'exhale' && 'Breathe Out'}
            {phase === 'pause' && 'Pause'}
          </p>
          {count > 0 && <p className="text-gray-600">Cycle {count}</p>}
        </div>

        <button
          onClick={() => setIsActive(!isActive)}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
        >
          {isActive ? (
            <>
              <Pause className="w-5 h-5" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Start
            </>
          )}
        </button>

        <p className="text-sm text-gray-500 mt-6">Exit anytime. No pressure, just breathe.</p>
      </div>
    </div>
  )
}

