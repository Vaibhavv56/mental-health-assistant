import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const user = await requireAuth(request, 'THERAPIST')
    const { chatId } = params
    const { guidance } = await request.json()

    if (guidance === undefined) {
      return NextResponse.json(
        { error: 'Guidance is required' },
        { status: 400 }
      )
    }

    // Verify chat has approved consent and patient belongs to therapist
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        consents: {
          some: {
            status: 'APPROVED',
          },
        },
        patient: {
          therapistId: user.id,
        },
      },
    })

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found or access denied' },
        { status: 404 }
      )
    }

    // Update chat with therapist guidance
    const updatedChat = await prisma.chat.update({
      where: { id: chatId },
      data: {
        therapistGuidance: guidance || null,
      },
    })

    return NextResponse.json({ chat: updatedChat })
  } catch (error: any) {
    console.error('Update guidance error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update guidance' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const user = await requireAuth(request, 'THERAPIST')
    const { chatId } = params

    // Verify chat has approved consent and patient belongs to therapist
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        consents: {
          some: {
            status: 'APPROVED',
          },
        },
        patient: {
          therapistId: user.id,
        },
      },
      select: {
        id: true,
        therapistGuidance: true,
      },
    })

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found or access denied' },
        { status: 404 }
      )
    }

    return NextResponse.json({ guidance: chat.therapistGuidance })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch guidance' },
      { status: 401 }
    )
  }
}
