import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value
  const { pathname } = request.nextUrl
  
  // Protect /dashboard routes
  if (pathname.startsWith('/dashboard')) {
    // 1. If no token, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    
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
        return NextResponse.redirect(new URL(fallbackPath, request.url))
      }
      
      // ADMIN boundary
      if (pathname.startsWith('/dashboard/admin') && userRole !== 'ADMIN') {
        const fallbackPath = userRole === 'SUPER_ADMIN' ? '/dashboard/superadmin' : '/dashboard/user'
        return NextResponse.redirect(new URL(fallbackPath, request.url))
      }

      // USER boundary
      if (pathname.startsWith('/dashboard/user') && userRole !== 'USER') {
        const fallbackPath = userRole === 'SUPER_ADMIN' ? '/dashboard/superadmin' : '/dashboard/admin'
        return NextResponse.redirect(new URL(fallbackPath, request.url))
      }
      
      // Dashboard root /dashboard redirect to specific role dashboard
      if (pathname === '/dashboard') {
        const rolePathName = userRole.toLowerCase().replace('_', '')
        return NextResponse.redirect(new URL(`/dashboard/${rolePathName}`, request.url))
      }

    } catch (e) {
      // Token parsing failed (e.g. malformed token)
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  // Only run middleware on paths inside /dashboard
  matcher: ['/dashboard/:path*'],
}
