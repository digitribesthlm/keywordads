import { getUserByEmail } from '@/lib/mongodb'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function POST(request) {
  try {
    const { email, password } = await request.json()
    
    const user = await getUserByEmail(email)
    
    if (!user || user.password !== password) { // In production, use proper password hashing
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role,
        clientId: user.clientId
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    // Set cookie
    cookies().set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400 // 1 day
    })

    return NextResponse.json({
      message: 'Login successful',
      user: {
        email: user.email,
        role: user.role,
        clientId: user.clientId
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 