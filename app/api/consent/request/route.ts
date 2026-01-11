import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, 'PATIENT')
    const { chatId } = await request.json()

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
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

    // Check if consent already exists - upsert instead of create
    const existingConsent = await prisma.consent.findUnique({
      where: {
        chatId_patientId: {
          chatId,
          patientId: user.id,
        },
      },
    })

    if (existingConsent) {
      // If already approved, return error
      if (existingConsent.status === 'APPROVED') {
        return NextResponse.json(
          { error: 'Consent already approved for this chat', consent: existingConsent },
          { status: 400 }
        )
      }
      // If exists but not approved, return it (will be updated by consent route)
      return NextResponse.json({ consent: existingConsent })
    }

    // Create new consent request
    const consent = await prisma.consent.create({
      data: {
        chatId,
        patientId: user.id,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ consent })
  } catch (error: any) {
    console.error('Consent request error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create consent request' },
      { status: 500 }
    )
  }
}
