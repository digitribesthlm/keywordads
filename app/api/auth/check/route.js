import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function GET() {
  try {
    const token = cookies().get('auth-token')
    
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify the token
    jwt.verify(token.value, process.env.JWT_SECRET)
    
    return NextResponse.json({ message: 'Authenticated' })
  } catch (error) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    )
  }
} 