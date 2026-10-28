import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value
  const { pathname } = request.nextUrl
  
  // Create response
  let response: NextResponse;
  
  // Protect /dashboard routes
  if (pathname.startsWith('/dashboard')) {
    // 1. If no token, redirect to login
    if (!token) {
      response = NextResponse.redirect(new URL('/auth/login', request.url))
    } else {
      try {
        // 2. Decode the JWT payload (Edge compatible base64 parsing)
        const payloadBase64 = token.split('.')[1]
        // Replace URL safe base64 chars
        const normalizedBase64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/')
        const decodedPayload = JSON.parse(atob(normalizedBase64))
        const userRole = decodedPayload.role
        
        // 3. RBAC Rules
        // SUPER_ADMIN boundary
        if (pathname.startsWith('/dashboard/superadmin') && userRole !== 'SUPER_ADMIN') {
          const fallbackPath = userRole === 'ADMIN' ? '/dashboard/admin' : '/dashboard/user'
          response = NextResponse.redirect(new URL(fallbackPath, request.url))
        }
        // ADMIN boundary
        else if (pathname.startsWith('/dashboard/admin') && userRole !== 'ADMIN') {
          const fallbackPath = userRole === 'SUPER_ADMIN' ? '/dashboard/superadmin' : '/dashboard/user'
          response = NextResponse.redirect(new URL(fallbackPath, request.url))
        }
        // USER boundary
        else if (pathname.startsWith('/dashboard/user') && userRole !== 'USER') {
          const fallbackPath = userRole === 'SUPER_ADMIN' ? '/dashboard/superadmin' : '/dashboard/admin'
          response = NextResponse.redirect(new URL(fallbackPath, request.url))
        }
        // Dashboard root /dashboard redirect to specific role dashboard
        else if (pathname === '/dashboard') {
          const rolePathName = userRole.toLowerCase().replace('_', '')
          response = NextResponse.redirect(new URL(`/dashboard/${rolePathName}`, request.url))
        } else {
          response = NextResponse.next()
        }

      } catch (e) {
        // Token parsing failed (e.g. malformed token)
        response = NextResponse.redirect(new URL('/auth/login', request.url))
      }
    }
  } else {
    response = NextResponse.next()
  }
  
  // Add CSP headers to allow Google OAuth
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://apis.google.com https://ogs.google.com blob:",
    "script-src-elem 'self' 'unsafe-inline' https://accounts.google.com https://apis.google.com https://ogs.google.com blob:",
    "frame-src 'self' https://accounts.google.com",
    "connect-src 'self' https://accounts.google.com https://www.googleapis.com http://localhost:5003",
    "style-src 'self' 'unsafe-inline' https://accounts.google.com",
    "font-src 'self' data:",
    "img-src 'self' data: https: blob:",
    "object-src 'none'",
    "base-uri 'self'",
  ].join('; ')
  
  response.headers.set('Content-Security-Policy', cspHeader)
  
  return response
}

export const config = {
  // Run middleware on all paths
  matcher: '/:path*',
}
