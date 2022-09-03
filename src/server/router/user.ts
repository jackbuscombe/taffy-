import { createRouter } from "./context";
import { z } from "zod";

export const userRouter = createRouter()
	.query("getAllUsers", {
		async resolve({ ctx }) {
			const users = await ctx.prisma.user.findMany();
			console.log("users are", users);
			return users;
		},
	})
	.query("checkIfUserExists", {
		input: z.object({
			id: z.string(),
		}),
		async resolve({ input, ctx }) {
			try {
				console.log("We are checking here in the Router");
				const userCount = await ctx.prisma.user.findFirstOrThrow({
					where: {
						id: input.id,
					},
				});
				console.log("user is equal to", userCount);
				if (userCount) {
					console.log("This came out true");
					return true;
				} else {
					console.log("This came out false");
					return false;
				}
			} catch (error) {
				console.log(error);
				return false;
			}
		},
	})
	.query("getSpecificUser", {
		input: z.object({
			id: z.string(),
		}),
		async resolve({ ctx, input }) {
			try {
				const user = await ctx.prisma.user.findUnique({
					where: {
						id: input.id,
					},
					select: {
						id: true,
						name: true,
						bio: true,
						image: true,
						projects: {
							select: {
								id: true,
								name: true,
								image: true,
								bannerImage: true,
								ticker: true,
								description: true,
								raiseTokenAddress: true,
								raiseEndTimestamp: true,
								target: true,
								_count: {
									select: {
										contributions: true,
										followers: true,
									},
								},
							},
						},
						contributions: {
							select: {
								Project: {
									select: {
										id: true,
										name: true,
										ticker: true,
										description: true,
										image: true,
										bannerImage: true,
										raiseTokenAddress: true,
										raiseEndTimestamp: true,
										target: true,
										creator: {
											select: {
												name: true,
											},
										},
										_count: {
											select: {
												contributions: true,
												followers: true,
											},
										},
									},
									// include: {
									// 	// _count: {
									// 	// 	select: {
									// 	// 		contributions: true,
									// 	// 		followers: true,
									// 	// 	},
									// 	// },
									// 	creator: {
									// 		select: {
									// 			name: true,
									// 		},
									// 	},
									// },
								},
							},
						},
						nfts: {
							select: {
								id: true,
								name: true,
								nftUrl: true,
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
						},
					},
				});

				console.log("Retrieved User: ", user);
				return user;
			} catch (error) {
				console.log(error);
				return;
			}
		},
	});
// export const userRouter = createRouter()
// 	.mutation("createUser", {
// 		input: z.object({
// 			address: z.string(),
// 			name: z.string(),
// 		}),
// 		async resolve({ input, ctx }) {
// 			const createdUser = await ctx.prisma.user.create({
// 				data: {
// 					address: input.address,
// 					name: input.name,
// 				},
// 			});
// 			return {
// 				createdUser,
// 			};
// 		},
// 	})
// 	.query("getAllUsers", {
// 		async resolve({ ctx }) {
// 			return await ctx.prisma.user.findMany();
// 		},
// 	});

// export const exampleRouter = createRouter()
//   .query("hello", {
//     input: z
//       .object({
//         text: z.string().nullish(),
//       })
//       .nullish(),
//     resolve({ input }) {
//       return {
//         greeting: `Hello ${input?.text ?? "world"}`,
//       };
//     },
//   })
//   .query("getAll", {
//     async resolve({ ctx }) {
//       return await ctx.prisma.example.findMany();
//     },
//   });
