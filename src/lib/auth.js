import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        nisNik: { label: "NIS/NIK", type: "text", placeholder: "NIS atau NIK" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.nisNik || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { nisNik: credentials.nisNik }
        });

        if (!user) {
          throw new Error("Akun tidak ditemukan");
        }

        if (!user.isActive) {
          throw new Error("Akun nonaktif");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Password salah");
        }

        return {
          id: user.id,
          name: user.name,
          nisNik: user.nisNik,
          role: user.role,
          image: user.image,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.nisNik = user.nisNik;
        token.image = user.image;
      }
      // Handle session update
      if (trigger === "update" && session?.image) {
        token.image = session.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.nisNik = token.nisNik;
        session.user.image = token.image;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 12 * 60 * 60, // 12 jam
  },
  secret: process.env.NEXTAUTH_SECRET,
};
