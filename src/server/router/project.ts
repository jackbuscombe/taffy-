import { createRouter } from "./context";
import { z } from "zod";

export const projectRouter = createRouter()
	.query("getSomeProjects", {
		input: z.object({
			amount: z.number(),
		}),
		async resolve({ ctx, input }) {
			const projects = await ctx.prisma.project.findMany({
				orderBy: [
					{
						createdTimestamp: "desc",
					},
				],
				take: input.amount,
				include: {
					creator: {
						select: {
							name: true,
							image: true,
						},
					},
					contributions: {
						select: {
							amount: true,
						},
					},
					stakes: {
						select: {
							amount: true,
						},
					},
					_count: {
						select: {
							contributions: true,
							followers: true,
						},
					},
				},
			});
			console.log(projects);
			return projects;
		},
	})
	.query("getSpecificProject", {
		input: z.object({
			id: z.string(),
		}),
		async resolve({ input, ctx }) {
			const project = await ctx.prisma.project.findUnique({
				where: {
					id: input.id,
				},
				include: {
					creator: {
						select: {
							id: true,
							name: true,
							image: true,
						},
					},
					followers: true,
					contributions: {
						select: {
							amount: true,
						},
					},
					proposals: true,
					_count: {
						select: {
							contributions: true,
							followers: true,
							stakes: true,
						},
					},
					stakes: {
						select: {
							amount: true,
						},
					},
					nfts: true,
				},
			});
			console.log("The fetched project is", project);
			return project;
		},
	})
	.query("getProjectSearch", {
		input: z.object({
			query: z.string(),
		}),
		async resolve({ ctx, input }) {
			try {
				const projects = await ctx.prisma.project.findMany({
					where: {
						name: {
							search: input.query,
							mode: "insensitive",
						},
					},
					select: {
						id: true,
						name: true,
						image: true,
					},
				});
				console.log("Projects: ", projects);
				return projects;
			} catch (error) {
				console.log(error);
				return;
			}
		},
	})
	.query("getAmountRaisedForSpecificProject", {
		input: z.object({
			projectId: z.string(),
		}),
		async resolve({ ctx, input }) {
			try {
				const amountRaised = ctx.prisma.project.findUnique({
					where: {
						id: input.projectId,
					},
					include: {
						contributions: {
							select: {
								amount: true,
							},
						},
					},
				});
				console.log("Amount Raise: ", amountRaised);
				return amountRaised;
			} catch (error) {
				console.log(error);
				return;
			}
		},
	});
// .query("getNftsFromCollection", {
// 	input: z.object({
// 		projectId: z.string(),
// 	}),
// 	async resolve({ctx, input}) {
// 		try {
// 			const projectNfts = await ctx.prisma.nft.findMany({
// 				where: {
// 					projectId: input.projectId,
// 				},
// 				include: {
// 					project: {
// 						select: {
// 							name: true,
// 						},
// 					},
// 					creator: {
// 						select: {
// 							name: true,
// 							image: true,
// 						},
// 					},
// 				},
// 			});
// 		} catch (error) {
// 			console.log(error);
// 			return;
// 		}
// 	}
// })
