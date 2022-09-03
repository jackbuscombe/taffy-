import FilterBar from "../components/FilterBar";
import ProjectCard from "../components/ProjectCard";
import NftCard from "../components/NftCard";
import dateToUnix from "../hooks/dateToUnix";
import Nfts from "./nfts";
import { useEffect, useState } from "react";
import unixToDateTime from "../hooks/unixToDateTime";
import { trpc } from "../utils/trpc";
import { Project } from "@prisma/client";
import { Pulsar } from "@uiball/loaders";

function Projects(/*{ projects, nfts }: ProjectsPage*/) {
	const { data: projects, isFetching: fetchingProjects } = trpc.useQuery(["project.getSomeProjects", { amount: 12 }]);
	const [status, setStatus] = useState("all");
	const [categories, setCategories] = useState([]);
	const [sortBy, setSortBy] = useState("time");

	useEffect(() => {
		const queryProjects = async () => {
			// DO a query with different sorting here based on the sidebar filters
			// let projectsArray = trpc
			// const projectQuery = query(collection(db, "projects"), orderBy(`${sortBy === "time" ? "createdTimestamp" : sortBy === "backers" ? "backers" : sortBy === "raised" ? "raised" : sortBy === "followers" ? "followersCounts" : "createdTimestamp"}`, "desc"), limit(20));
			// const projectQuerySnapshot = await getDocs(projectQuery);
			// // projectQuerySnapshot.forEach((doc) => {
			// // 	projects.push({
			// // 		id: doc.id,
			// // 		amountStaked: doc.data().amountStaked,
			// // 		bannerImage: doc.data().bannerImage,
			// // 		contributions: doc.data().contributions,
			// // 		contributionsCount: doc.data().contributionsCount,
			// // 		contributionsValue: doc.data().contributionsValue,
			// // 		createdTimestamp: doc.data().createdTimestamp,
			// // 		creatorAddress: doc.data().creatorAddress,
			// // 		creatorName: doc.data().creatorName,
			// // 		discord: doc.data().discord,
			// // 		endDate: doc.data().endDate,
			// // 		followers: doc.data().followers,
			// // 		followersCount: doc.data().followersCount,
			// // 		linkedIn: doc.data().linkedIn,
			// // 		projectDescription: doc.data().projectDescription,
			// // 		projectImage: doc.data().projectImage,
			// // 		projectName: doc.data().projectName,
			// // 		projectTicker: doc.data().projectTicker,
			// // 		tags: doc.data().tags,
			// // 		target: doc.data().target,
			// // 		telegram: doc.data().telegram,
			// // 		tokenId: doc.data().tokenId,
			// // 		tokenPrice: doc.data().tokenPrice,
			// // 		twitter: doc.data().twitter,
			// // 		views: doc.data().views,
			// // 	});
			// // });
			// setUpdatedProjects(projectsArray);
		};

		queryProjects();
	}, [categories]);
	return (
		<div className="w-full flex flex-col items-center bg-[#f3f6fc] py-12">
			<div className="w-4/5 ">
				<h1 className="text-black text-4xl font-bold mb-8">Projects</h1>
				<div className="grid gap-5 grid-cols-5">
					<div className="sm:block col-span-5 sm:col-span-2 md:col-span-1">
						<FilterBar filterName="Projects" status={status} setStatus={setStatus} categories={categories} setCategories={setCategories} sortBy={sortBy} setSortBy={setSortBy} />
					</div>

					{/* Main */}
					<div className="col-span-5 sm:col-span-3 md:col-span-4">
						{!projects ? (
							<div className="w-full flex justify-center pt-12">
								<Pulsar size={40} speed={1.75} color="#21c275" />
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{projects.map((project, i: number) => (
									<ProjectCard key={project.id} projectId={project.id} projectName={project.name} projectTicker={project.ticker} projectImage={project.image} description={project.description} creatorName={project.creator.name} bannerImage={project.bannerImage} backers={project._count.contributions} followers={project._count.followers} endDate={project.raiseEndTimestamp} raiseTokenAddress={project.raiseTokenAddress} amountRaised={10} target={project.target} amountStaked={project.stakes.length} nftDrop={false} />
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
export default Projects;

// export async function getServerSideProps() {
// 	let projects: ProjectType[] = [];
// 	const projectQuery = query(collection(db, "projects"), orderBy("createdTimestamp", "desc"), limit(20));
// 	const projectQuerySnapshot = await getDocs(projectQuery);
// 	projectQuerySnapshot.forEach((doc) => {
// 		projects.push({
// 			id: doc.id,
// 			amountStaked: doc.data().amountStaked,
// 			bannerImage: doc.data().bannerImage,
// 			contributions: doc.data().contributions,
// 			contributionsCount: doc.data().contributionsCount,
// 			contributionsValue: doc.data().contributionsValue,
// 			createdTimestamp: doc.data().createdTimestamp,
// 			creatorAddress: doc.data().creatorAddress,
// 			creatorName: doc.data().creatorName,
// 			discord: doc.data().discord,
// 			endDate: doc.data().endDate,
// 			followers: doc.data().followers,
// 			followersCount: doc.data().followersCount,
// 			linkedIn: doc.data().linkedIn,
// 			projectDescription: doc.data().projectDescription,
// 			projectImage: doc.data().projectImage,
// 			projectName: doc.data().projectName,
// 			projectTicker: doc.data().projectTicker,
// 			tags: doc.data().tags,
// 			target: doc.data().target,
// 			telegram: doc.data().telegram,
// 			tokenId: doc.data().tokenId,
// 			tokenPrice: doc.data().tokenPrice,
// 			twitter: doc.data().twitter,
// 			views: doc.data().views,
// 		});
// 	});

// 	// let nfts: NftType[] = [];
// 	// const nftQuery = query(collection(db, "nfts"), orderBy("createdTimestamp", "desc"), limit(20));
// 	// const nftQuerySnapshot = await getDocs(nftQuery);
// 	nftQuerySnapshot.forEach((doc) => {
// 		nfts.push({
// 			id: doc.id,
// 			chain: doc.data().chain,
// 			contractAddress: doc.data().contractAddress,
// 			createdTimestamp: doc.data().createdTimestamp,
// 			creatorFees: doc.data().creatorFees,
// 			creatorAddress: doc.data().creatorAddress,
// 			creatorImage: doc.data().creatorImage,
// 			creatorName: doc.data().creatorName,
// 			description: doc.data().description,
// 			mintTimestamp: doc.data().mintTimestamp,
// 			name: doc.data().name,
// 			nftUrl: doc.data().nftUrl,
// 			price: doc.data().price,
// 			projectId: doc.data().projectId,
// 			projectName: doc.data().projectName,
// 			tokenId: doc.data().tokenId,
// 			tokenStandard: doc.data().tokenStandard,
// 			traits: doc.data().traits,
// 			views: doc.data().views,
// 		});
// 	});

// 	return {
// 		props: {
// 			projects,
// 			nfts,
// 		},
// 	};
// }
