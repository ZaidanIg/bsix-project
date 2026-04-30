import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Admin-only routes
    if (path.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login?error=unauthorized', req.url))
    }

    // Guru-only routes
    if (path.startsWith('/guru') && !['ADMIN', 'GURU'].includes(token?.role)) {
      return NextResponse.redirect(new URL('/login?error=unauthorized', req.url))
    }

    // Siswa-only routes
    if (path.startsWith('/siswa') && !['ADMIN', 'SISWA'].includes(token?.role)) {
      return NextResponse.redirect(new URL('/login?error=unauthorized', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow public routes without token
        const publicPaths = ['/login', '/program-bsix', '/galeri', '/pendidik', '/berita', '/spmb', '/kritik-saran']
        const isPublic = req.nextUrl.pathname === '/' || publicPaths.some(p => req.nextUrl.pathname.startsWith(p))
        if (isPublic) return true
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
}
