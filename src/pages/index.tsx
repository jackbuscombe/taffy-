import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/outline";
import ProjectCard from "../components/ProjectCard";
import Link from "next/link";
import { trpc } from "../utils/trpc";
import { Pulsar } from "@uiball/loaders";
import { useState } from "react";

const Home: NextPage = () => {
	const { data: projects, isFetching: fetchingProjects } = trpc.useQuery(["project.getSomeProjects", { amount: 6, status: "all", tags: [] }]);
	const [trendingProjectsPage, setTrendingProjectsPage] = useState<number>(1);
	const [upcomingNftDropsPage, setUpcomingNftDropsPage] = useState<number>(1);
	const router = useRouter();
	return (
		<div className="bg-[#f3f6fc]">
			<Head>
				<title>Taffy</title>
				<meta name="description" content="Taffy" />
				<meta property="og:image" content="/home_banner.png" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<main className="">
				{/* Banner */}
				<div className="flex flex-col w-full py-8 md:py-16 bg-cover text-white bg-[url('/home_banner.png')] justify-center mb-12">
					<div className="flex flex-col space-y-6 w-full p-10 lg:p-0 lg:w-3/4 self-center">
						<h2 className="text-5xl font-semibold leading-snug md:w-1/2">Give NFT projects wings</h2>
						<h3>Sticky fundraising. Fair distribution. Smart liquidity.</h3>
						<Link href={"/projects"}>
							<a className="bg-[#5082fb] p-3 rounded-md flex-grow-0 text-center w-36">View all</a>
						</Link>
					</div>
				</div>

				{/* Home Grid Layer */}

				{/* Trending Projects */}
				<div className="w-full pb-12 flex flex-col">
					{/* Title */}
					<div className="w-3/4 self-center flex justify-between mb-8 flex-wrap">
						<h4 className="text-black text-2xl font-bold mb-2 sm:mb-0">Trending projects</h4>
						<div className="flex space-x-2">
							<button
								disabled={trendingProjectsPage === 1}
								onClick={() => {
									setTrendingProjectsPage(1);
								}}
								className="w-8 h-8 flex bg-transparent hover:bg-gray-500 text-gray-500 font-semibold hover:text-white border border-gray-400 hover:border-transparent rounded justify-center items-center disabled:cursor-not-allowed disabled:hover:bg-transparent"
							>
								<ChevronLeftIcon className="h-4 w-4" />
							</button>
							<button
								disabled={trendingProjectsPage === 2}
								onClick={() => {
									setTrendingProjectsPage(2);
								}}
								className="w-8 h-8 flex bg-transparent hover:bg-gray-500 text-gray-500 font-semibold hover:text-white border border-gray-400 hover:border-transparent rounded justify-center items-center disabled:cursor-not-allowed disabled:hover:bg-transparent"
							>
								<ChevronRightIcon className="h-4 w-4" />
							</button>
							<button onClick={() => router.push("/projects")} className="w-20 h-8 bg-transparent hover:bg-gray-500 text-gray-500 font-semibold hover:text-white border border-gray-400 hover:border-transparent rounded text-sm">
								View All
							</button>
						</div>
					</div>

					{/* Cards */}
					<div className="w-3/4 self-center grid grid-cols-1 lg:grid-cols-3 gap-4">
						{projects ? (
							projects.slice(trendingProjectsPage === 1 ? 0 : 3, trendingProjectsPage === 1 ? 3 : 6).map((project, i: number) => <ProjectCard key={project.id} projectId={project.id} projectName={project.name} projectTicker={project.ticker} bannerImage={project.bannerImage} description={project.description} creatorName={project.creator.name} projectImage={project.image} backers={project._count.contributions} followers={project._count.followers} endDate={project.raiseEndTimestamp} raiseTokenAddress={project.raiseTokenAddress} amountRaised={project.amountRaised} target={project.target} amountStaked={project.amountStaked} nftDrop={false} />)
						) : (
							<div className="w-full col-span-1 lg:col-span-3 flex justify-center pt-12">
								<Pulsar size={40} speed={1.75} color="#21c275" />
							</div>
						)}
					</div>
				</div>

				{/* Upcoming NFT Drops */}
				<div className="w-full pb-12 flex flex-col">
					{/* Title */}
					<div className="w-3/4 self-center flex justify-between mb-8 flex-wrap">
						<h4 className="text-black text-2xl font-bold mb-2 sm:mb-0">Upcoming NFT drops</h4>
						<div className="flex space-x-2">
							<button
								disabled={upcomingNftDropsPage === 1}
								onClick={() => {
									setUpcomingNftDropsPage(1);
								}}
								className="w-8 h-8 flex bg-transparent hover:bg-gray-500 text-gray-500 font-semibold hover:text-white border border-gray-400 hover:border-transparent rounded justify-center items-center disabled:cursor-not-allowed disabled:hover:bg-transparent"
							>
								<ChevronLeftIcon className="h-4 w-4" />
							</button>
							<button
								disabled={upcomingNftDropsPage === 2}
								onClick={() => {
									setUpcomingNftDropsPage(2);
								}}
								className="w-8 h-8 flex bg-transparent hover:bg-gray-500 text-gray-500 font-semibold hover:text-white border border-gray-400 hover:border-transparent rounded justify-center items-center disabled:cursor-not-allowed disabled:hover:bg-transparent"
							>
								<ChevronRightIcon className="h-4 w-4" />
							</button>
							<button onClick={() => router.push("/nfts")} className="w-20 h-8 bg-transparent hover:bg-gray-500 text-gray-500 font-semibold hover:text-white border border-gray-400 hover:border-transparent rounded text-sm">
								View All
							</button>
						</div>
					</div>

					{/* Cards */}
					<div className="w-3/4 self-center grid grid-cols-1 lg:grid-cols-3 gap-4">
						{projects ? (
							projects.slice(upcomingNftDropsPage === 1 ? 0 : 3, upcomingNftDropsPage === 1 ? 3 : 6).map((project, i: number) => <ProjectCard key={project.id} projectId={project.id} projectName={project.name} projectTicker={project.ticker} bannerImage={project.bannerImage} description={project.description} creatorName={project.creator.name} projectImage={project.image} backers={project._count.contributions} followers={project._count.followers} endDate={project.raiseEndTimestamp} raiseTokenAddress={project.raiseTokenAddress} amountRaised={project.amountRaised} target={project.target} amountStaked={project.amountStaked} nftDrop={true} />)
						) : (
							<div className="w-full col-span-1 lg:col-span-3 flex justify-center pt-12">
								<Pulsar size={40} speed={1.75} color="#21c275" />
							</div>
						)}
					</div>
				</div>
			</main>
		</div>
	);
};

export default Home;
