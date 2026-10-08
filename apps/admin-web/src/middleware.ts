import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Route Protection Middleware for GiaoVienHay Admin Portal
 * Uses cookie 'gvh_admin_token' to guard protected dashboard routes
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get('gvh_admin_token')?.value;

  // 1. Nếu đang truy cập trang /login
  if (pathname === '/login') {
    // Nếu đã có token đăng nhập hợp lệ -> chuyển hướng ngay vào Dashboard
    if (token) {
      const dashboardUrl = new URL('/', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
    return NextResponse.next();
  }

  // 2. Với tất cả các trang quản trị còn lại (/, /users, /classes, /logs, /settings, /limits, ...)
  // Nếu chưa đăng nhập -> chuyển hướng về /login kèm query redirect để quay lại sau khi đăng nhập
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

/**
 * Matcher configuration:
 * Run middleware on all routes EXCEPT static assets, next internal files, and public images
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static media files (png, jpg, jpeg, svg, webp, gif)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|gif|png|svg|webp|ico)).*)',
  ],
};
