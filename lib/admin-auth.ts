export const ADMIN_CREDENTIALS = {
  email: "jdjfc@hotmail.com",
  password: "_Pjanno 12"
};

export function isAdmin(email: string, password: string) {
  return email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password;
}

export function checkAdminSession(session: string | undefined) {
  if (!session) return false;
  return session.includes(ADMIN_CREDENTIALS.email);
} 