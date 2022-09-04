import { PlusIcon } from "@heroicons/react/solid";
import { Nft } from "@prisma/client";
import { Pulsar } from "@uiball/loaders";
import { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useToken } from "wagmi";
import NftCard from "../../components/NftCard";
import VotingCard from "../../components/VotingCard";
import secondsToDhms from "../../hooks/secondsToDhms";
import unixToDateTime from "../../hooks/unixToDateTime";
import { trpc } from "../../utils/trpc";
import { authOptions } from "../api/auth/[...nextauth]";

function Admin({ id }: { id: string }) {
	const { data: session, status } = useSession();
	const router = useRouter();
	const { data: project, isFetching: fetchingProject } = trpc.useQuery(["project.getSpecificProject", { id: id }]);
	const [selected, setSelected] = useState<string>("nfts");
	const [upcomingNftArray, setUpcomingNftArray] = useState<any>([]);
	const [releasedNftArray, setReleasedNftArray] = useState<any>([]);
	const [timeLeft, setTimeLeft] = useState<string>("");
	const {
		data: raiseTokenData,
		isError,
		isLoading,
	} = useToken({
		address: project?.raiseTokenAddress,
		enabled: !!project?.raiseTokenAddress,
	});

	useEffect(() => {
		if (!project) return;

		setTimeout(() => {
			setTimeLeft(secondsToDhms(project.raiseEndTimestamp - Math.floor(Date.now() / 1000)));
		}, 1000);
	}, [project]);

	useEffect(() => {
		if (!session || !project) {
			return;
		}

		async function getNfts() {
			if (!project) return;
			// Get Project NFTS
			const upcomingNfts: Nft[] = [];
			const releasedNfts: Nft[] = [];
			for (let i = 0; i < project.nfts.length; i++) {
				if ((project.nfts[i] as Nft).mintTimestamp > Math.floor(Date.now() / 1000)) {
					upcomingNfts.push(project.nfts[i] as Nft);
				} else if ((project.nfts[i] as Nft).mintTimestamp > Math.floor(Date.now() / 1000)) {
					releasedNfts.push(project.nfts[i] as Nft);
				}
			}

			setUpcomingNftArray(upcomingNfts);
			setReleasedNftArray(releasedNfts);
		}

		getNfts();
	}, [project]);

	return !project ? (
		<div className="w-full flex justify-center pt-12">
			<Pulsar size={40} speed={1.75} color="#21c275" />
		</div>
	) : (
		<main className="w-full flex flex-col items-center bg-gray-50">
			{/* <div className="flex flex-col w-full py-8 md:py-16 bg-auto text-white bg-[url('/admin_hero.png')] justify-center mb-8"></div> */}
			<img src={project.bannerImage} alt="" className="w-full" />

			<div className="w-3/4 space-y-12 py-8">
				<div className="flex flex-col md:grid grid-cols-8 gap-4 text-center bg-white p-4 rounded-lg shadow-md">
					<div className="col-span-2 flex flex-col text-center items-center sm:justify-center sm:flex-row justify-center sm:space-x-4">
						<img src={project.image} alt="" className="h-16 w-16 rounded-full" />
						<div className="">
							<Link href={`/project/${id}`}>
								<a className="text-lg font-semibold hover:underline cursor-pointer">{project.name}</a>
							</Link>
							<p className="text-gray-400 font-light">{project.ticker.toUpperCase()}</p>
						</div>
					</div>
					<div className="flex flex-col justify-center col-span-3 lg:col-span-2">
						<p className="text-lg font-semibold">{timeLeft}</p>
						<p className="text-sm text-gray-400">Next NFT Drop</p>
					</div>
					<div className="flex justify-center space-x-4 md:col-span-2">
						<div className="flex flex-col col-span-1 justify-center">
							<p className="text-lg font-semibold">{10} ETH</p>
							<p className="text-sm text-gray-400">Token Price</p>
						</div>
						<div className="flex flex-col col-span-1 justify-center">
							<p className="text-lg font-semibold">{project.amountStaked}</p>
							<p className="text-sm text-gray-400">{project.ticker.toUpperCase()} Staked</p>
						</div>
					</div>
					<div className="hidden lg:flex flex-col lg:col-span-1 justify-center space-y-2">
						<button className="w-32 py-1 border-[1px] rounded-md border-[#21c275] text-[#21c275] font-semibold hover:bg-[#21c275] hover:text-white">Buy {project.ticker.toUpperCase()}</button>
						<button className="w-32 py-1 border-[1px] rounded-md border-[#5082fb] text-[#5082fb] font-semibold hover:bg-[#5082fb] hover:text-white">Stake {project.ticker.toUpperCase()}</button>
					</div>
				</div>

				<div className="flex flex-col-reverse sm:flex-row gap-2 justify-between pb-6 border-b-[1px] border-gray-200">
					<div className="flex flex-col sm:flex-row sm:space-x-4 items-start justify-center sm:items-center sm:justify-start">
						<p onClick={() => setSelected("nfts")} className={`font-semibold ${selected == "nfts" ? "text-[#5082fb] cursor-default" : "text-gray-500 cursor-pointer"}`}>
							NFTs
						</p>
						<p onClick={() => setSelected("votes")} className={`font-semibold ${selected == "votes" ? "text-[#5082fb] cursor-default" : "text-gray-500 cursor-pointer"}`}>
							Votes
						</p>
						<p onClick={() => setSelected("tokenomics")} className={`font-semibold ${selected == "tokenomics" ? "text-[#5082fb] cursor-default" : "text-gray-500 cursor-pointer"}`}>
							Tokenomics
						</p>
						<p onClick={() => setSelected("about")} className={`font-semibold ${selected == "about" ? "text-[#5082fb] cursor-default" : "text-gray-500 cursor-pointer"}`}>
							About
						</p>
					</div>
					<div className="flex mb-4 sm:mb-0 sm:justify-end space-x-6 items-center">
						<p className="text-red-500 font-semibold">ADMIN MODE</p>
						<button
							onClick={() =>
								router.push({
									pathname: "/mint",
									query: {
										id: id,
										projectName: project.name,
										projectImage: project.image,
									},
								})
							}
							className="hidden sm:flex items-center bg-green-500 text-white px-4 py-2 rounded-sm font-semibold hover:bg-transparent border-[1px] hover:text-green-500 border-green-500 transition transform ease-in-out"
						>
							<PlusIcon className="h-3 w-3 mr-2" />
							Mint NFT
						</button>
					</div>
				</div>

				{selected === "nfts" ? (
					<div>
						<div
							onClick={() =>
								router.push({
									pathname: "/mint",
									query: {
										id: id,
										projectName: project.name,
										projectImage: project.image,
									},
								})
							}
							className="w-1/3 flex flex-col md:flex-row text-center justify-center items-center space-x-2 bg-white rounded-sm p-12 shadow cursor-pointer hover:bg-gray-100 hover:shadow-lg mb-6"
						>
							<PlusIcon className="text-blue-500 h-10 w-10" />
							<p className="text-gray-700 text-lg font-semibold">Mint NFT</p>
						</div>
						<div className="mb-12">
							<h2 className="text-2xl text-gray-800 font-bold mb-5">NFTs queued for minting</h2>
							<div className="grid grid-cols-5 gap-4">
								{upcomingNftArray.map((nft: Nft, i: number) => (
									<NftCard key={nft.id} id={nft.id} nftUrl={nft.nftUrl} nftName={nft.name} projectName={project.name} />
								))}
								{upcomingNftArray?.length === 0 && <p className="col-span-5 text-center text-gray-500 italic font-light">No NFTs have been released yet.</p>}
							</div>
						</div>
						<div className="">
							<h2 className="text-2xl text-gray-800 font-bold mb-5">Already Released</h2>
							<div className="grid grid-cols-5 gap-4">
								{releasedNftArray.map((nft: Nft, i: number) => (
									<NftCard key={nft.id} id={nft.id} nftUrl={nft.nftUrl} nftName={nft.name} projectName={project.name} />
								))}
								{releasedNftArray?.length === 0 && <p className="col-span-5 text-center text-gray-500 italic font-light">No NFTs have been released yet.</p>}
							</div>
						</div>
					</div>
				) : selected === "votes" ? (
					<div className="flex flex-col w-full rounded-md">
						<div
							onClick={() =>
								router.push({
									pathname: "/create-proposal",
									query: {
										id: id,
										projectName: project.name,
										projectImage: project.image,
										projectTicker: project.ticker,
									},
								})
							}
							className="w-full md:w-1/3 flex flex-col md:flex-row text-center justify-center items-center space-x-2 bg-white rounded-sm p-12 shadow cursor-pointer hover:bg-gray-100 hover:shadow-lg mb-6"
						>
							<PlusIcon className="text-blue-500 h-10 w-10" />
							<p className="text-gray-700 text-lg font-semibold">Create Proposal</p>
						</div>
						{project.proposals && project.proposals.length > 0 && (
							<>
								<h2 className="text-2xl text-gray-800 font-bold mb-5">Active Proposals</h2>
								{project.proposals.map((proposal, i: number) => (
									<VotingCard key={proposal.id} proposalId={proposal.id} title={proposal.title} description={proposal.description ?? ""} question={proposal.question} options={proposal.options} projectId={proposal.projectId} projectName={project.name} projectTicker={project.ticker} projectImage={project.image} timeLeft={unixToDateTime(proposal.votingCloseTimestamp, "local")} />
								))}
							</>
						)}
					</div>
				) : selected === "tokenomics" ? (
					<div className="flex flex-col w-full bg-white rounded-md p-4 divide-y">
						<div className="">
							<h2 className="text-2xl text-gray-800 font-bold mb-5">Tokenomics</h2>
							<div className="flex flex-col md:flex-row space-x-4 py-4">
								<p className="font-semibold">End Date:</p>
								<p>{new Date(project.raiseEndTimestamp * 1000).toUTCString()}</p>
							</div>
						</div>

						<div className="flex flex-col md:flex-row space-x-4 py-4">
							<p className="font-semibold">Amount Raised:</p>
							<p>
								{project.amountRaised} {raiseTokenData?.symbol.toUpperCase()}
							</p>
						</div>

						<div className="flex flex-col md:flex-row space-x-4 py-4">
							<p className="font-semibold">Target:</p>
							<p>
								{project.target} {raiseTokenData?.symbol.toUpperCase()}
							</p>
						</div>

						<div className="flex flex-col md:flex-row space-x-4 py-4">
							<p className="font-semibold">Time Left:</p>
							<p>{unixToDateTime(project.raiseEndTimestamp, "local")}</p>
						</div>

						<div className="flex flex-col md:flex-row space-x-4 py-4">
							<p className="font-semibold">Token Price:</p>
							<p>{10} ETH</p>
						</div>

						<div className="flex flex-col md:flex-row space-x-4 py-4">
							<p className="font-semibold">Amount Staked:</p>
							<p>
								{project.amountStaked} {project.ticker.toUpperCase()}
							</p>
						</div>
					</div>
				) : selected === "about" ? (
					<div className="flex flex-col w-full bg-white rounded-md p-4 divide-y">
						<div>
							<h2 className="text-2xl text-gray-800 font-bold mb-5">About</h2>
							<div className="flex flex-col md:flex-row space-x-4 py-4">
								<p className="font-semibold">Project Name:</p>
								<p>{project.name}</p>
							</div>
						</div>

						<div className="flex flex-col md:flex-row space-x-4 py-4">
							<p className="font-semibold">Project Ticker:</p>
							<p>{project.ticker.toUpperCase()}</p>
						</div>

						<div className="flex flex-col md:flex-row space-x-4 py-4">
							<p className="font-semibold">Project Description:</p>
							<p>{project.description}</p>
						</div>

						<div className="flex flex-col md:flex-row space-x-4 py-4">
							<p className="font-semibold">Views:</p>
							<p>{project.views}</p>
						</div>

						<div className="flex flex-col md:flex-row space-x-4 py-4">
							<p className="font-semibold">Backers:</p>
							<p>{project._count.contributions}</p>
						</div>

						<div className="flex flex-col md:flex-row space-x-4 py-4">
							<p className="font-semibold">Followers:</p>
							<p>{project._count.followers}</p>
						</div>
					</div>
				) : (
					<div className="flex flex-col w-full bg-white rounded-md p-4 divide-y">
						<div>
							<h2 className="text-2xl text-gray-800 font-bold mb-5">About</h2>
							<div className="flex flex-col md:flex-row space-x-4 py-4">
								<p className="font-semibold">Project Name:</p>
								<p>{project.name}</p>
							</div>
						</div>

						<div className="flex flex-col md:flex-row space-x-4 py-4">
							<p className="font-semibold">Project Ticker:</p>
							<p>{project.ticker.toUpperCase()}</p>
						</div>

						<div className="flex flex-col md:flex-row space-x-4 py-4">
							<p className="font-semibold">Project Description:</p>
							<p>{project.description}</p>
						</div>

						<div className="fflex flex-col md:flex-rowlex space-x-4 py-4">
							<p className="font-semibold">Views:</p>
							<p>{project.views}</p>
						</div>

						<div className="flex flex-col md:flex-row space-x-4 py-4">
							<p className="font-semibold">Backers:</p>
							<p>{project._count.contributions}</p>
						</div>

						<div className="flex flex-col md:flex-row space-x-4 py-4">
							<p className="font-semibold">Followers:</p>
							<p>{project._count.followers}</p>
						</div>
					</div>
				)}
			</div>
		</main>
	);
}
export default Admin;

export const getServerSideProps: GetServerSideProps = async (context) => {
	const id = context.params?.id;
	const session = await unstable_getServerSession(context.req, context.res, authOptions);

	if (!session || !id) {
		return {
			redirect: {
				destination: "/",
				permanent: false,
			},
		};
	}

	return {
		props: {
			session,
			id,
		},
	};
};
