"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ADMIN_CREDENTIALS } from '@/lib/auth/server-auth';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      // Crear sesión simple
      document.cookie = `admin-session=${email}; path=/`;
      router.push('/admin');
    } else {
      setError('Credenciales inválidas');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          className="w-full mb-4 p-2 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
}

