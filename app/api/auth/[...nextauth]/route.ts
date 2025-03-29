import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createSupabaseClient } from "@/lib/supabase";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

interface UserWithRole extends Session {
  user: {
    id: string;
    role: string;
    [key: string]: any;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Use Supabase for authentication but only to verify credentials
        const supabase = createSupabaseClient();
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error || !data.user) {
          return null;
        }

        // Get user profile data from Supabase
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        // Return user data in format expected by NextAuth
        return {
          id: data.user.id,
          email: data.user.email,
          name: profileData?.full_name || data.user.email,
          role: profileData?.role || 'user',
          ...profileData
        };
      }
    })
  ],
  callbacks: {
    // Include user ID and role in session
    async session({ session, token }: { session: any; token: JWT }) {
      if (session?.user && token) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    // Save role to token
    async jwt({ token, user }: { token: JWT; user: any }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
      }
      return token;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: "jwt",
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 