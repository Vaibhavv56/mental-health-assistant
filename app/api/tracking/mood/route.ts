import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, 'PATIENT')
    const { mood, intensity, notes } = await request.json()

    if (!mood || !intensity) {
      return NextResponse.json(
        { error: 'Mood and intensity are required' },
        { status: 400 }
      )
    }

    const entry = await prisma.moodEntry.create({
      data: {
        patientId: user.id,
        mood,
        intensity: parseInt(intensity),
        notes: notes || null,
      },
    })

    return NextResponse.json({ entry })
  } catch (error: any) {
    console.error('Mood tracking error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save mood' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, 'PATIENT')
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'week' // day, week, month

    const entries = await prisma.moodEntry.findMany({
      where: { patientId: user.id },
      orderBy: { createdAt: 'desc' },
      take: period === 'day' ? 1 : period === 'week' ? 7 : period === 'month' ? 30 : 7,
    })

    return NextResponse.json({ entries })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch mood entries' },
      { status: 500 }
    )
  }
}

