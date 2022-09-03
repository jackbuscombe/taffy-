import NextAuth, { type NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from "next-auth/react";
import { SiweMessage } from "siwe";

// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../server/db/client";
import { env } from "../../../env/server.mjs";
import { IncomingMessage } from "http";

export const authOptions: NextAuthOptions = {
	// Include user.id on session
	callbacks: {
		async jwt({ token, user }) {
			console.log("Entering jwt callback where token = ", token);
			console.log("Entering jwt callback where user = ", user);
			if (user) {
				console.log("if user is true");

				const fetchedUser = await prisma.user.findFirst({
					where: {
						id: user.id,
					},
				});
				console.log("the fetched user = ", fetchedUser);
				if (!fetchedUser) {
					console.log("A fetched user does not exist, so we are creating one");
					// No user exists => Create a new user with id and name = user.id.
					const createdUser = await prisma.user.create({
						data: {
							id: user.id,
							name: `${user.id.slice(0, 5)}...${user.id.slice(user.id.length - 5)}`,
							image: `https://avatars.dicebear.com/api/open-peeps/${user.id || "placeholder"}.svg`,
						},
					});
					console.log("New User Created in Database", createdUser);
					token.name = user.id;
					token.email = createdUser.email;
					token.picture = createdUser.image;
				} else {
					// A user is found in the DB => Set the token to represent the DB user.
					token.name = fetchedUser.name;
					token.email = fetchedUser.email;
					token.picture = fetchedUser.image;
				}
				console.log("After modifying the token, it is equal to", token);
			}
			console.log("Exiting the jwt callback where token = ", token);
			console.log("Exiting jwt callback where user = ", user);
			return { ...token, ...user };
		},
		async session({ session, token }) {
			console.log("Entering the session callback where session =", session);
			console.log("Entering the session callback wher token = ", token);
			session.address = token.sub;
			if (session.user) {
				session.user.id = token.sub as string;
				session.user.name = token.name;
				session.user.email = token.email;
				session.user.image = token.picture;
				// const fetchedUser = await prisma?.user.findFirst({
				// 	where: {
				// 		id: token.sub,
				// 	},
				// });
				// console.log("the fetched user = ", fetchedUser);
				// if (!fetchedUser) {
				// 	session.user.name = token.sub;
				// } else {
				// 	token.name = fetchedUser.name;
				// 	token.email = fetchedUser.email;
				// 	token.picture = fetchedUser.image;

				// }
			}
			console.log("Exiting the Session callbacker where session = ", session);
			console.log("Exiting the Session callbacker where token = ", token);
			console.log("The session address is", session.address);
			return session;
		},
	},
	// Configure one or more authentication providers
	adapter: PrismaAdapter(prisma),
	providers: [
		CredentialsProvider({
			name: "Ethereum",
			credentials: {
				message: {
					label: "Message",
					type: "text",
					placeholder: "0x0",
				},
				signature: {
					label: "Signature",
					type: "text",
					placeholder: "0x0",
				},
			},
			async authorize(credentials, req: any) {
				try {
					const siwe = new SiweMessage(JSON.parse(credentials?.message || "{}"));

					const nextAuthUrl = process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);
					if (!nextAuthUrl) {
						return null;
					}

					const nextAuthHost = new URL(nextAuthUrl).host;
					if (siwe.domain !== nextAuthHost) {
						return null;
					}

					if (siwe.nonce !== (await getCsrfToken({ req }))) {
						return null;
					}

					await siwe.validate(credentials?.signature || "");

					return {
						id: siwe.address,
					};
				} catch (e) {
					return null;
				}
			},
		}),
	],
	// This below here was from the siwe docs
	session: {
		strategy: "jwt",
	},
	secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);

// export default async function auth(req, res) {
//   const providers = [
//     CredentialsProvider({
//       name: "Ethereum",
//       credentials: {
//         message: {
//           label: "Message",
//           type: "text",
//           placeholder: "0x0",
//         },
//         signature: {
//           label: "Signature",
//           type: "text",
//           placeholder: "0x0",
//         },
//       },
//       async authorize(credentials) {
//         try {
//           const siwe = new SiweMessage(JSON.parse(credentials?.message || "{}"))

//           const nextAuthUrl =
//             process.env.NEXTAUTH_URL ||
//             (process.env.VERCEL_URL
//               ? `https://${process.env.VERCEL_URL}`
//               : null)
//           if (!nextAuthUrl) {
//             return null
//           }

//           const nextAuthHost = new URL(nextAuthUrl).host
//           if (siwe.domain !== nextAuthHost) {
//             return null
//           }

//           if (siwe.nonce !== (await getCsrfToken({ req }))) {
//             return null
//           }

//           await siwe.validate(credentials?.signature || "")
//           return {
//             id: siwe.address,
//           }
//         } catch (e) {
//           return null
//         }
//       },
//     }),
//   ]

//   const isDefaultSigninPage =
//     req.method === "GET" && req.query.nextauth.includes("signin")

//   // Hide Sign-In with Ethereum from default sign page
//   if (isDefaultSigninPage) {
//     providers.pop()
//   }

//   return await NextAuth(req, res, {
//     // https://next-auth.js.org/configuration/providers/oauth
//     providers,
//     session: {
//       strategy: "jwt",
//     },
//     secret: process.env.NEXTAUTH_SECRET,
//     callbacks: {
//       async session({ session, token }) {
//         session.address = token.sub
//         session.user.name = token.sub
//         session.user.image = 'https://www.fillmurray.com/128/128'
//         return session
//       },
//     },
//   })
// }
