import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { analyzeConversation } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, 'THERAPIST')
    const { chatId } = await request.json()

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
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
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found or access denied' },
        { status: 404 }
      )
    }

    // Analyze conversation
    const analysis = await analyzeConversation(
      chat.messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))
    )

    // Save or update analysis
    const aiAnalysis = await prisma.aIAnalysis.upsert({
      where: {
        chatId_therapistId: {
          chatId,
          therapistId: user.id,
        },
      },
      update: {
        analysis: analysis.analysis,
        predictions: analysis.predictions,
        sentiment: analysis.sentiment,
        riskLevel: analysis.riskLevel,
        updatedAt: new Date(),
      },
      create: {
        chatId,
        therapistId: user.id,
        analysis: analysis.analysis,
        predictions: analysis.predictions,
        sentiment: analysis.sentiment,
        riskLevel: analysis.riskLevel,
      },
    })

    return NextResponse.json({ analysis: aiAnalysis })
  } catch (error: any) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate analysis' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, 'THERAPIST')
    const { searchParams } = new URL(request.url)
    const chatId = searchParams.get('chatId')

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 }
      )
    }

    const analysis = await prisma.aIAnalysis.findFirst({
      where: {
        chatId,
        therapistId: user.id,
      },
    })

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ analysis })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analysis' },
      { status: 401 }
    )
  }
}
