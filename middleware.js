import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request) {
  // Allow direct access to the home page
  if (request.nextUrl.pathname === '/') {
    return NextResponse.next()
  }

  // Handle login page access - redirect to dashboard if already authenticated
  if (request.nextUrl.pathname === '/login') {
    const token = request.cookies.get('auth-token')
    if (token) {
      try {
        await jwtVerify(
          token.value,
          new TextEncoder().encode(process.env.JWT_SECRET || '')
        )
        return NextResponse.redirect(new URL('/dashboard', request.url))
      } catch (error) {
        const response = NextResponse.next()
        response.cookies.delete('auth-token')
        return response
      }
    }
    return NextResponse.next()
  }

  // Exclude API routes from middleware
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // Protect all other routes
  const token = request.cookies.get('auth-token')
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    await jwtVerify(
      token.value,
      new TextEncoder().encode(process.env.JWT_SECRET || '')
    )
    return NextResponse.next()
  } catch (error) {
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('auth-token')
    return response
  }
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
} 