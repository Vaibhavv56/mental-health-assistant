import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, 'PATIENT')
    const { duration, quality, notes } = await request.json()

    if (!duration || !quality) {
      return NextResponse.json(
        { error: 'Duration and quality are required' },
        { status: 400 }
      )
    }

    const entry = await prisma.sleepEntry.create({
      data: {
        patientId: user.id,
        duration: parseFloat(duration),
        quality: parseInt(quality),
        notes: notes || null,
      },
    })

    return NextResponse.json({ entry })
  } catch (error: any) {
    console.error('Sleep tracking error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save sleep' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, 'PATIENT')
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'week'

    const entries = await prisma.sleepEntry.findMany({
      where: { patientId: user.id },
      orderBy: { createdAt: 'desc' },
      take: period === 'day' ? 1 : period === 'week' ? 7 : period === 'month' ? 30 : 7,
    })

    return NextResponse.json({ entries })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch sleep entries' },
      { status: 500 }
    )
  }
}

