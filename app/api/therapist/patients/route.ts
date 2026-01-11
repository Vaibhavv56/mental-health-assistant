import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request, 'THERAPIST')
    
    // Get patients assigned to this therapist
    let patients = await prisma.user.findMany({
      where: { therapistId: user.id },
      include: {
        chats: {
          include: {
            _count: {
              select: { messages: true },
            },
            consents: {
              where: { status: 'APPROVED' },
              orderBy: { requestedAt: 'desc' },
            },
          },
          orderBy: { updatedAt: 'desc' },
        },
        _count: {
          select: { chats: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // If no patients found and this is admin therapist, try to auto-assign admin patients
    if (patients.length === 0 && user.name === (process.env.ADMIN_USERNAME || 'admin')) {
      const adminPatients = await prisma.user.findMany({
        where: {
          name: process.env.ADMIN_USERNAME || 'admin',
          role: 'PATIENT',
        },
      })

      // Assign admin patients to this therapist
      if (adminPatients.length > 0) {
        await prisma.user.updateMany({
          where: {
            id: { in: adminPatients.map(p => p.id) },
          },
          data: {
            therapistId: user.id,
          },
        })

        // Fetch again after assignment
        patients = await prisma.user.findMany({
          where: { therapistId: user.id },
          include: {
            chats: {
              include: {
                _count: {
                  select: { messages: true },
                },
                consents: {
                  where: { status: 'APPROVED' },
                  orderBy: { requestedAt: 'desc' },
                },
              },
              orderBy: { updatedAt: 'desc' },
            },
            _count: {
              select: { chats: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        })
      }
    }

    return NextResponse.json({ patients })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch patients' },
      { status: 401 }
    )
  }
}

