import { createProtectedRouter } from "./protected-router";
import { z } from "zod";

const optionSchema = z.object({
	id: z.number(),
	value: z.string(),
});

// Router with queries that can only be hit if the user requesting is signed in
export const protectedProposalRouter = createProtectedRouter()
	.mutation("createProposal", {
		input: z.object({
			options: z.array(optionSchema),
			projectId: z.string(),
			question: z.string(),
			description: z.string().optional(),
			title: z.string(),
			votingCloseTimestamp: z.number(),
		}),
		async resolve({ ctx, input }) {
			const associatedProject = await ctx.prisma.project.findUnique({
				where: {
					id: input.projectId,
				},
				select: {
					creatorId: true,
				},
			});
			if (ctx.session.user.id !== associatedProject?.creatorId) {
				console.error("Unauthorized. This is not your project");
				return;
			}
			try {
				const createdProposal = await ctx.prisma.proposal.create({
					data: {
						options: input.options,
						projectId: input.projectId,
						question: input.question,
						description: input.description,
						title: input.title,
						votingCloseTimestamp: input.votingCloseTimestamp,
					},
				});
				console.log("Newly created Proposal is", createdProposal);

				return createdProposal;
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
		async resolve({ input, ctx }) {
			const projectFollowed = await ctx.prisma.project.update({
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
			console.log("Project susccessfully followed", projectFollowed);
			return projectFollowed;
		},
	})
	.query("getUserProposals", {
		async resolve({ ctx }) {
			const userProposals = await ctx.prisma.proposal.findMany({
				include: {
					project: {
						select: {
							name: true,
							ticker: true,
							image: true,
							contributions: {
								where: {
									userId: ctx.session.user.id,
								},
							},
						},
					},
				},
			});
			console.log("User Proposals", userProposals);
			return userProposals;
		},
	});
