import { useEffect, useState } from "react";
import ProjectCard from "../../components/ProjectCard";
import NftCardExtended from "../../components/NftCardExtended";
import { NftType, UserType } from "../../types/typings";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { trpc } from "../../utils/trpc";
import { Pulsar } from "@uiball/loaders";

export type ProfilePageType = {
	userDetails: UserType;
	contributions: ContributionType[];
	nftArray: NftType[];
	projectsCreated: any[];
};

export type ContributionType = {
	id: string;
	amount: number;
	contributionTimestamp: number;
	projectId: string;
	projectName: string;
	projectImage: string;
	projectBannerImage: string;
	projectDescription: string;
	projectTicker: string;
	creatorName: string;
	backers: number;
	followers: number;
	endDate: number;
	ethRaise: number;
	target: number;
	amountStaked: number;
	nftDrop: boolean;
};

function Profile({ id }: { id: string } /*{ userDetails, contributions, nftArray, projectsCreated }: ProfilePageType*/) {
	const { data: session, status } = useSession();
	const { data: user, isFetching: fetchingUser } = trpc.useQuery(["user.getSpecificUser", { id: id }]);
	const [backedToggle, setBackedToggle] = useState(true);
	const router = useRouter();

	return !user ? (
		<div className="w-full h-screen flex flex-col justify-center items-center pt-12">
			<h2 className="text-lg font-semibold">Loading Profile...</h2>
			<br />
			<Pulsar size={40} speed={1.75} color="#21c275" />
		</div>
	) : (
		<main className="flex flex-col items-center w-full">
			{/* <div className="flex flex-col w-full py-32 bg-cover text-white bg-blend-darken bg-[url('/profile_hero.png')] justify-center mb-12"> */}

			<div className="bg-gradient-to-b from-slate-600 to-black h-32 w-full relative flex flex-col py-8 sm:py-32 text-white bg-blend-darken justify-center mb-12">
				<img src="/profile_hero.png" alt="" className="w-full h-full object-cover absolute mix-blend-overlay" />
			</div>
			{/* <div className="flex flex-col w-full py-32 bg-cover text-white bg-blend-darken bg-[url('/profile_hero.png')] justify-center mb-12" /> */}

			<div className="w-2/3 flex flex-col sm:flex-row text-center sm:text-left justify-between items-center -m-40 z-10">
				<div className="w-full flex flex-col items-center sm:flex-row space-x-4">
					<div className="bg-gray-100 h-[60px] w-[60px] sm:h-[130px] sm:w-[130px] rounded-full flex justify-center items-center mb-4 sm:mb-0">
						<img src={user.image} alt="" className="h-[58px] w-[58px] sm:h-[127px] sm:w-[127px] object-cover rounded-full" />
					</div>
					<div className="bg-gray-100 w-3/4 sm:bg-transparent p-2 sm:p-0 rounded-md shadow flex flex-col justify-center space-y-2">
						<h1 className="text-black sm:text-white font-bold text-xl">{user.name}</h1>
						<p className="text-black sm:text-white truncate">{user.id}</p>
					</div>
				</div>
				{user.id == session?.user?.id && (
					<button onClick={() => router.push("/settings")} className="bg-transparent text-white font-semibold rounded-sm border-[1px] border-white px-4 py-1 hover:bg-black transition transform ease-in-out">
						Edit profile
					</button>
				)}
			</div>

			<div className="flex flex-col items-center w-2/3 mb-4 mt-44 space-y-4 border-b-[1px] border-b-gray-300">
				<div className="flex self-start space-x-4 py-4">
					<div className={`px-4 py-2 ${backedToggle ? "bg-[#5082fb]" : "bg-transparent"}`}>
						<p onClick={() => setBackedToggle(true)} className={`${backedToggle ? "text-white font-bold cursor-default" : "text-gray-500 font-semibold cursor-pointer"}`}>
							Projects
						</p>
					</div>
					{user.nfts.length > 0 && (
						<div className={`px-4 py-2 ${!backedToggle ? "bg-[#5082fb]" : "bg-transparent"}`}>
							<p onClick={() => setBackedToggle(false)} className={`${!backedToggle ? "text-white font-bold cursor-default" : "text-gray-500 font-semibold cursor-pointer"}`}>
								NFTs
							</p>
						</div>
					)}
				</div>
			</div>

			{/* Cards */}
			{backedToggle ? (
				<div className="flex flex-col w-2/3 my-4 space-y-12">
					{user.projects.length > 0 && (
						<div className="flex flex-col space-y-4">
							<h2 className="text-xl font-semibold">Projects Created</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full justify-between my-4">
								{user.projects.map((project, i) => (
									<ProjectCard key={project.id} projectId={project.id} projectName={project.name} projectTicker={project.ticker} bannerImage={project.bannerImage} description={project.description} raiseTokenAddress={project.raiseTokenAddress} creatorName={user.name} projectImage={project.image} backers={project._count.contributions} followers={project._count.followers} endDate={project.raiseEndTimestamp} amountRaised={project.amountRaised} target={project.target} amountStaked={project.amountStaked} nftDrop={false} />
								))}
							</div>
						</div>
					)}
					{user.contributions.length > 0 && (
						<div className="flex flex-col space-y-4">
							<h2 className="text-xl font-semibold">Projects Backed</h2>
							<div className="grid grid-cols-3 gap-3 space-x-6 justify-between">
								{user.contributions.map((contribution, i: number) => (
									<ProjectCard key={contribution.Project.id} projectId={contribution.Project.id} projectName={contribution.Project.name} projectTicker={contribution.Project.ticker} bannerImage={contribution.Project.bannerImage} description={contribution.Project.description} raiseTokenAddress={contribution.Project.raiseTokenAddress} creatorName={contribution.Project.creator.name} projectImage={contribution.Project.image} backers={contribution.Project._count.contributions} followers={contribution.Project._count.followers} endDate={contribution.Project.raiseEndTimestamp} amountRaised={contribution.Project.amountRaised} target={contribution.Project.target} amountStaked={contribution.Project.amountStaked} nftDrop={true} />
								))}
							</div>
						</div>
					)}
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-2/3 justify-evenly my-4">{user.nfts.length > 0 && user.nfts.map((nft, i: number) => <NftCardExtended key={nft.id} id={nft.id} nftUrl={nft.nftUrl} nftName={nft.name} projectName={nft.project?.name ?? nft.name} price={10} creatorImage={nft.creator.image} creatorName={nft.creator.name} />)}</div>
			)}
		</main>
	);
}
export default Profile;

