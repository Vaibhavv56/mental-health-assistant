import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const user = await requireAuth(request, 'PATIENT')
    const { chatId } = params

    const chat = await prisma.chat.findFirst({
      where: { id: chatId, patientId: user.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        consents: {
          where: { patientId: user.id },
          orderBy: { requestedAt: 'desc' },
        },
      },
    })

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ chat })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch chat' },
      { status: 401 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const user = await requireAuth(request, 'PATIENT')
    const { chatId } = params

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

    // Delete chat (cascade will delete messages, consents, etc.)
    await prisma.chat.delete({
      where: { id: chatId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete chat error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete chat' },
      { status: 500 }
    )
  }
}

