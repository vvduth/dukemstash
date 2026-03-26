import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { isEmailVerificationEnabled } from "@/lib/email"
import authConfig from "./auth.config"

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      return session
    },
  },
  providers: [
    // Keep all providers from config, but override Credentials with real validation
    ...authConfig.providers.filter(
      (p) => (p as { type?: string }).type !== "credentials"
    ),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined
        const password = credentials?.password as string | undefined

        if (!email || !password) return null

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user?.password) return null

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) return null

        if (isEmailVerificationEnabled() && !user.emailVerified) {
          return null
        }

        return { id: user.id, name: user.name, email: user.email, image: user.image }
      },
    }),
  ],
})
