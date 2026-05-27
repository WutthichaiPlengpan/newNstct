import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// 💡 เปลี่ยนชื่อฟังก์ชันจาก middleware เป็น proxy ตรงนี้ครับ
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin');
  const isLoginRoute = pathname === '/admin/login';
  const isAdminApiRoute = pathname.startsWith('/api/admin') && pathname !== '/api/admin/login';

  if (!isAdminRoute && !isAdminApiRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get('nstct_admin_token')?.value;

  if (!token) {
    if (isLoginRoute) {
      return NextResponse.next();
    }
    
    if (isAdminApiRoute) {
      return NextResponse.json({ success: false, message: 'Unauthorized: Access Denied' }, { status: 401 });
    }
    
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("Missing JWT_SECRET in environment");
    }

    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secretKey);

    if (isLoginRoute) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    return NextResponse.next();

  } catch (error) {
    console.error('Proxy Security Error:', error);
    
    const response = isAdminApiRoute 
        ? NextResponse.json({ success: false, message: 'Invalid or Expired Token' }, { status: 401 })
        : NextResponse.redirect(new URL('/admin/login', request.url));

    response.cookies.delete('nstct_admin_token');
    
    return response;
  }
}

export const config = {
  matcher: [
    '/admin/:path*',       
    '/api/admin/:path*'    
  ],
};