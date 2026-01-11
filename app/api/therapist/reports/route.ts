import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateReport } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, 'THERAPIST')
    const { patientId, title, analysisId } = await request.json()

    if (!patientId || !title) {
      return NextResponse.json(
        { error: 'Patient ID and title are required' },
        { status: 400 }
      )
    }

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

    let reportContent = ''

    // If analysis ID provided, use it
    if (analysisId) {
      const analysis = await prisma.aIAnalysis.findFirst({
        where: {
          id: analysisId,
          therapistId: user.id,
        },
        include: {
          chat: {
            include: {
              messages: {
                orderBy: { createdAt: 'asc' },
              },
            },
          },
        },
      })

      if (analysis) {
        const correctedAnalysis = analysis.therapistCorrections 
          ? `${analysis.analysis}\n\nTherapist Corrections:\n${analysis.therapistCorrections}`
          : analysis.analysis

        // Get all approved chats for this patient
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
          },
        })

        const chatData = chats.map(chat => ({
          title: chat.title,
          messages: chat.messages.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          })),
        }))

        reportContent = await generateReport(
          patient.name,
          chatData,
          correctedAnalysis
        )
      }
    }

    // If no analysis or report generation failed, create a basic report
    if (!reportContent) {
      reportContent = `Report for ${patient.name}\n\nGenerated on ${new Date().toLocaleDateString()}\n\nNo detailed analysis available at this time.`
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        therapistId: user.id,
        patientId,
        title,
        content: reportContent,
      },
    })

    return NextResponse.json({ report })
  } catch (error: any) {
    console.error('Report generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate report' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, 'THERAPIST')
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')

    const where: any = { therapistId: user.id }
    if (patientId) {
      where.patientId = patientId
    }

    const reports = await prisma.report.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ reports })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reports' },
      { status: 401 }
    )
  }
}

