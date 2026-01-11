'use client'

import { useState, useEffect } from 'react'
import { Smile, Heart, Meh, Frown, AlertCircle, ArrowLeft } from 'lucide-react'

interface EmotionMatchingGameProps {
  onBack: () => void
}

const emotions = [
  { id: 1, name: 'Happy', icon: Smile, color: 'text-yellow-500' },
  { id: 2, name: 'Sad', icon: Frown, color: 'text-blue-500' },
  { id: 3, name: 'Anxious', icon: AlertCircle, color: 'text-orange-500' },
  { id: 4, name: 'Calm', icon: Heart, color: 'text-green-500' },
  { id: 5, name: 'Neutral', icon: Meh, color: 'text-gray-500' },
  { id: 6, name: 'Excited', icon: Smile, color: 'text-pink-500' },
]

export default function EmotionMatchingGame({ onBack }: EmotionMatchingGameProps) {
  const [cards, setCards] = useState<Array<{ id: number; name: string; icon: any; color: string; flipped: boolean; matched: boolean }>>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matches, setMatches] = useState(0)

  useEffect(() => {
    // Create pairs of cards
    const pairs = [...emotions, ...emotions].map((emotion, index) => ({
      ...emotion,
      id: index,
      flipped: false,
      matched: false,
    }))
    // Shuffle
    const shuffled = pairs.sort(() => Math.random() - 0.5)
    setCards(shuffled)
  }, [])

  const handleCardClick = (index: number) => {
    if (cards[index].flipped || cards[index].matched || flippedCards.length === 2) return

    const newCards = [...cards]
    newCards[index].flipped = true
    setCards(newCards)

    if (flippedCards.length === 0) {
      setFlippedCards([index])
    } else {
      setFlippedCards([flippedCards[0], index])
      // Check for match
      if (cards[flippedCards[0]].name === cards[index].name) {
        setTimeout(() => {
          const updatedCards = [...newCards]
          updatedCards[flippedCards[0]].matched = true
          updatedCards[index].matched = true
          setCards(updatedCards)
          setMatches(matches + 1)
          setFlippedCards([])
        }, 500)
      } else {
        setTimeout(() => {
          const updatedCards = [...newCards]
          updatedCards[flippedCards[0]].flipped = false
          updatedCards[index].flipped = false
          setCards(updatedCards)
          setFlippedCards([])
        }, 1000)
      }
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
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Emotion Matching Memory Game</h2>
      <p className="text-gray-600 mb-6">Flip cards to match emotion names. No timer, no pressure!</p>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-6">
        {cards.map((card, index) => {
          const Icon = card.icon
          return (
            <button
              key={index}
              onClick={() => handleCardClick(index)}
              disabled={card.matched || flippedCards.length === 2}
              className={`aspect-square rounded-xl border-2 transition-all ${
                card.matched
                  ? 'bg-green-100 border-green-400'
                  : card.flipped
                  ? 'bg-white border-primary-500'
                  : 'bg-gray-100 border-gray-300 hover:border-gray-400'
              }`}
            >
              {card.flipped || card.matched ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Icon className={`w-8 h-8 ${card.color} mb-2`} />
                  <span className="text-sm font-medium text-gray-900">{card.name}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-2xl">?</span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {matches === emotions.length && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-green-900 font-medium">Great job! You matched all the emotions! 🎉</p>
        </div>
      )}
    </div>
  )
}

