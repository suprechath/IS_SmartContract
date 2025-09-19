import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: '/pending-verification', 
};

export function middleware(request: NextRequest) {
  const token = request.cookies.get('jwt_token')?.value;
  console.log('Middleware checking token:', token);

  if (!token) {
    console.log('No token found, redirecting to /');
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  console.log('Token found, allowing access.');
  return NextResponse.next();
}