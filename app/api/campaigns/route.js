import { getCampaignsByClientId } from '@/lib/mongodb'
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

    try {
      const decoded = jwt.verify(token.value, process.env.JWT_SECRET)
      const campaigns = await getCampaignsByClientId(decoded.clientId)
      return NextResponse.json({ campaigns })
    } catch (error) {
      console.error('JWT verification error:', error)
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Campaigns API error:', error)
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    )
  }
} 