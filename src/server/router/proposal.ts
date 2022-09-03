import { createRouter } from "./context";
import { z } from "zod";

export const proposalRouter = createRouter()
	.query("getAllProjectProposals", {
		input: z.object({
			projectId: z.string(),
		}),
		async resolve({ ctx, input }) {
			const proposals = await ctx.prisma.proposal.findMany({
				where: {
					projectId: input.projectId,
				},
			});
			console.log(proposals);
			return proposals;
		},
	})
	.query("getSpecificProposal", {
		input: z.object({
			id: z.string(),
		}),
		async resolve({ input, ctx }) {
			const proposal = await ctx.prisma.proposal.findUnique({
				where: {
					id: input.id,
				},
			});
			console.log("The fetched proposal is", proposal);
			return proposal;
		},
	});
