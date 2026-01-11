import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, 'PATIENT')
    const { emotion, intensity, context } = await request.json()

    if (!emotion || !intensity) {
      return NextResponse.json(
        { error: 'Emotion and intensity are required' },
        { status: 400 }
      )
    }

    await prisma.activity.create({
      data: {
        patientId: user.id,
        activityType: 'name_feeling',
        data: JSON.stringify({ emotion, intensity, context: context || '' }),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Name feeling error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save feeling' },
      { status: 500 }
    )
  }
}

