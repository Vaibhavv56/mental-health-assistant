import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, 'PATIENT')
    const { chatId, status } = await request.json()

    if (!chatId || !status) {
      return NextResponse.json(
        { error: 'Chat ID and status are required' },
        { status: 400 }
      )
    }

    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Verify chat belongs to patient
    const chat = await prisma.chat.findFirst({
      where: { id: chatId, patientId: user.id },
    })

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      )
    }

    // Create or update consent
    const consent = await prisma.consent.upsert({
      where: {
        chatId_patientId: {
          chatId,
          patientId: user.id,
        },
      },
      update: {
        status: status as any,
        respondedAt: status !== 'PENDING' ? new Date() : null,
      },
      create: {
        chatId,
        patientId: user.id,
        status: status as any,
        respondedAt: status !== 'PENDING' ? new Date() : null,
      },
    })

    return NextResponse.json({ consent })
  } catch (error: any) {
    console.error('Consent error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update consent' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, 'PATIENT')
    
    const consents = await prisma.consent.findMany({
      where: { patientId: user.id },
      include: {
        chat: {
          include: {
            _count: {
              select: { messages: true },
            },
          },
        },
      },
      orderBy: { requestedAt: 'desc' },
    })

    return NextResponse.json({ consents })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch consents' },
      { status: 401 }
    )
  }
}
