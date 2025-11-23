import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "./db";
import { User } from "./models";

// Function to validate Turnstile token
async function validateTurnstileToken(token: string): Promise<boolean> {
  if (!token) return false;
  
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${token}`,
    });
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Turnstile validation error:', error);
    return false;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        turnstileToken: { label: "Turnstile Token", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.turnstileToken) {
          return null;
        }

        // Validate Turnstile token
        const isTurnstileValid = await validateTurnstileToken(credentials.turnstileToken);
        if (!isTurnstileValid) {
          console.error("Turnstile validation failed");
          return null;
        }

        try {
          await connectDB();
          
          // Find user by email and include password for comparison
          const user = await User.findOne({ email: credentials.email }).select("+password");
          
          if (!user) {
            return null;
          }

          // Check if password matches
          const isMatch = await user.matchPassword(credentials.password);
          
          if (!isMatch) {
            return null;
          }

          // Check if user is blocked
          if (user.blocked) {
            throw new Error("Your account has been blocked. Please contact support.");
          }

          // Check if user has admin privileges (staff, admin, or super-admin)
          if (!['staff', 'admin', 'super-admin'].includes(user.role)) {
            throw new Error("Access denied. Admin privileges required.");
          }

          // Return user without password
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            accountType: user.accountType,
            blocked: user.blocked
          };
        } catch (error) {
          console.error("Authentication error:", error);
          throw error; // Re-throw to be handled by NextAuth
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Handle Google OAuth login
      if (account && account.type === "oauth" && user) {
        // Check if user already exists in our database
        await connectDB();
        let existingUser = await User.findOne({ email: user.email });
        
        if (!existingUser) {
          // User doesn't exist in database - deny access
          throw new Error("Access denied. Admin privileges required.");
        }
        
        // Check if user has admin privileges (staff, admin, or super-admin)
        if (!['staff', 'admin', 'super-admin'].includes(existingUser.role)) {
          throw new Error("Access denied. Admin privileges required.");
        }
        
        // Update token with user info
        token.id = existingUser._id.toString();
        token.role = existingUser.role;
        token.accountType = existingUser.accountType;
        token.blocked = existingUser.blocked;
      }
      
      // Handle regular credentials login
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accountType = user.accountType;
        token.blocked = user.blocked;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.accountType = token.accountType as string;
        session.user.blocked = token.blocked as boolean;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET || "your-default-secret-do-not-use-in-production",
};

// Extend next-auth types
declare module "next-auth" {
  interface User {
    id: string;
    role?: string;
    accountType?: string;
    blocked?: boolean;
  }
  
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      accountType?: string;
      blocked?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
    accountType?: string;
    blocked?: boolean;
  }
}