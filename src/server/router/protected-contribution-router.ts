import { createProtectedRouter } from "./protected-router";
import { z } from "zod";

const traitSchema = z.object({
	traitName: z.string(),
	traitValue: z.string(),
});

export const protectedContributionRouter = createProtectedRouter()
	.mutation("createContribtuion", {
		input: z.object({
			projectId: z.string(),
			contributedTokenAddress: z.string(),
			amount: z.number(),
		}),
		async resolve({ ctx, input }) {
			try {
				const createdContribtuion = await ctx.prisma.contribution.create({
					data: {
						projectId: input.projectId,
						userId: ctx.session.user.id,
						contributedTokenAddress: input.contributedTokenAddress,
						amount: input.amount,
					},
				});
				console.log("Created Contribution: ", createdContribtuion);
				try {
					await ctx.prisma.project.update({
						where: {
							id: input.projectId,
						},
						data: {
							amountRaised: {
								increment: input.amount,
							},
						},
					});
				} catch (error) {
					console.log("Error incrementing amount raised", error);
				}
				return createdContribtuion;
			} catch (error) {
				console.log(error);
				return;
			}
		},
	})
	.query("getUserBackProjects", {
		async resolve({ ctx }) {
			try {
				const userBackedProjects = await ctx.prisma.contribution.findMany({
					where: {
						userId: ctx.session.user.id,
					},
					select: {
						amount: true,
						Project: true,
						contributionTimestamp: true,
					},
				});

				console.log("User Backed Projects: ", userBackedProjects);
				return userBackedProjects;
			} catch (error) {
				console.log(error);
				return;
			}
		},
	});
