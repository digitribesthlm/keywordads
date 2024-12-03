import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request) {
  // Exclude login page and API routes from middleware
  if (
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next()
  }

  const token = request.cookies.get('auth-token')

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    // Using jose instead of jsonwebtoken for Edge runtime compatibility
    await jwtVerify(
      token.value,
      new TextEncoder().encode(process.env.JWT_SECRET || '')
    )
    return NextResponse.next()
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)',
  ],
} 