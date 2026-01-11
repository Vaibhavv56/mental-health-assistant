import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    const user = await requireAuth(request, 'THERAPIST')
    const { patientId } = params

    // Verify patient belongs to therapist
    const patient = await prisma.user.findFirst({
      where: { id: patientId, therapistId: user.id },
    })

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found or not assigned to you' },
        { status: 404 }
      )
    }

    // Get chats with approved consents only
    const chats = await prisma.chat.findMany({
      where: {
        patientId,
        consents: {
          some: {
            status: 'APPROVED',
          },
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        consents: {
          where: { status: 'APPROVED' },
          orderBy: { requestedAt: 'desc' },
        },
        aiAnalyses: {
          where: { therapistId: user.id },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ chats })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch chats' },
      { status: 401 }
    )
  }
}
