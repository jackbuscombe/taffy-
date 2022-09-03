import { createProtectedRouter } from "./protected-router";
import { z } from "zod";

// Example router with queries that can only be hit if the user requesting is signed in
export const protectedStakeRouter = createProtectedRouter().mutation("createStake", {
	input: z.object({
		projectId: z.string(),
		amount: z.number(),
		tokenAddress: z.string(),
	}),
	async resolve({ ctx, input }) {
		try {
			const createdStake = await ctx.prisma.stake.create({
				data: {
					userId: ctx.session.user.id,
					projectId: input.projectId,
					amount: input.amount,
					tokenAddress: input.tokenAddress,
				},
			});

			console.log("Created Stake: ", createdStake);
			return createdStake;
		} catch (error) {
			console.log(error);
			return;
		}
	},
});
