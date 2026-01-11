'use client'

import { useRouter } from 'next/navigation'
import { Heart, Stethoscope } from 'lucide-react'

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-16 h-16 text-primary-600" fill="currentColor" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            AI Mental Health Companion
          </h1>
          <p className="text-xl text-gray-600">
            Your compassionate AI assistant with professional therapist guidance
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          <button
            onClick={() => router.push('/patient/login')}
            className="group bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-primary-500"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary-500 transition-colors">
                <Heart className="w-10 h-10 text-primary-600 group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Patient Portal
              </h2>
              <p className="text-gray-600 mb-4">
                Chat with AI, get support, and share insights with your therapist
              </p>
              <span className="text-primary-600 font-semibold group-hover:text-primary-700">
                Enter as Patient →
              </span>
            </div>
          </button>

          <button
            onClick={() => router.push('/therapist/login')}
            className="group bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-primary-500"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-500 transition-colors">
                <Stethoscope className="w-10 h-10 text-green-600 group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Therapist Portal
              </h2>
              <p className="text-gray-600 mb-4">
                Monitor patients, review AI insights, and provide guidance
              </p>
              <span className="text-green-600 font-semibold group-hover:text-green-700">
                Enter as Therapist →
              </span>
            </div>
          </button>
        </div>

        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Secure • Confidential • Professional</p>
        </div>
      </div>
    </div>
  )
}

