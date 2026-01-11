import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, 'THERAPIST')
    const { analysisId, corrections } = await request.json()

    if (!analysisId || !corrections) {
      return NextResponse.json(
        { error: 'Analysis ID and corrections are required' },
        { status: 400 }
      )
    }

    // Verify analysis belongs to therapist
    const analysis = await prisma.aIAnalysis.findFirst({
      where: {
        id: analysisId,
        therapistId: user.id,
      },
    })

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found or access denied' },
        { status: 404 }
      )
    }

    // Update with corrections
    const updated = await prisma.aIAnalysis.update({
      where: { id: analysisId },
      data: {
        therapistCorrections: corrections,
        correctedAt: new Date(),
      },
    })

    return NextResponse.json({ analysis: updated })
  } catch (error: any) {
    console.error('Correction error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save corrections' },
      { status: 500 }
    )
  }
}

