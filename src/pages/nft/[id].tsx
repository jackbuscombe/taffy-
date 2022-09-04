import { ChartBarIcon, CheckIcon, ChevronDownIcon, DotsVerticalIcon, EyeIcon, RefreshIcon, ShareIcon, XIcon } from "@heroicons/react/outline";
// import { Nft } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import EarningsTable from "../../components/EarningsTable";
import NftCardExtended from "../../components/NftCardExtended";
import capitalizeFirstLetter from "../../hooks/capitalizeFirstLetter";
import { NftType } from "../../types/typings";
import { trpc } from "../../utils/trpc";

// function Nft({ id, nftUrl, name, description, createdTimestamp, creatorAddress, creatorName, creatorImage, projectId, projectName, views, price, contractAddress, tokenId, tokenStandard, chain }: NftType) {
function Nft({ id }: { id: string }) {
	const router = useRouter();
	const { data: nft } = trpc.useQuery(["nft.getSpecificNft", { id: id }]);
	const updateViewCount = trpc.useMutation(["nft.incrementView"]);
	const { data: nftCollection } = trpc.useQuery(["nft.getNftsFromCollection", { projectId: nft?.projectId as string }], {
		enabled: !!nft?.projectId,
	});
	const [graphTimeline, setGraphTimeline] = useState<string>("alltime");

	// State for each property
	const [nftUrl, setNftUrl] = useState<string>("");
	const [name, setName] = useState<string>("");
	const [description, setDescription] = useState<string>("");
	const [createdTimestamp, setCreatedTimestamp] = useState<Date>();
	const [creatorAddress, setCreatorAddress] = useState<string>("");
	const [creatorName, setCreatorName] = useState<string>("");
	const [creatorImage, setCreatorImage] = useState<string>("");
	const [projectId, setProjectId] = useState<string>("");
	const [projectName, setProjectName] = useState<string>("");
	const [views, setViews] = useState<number>();
	const [price, setPrice] = useState<number>();
	const [contractAddress, setContractAddress] = useState<string>("");
	const [tokenId, setTokenId] = useState<number>();
	const [tokenStandard, setTokenStandard] = useState<string>("");
	const [chain, setChain] = useState<number>();
	// This should be Replaced with beneficiaries
	// const [creatorFees, setCreatorFees] = useState<number>();

	useEffect(() => {
		if (!nft) return;
		setNftUrl(nft.nftUrl);
		setName(nft.name);
		setDescription(nft.description);
		setCreatedTimestamp(nft.createdTimestamp);
		setCreatorAddress(nft.creatorId);
		setCreatorName(nft.creator.name);
		setCreatorImage(nft.creator.image);
		setProjectId(nft.projectId ?? "");
		setProjectName(nft.project?.name ?? "");
		setViews(nft.views);
		setPrice(10);
		setContractAddress(nft.contractAddress);
		setTokenId(nft.tokenId);
		setTokenStandard("ERC20");
		setChain(nft.chainId);
	}, [nft]);

	// Update View count
	let incrementedView = false;
	useEffect(() => {
		if (incrementedView) return;
		incrementedView = true;
		updateViewCount.mutate({ nftId: id });
	}, [incrementedView]);

	return (
		<main className="flex flex-col items-center space-y-6 bg-blue-50 w-full py-8">
			<div className="w-3/4 justify-center grid sm:grid-cols-2 gap-6 grid-flow-row-dense h-fit">
				{/* Main Image */}
				<div className="flex justify-center">
					<img src={nftUrl} alt={name} className="rounded-md border-4 object-cover border-white shadow col-span-1" />
				</div>

				{/* Main Details */}
				<div className="bg-white p-4 rounded-sm shadow col-span-1">
					<div className="flex justify-between items-center">
						<Link href={`/project/${projectId}`}>
							<a className="text-blue-500 cursor-pointer hover:underline text-sm">{projectName}</a>
						</Link>
						<div className="flex space-x-3">
							<button className="border-[1px] border-gray-300 p-2 hover:bg-gray-100 transition transform ease-in-out">
								<RefreshIcon className="h-3 w-3 text-gray-600" />
							</button>
							<button className="border-[1px] border-gray-300 p-2 hover:bg-gray-100 transition transform ease-in-out">
								<ShareIcon className="h-3 w-3 text-gray-600" />
							</button>
							<button className="border-[1px] border-gray-300 p-2 hover:bg-gray-100 transition transform ease-in-out">
								<DotsVerticalIcon className="h-3 w-3 text-gray-600" />
							</button>
						</div>
					</div>

					<h1 className="text-2xl font-bold w-2/3 mb-4">{name}</h1>

					<div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 items-center sm:space-x-6 border-b-[1px] pb-4">
						<div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 items-center">
							<p className="text-xs text-gray-400 mr-3">Owned By</p>
							<Link href={`/profile/${creatorAddress}`} passHref>
								<div className="group flex items-center">
									<img src={creatorImage} alt={creatorName} className="h-8 w-8 rounded-full mr-1 cursor-pointer object-cover" />
									<a className="text-xs text-gray-700 font-bold cursor-pointer group-hover:underline">{creatorName}</a>
								</div>
							</Link>
						</div>
						<div className="flex items-center text-center space-x-2 text-gray-600">
							<EyeIcon className="h-6 w-6" />
							<p>{`${views ?? ""} ${views === 1 ? "view" : "views"}`}</p>
						</div>
					</div>

					<div className="flex flex-col items-center space-y-2 sm:space-y-0 sm:flex-row justify-between sm:space-x-12 mt-4">
						<div className="flex space-x-2 items-center">
							<p className="text-gray-400 text-sm">Last Price:</p>
							<div className="flex items-center space-x-1">
								<img src="/eth_logo.png" alt={chain?.toString()} className="" />
								<p className="font-semibold text-sm">{price} ETH</p>
							</div>
						</div>
						<button className="flex-1 p-2 border-[1px] rounded-sm border-gray-200 text-[#5082fb] font-semibold hover:bg-[#5082fb] hover:text-white">Make Offer</button>
					</div>
				</div>

				{/* Description Box */}
				<div className="bg-white rounded-sm p-4 text-sm text-gray-500 col-span-1 shadow divide-y-2">
					<div className="pb-4">
						<h2 className="text-lg font-semibold mb-2 text-gray-700">Description</h2>
						<p>
							Created By{" "}
							<Link href={`/project/${projectId}`}>
								<a className="text-blue-500 cursor-pointer hover:underline ml-2">{capitalizeFirstLetter(projectName)}</a>
							</Link>
						</p>
					</div>
					<p className="pt-4">{description}</p>
				</div>

				{/* Price History */}
				<div className="bg-white rounded-sm p-4 text-sm text-gray-500 col-span-1 shadow divide-y-[1px]">
					<div className="flex justify-between">
						<div className="mb-4">
							<h2 className="text-lg font-semibold mb-2 text-gray-700">Price History</h2>
							<p>
								All time avg. price: <span className="font-semibold cursor-pointer hover:underline ml-2">{price} ETH</span>
							</p>
						</div>
						<div className="relative mt-auto mb-3 inline-block group justify-between">
							<button className={`flex justify-between w-40 p-1 border-[1px] border-gray-300 rounded-sm font-semibold items-center`}>
								<ChartBarIcon className="h-6 w-6 text-blue-500" />
								<div className="flex w-full justify-between items-center px-2">
									<p className="text-xs">{graphTimeline == "alltime" ? "All Time" : graphTimeline == "year" ? "Past Year" : graphTimeline == "month" ? "Past Month" : graphTimeline == "week" ? "Past Week" : graphTimeline == "day" ? "Today" : ""}</p>
								</div>
								<ChevronDownIcon className="h-6 w-6 text-gray-300" />
							</button>
							<div className="hidden absolute group-hover:block z-10 bg-white divide-y divide-gray-100 rounded-sm shadow w-44">
								<div onClick={() => setGraphTimeline("alltime")} className="flex justify-between items-center py-1 cursor-pointer px-4 text-gray-700 hover:bg-gray-100">
									<p className="block py-2 text-sm text-gray-700 hover:bg-gray-100">All Time</p>
									{graphTimeline == "alltime" && <CheckIcon className="h-4 w-4 text-green-500" />}
								</div>
								<div onClick={() => setGraphTimeline("year")} className="flex justify-between items-center py-1 cursor-pointer px-4 text-gray-700 hover:bg-gray-100">
									<p className="block py-2 text-sm text-gray-700 hover:bg-gray-100">Past Year</p>
									{graphTimeline == "year" && <CheckIcon className="h-4 w-4 text-green-500" />}
								</div>
								<div onClick={() => setGraphTimeline("month")} className="flex justify-between items-center py-1 cursor-pointer px-4 text-gray-700 hover:bg-gray-100">
									<p className="block py-2 text-sm">Past Month</p>
									{graphTimeline == "month" && <CheckIcon className="h-4 w-4 text-green-500" />}
								</div>
								<div onClick={() => setGraphTimeline("week")} className="flex justify-between items-center py-1 cursor-pointer px-4 text-gray-700 hover:bg-gray-100">
									<p className="block py-2 text-sm text-gray-700 hover:bg-gray-100">Past Week</p>
									{graphTimeline == "week" && <CheckIcon className="h-4 w-4 text-green-500" />}
								</div>
								<div onClick={() => setGraphTimeline("day")} className="flex justify-between items-center py-1 cursor-pointer px-4 text-gray-700 hover:bg-gray-100">
									<p className="block py-2 text-sm text-gray-700 hover:bg-gray-100">Today</p>
									{graphTimeline == "day" && <CheckIcon className="h-4 w-4 text-green-500" />}
								</div>
							</div>
						</div>
					</div>
					<img src="/price_history.png" alt="Price History" className="pt-4" />
				</div>

				{/* Empty Div For Layout */}
				<div></div>

				{/* Details */}
				<div className="bg-white rounded-sm p-4 text-sm text-gray-500 col-span-1 shadow">
					<div className="pb-4 border-b-[1px]">
						<h2 className="text-lg font-semibold text-gray-700">Details</h2>
					</div>
					<div className="flex flex-col mt-4 space-y-2">
						<div className="flex justify-between">
							<h3 className="font-semibold">Contract Address</h3>
							<a href={`https://goerli.etherscan.io/address/${contractAddress}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline font-semibold">{`${contractAddress?.slice(0, 5)}...${contractAddress?.slice(contractAddress?.length - 5)}`}</a>
						</div>
						<div className="flex justify-between">
							<h3 className="font-semibold">Token ID</h3>
							<a href={`https://opensea.io/assets/ethereum/${contractAddress}/${tokenId}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline font-semibold">
								{tokenId}
							</a>
						</div>
						<div className="flex justify-between">
							<h3 className="font-semibold">Token Standard</h3>
							<p>{tokenStandard}</p>
						</div>
						<div className="flex justify-between">
							<h3 className="font-semibold">Blockchain</h3>
							<p>{chain}</p>
						</div>
						{/* This should be replaced with Beneficiaries */}
						{/* <div className="flex justify-between">
							<h3 className="font-semibold">Creator Fees</h3>
							<p>{creatorFees}%</p>
						</div> */}
					</div>
				</div>
			</div>

			{/* Item Activity */}
			<div className="w-3/4 p-6 bg-white rounded-md">
				<h2 className="w-full text-xl font-semibold border-b-[1px] pb-4">Item Activity</h2>
				<div className="flex items-center space-x-4 mb-3 pt-4">
					<div className="relative mt-auto inline-block group justify-between">
						<button className={`flex justify-between w-40 p-1 border-[1px] border-gray-200 rounded-sm font-semibold items-center`}>
							<ChartBarIcon className="h-6 w-6 text-blue-500" />
							<div className="flex w-full justify-between items-center px-2">
								<p className="text-xs">{graphTimeline == "alltime" ? "All Time" : graphTimeline == "year" ? "Past Year" : graphTimeline == "month" ? "Past Month" : graphTimeline == "week" ? "Past Week" : graphTimeline == "day" ? "Today" : ""}</p>
							</div>
							<ChevronDownIcon className="h-6 w-6 text-gray-300" />
						</button>
						<div className="hidden absolute group-hover:block z-10 bg-white divide-y divide-gray-100 rounded-sm shadow w-44">
							<div onClick={() => setGraphTimeline("alltime")} className="flex justify-between items-center py-1 cursor-pointer px-4 text-gray-700 hover:bg-gray-100">
								<p className="block py-2 text-sm text-gray-700 hover:bg-gray-100">All Time</p>
								{graphTimeline == "alltime" && <CheckIcon className="h-4 w-4 text-green-500" />}
							</div>
							<div onClick={() => setGraphTimeline("year")} className="flex justify-between items-center py-1 cursor-pointer px-4 text-gray-700 hover:bg-gray-100">
								<p className="block py-2 text-sm text-gray-700 hover:bg-gray-100">Past Year</p>
								{graphTimeline == "year" && <CheckIcon className="h-4 w-4 text-green-500" />}
							</div>
							<div onClick={() => setGraphTimeline("month")} className="flex justify-between items-center py-1 cursor-pointer px-4 text-gray-700 hover:bg-gray-100">
								<p className="block py-2 text-sm">Past Month</p>
								{graphTimeline == "month" && <CheckIcon className="h-4 w-4 text-green-500" />}
							</div>
							<div onClick={() => setGraphTimeline("week")} className="flex justify-between items-center py-1 cursor-pointer px-4 text-gray-700 hover:bg-gray-100">
								<p className="block py-2 text-sm text-gray-700 hover:bg-gray-100">Past Week</p>
								{graphTimeline == "week" && <CheckIcon className="h-4 w-4 text-green-500" />}
							</div>
							<div onClick={() => setGraphTimeline("day")} className="flex justify-between items-center py-1 cursor-pointer px-4 text-gray-700 hover:bg-gray-100">
								<p className="block py-2 text-sm text-gray-700 hover:bg-gray-100">Today</p>
								{graphTimeline == "day" && <CheckIcon className="h-4 w-4 text-green-500" />}
							</div>
						</div>
					</div>
					<div className="hidden sm:flex space-x-2">
						<button className="flex text-sm justify-between px-3 py-1 border-[1px] rounded-sm font-semibold items-center border-gray-200 text-[#5082fb] hover:bg-[#5082fb] hover:text-white">
							<p>Sales</p>
							<XIcon className="h-3 w-3 ml-3 hover:shadow-lg" />
						</button>
						<button className="flex text-sm justify-between px-3 py-1 border-[1px] rounded-sm font-semibold items-center border-gray-200 text-[#5082fb] hover:bg-[#5082fb] hover:text-white">
							<p>Transfers</p>
							<XIcon className="h-3 w-3 ml-3 hover:shadow-lg" />
						</button>
						<button className="flex text-sm justify-between px-3 py-1 border-[1px] rounded-sm font-semibold items-center border-gray-200 text-[#5082fb] hover:bg-[#5082fb] hover:text-white">
							<p>Clear All</p>
						</button>
					</div>
				</div>
				{/* <EarningsTable contributionArray={backedProjects} /> */}
			</div>

			{/* More from collection */}
			{nftCollection && (
				<div className="w-3/4">
					<div className="w-full flex justify-between mb-4">
						<h2 className="text-2xl font-semibold">More from this collection</h2>
						<button onClick={() => router.push(`/project/${projectId}`)} className="text-gray-600 text-sm hover:text-white hover:bg-blue-600 border-[1px] border-blue-200 rounded-sm px-2 py-1">
							View collection
						</button>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
						{nftCollection.map((nft, i) => (
							<NftCardExtended key={nft.id} id={nft.id} nftUrl={nft.nftUrl} nftName={nft.name} projectName={nft.project?.name as string} price={10} creatorImage={nft.creator.image} creatorName={nft.creator.name} />
						))}
					</div>
				</div>
			)}
		</main>
	);
}
export default Nft;

export async function getServerSideProps(context: any) {
	const id: string = context.params.id;

	return {
		props: {
			id,
		},
	};

	// const docRef = doc(db, "nfts", id);
	// const docSnap = await getDoc(docRef);

	// if (docSnap.exists()) {
	// 	const id = docSnap.id;
	// 	const chain = docSnap.data().chain;
	// 	const contractAddress = docSnap.data().contractAddress;
	// 	const createdTimestamp = docSnap.data().createdTimestamp;
	// 	const creatorFees = docSnap.data().creatorFees;
	// 	const creatorAddress = docSnap.data().creatorAddress;
	// 	const creatorImage = docSnap.data().creatorImage;
	// 	const creatorName = docSnap.data().creatorName;
	// 	const description = docSnap.data().description;
	// 	const name = docSnap.data().name;
	// 	const nftUrl = docSnap.data().nftUrl;
	// 	const price = docSnap.data().price;
	// 	const projectId = docSnap.data().projectId;
	// 	const projectName = docSnap.data().projectName;
	// 	const tokenId = docSnap.data().tokenId;
	// 	const tokenStandard = docSnap.data().tokenStandard;
	// 	const traits = docSnap.data().traits;
	// 	const views = docSnap.data().views;

	// 	await updateDoc(doc(db, "nfts", id), {
	// 		views: increment(1),
	// 	});

	// 	return {
	// 		props: {
	// 			id,
	// 			chain,
	// 			contractAddress,
	// 			createdTimestamp,
	// 			creatorFees,
	// 			creatorAddress,
	// 			description,
	// 			nftUrl,
	// 			name,
	// 			price,
	// 			projectId,
	// 			projectName,
	// 			tokenId,
	// 			tokenStandard,
	// 			traits,
	// 			creatorName,
	// 			creatorImage,
	// 			views,
	// 		},
	// 	};
	// } else {
	// 	// doc.data() will be undefined in this case
	// 	console.log("No such NFT was found!");
	// 	return {
	// 		redirect: {
	// 			destination: "/",
	// 			permanent: false,
	// 		},
	// 	};
	// }
}
