import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_CREDENTIALS } from '@/lib/auth/server-auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email y contraseña son requeridos' }, { status: 400 });
    }

    // Validar credenciales
    const isValidAdmin = email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password;

    if (isValidAdmin) {
      // Establecer la cookie de sesión segura
      const cookieStore = cookies();
      cookieStore.set('admin-session', email, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
        sameSite: 'lax', // Protección CSRF
        maxAge: 60 * 60 * 24 * 7 // 1 semana de duración
      });

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, message: 'Credenciales inválidas' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error en /api/login:', error);
    return NextResponse.json({ success: false, message: 'Error interno del servidor' }, { status: 500 });
  }
} 