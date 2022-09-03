export interface NftType {
	id: string;
	chainId: number;
	contractAddress: string;
	createdTimestamp: Date;
	creatorId: string;
	description: string;
	mintTimestamp: number;
	name: string;
	nftUrl: string;
	projectId: string | undefined;
	tokenId: number;
	traits: { traitName: string; traitValue: string };
	views: string;

	// id: string;
	// chainId: string;
	// contractAddress: string;
	// createdTimestamp: string;
	// creatorAddress: number;
	// creatorFees: number;
	// creatorImage: string;
	// creatorName: string;
	// description: string;
	// mintTimestamp: number;
	// name: string;
	// nftUrl: string;
	// price: number;
	// projectId: number;
	// projectName: string;
	// tokenId: number;
	// tokenStandard: string;
	// traits?: [];
	// views: number;
}

// export interface ProjectType {
// 	id: string;
// 	amountStaked: number;
// 	bannerImage: string;
// 	contributions: Object[];
// 	contributionsCount: number;
// 	contributionsValue: number;
// 	createdTimestamp: number;
// 	creatorAddress: string;
// 	creatorName: string;
// 	discord?: string;
// 	endDate: number;
// 	followers: string[];
// 	followersCount: number;
// 	linkedIn?: string;
// 	projectDescription: string;
// 	projectImage: string;
// 	projectName: string;
// 	projectTicker: string;
// 	tags: string[];
// 	target: number;
// 	telegram?: string;
// 	tokenId: string;
// 	tokenPrice: number;
// 	twitter?: string;
// 	views: number;
// }

export interface UserType {
	id: string;
	bio: string;
	firstName: string;
	lastName: string;
	profileImage: string;
	userCreatedTimestamp: number;
}

// export interface ProposalType {
// 	id: string;
// 	description: string;
// 	options: Object[];
// 	projectId: string;
// 	projectImage: string;
// 	projectName: string;
// 	projectTicker: string;
// 	question: string;
// 	title: string;
// 	// votes?: Object[];
// 	votingCloseTimestamp: number;
// }

export interface UserContributionType {
	id: string;
	amount: number;
	contributionTimestamp: number;
	projectId: string;
}

export interface TokenType {
	id: string;
	name: string;
	projectId: string;
	ticker: string;
	tokenPrice: number;
}

enum BenefitType {
	TOKENOMICS,
	RAISENOMICS,
}

export interface Beneficiary {
	name?: string;
	address: string;
	percentage: number;
	benefit: "TOKENOMICS" | "RAISENOMICS" | "ROYALTY";
	vestingFrequency?: number;
	vestingLength?: number;
	cliff?: number;
}

export {};
declare global {
	interface Window {
		ethereum: any;
	}
}
