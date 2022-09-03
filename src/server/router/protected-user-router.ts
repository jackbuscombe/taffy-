import { createProtectedRouter } from "./protected-router";
import { z } from "zod";

// Example router with queries that can only be hit if the user requesting is signed in
export const protectedUserRouter = createProtectedRouter()
	.mutation("createUser", {
		input: z.object({
			name: z.string(),
		}),
		async resolve({ ctx, input }) {
			try {
				const createdUser = await ctx.prisma.user.create({
					data: {
						id: ctx.session.user.id,
						name: input.name,
					},
				});

				return createdUser;
			} catch (error) {
				console.log(error);
				return;
			}
		},
	})
	.mutation("updateUser", {
		input: z.object({
			name: z.string().optional(),
			email: z.string().optional(),
			image: z.string().optional(),
			bio: z.string().optional(),
		}),
		async resolve({ input, ctx }) {
			try {
				const updatedUser = await ctx.prisma.user.update({
					where: {
						id: ctx.session?.user?.id,
					},
					data: {
						name: input.name,
						email: input.name,
						image: input.image,
						bio: input.bio,
					},
				});
				console.log("Updated User", updatedUser);
				return updatedUser;
			} catch (error) {
				console.log(error);
				return;
			}
		},
	})
	.query("getLoggedInUser", {
		async resolve({ ctx }) {
			try {
				const loggedInUser = ctx.prisma.user.findUnique({
					where: {
						id: ctx.session.user.id,
					},
					select: {
						name: true,
						email: true,
						bio: true,
						image: true,
					},
				});
				console.log("Logged In User:", loggedInUser);
				return loggedInUser;
			} catch (error) {
				console.log(error);
				return;
			}
		},
	});
