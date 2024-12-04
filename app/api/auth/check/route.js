import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function GET() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('auth-token')
    
    if (!token) {
      return new NextResponse(null, { status: 401 })
    }

    try {
      // Verify the token
      jwt.verify(token.value, process.env.JWT_SECRET)
      return new NextResponse(null, { status: 200 })
    } catch (error) {
      return new NextResponse(null, { status: 401 })
    }
  } catch (error) {
    console.error('Auth check error:', error)
    return new NextResponse(null, { status: 500 })
  }
} 