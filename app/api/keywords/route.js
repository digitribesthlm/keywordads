import { getKeywordsByClientId } from '@/lib/mongodb'
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

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET)
    const keywords = await getKeywordsByClientId(decoded.clientId)

    return NextResponse.json({ keywords })
  } catch (error) {
    console.error('Error fetching keywords:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 