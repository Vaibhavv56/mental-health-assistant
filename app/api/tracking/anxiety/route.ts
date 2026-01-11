import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, 'PATIENT')
    const { level, triggers, notes } = await request.json()

    if (level === undefined || level === null) {
      return NextResponse.json(
        { error: 'Anxiety level is required' },
        { status: 400 }
      )
    }

    const entry = await prisma.anxietyEntry.create({
      data: {
        patientId: user.id,
        level: parseInt(level),
        triggers: triggers ? JSON.stringify(triggers) : null,
        notes: notes || null,
      },
    })

    return NextResponse.json({ entry })
  } catch (error: any) {
    console.error('Anxiety tracking error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save anxiety level' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, 'PATIENT')
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'week'

    const entries = await prisma.anxietyEntry.findMany({
      where: { patientId: user.id },
      orderBy: { createdAt: 'desc' },
      take: period === 'day' ? 1 : period === 'week' ? 7 : period === 'month' ? 30 : 7,
    })

    return NextResponse.json({ 
      entries: entries.map(e => ({
        ...e,
        triggers: e.triggers ? JSON.parse(e.triggers) : null,
      }))
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch anxiety entries' },
      { status: 500 }
    )
  }
}

