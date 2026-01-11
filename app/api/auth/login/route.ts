import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/auth'

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin'

export async function POST(request: NextRequest) {
  try {
    const { username, password, role } = await request.json()

    if (!username || !password || !role) {
      return NextResponse.json(
        { error: 'Username, password, and role are required' },
        { status: 400 }
      )
    }

    if (!['PATIENT', 'THERAPIST'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Check admin credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Find or create admin user for this role
      let user = await prisma.user.findFirst({
        where: {
          name: ADMIN_USERNAME,
          role: role as 'PATIENT' | 'THERAPIST',
        },
      })

      // If user doesn't exist, create it
      if (!user) {
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10)
        
        // If creating patient, find admin therapist to assign
        let therapistId = null
        if (role === 'PATIENT') {
          const adminTherapist = await prisma.user.findFirst({
            where: {
              name: ADMIN_USERNAME,
              role: 'THERAPIST',
            },
          })
          if (adminTherapist) {
            therapistId = adminTherapist.id
          }
        }

        user = await prisma.user.create({
          data: {
            email: `${ADMIN_USERNAME}_${role.toLowerCase()}@admin.local`,
            password: hashedPassword,
            name: ADMIN_USERNAME,
            role: role as 'PATIENT' | 'THERAPIST',
            therapistId: therapistId,
          },
        })

        // If creating therapist, assign all existing admin patients to this therapist
        if (role === 'THERAPIST') {
          await prisma.user.updateMany({
            where: {
              name: ADMIN_USERNAME,
              role: 'PATIENT',
              therapistId: null,
            },
            data: {
              therapistId: user.id,
            },
          })
        }
      }

      const token = generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as 'PATIENT' | 'THERAPIST',
        therapistId: user.therapistId,
      })

      const response = NextResponse.json({
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
        },
      })

      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      return response
    }

    // If not admin, try to find user by name
    const user = await prisma.user.findFirst({
      where: {
        name: username,
        role: role as 'PATIENT' | 'THERAPIST',
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'PATIENT' | 'THERAPIST',
      therapistId: user.therapistId,
    })

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}

