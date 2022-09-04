import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import secondsToDhms from "../hooks/secondsToDhms";
import unixToDateTime from "../hooks/unixToDateTime";
import BackProjectModal from "./BackProjectModal";
import StakeTokenModal from "./StakeTokenModal";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useToken } from "wagmi";

type ProjectCardType = {
	projectId: string;
	projectName: string;
	projectTicker: string;
	projectImage: string;
	description?: string | null;
	creatorName: string;
	bannerImage: string;
	backers: any;
	followers: any;
	endDate: any;
	amountRaised: number;
	target: number;
	amountStaked: number;
	nftDrop: any;
	raiseTokenAddress: string;
};

function ProjectCard({ projectId, projectName, projectTicker, projectImage, description, creatorName, bannerImage, backers, followers, endDate, raiseTokenAddress, amountRaised, target, amountStaked, nftDrop }: ProjectCardType) {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [date, setDate] = useState<string>();
	const [timeLeft, setTimeLeft] = useState("");
	const [isBackingModalOpen, setIsBackingModalOpen] = useState(false);
	const [isStakingModalOpen, setIsStakingModalOpen] = useState(false);
	const {
		data: raiseTokenData,
		isError,
		isLoading,
	} = useToken({
		address: raiseTokenAddress,
		enabled: !!raiseTokenAddress,
	});

	useEffect(() => {
		setDate(unixToDateTime(endDate, "local"));
	}, [endDate]);

	useEffect(() => {
		setTimeout(() => {
			setTimeLeft(secondsToDhms(endDate - Math.floor(Date.now() / 1000)));
		}, 1000);
	}, [endDate, timeLeft]);

	return (
		<div
			onClick={() => {
				if (!isBackingModalOpen && !isStakingModalOpen) {
					router.push(`/project/${projectId}`);
				}
			}}
			className="flex flex-col justify-between rounded-lg cursor-pointer bg-white hover:bg-gray-50 shadow-lg text-sm w-full"
		>
			<img src={bannerImage} alt={`${projectName} Banner Image`} className="h-[80px] w-full object-cover object-center" />
			<div className="flex flex-col justify-between h-full p-5">
				<div className="flex h-8 space-x-2 items-center mb-4">
					<img src={projectImage} alt={`${projectName} Project Image`} className="h-8 w-8 rounded-full shadow-md object-cover" />
					<div className="overflow-hidden">
						<p className="text-black font-bold truncate">{projectName}</p>
						<p className="text-gray-500 text-sm truncate">{creatorName}</p>
					</div>
				</div>
				<p className="text-gray-700 mb-4 line-clamp-3">{description}</p>
				<div className="flex mb-4 flex-wrap">
					<p className="text-gray-700 text-sm mr-4">
						<span className="text-blue-500 font-semibold">{backers} </span> {backers == 1 ? "Backer" : "Backers"}
					</p>
					<p className="text-gray-700">
						<span className="text-blue-500 font-semibold">{followers} </span> {followers == 1 ? "Follower" : "Followers"}
					</p>
				</div>
				{nftDrop ? (
					<div className="flex flex-col sm:flex-row justify-center items-center grid-cols-2 mb-6 text-center">
						<div className="flex flex-col items-center justify-center sm:border-r-[1px] sm:pr-4 sm:w-1/2">
							<p className="font-semibold mb-1">{timeLeft ? `${timeLeft}` : "0"}</p>
							<p className="text-gray-400 text-xs">{timeLeft ? "Next NFT Drop" : "Upcoming NFT Drops"}</p>
						</div>
						<div className="flex flex-col items-center justify-center sm:pl-4 sm:w-1/2">
							<p className="font-semibold mb-1">${amountStaked}</p>
							<p className="text-gray-400 text-xs">Staked (USD)</p>
						</div>
					</div>
				) : (
					<div className="text-center">
						<div className="flex flex-col sm:flex-row justify-center items-center grid-cols-2 mb-6">
							<div className="flex flex-col items-center justify-center sm:border-r-[1px] sm:pr-4 sm:w-1/2">
								<p className="font-semibold mb-1">{timeLeft ? `${timeLeft}` : "Finished Raise"}</p>
								<p className="text-gray-400 text-xs">{timeLeft && "Left to raise"}</p>
							</div>
							<div className="flex flex-col items-center justify-center sm:pl-4 sm:w-1/2">
								<p className="mb-1">
									{amountRaised.toLocaleString("en", {
										minimumFractionDigits: 0,
										maximumFractionDigits: 3,
									})}{" "}
									{raiseTokenData?.symbol ?? "ETH"} Raised
								</p>
								<p className="text-gray-400 text-xs">
									Of{" "}
									{target.toLocaleString("en", {
										minimumFractionDigits: 0,
										maximumFractionDigits: 3,
									})}{" "}
									{raiseTokenData?.symbol ?? "ETH"} Target
								</p>
							</div>
						</div>

						{/* <div className="grid grid-cols-1 md:grid-cols-2 justify-between mb-2 flex-wrap">
							<p className="mb-2 font-semibold">{timeLeft ? `${timeLeft} left` : "Finished Raise"}</p>
							<p>
								{amountRaised} ETH / {target} Raised
							</p>
						</div> */}

						<div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-200 mb-6">
							<div style={{ width: `${amountRaised > target ? "100%" : (amountRaised / target) * 100}%` }} className={`h-2.5 rounded-full ${amountRaised > target ? "bg-green-400" : "bg-blue-400"}`}></div>
						</div>
					</div>
				)}
				<div className="bottom-0">
					<button
						onClick={(e) => {
							e.stopPropagation();
							if (!session?.user?.id) {
								toast.error("You must be logged in to do that.");
								return;
							}
							if (nftDrop) {
								setIsStakingModalOpen(true);
							} else {
								setIsBackingModalOpen(true);
							}
						}}
						className="w-full bg-transparent hover:bg-[#5082fb] text-blue-500 font-semibold hover:text-white py-2 px-4 border border-[#5082fb] hover:border-transparent rounded shadow-md transition ease-in-out"
					>
						{nftDrop ? `Stake ${projectTicker.toUpperCase()}` : "Back Project"}
					</button>
					{nftDrop && <button className="w-full mt-2 bg-transparent hover:bg-[#4fc681] text-green-500 font-semibold hover:text-white py-2 px-4 border border-[#4fc681] hover:border-transparent rounded shadow-md">Get {projectTicker.toUpperCase()}</button>}
				</div>
			</div>
			{isBackingModalOpen && <BackProjectModal id={projectId} setIsBackingModalOpen={setIsBackingModalOpen} endTime={new Date(endDate * 1000).toUTCString()} projectId={projectId} projectName={projectName} tokenId={projectId} raiseTokenAddress={raiseTokenAddress} raiseTokenTicker={raiseTokenData?.symbol ?? "ETH"} tokenPrice={2} projectTicker={projectTicker} target={target} />}
			{isStakingModalOpen && <StakeTokenModal tokenId={projectId} userTokenBalance={0} setIsStakingModalOpen={setIsStakingModalOpen} endTime={new Date(endDate * 1000).toUTCString()} projectId={projectId} projectName={projectName} tokenPrice={2} tokenTicker={projectTicker} />}
		</div>
	);
}
export default ProjectCard;
