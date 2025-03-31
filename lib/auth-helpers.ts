"use client"

import { ADMIN_CREDENTIALS } from './admin-auth';

export function checkAdminAccess() {
  const cookies = document.cookie.split(';');
  const adminSession = cookies.find(c => c.trim().startsWith('admin-session='));
  return adminSession?.includes(ADMIN_CREDENTIALS.email) ?? false;
} 