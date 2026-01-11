import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, 'PATIENT')

    const entries = await prisma.gratitudeEntry.findMany({
      where: { patientId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      entries: entries.map((e) => ({
        id: e.id,
        text: e.text,
        createdAt: e.createdAt.toISOString(),
        growth: Math.min(100, ((Date.now() - new Date(e.createdAt).getTime()) / (1000 * 60 * 60 * 24)) * 10), // 10% per day
      })),
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch entries' },
      { status: 401 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, 'PATIENT')
    const { text } = await request.json()

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    const entry = await prisma.gratitudeEntry.create({
      data: {
        patientId: user.id,
        text: text.trim(),
      },
    })

    return NextResponse.json({ entry })
  } catch (error: any) {
    console.error('Gratitude error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save gratitude' },
      { status: 500 }
    )
  }
}

