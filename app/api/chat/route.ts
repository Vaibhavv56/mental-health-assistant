import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateChatResponse } from '@/lib/openai'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, 'PATIENT')
    
    const chats = await prisma.chat.findMany({
      where: { patientId: user.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: { messages: true },
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

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, 'PATIENT')
    const { message, chatId } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    let chat
    if (chatId) {
      chat = await prisma.chat.findFirst({
        where: { id: chatId, patientId: user.id },
      })
      if (!chat) {
        return NextResponse.json(
          { error: 'Chat not found' },
          { status: 404 }
        )
      }
    } else {
      chat = await prisma.chat.create({
        data: {
          patientId: user.id,
          title: message.substring(0, 50),
        },
      })
    }

    // Save user message
    await prisma.message.create({
      data: {
        chatId: chat.id,
        content: message,
        role: 'user',
      },
    })

    // Get all messages for context
    const messages = await prisma.message.findMany({
      where: { chatId: chat.id },
      orderBy: { createdAt: 'asc' },
    })

    // Get chat with therapist guidance
    const chatWithGuidance = await prisma.chat.findUnique({
      where: { id: chat.id },
    })

    // Generate AI response (pass therapist guidance if available)
    const aiResponse = await generateChatResponse(
      messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      (chatWithGuidance as any)?.therapistGuidance || undefined
    )

    // Save AI response
    await prisma.message.create({
      data: {
        chatId: chat.id,
        content: aiResponse,
        role: 'assistant',
      },
    })

    // Update chat timestamp
    await prisma.chat.update({
      where: { id: chat.id },
      data: { updatedAt: new Date() },
    })

    // Get the updated chat with all messages including the AI response
    const updatedChat = await prisma.chat.findUnique({
      where: { id: chat.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    return NextResponse.json({
      chatId: chat.id,
      response: aiResponse,
      chat: updatedChat,
    })
  } catch (error: any) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    )
  }
}

