import { createRouter } from "./context";
import { z } from "zod";

type upcomingStatusType = {
	raiseEndTimestamp: {
		gt: number;
	};
};

type releasedStatusType = {
	raiseEndTimestamp: {
		lt: number;
	};
};

type sortByCreatedTimeType = {
	createdTimestamp: "asc" | "desc";
};
type sortByBackersType = {
	contributions: {
		_count: "asc" | "desc";
	};
};
type sortByFollowersType = {
	followers: {
		_count: "asc" | "desc";
	};
};

export const projectRouter = createRouter()
	.query("getSomeProjects", {
		input: z.object({
			amount: z.number(),
			status: z.string(),
			tags: z.array(z.string()),
			sortBy: z.string().optional(),
		}),
		async resolve({ ctx, input }) {
			let status: upcomingStatusType | releasedStatusType;
			if (input.status === "upcoming") {
				status = {
					raiseEndTimestamp: {
						gt: Math.floor(Date.now() / 1000),
					},
				};
			} else if (input.status === "released") {
				status = {
					raiseEndTimestamp: {
						lt: Math.floor(Date.now() / 1000),
					},
				};
			} else {
				status = {
					raiseEndTimestamp: {
						gt: 0,
					},
				};
			}

			let sortBy: sortByCreatedTimeType | sortByBackersType | sortByFollowersType;
			if (input.sortBy === "time") {
				sortBy = {
					createdTimestamp: "desc",
				};
			} else if (input.sortBy === "backers") {
				sortBy = {
					contributions: {
						_count: "desc",
					},
				};
			} else if (input.sortBy === "raised") {
				sortBy = {
					contributions: {
						_count: "desc",
					},
				};
			} else if (input.sortBy === "followers") {
				sortBy = {
					followers: {
						_count: "desc",
					},
				};
			} else {
				sortBy = {
					createdTimestamp: "desc",
				};
			}
			// This is how we conditionally make the 'where' work, such that empty arrays return all projects
			const tagsFilter =
				input.tags.length > 0
					? {
							tags: {
								hasSome: input.tags,
							},
					  }
					: {};
			const projects = await ctx.prisma.project.findMany({
				orderBy: sortBy,
				where: tagsFilter && status,
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
	.mutation("incrementView", {
		input: z.object({
			projectId: z.string(),
		}),
		async resolve({ ctx, input }) {
			try {
				await ctx.prisma.project.update({
					where: {
						id: input.projectId,
					},
					data: {
						views: {
							increment: 1,
						},
					},
				});
				return;
			} catch (error) {
				console.log("Error incrementing Views", error);
				return;
			}
		},
	});
