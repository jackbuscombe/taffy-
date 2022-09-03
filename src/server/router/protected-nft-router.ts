import { createProtectedRouter } from "./protected-router";
import { z } from "zod";
import { resolve } from "path";

const traitSchema = z.object({
	traitName: z.string(),
	traitValue: z.string(),
});

const beneficiarySchema = z.object({
	name: z.string().optional(),
	address: z.string(),
	percentage: z.number(),
	benefit: z.string(),
});

// Example router with queries that can only be hit if the user requesting is signed in
export const protectedNftRouter = createProtectedRouter()
	.mutation("createNft", {
		input: z.object({
			chainId: z.number().optional(),
			contractAddress: z.string(),
			creatorId: z.string(),
			description: z.string(),
			mintTimestamp: z.number(),
			name: z.string(),
			nftUrl: z.string(),
			projectId: z.string().optional(),
			tokenId: z.number(),
			traits: z.array(traitSchema).optional(),
			beneficiaries: z.array(beneficiarySchema),
		}),
		async resolve({ ctx, input }) {
			try {
				const createdNft = await ctx.prisma.nft.create({
					data: {
						chainId: input.chainId,
						contractAddress: input.contractAddress,
						creatorId: ctx.session.user.id,
						description: input.description,
						mintTimestamp: input.mintTimestamp,
						name: input.name,
						nftUrl: input.nftUrl,
						projectId: input.projectId,
						tokenId: input.tokenId,
						traits: input.traits,
						beneficiaries: {
							create: [...input.beneficiaries],
						},
					},
				});

				return {
					createdNft,
				};
			} catch (error) {
				console.log(error);
				return;
			}
		},
	})
	.mutation("updateNftAddress", {
		input: z.object({
			id: z.string(),
			address: z.string(),
		}),
		async resolve({ ctx, input }) {
			try {
				const updatedNft = await ctx.prisma.nft.update({
					where: {
						id: input.id,
					},
					data: {
						contractAddress: input.address,
						mintTimestamp: Math.floor(Date.now() / 1000),
					},
				});
				console.log("Updated Nft on backend", updatedNft);
				return updatedNft;
			} catch (error) {
				console.log(error);
			}
		},
	})
	.query("getRecentTraits", {
		async resolve({ ctx }) {
			const recentTraits = await ctx.prisma.nft.findMany({
				where: {
					creatorId: ctx.session.user.id,
				},
				select: {
					traits: true,
				},
			});
			console.log(recentTraits);
			return recentTraits;
		},
	});
