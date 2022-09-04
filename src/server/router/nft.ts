import { createRouter } from "./context";
import { z } from "zod";

type sortByMintedTimeType = {
	mintTimestamp: "asc" | "desc";
};
type sortByViewsType = {
	views: "asc" | "desc";
};
type sortByBackersType = {
	project: {
		contributions: {
			_count: "desc";
		};
	};
};
type sortByFollowersType = {
	project: {
		followers: {
			_count: "desc";
		};
	};
};

export const nftRouter = createRouter()
	.query("getSomeNfts", {
		input: z.object({
			amount: z.number(),
			status: z.string(),
			sortBy: z.string().optional(),
		}),
		async resolve({ ctx, input }) {
			let status;
			if (input.status === "upcoming") {
				status = {
					mintTimestamp: {
						gt: Math.floor(Date.now() / 1000),
					},
				};
			} else if (input.status === "released") {
				status = {
					mintTimestamp: {
						lt: Math.floor(Date.now() / 1000),
					},
				};
			} else {
				status = {
					mintTimestamp: {
						gt: 0,
					},
				};
			}

			let sortBy: sortByMintedTimeType | sortByViewsType | sortByBackersType | sortByFollowersType;
			if (input.sortBy === "time") {
				sortBy = {
					mintTimestamp: "asc",
				};
			} else if (input.sortBy === "views") {
				sortBy = {
					views: "asc",
				};
			} else if (input.sortBy === "backers") {
				sortBy = {
					project: {
						contributions: {
							_count: "desc",
						},
					},
				};
			} else if (input.sortBy === "followers") {
				sortBy = {
					project: {
						followers: {
							_count: "desc",
						},
					},
				};
			} else {
				sortBy = {
					mintTimestamp: "asc",
				};
			}
			const nfts = await ctx.prisma.nft.findMany({
				where: status,
				orderBy: sortBy,
				take: input.amount,
				include: {
					creator: {
						select: {
							name: true,
							image: true,
						},
					},
					project: {
						select: {
							name: true,
						},
					},
				},
			});
			console.log(nfts);
			return nfts;
		},
	})
	.query("getSpecificNft", {
		input: z.object({
			id: z.string(),
		}),
		async resolve({ ctx, input }) {
			const nft = await ctx.prisma.nft.findUnique({
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
					project: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			});
			console.log("The retreieved nft is", nft);
			return nft;
		},
	})
	.query("getNftsFromCollection", {
		input: z.object({
			projectId: z.string(),
		}),
		async resolve({ ctx, input }) {
			try {
				const nftCollection = await ctx.prisma.nft.findMany({
					where: {
						projectId: input.projectId,
					},
					include: {
						project: {
							select: {
								name: true,
							},
						},
						creator: {
							select: {
								name: true,
								image: true,
							},
						},
					},
				});
				console.log("Nft Collection");
				return nftCollection;
			} catch (error) {
				console.log(error);
				return;
			}
		},
	})
	.query("getNftSearch", {
		input: z.object({
			query: z.string(),
		}),
		async resolve({ ctx, input }) {
			try {
				const nfts = await ctx.prisma.nft.findMany({
					where: {
						name: {
							search: input.query,
							mode: "insensitive",
						},
					},
					select: {
						id: true,
						name: true,
						nftUrl: true,
					},
				});
				console.log("NFTS: ", nfts);
				return nfts;
			} catch (error) {
				console.log(error);
				return;
			}
		},
	})
	.mutation("incrementView", {
		input: z.object({
			nftId: z.string(),
		}),
		async resolve({ ctx, input }) {
			try {
				await ctx.prisma.nft.update({
					where: {
						id: input.nftId,
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
