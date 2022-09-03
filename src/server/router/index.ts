// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { userRouter } from "./user";
import { protectedUserRouter } from "./protected-user-router";
import { protectedProjectRouter } from "./protected-project-router";
import { projectRouter } from "./project";
import { protectedNftRouter } from "./protected-nft-router";
import { nftRouter } from "./nft";
import { proposalRouter } from "./proposal";
import { protectedProposalRouter } from "./protected-proposal-router";
import { voteRouter } from "./vote";
import { protectedVoteRouter } from "./protected-vote-router";
import { stakeRouter } from "./stake";
import { protectedStakeRouter } from "./protected-stake-router";
import { contributionRouter } from "./contribution";
import { protectedContributionRouter } from "./protected-contribution-router";

export const appRouter = createRouter().transformer(superjson).merge("user.", userRouter).merge("user.", protectedUserRouter).merge("project.", projectRouter).merge("project.", protectedProjectRouter).merge("nft.", nftRouter).merge("nft.", protectedNftRouter).merge("proposal.", proposalRouter).merge("proposal.", protectedProposalRouter).merge("vote.", voteRouter).merge("vote.", protectedVoteRouter).merge("contribution.", contributionRouter).merge("contribution.", protectedContributionRouter).merge("stake.", stakeRouter).merge("stake.", protectedStakeRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
