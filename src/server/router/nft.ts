import { createRouter } from "./context";
import { z } from "zod";

export const nftRouter = createRouter()
	.query("getSomeNfts", {
		input: z.object({
			amount: z.number(),
		}),
		async resolve({ ctx, input }) {
			const nfts = await ctx.prisma.nft.findMany({
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
	});
