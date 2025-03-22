import type { NextAuthOptions } from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import { GithubProfile } from 'next-auth/providers/github'

// Mock user database (Replace this with DB queries)
const users = [
    { id: "1", name: "Dave", password: "nextauth", role: "manager" },
    { id: "2", name: "Alice", password: "securepass", role: "admin" },
    { id: "3", name: "Bob", password: "userpass", role: "user" }
];

export const options: NextAuthOptions = {
    providers: [
        GitHubProvider({
            profile(profile: GithubProfile) {
                console.log(profile)
                return {
                    ...profile,
                    role: profile.role ?? "user",
                    id: profile.id.toString(),
                    image: profile.avatar_url,
                }
            },
            clientId: process.env.GITHUB_ID as string,
            clientSecret: process.env.GITHUB_SECRET as string,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username:", type: "text", placeholder: "your-username" },
                password: { label: "Password:", type: "password", placeholder: "your-password" }
            },
            async authorize(credentials) {
                const user = users.find(u => u.name === credentials?.username && u.password === credentials?.password);
                if (user) return user;
                return null;
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role; // Store role in token
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }: { session: any; token: { id?: string; role?: string } }) {
            if (session?.user) {
                session.user.role = token.role;
                session.user.id = token.id;
            }
            return session;
        }
    },
    session: {
        strategy: "jwt",
    },
}