export async function getServerSideProps(context: any) {
	const id = context.params.id;

	return {
		props: {
			id,
		},
	};
	// let contributions: ContributionType[] = [];
	// let nftArray: NftType[] = [];

	// const userRef = doc(db, "users", id);
	// const userSnap = await getDoc(userRef);
	// let userDetails: UserType = {
	// 	id: context.params.id,
	// 	bio: "",
	// 	firstName: "",
	// 	lastName: "",
	// 	profileImage: "",
	// 	userCreatedTimestamp: 0,
	// };

	// if (userSnap.exists()) {
	// 	userDetails = {
	// 		id: context.params.id,
	// 		bio: userSnap.data().bio,
	// 		firstName: userSnap.data().firstName,
	// 		lastName: userSnap.data().lastName,
	// 		profileImage: userSnap.data().profileImage,
	// 		userCreatedTimestamp: userSnap.data().userCreatedTimestamp,
	// 	};
	// } else {
	// 	return {
	// 		redirect: {
	// 			destination: "/",
	// 			permanent: false,
	// 		},
	// 	};
	// }

	// // Get Projects Backed
	// let projectId: string = "";
	// let projectName = "";
	// let projectImage = "";
	// let projectBannerImage = "";
	// let projectDescription = "";
	// let projectTicker = "";
	// let creatorName = "";
	// let backers = 1;
	// let followers = 1;
	// let endDate = 1;
	// let ethRaise = 1;
	// let target = 1;
	// let amountStaked = 0;
	// let nftDrop = true;

	// const contributionQuery = query(collection(db, "users", id, "contributions"), orderBy("contributionTimestamp", "desc"), limit(3));
	// const contributionQuerySnapshot = await getDocs(contributionQuery);

	// for (const contribution of contributionQuerySnapshot.docs) {
	// 	// Get Project Details
	// 	const docSnap = await getDoc(doc(db, "projects", contribution.data().projectId));

	// 	if (docSnap.exists()) {
	// 		projectId = docSnap.id;
	// 		amountStaked = docSnap.data().amountStaked;
	// 		projectName = docSnap.data().projectName;
	// 		projectImage = docSnap.data().projectImage;
	// 		projectBannerImage = docSnap.data().bannerImage;
	// 		projectDescription = docSnap.data().projectDescription;
	// 		projectTicker = docSnap.data().projectTicker;
	// 		creatorName = docSnap.data().creatorName;
	// 		backers = docSnap.data().contributionsCount;
	// 		followers = docSnap.data().followersCount;
	// 		endDate = docSnap.data().endDate;
	// 		ethRaise = docSnap.data().contributionsValue;
	// 		target = docSnap.data().target;
	// 		nftDrop = true;
	// 	} else {
	// 		console.log("No such document!");
	// 	}
	// 	contributions.push({
	// 		id: contribution.id,
	// 		amount: contribution.data().amount,
	// 		contributionTimestamp: contribution.data().contributionTimestamp,
	// 		projectId: contribution.data().projectId,
	// 		projectName,
	// 		projectImage,
	// 		projectBannerImage,
	// 		projectDescription,
	// 		projectTicker,
	// 		creatorName,
	// 		backers,
	// 		followers,
	// 		endDate,
	// 		ethRaise,
	// 		target,
	// 		amountStaked,
	// 		nftDrop,
	// 	});
	// }

	// const nftQuery = query(collection(db, "nfts"), where("creatorAddress", "==", id));

	// const nftQuerySnapshot = await getDocs(nftQuery);
	// nftQuerySnapshot.forEach((nft) => {
	// 	nftArray.push({
	// 		id: nft.id,
	// 		chain: nft.data().chain,
	// 		contractAddress: nft.data().contractAddress,
	// 		createdTimestamp: nft.data().createdTimestamp,
	// 		creatorAddress: nft.data().creatorAddress,
	// 		creatorImage: nft.data().creatorImage,
	// 		creatorName: nft.data().creatorName,
	// 		description: nft.data().description,
	// 		mintTimestamp: nft.data().mintTimestamp,
	// 		name: nft.data().name,
	// 		nftUrl: nft.data().nftUrl,
	// 		price: nft.data().price,
	// 		projectId: nft.data().projectId,
	// 		projectName: nft.data().projectName,
	// 		tokenId: nft.data().tokenId,
	// 		tokenStandard: nft.data().tokenStandard,
	// 		traits: nft.data().traits,
	// 		views: nft.data().views,
	// 	});
	// });
	// console.log(nftArray);

	// // Projects Created
	// let projectsCreated: any[] = [];
	// const projectCreatorQuery = query(collection(db, "projects"), where("creatorAddress", "==", id));
	// const projectCreatorSnapshot = await getDocs(projectCreatorQuery);
	// projectCreatorSnapshot.forEach((doc) => {
	// 	projectsCreated.push({
	// 		id: doc.id,
	// 		...doc.data(),
	// 	});
	// });

	// return {
	// 	props: {
	// 		userDetails,
	// 		contributions,
	// 		nftArray,
	// 		projectsCreated,
	// 	},
	// };
}
