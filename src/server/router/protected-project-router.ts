import { createProtectedRouter } from "./protected-router";
import { z } from "zod";

const beneficiarySchema = z.object({
	name: z.string().optional(),
	address: z.string(),
	percentage: z.number(),
	benefit: z.string(),
});

// Router with queries that can only be hit if the user requesting is signed in
export const protectedProjectRouter = createProtectedRouter()
	.mutation("createProject", {
		input: z.object({
			name: z.string(),
			bannerImage: z.string().optional(),
			discord: z.string().optional(),
			linkedIn: z.string().optional(),
			twitter: z.string().optional(),
			telegram: z.string().optional(),
			description: z.string().optional(),
			image: z.string(),
			ticker: z.string(),
			tags: z.array(z.string()),
			raiseTokenAddress: z.string().optional(),
			raiseEndTimestamp: z.number(),
			target: z.number().optional(),
			tokenAddress: z.string(),
			tokenSupply: z.number().optional(),
			beneficiaries: z.array(beneficiarySchema),
		}),
		async resolve({ ctx, input }) {
			try {
				const createdProject = await ctx.prisma.project.create({
					data: {
						name: input.name,
						description: input.description,
						ticker: input.ticker,
						image: input.image,
						bannerImage: input.bannerImage,
						creatorId: ctx.session.user.id,
						discord: input.discord,
						linkedIn: input.linkedIn,
						twitter: input.twitter,
						telegram: input.telegram,
						raiseTokenAddress: input.raiseTokenAddress,
						raiseEndTimestamp: input.raiseEndTimestamp,
						target: input.target,
						tags: input.tags,
						tokenAddress: input.tokenAddress,
						tokenSupply: input.tokenSupply,
						beneficiaries: {
							create: [...input.beneficiaries],
						},
					},
					include: { beneficiaries: true },
				});
				console.log("Newly created Project is", createdProject);

				return {
					createdProject,
				};
			} catch (error) {
				console.log(error);
				return;
			}
		},
	})
	.mutation("followProject", {
		input: z.object({
			projectId: z.string(),
		}),
		async resolve({ ctx, input }) {
			try {
				const followedProject = await ctx.prisma.project.update({
					where: {
						id: input.projectId,
					},
					data: {
						followers: {
							connect: {
								id: ctx.session.user.id,
							},
						},
					},
				});

				console.log("Followed Project", followedProject);
				return followedProject;
			} catch (error) {
				console.log(error);
				return;
			}
		},
	})
	.mutation("unfollowProject", {
		input: z.object({
			projectId: z.string(),
		}),
		async resolve({ ctx, input }) {
			try {
				const unfollowedProject = await ctx.prisma.project.update({
					where: {
						id: input.projectId,
					},
					data: {
						followers: {
							disconnect: {
								id: ctx.session.user.id,
							},
						},
					},
				});

				console.log("Unfollowed Project", unfollowedProject);
				return unfollowedProject;
			} catch (error) {
				console.log(error);
				return;
			}
		},
	})
	// .mutation("followProject", {
	// 	input: z.object({
	// 		projectId: z.string(),
	// 	}),
	// 	async resolve({ input, ctx }) {
	// 		await ctx.prisma.project.update({
	// 			where: {
	// 				id: input.projectId,
	// 			},
	// 			data: {
	// 				followers: {
	// 					create: {
	// 						userId: ctx.session.user.id,
	// 					},
	// 				},
	// 			},
	// 		});
	// 	},
	// })
	.query("checkIfFollowing", {
		input: z.object({
			projectId: z.string(),
		}),
		async resolve({ ctx, input }) {
			const isFollowing = await ctx.prisma.project.findUnique({
				where: {
					id: input.projectId,
				},
				include: {
					followers: {
						where: {
							id: ctx.session.user.id,
						},
					},
				},
			});
			console.log("isFollowing", isFollowing);
			if (isFollowing) {
				return true;
			}
			return false;
		},
	})
	.query("getLoggedInUserProjects", {
		async resolve({ ctx }) {
			const userProjects = await ctx.prisma.project.findMany({
				where: {
					creatorId: ctx.session.user.id,
				},
			});
			console.log("User projects:", userProjects);
			return userProjects;
		},
	});
