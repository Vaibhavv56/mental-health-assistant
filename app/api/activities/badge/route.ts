import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, 'PATIENT')
    const { badgeType } = await request.json()

    if (!badgeType) {
      return NextResponse.json(
        { error: 'Badge type is required' },
        { status: 400 }
      )
    }

    // Check if badge already exists
    const existing = await prisma.selfCompassionBadge.findUnique({
      where: {
        patientId_badgeType: {
          patientId: user.id,
          badgeType,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ success: true, badge: existing })
    }

    const badge = await prisma.selfCompassionBadge.create({
      data: {
        patientId: user.id,
        badgeType,
      },
    })

    return NextResponse.json({ success: true, badge })
  } catch (error: any) {
    console.error('Badge error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save badge' },
      { status: 500 }
    )
  }
}

