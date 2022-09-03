import { createProtectedRouter } from "./protected-router";
import { z } from "zod";

// Example router with queries that can only be hit if the user requesting is signed in
export const protectedVoteRouter = createProtectedRouter()
	.mutation("createVote", {
		input: z.object({
			proposalId: z.string(),
			selection: z.number(),
		}),
		async resolve({ input, ctx }) {
			try {
				const submittedVote = await ctx.prisma.vote.create({
					data: {
						proposalId: input.proposalId,
						selection: input.selection,
						userId: ctx.session.user.id,
					},
				});
				console.log("Submitted Vote", submittedVote);
				return submittedVote;
			} catch (error) {
				console.log(error);
				return;
			}
		},
	})
	.query("checkforExistingVote", {
		input: z.object({
			proposalId: z.string(),
		}),
		async resolve({ ctx, input }) {
			try {
				const existingVote = await ctx.prisma.vote.findFirst({
					where: {
						AND: [
							{
								proposalId: input.proposalId,
							},
							{
								userId: ctx.session.user.id,
							},
						],
					},
				});

				console.log("Existing Vote", existingVote);
				return existingVote;
			} catch (error) {
				console.log(error);
				return;
			}
		},
	});
