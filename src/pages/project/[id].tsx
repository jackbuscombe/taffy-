import { useCallback, useEffect, useRef, useState } from "react";
import ProjectCard from "../../components/ProjectCard";
import NftCardExtended from "../../components/NftCardExtended";
import { useRouter } from "next/router";
import BackProjectModal from "../../components/BackProjectModal";
import unixToDateTime from "../../hooks/unixToDateTime";
import dateToUnix from "../../hooks/dateToUnix";
import secondsToDhms from "../../hooks/secondsToDhms";
import VotingCard from "../../components/VotingCard";
import StakeTokenModal from "../../components/StakeTokenModal";
import { FaTwitter, FaDiscord, FaLinkedin, FaTelegram } from "react-icons/fa";
import { CurrencyDollarIcon, EyeIcon, UserGroupIcon, UsersIcon } from "@heroicons/react/outline";
import Link from "next/link";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { trpc } from "../../utils/trpc";
import type { Nft, Proposal } from "@prisma/client";
import { useBalance, useToken } from "wagmi";
import { Pulsar } from "@uiball/loaders";
// import tokenAddressToTicker from "../../utils/tokenAddressToTicker";

function Project({ id }: { id: string }) {
	const { data: session, status } = useSession();
	const { data: project, isFetching: fetchingProject } = trpc.useQuery(["project.getSpecificProject", { id: id }]);
	const followProject = trpc.useMutation(["project.followProject"]);
	const unfollowProject = trpc.useMutation(["project.unfollowProject"]);
	const { data: isUserFollowing, isFetching: fetchingIsFollowing } = trpc.useQuery(["project.checkIfFollowing", { projectId: id }]);
	const { data: similarProjects, isFetching: isFetchingSimilarProjects } = trpc.useQuery(["project.getSomeProjects", { amount: 3, status: "all", tags: [] }]);
	const updateViewCount = trpc.useMutation(["project.incrementView"]);
	const router = useRouter();

	// State for each of the props
	const [projectName, setProjectName] = useState<string>("");
	const [projectTicker, setProjectTicker] = useState<string>("");
	const [projectDescription, setProjectDescription] = useState<string | null>("");
	const [projectImage, setProjectImage] = useState<string>("");
	const [bannerImage, setBannerImage] = useState<string>("");
	const [endDate, setEndDate] = useState<number>(Math.floor(Date.now() / 1000));
	const [ended, setEnded] = useState<boolean>(true);
	const [creatorAddress, setCreatorAddress] = useState<string>("");
	const [creatorName, setCreatorName] = useState<string>("");
	const [creatorImage, setCreatorImage] = useState<string>("");
	const [contributionsValue, setContributionsValue] = useState<number>();
	const [target, setTarget] = useState<number>(0);
	const [secondsLeft, setSecondsLeft] = useState<number>(0);
	const [tokenId, setTokenId] = useState<string>("");
	const [tokenPrice, setTokenPrice] = useState<number>();
	const [amountStaked, setAmountStaked] = useState<number>();
	const [nfts, setNfts] = useState<Nft[] | []>([]);
	const [views, setViews] = useState<number>();
	const [contributionsCount, setContributionsCount] = useState<number>();
	const [followersCount, setFollowersCount] = useState<number>();
	const [followers, setFollowers] = useState();
	const [twitter, setTwitter] = useState<string>("");
	const [telegram, setTelegram] = useState<string>("");
	const [discord, setDiscord] = useState<string>("");
	const [linkedIn, setLinkedIn] = useState<string>("");
	const [proposals, setProposals] = useState<Proposal[]>([]);
	const [raiseTokenAddress, setRaiseTokenAddress] = useState<string>("");
	const [userTokenBalance, setUserTokenBalance] = useState(0);

	const [isFollowing, setIsFollowing] = useState<boolean>(false);
	const [togglingFollowStatus, setTogglingFollowStatus] = useState<boolean>(false);
	const { data: fetchedTokenBalance, refetch } = useBalance({
		addressOrName: session?.user?.id,
		token: tokenId,
		watch: true,
	});
	const {
		data: raiseTokenData,
		isError,
		isLoading,
	} = useToken({
		address: raiseTokenAddress,
		enabled: !!raiseTokenAddress,
	});

	useEffect(() => {
		if (!project) {
			return;
		}
		setProjectName(project.name);
		setProjectTicker(project.ticker);
		setProjectDescription(project.description);
		setProjectImage(project.image);
		setBannerImage(project.bannerImage);
		setEndDate(project.raiseEndTimestamp);
		if (project.raiseEndTimestamp > Math.floor(Date.now() / 1000)) {
			setEnded(false);
		}
		setCreatorAddress(project.creatorId);
		setCreatorName(project.creator.name);
		setCreatorImage(project.creator.image);
		setContributionsValue(project.amountRaised);
		setTarget(project.target);
		setSecondsLeft(Math.floor(Date.now() / 1000 - project.raiseEndTimestamp));
		setTokenId(project.tokenAddress);
		setTokenPrice(10);
		setAmountStaked(project.amountStaked);
		setNfts(project.nfts);
		setViews(project.views);
		setContributionsCount(project._count.contributions);
		setFollowersCount(project._count.followers);
		setTwitter(project.twitter ?? "");
		setTelegram(project.telegram ?? "");
		setDiscord(project.discord ?? "");
		setLinkedIn(project.linkedIn ?? "");
		setProposals(project.proposals);
		setRaiseTokenAddress(project.raiseTokenAddress ?? "");
	}, [project]);

	useEffect(() => {
		if (!session || !project) return;

		if (isUserFollowing) {
			return setIsFollowing(true);
		}
	}, [session, project, isUserFollowing]);

	const [selected, setSelected] = useState<string>("overview");
	const [isBackingModalOpen, setIsBackingModalOpen] = useState<boolean>(false);
	const [isStakingModalOpen, setIsStakingModalOpen] = useState<boolean>(false);

	const [localEndDate, setLocalEndDate] = useState<string>("");
	const [timeLeft, setTimeLeft] = useState<string>("");

	const [upcomingNfts, setUpcomingNfts] = useState<Nft[]>([]);
	const [releasedNfts, setReleasedNfts] = useState<Nft[]>([]);

	useEffect(() => {
		if (!endDate) {
			return;
		}
		setLocalEndDate(unixToDateTime(endDate, "local"));
	}, [endDate]);

	useEffect(() => {
		if (!endDate) {
			return;
		}
		setTimeout(() => {
			setTimeLeft(secondsToDhms(endDate - Math.floor(Date.now() / 1000)));
		}, 1000);
	}, [secondsLeft, timeLeft, endDate]);

	const backProjectModalWrapper = useRef(null);
	useOutsideAlerter(backProjectModalWrapper);

	const stakeTokenModalWrapper = useRef(null);
	useOutsideAlerter(stakeTokenModalWrapper);

	function useOutsideAlerter(ref: any) {
		useEffect(() => {
			function handleClickOutside(event: any) {
				if (ref.current && !ref.current.contains(event.target)) {
					if (ref === backProjectModalWrapper) {
						setIsBackingModalOpen(false);
					}
					if (ref === stakeTokenModalWrapper) {
						setIsStakingModalOpen(false);
					}
				}
			}
			document.addEventListener("mousedown", handleClickOutside);
			return () => {
				document.removeEventListener("mousedown", handleClickOutside);
			};
		}, [ref]);
	}

	useEffect(() => {
		if (!nfts || nfts.length === 0) {
			return;
		}
		const upcomingArray: Nft[] = [];
		const releasedArray: Nft[] = [];

		for (let i = 0; i < nfts.length; i++) {
			if ((nfts[i] as Nft).mintTimestamp > Math.floor(Date.now() / 1000)) {
				upcomingArray.push(nfts[i] as Nft);
			}
			if ((nfts[i] as Nft).mintTimestamp < Math.floor(Date.now() / 1000)) {
				releasedArray.push(nfts[i] as Nft);
			}
		}
		setUpcomingNfts(upcomingArray);
		setReleasedNfts(releasedArray);
	}, [nfts]);

	const toggleFollowing = async () => {
		if (!session?.user?.id) {
			return;
		}

		try {
			setTogglingFollowStatus(true);
			if (isFollowing) {
				const followingToast = toast.loading("Unfollowing");
				await unfollowProject.mutateAsync({ projectId: id });
				setIsFollowing(false);
				toast.dismiss();
				toast.success(`Unfollowed ${projectName}`, {
					id: followingToast,
				});
			} else {
				await followProject.mutateAsync({ projectId: id });
				setIsFollowing(true);
				toast.dismiss();
				toast.success(`Following ${projectName}`);
			}
		} catch (error) {
			toast.dismiss();
			toast.error("Unable to update following status");
		} finally {
			setTogglingFollowStatus(false);
		}
	};

	useEffect(() => {
		if (!session?.user?.id || !tokenId) {
			return;
		}

		refetch();
	}, [session?.user?.id, tokenId]);

	useEffect(() => {
		if (!fetchedTokenBalance) return;
		if (parseFloat(fetchedTokenBalance.formatted) >= 0) return;

		setUserTokenBalance(parseFloat(fetchedTokenBalance.formatted));
	}, [fetchedTokenBalance]);

	// Update View count
	let incrementedView = false;
	useEffect(() => {
		if (incrementedView) return;
		incrementedView = true;
		updateViewCount.mutate({ projectId: id });
	}, [incrementedView]);

	return (
		<main className={``}>
			<div className={`flex flex-col items-center w-full bg-blue-50 pb-8 ${(isStakingModalOpen || isBackingModalOpen) && "bg-blend-multiply mix-blend-darken blur"}`}>
				<div className={`bg-gradient-to-b from-slate-600 to-black h-32 w-full relative flex flex-col py-8 sm:py-32 text-white bg-blend-darken justify-center mb-12`}>
					<img src={bannerImage} alt="" className="w-full h-full object-cover absolute mix-blend-overlay" />
				</div>
				{/* <div style={{ backgroundImage: `url(${bannerImage})` }} className="flex z-10 flex-col w-full py-16 md:py-32 text-white bg-blend-darken justify-center bg-center bg-cover bg-no-repeat" /> */}

				<div className={`w-full bg-white flex flex-col items-center -mt-40`}>
					<div className={`flex z-20 ${ended ? "w-2/3" : "w-full"} justify-center items-center`}>
						<div className="w-2/3 flex flex-col sm:flex-row justify-between">
							<div className="flex space-x-4">
								<div className="bg-gray-100 h-[130px] w-[130px] rounded-full flex justify-center items-center overflow-hidden">
									<img src={projectImage} alt={projectName} className="h-[127px] w-[127px] rounded-full object-cover" />
								</div>
								<div className="flex flex-col justify-center sm:flex-row sm:items-center sm:space-x-2">
									<h1 className="text-white font-bold text-xl">{projectName}</h1>
									<p className="text-gray-300">{projectTicker.toUpperCase()}</p>
								</div>
							</div>
							{creatorAddress === session?.user?.id && (
								<div className="flex items-center justify-self-end">
									<button onClick={() => router.push(`/admin/${id}`)} className="text-sm w-36 h-10 border-[1px] rounded-sm border-red-100 text-white font-semibold bg-red-500 hover:bg-red-600">
										Access Admin
									</button>
								</div>
							)}
						</div>
						{ended && (
							<div className="hidden sm:flex space-x-2">
								<button className="flex bg-blue-500 text-white font-semibold rounded-md px-4 py-1 hover:bg-blue-600 transition transform ease-in-out border-[1px] shadow-2xl">
									<img src={projectImage} alt="" className="h-6 w-6 rounded-full mr-2 object-cover" />
									{amountStaked && amountStaked.toLocaleString()} {raiseTokenData?.symbol ?? "ETH"} Staked
								</button>
								<button onClick={toggleFollowing} className="flex bg-green-500 text-white items-center font-semibold rounded-md px-4 py-1 hover:bg-green-600 transition transform ease-in-out border-[1px] shadow-2xl">
									{togglingFollowStatus || fetchingIsFollowing ? <Pulsar size={20} speed={1.75} color="white" /> : isFollowing ? "Following" : "Follow"}
									{/* {isUserFollowing ? "Following" : "Follow"} */}
								</button>
							</div>
						)}
					</div>
					<div className={`flex justify-center pt-3 pb-8 w-full bg-white`}>
						{ended && project ? (
							<div className="flex flex-col md:flex-row w-2/3 px-4 justify-between space-y-6 md:space-y-0">
								<div className="flex flex-col sm:flex-row justify-center sm:space-x-8 space-y-2 sm:space-y-0">
									<div>
										<p className="text-lg font-semibold">{unixToDateTime(endDate, "local")}</p>
										<p className="text-sm text-gray-400">Next NFT Drop</p>
									</div>
									<div className="sm:border-l-[1px] border-gray-100 sm:pl-4">
										<p className="text-lg font-semibold">${tokenPrice}</p>
										<p className="text-sm text-gray-400">Token price</p>
									</div>
									<div className="sm:border-l-[1px] border-gray-100 sm:pl-4">
										<p className="text-lg font-semibold">${amountStaked?.toLocaleString()}</p>
										<p className="text-sm text-gray-400">$ Staked</p>
									</div>
								</div>
								<div className="flex flex-col sm:flex-row justify-center sm:items-center sm:space-x-2 space-y-2 sm:space-y-0">
									<button onClick={() => setIsStakingModalOpen(true)} className="text-sm px-6 py-2 border-[1px] rounded-sm border-blue-100 text-[#5082fb] font-semibold hover:bg-[#5082fb] hover:text-white transition transform ease-in-out">
										Stake {projectTicker.toUpperCase()}
									</button>
									<button onClick={() => setIsBackingModalOpen(true)} className="text-sm px-6 py-2 border-[1px] rounded-sm border-blue-100 text-[#5082fb] font-semibold hover:bg-[#5082fb] hover:text-white transition transform ease-in-out">
										Get {projectTicker.toUpperCase()}
									</button>
								</div>
							</div>
						) : !ended && project ? (
							<div className="flex flex-col sm:flex-row w-2/3 justify-between">
								<div className="w-full flex space-x-8">
									<div className="flex flex-col justify-center">
										<p className="text-lg font-semibold">
											{contributionsValue?.toLocaleString()}
											<span className="font-normal">{raiseTokenData?.symbol ?? "ETH"}</span> / {target.toLocaleString()}
											<span className="font-normal">{raiseTokenData?.symbol ?? "ETH"}</span>
										</p>
										<p className="text-sm text-gray-400 mb-3">Raised</p>
										<div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-200 mb-6">
											<div style={{ width: `${contributionsValue && target && contributionsValue > target ? "100%" : contributionsValue && target && contributionsValue < target ? `${(contributionsValue / target) * 100}%` : "0%"}` }} className={`h-2.5 rounded-full ${contributionsValue && target && contributionsValue > target ? "bg-green-400" : "bg-blue-400"}`}></div>
										</div>
									</div>
									<div className="border-l-[1px] border-gray-100 pl-4 w-1/2">
										<p className="text-lg font-semibold">{timeLeft}</p>
										<p className="hidden sm:inline-block text-sm text-gray-400">All or nothing. This project will only be funded if it reaches its goal by {localEndDate}</p>
										<p className="inline-block sm:hidden text-sm text-gray-400">Left of raising period.</p>
									</div>
								</div>
								<div className="">
									{userTokenBalance > 0 && (
										<button onClick={() => setIsStakingModalOpen(true)} className="text-sm w-36 h-10 border-[1px] rounded-sm border-green-100 text-green-500 font-semibold hover:bg-green-500 hover:text-white mb-2">
											Stake {projectTicker.toUpperCase()}
										</button>
									)}
									<button onClick={() => setIsBackingModalOpen(true)} className="text-sm w-full sm:w-36 h-10 border-[1px] rounded-sm border-blue-100 text-[#5082fb] font-semibold hover:bg-[#5082fb] hover:text-white">
										Back Project
									</button>
								</div>
							</div>
						) : (
							<div className="w-full flex justify-center pt-12">
								<Pulsar size={40} speed={1.75} color="#21c275" />
							</div>
						)}
					</div>
				</div>

				<div className={`flex flex-col items-center w-2/3 mb-4 space-y-4 border-b-[1px] border-b-gray-300`}>
					<div className="flex flex-col sm:flex-row self-start sm:space-x-4 space-y-2 sm:space-y-1 py-4">
						<div onClick={() => setSelected("overview")} className={`px-4 py-2 ${selected == "overview" ? "bg-[#5082fb] cursor-default" : "bg-transparent cursor-pointer"} border-[1px] border-gray-300 rounded-sm`}>
							<p className={`${selected == "overview" ? "text-white font-bold" : "text-gray-500 font-semibold"}`}>Overview</p>
						</div>
						<div onClick={() => setSelected("about")} className={`px-4 py-2 ${selected == "about" ? "bg-[#5082fb] cursor-default" : "bg-transparent cursor-pointer"} border-[1px] border-gray-300 rounded-sm`}>
							<p className={`${selected == "about" ? "text-white font-bold" : "text-gray-500 font-semibold"}`}>About</p>
						</div>
						<div onClick={() => setSelected("tokenomics")} className={`px-4 py-2 ${selected == "tokenomics" ? "bg-[#5082fb] cursor-default" : "bg-transparent cursor-pointer"} border-[1px] border-gray-300 rounded-sm`}>
							<p className={`${selected == "tokenomics" ? "text-white font-bold" : "text-gray-500 font-semibold"}`}>Tokenomics</p>
						</div>
						<div onClick={() => setSelected("nfts")} className={`px-4 py-2 ${selected == "nfts" ? "bg-[#5082fb] cursor-default" : "bg-transparent cursor-pointer"} border-[1px] border-gray-300 rounded-sm`}>
							<p className={`${selected == "nfts" ? "text-white font-bold cursor-default" : "text-gray-500 font-semibold"}`}>NFTs</p>
						</div>
						{proposals?.length > 0 && (
							<div onClick={() => setSelected("votes")} className={`px-4 py-2 ${selected == "votes" ? "bg-[#5082fb] cursor-default" : "bg-transparent cursor-pointer"} border-[1px] border-gray-300 rounded-sm`}>
								<p className={`${selected == "votes" ? "text-white font-bold" : "text-gray-500 font-semibold"}`}>Votes</p>
							</div>
						)}

						<div onClick={() => setSelected("similar")} className={`px-4 py-2 ${selected == "similar" ? "bg-[#5082fb] cursor-default" : "bg-transparent cursor-pointer"} border-[1px] border-gray-300 rounded-sm`}>
							<p className={`${selected == "similar" ? "text-white font-bold" : "text-gray-500 font-semibold"}`}>Similar Projects</p>
						</div>
					</div>
				</div>

				{/* Cards */}

				{selected == "overview" ? (
					<div className={`flex flex-col w-2/3 bg-white rounded-md p-4 divide-y`}>
						<div className="flex flex-col md:flex-row py-4 justify-between">
							<div className="flex flex-col space-y-3">
								<h2 className="text-2xl text-gray-800 font-bold">{projectName}</h2>
								<p className="italic">{projectDescription}</p>
								<hr className="" />
								<div className="flex items-center space-x-2 text-sm">
									<CurrencyDollarIcon className="h-5 w-5" />
									<p>{contributionsCount} backers</p>
								</div>
								<div className="flex items-center space-x-2 text-sm">
									<UserGroupIcon className="h-5 w-5" />
									<p>{`${followersCount ?? ""} ${followersCount === 1 ? "follower" : "followers"}`}</p>
								</div>
								<div className="flex items-center space-x-2 text-sm">
									<EyeIcon className="h-5 w-5" />
									<p>{`${views ?? ""} ${views === 1 ? "view" : "views"}`}</p>
								</div>
								<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm">
									{twitter && (
										<a href={`https://twitter.com/${twitter}`} target="_blank" rel="noreferrer" className="flex items-center space-x-2 text-[#1DA1F2]">
											<FaTwitter />
											<p className="cursor-pointer hover:underline">Twitter</p>
										</a>
									)}
									{discord && (
										<a href={`https://discord.com/${discord}`} target="_blank" rel="noreferrer" className="flex items-center space-x-2 text-[#5865F2]">
											<FaDiscord />
											<p className="cursor-pointer hover:underline">Discord</p>
										</a>
									)}
									{linkedIn && (
										<a href={`https://linkedin.com/${linkedIn}`} target="_blank" rel="noreferrer" className="flex items-center space-x-2 text-[#0077b5]">
											<FaLinkedin />
											<p className="cursor-pointer text-blue-500 hover:underline">LinkedIn</p>
										</a>
									)}
									{telegram && (
										<a href={`https://telegram.com/${telegram}`} target="_blank" rel="noreferrer" className="flex items-center space-x-2 text-[#0088cc]">
											<FaTelegram />
											<p className="cursor-pointer text-blue-500 hover:underline">Telegram</p>
										</a>
									)}
								</div>
								<hr />
								<div className="flex flex-col space-y-2 justify-center">
									<h3 className="text-lg font-semibold">Creator</h3>
									<Link href={`/profile/${creatorAddress}`} passHref>
										<div className="group lg:w-2/3 flex flex-col md:flex-row md:items-center md:space-x-4 bg-gray-50 hover:bg-gray-100 shadow p-6 cursor-pointer">
											<img src={creatorImage} alt={creatorName} className="h-16 w-16 rounded-full mr-1 cursor-pointer object-cover shadow-lg" />
											<a className="text-xl text-black font-bold overflow-hidden">{creatorName}</a>
										</div>
									</Link>
								</div>
							</div>
						</div>

						<div className="flex space-x-6 justify-between my-4">
							<div className="space-y-14">
								<div>
									<div className="w-2/3 my-6">{endDate && contributionsValue && target && Math.floor(Date.now() / 1000) > endDate && contributionsValue > target ? <h2 className="text-2xl text-gray-800 font-bold mb-5">Upcoming Prizes</h2> : <h2 className="text-2xl text-gray-800 font-bold mb-5">Prizes if project is funded</h2>}</div>
									<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
										{upcomingNfts?.map((nft, i) => (
											<NftCardExtended key={nft.id} id={nft.id} nftUrl={nft.nftUrl} nftName={nft.name} projectName={projectName} price={10} creatorImage={creatorImage} creatorName={creatorName} />
										))}
										{upcomingNfts?.length === 0 && <p className="col-span-4 text-center text-gray-500 italic font-light">There are no upcoming NFTs</p>}
										{/* {nfts
									.filter((nft) => nft.mintTimestamp > Date.now() / 1000)
									.map((nft, i) => (
										<NftCardExtended key={nft.id} id={nft.id} nftUrl={nft.nftUrl} nftName={nft.name} projectName={nft.projectName} price={nft.price} creatorImage={nft.creatorImage} creatorName={nft.creatorName} />
									))} */}
									</div>
								</div>
								<div className="">
									<div className="mb-6">
										<h2 className="text-2xl text-gray-800 font-bold mb-5">Already Released</h2>
									</div>
									<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
										{releasedNfts?.map((nft, i) => (
											<NftCardExtended key={nft.id} id={nft.id} nftUrl={nft.nftUrl} nftName={nft.name} projectName={projectName} price={10} creatorImage={creatorImage} creatorName={creatorName} />
										))}
										{releasedNfts?.length === 0 && <p className="col-span-4 text-center text-gray-500 italic font-light">No NFTs have been released yet.</p>}
										{/* {nfts
									.filter((nft) => nft.mintTimestamp < Date.now() / 1000)
									.map((nft, i) => (
										<NftCardExtended key={nft.id} id={nft.id} nftUrl={nft.nftUrl} nftName={nft.name} projectName={nft.projectName} price={nft.price} creatorImage={nft.creatorImage} creatorName={nft.creatorName} />
									))} */}
									</div>
								</div>
							</div>
						</div>

						{/* Project Updates */}
					</div>
				) : selected == "nfts" ? (
					<div className="flex space-x-6 w-2/3 justify-between my-4">
						<div className="space-y-14">
							<div>
								<div className="w-2/3 mb-6">{endDate && contributionsValue && target && Math.floor(Date.now() / 1000) > endDate && contributionsValue > target ? <h2 className="text-2xl text-gray-800 font-bold mb-5">Upcoming Prizes</h2> : <h2 className="text-2xl text-gray-800 font-bold mb-5">Prizes if project is funded</h2>}</div>
								<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
									{upcomingNfts?.map((nft, i) => (
										<NftCardExtended key={nft.id} id={nft.id} nftUrl={nft.nftUrl} nftName={nft.name} projectName={projectName} price={10} creatorImage={creatorImage} creatorName={creatorName} />
									))}
									{upcomingNfts?.length === 0 && <p className="col-span-4 text-center text-gray-500 italic font-light">There are no upcoming NFTs</p>}
									{/* {nfts
									.filter((nft) => nft.mintTimestamp > Date.now() / 1000)
									.map((nft, i) => (
										<NftCardExtended key={nft.id} id={nft.id} nftUrl={nft.nftUrl} nftName={nft.name} projectName={nft.projectName} price={nft.price} creatorImage={nft.creatorImage} creatorName={nft.creatorName} />
									))} */}
								</div>
							</div>
							<div className="">
								<div className="mb-6">
									<h2 className="text-2xl text-gray-800 font-bold mb-5">Already Released</h2>
								</div>
								<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
									{releasedNfts?.map((nft, i) => (
										<NftCardExtended key={nft.id} id={nft.id} nftUrl={nft.nftUrl} nftName={nft.name} projectName={projectName} price={10} creatorImage={creatorImage} creatorName={creatorName} />
									))}
									{releasedNfts?.length === 0 && <p className="col-span-4 text-center text-gray-500 italic font-light">No NFTs have been released yet.</p>}
									{/* {nfts
									.filter((nft) => nft.mintTimestamp < Date.now() / 1000)
									.map((nft, i) => (
										<NftCardExtended key={nft.id} id={nft.id} nftUrl={nft.nftUrl} nftName={nft.name} projectName={nft.projectName} price={nft.price} creatorImage={nft.creatorImage} creatorName={nft.creatorName} />
									))} */}
								</div>
							</div>
						</div>
					</div>
				) : selected == "votes" ? (
					<div className="flex flex-col w-2/3 rounded-md p-4 divide-y">
						<h2 className="text-2xl text-gray-800 font-bold mb-5">{proposals.length > 0 ? "Active Proposals" : "There are no active proposals"}</h2>
						{proposals.length > 0 && project && proposals.map((proposal, i: number) => <VotingCard key={proposal.id} proposalId={proposal.id} title={proposal.title} description={proposal.description ?? ""} question={proposal.question} options={proposal.options} projectId={proposal.projectId} projectName={project?.name} projectTicker={project.ticker} projectImage={project.image} timeLeft={unixToDateTime(proposal.votingCloseTimestamp, "local")} />)}
					</div>
				) : selected == "tokenomics" ? (
					<div className="flex flex-col w-2/3 bg-white rounded-md p-4 divide-y">
						<div className="">
							<h2 className="text-2xl text-gray-800 font-bold mb-5">Tokenomics</h2>
							<div className="flex flex-col md:flex-row space-x-4 py-4">
								<p className="font-semibold">End Date:</p>
								<p>{endDate && new Date(endDate * 1000).toUTCString()}</p>
							</div>
						</div>

						<div className="flex flex-col md:flex-row space-x-4 py-4">
							<p className="font-semibold">Amount Raised:</p>
							<p>{contributionsValue}</p>
						</div>

						<div className="flex flex-col md:flex-row space-x-4 py-4">
							<p className="font-semibold">Target:</p>
							<p>
								{target.toLocaleString()} {raiseTokenData?.symbol ?? "ETH"}
							</p>
						</div>

						<div className="flex flex-col md:flex-row space-x-4 py-4">
							<p className="font-semibold">Time Left:</p>
							<p>{timeLeft}</p>
						</div>

						<div className="flex flex-col md:flex-row space-x-4 py-4">
							<p className="font-semibold">Token Price:</p>
							<p>{tokenPrice} ETH</p>
						</div>

						<div className="flex flex-col md:flex-row space-x-4 py-4">
							<p className="font-semibold">Amount Staked:</p>
							<p>
								{amountStaked} {projectTicker.toUpperCase()}
							</p>
						</div>
					</div>
				) : selected == "about" ? (
					<div className="flex flex-col w-2/3 bg-white rounded-md p-4 divide-y">
						<div>
							<h2 className="text-2xl text-gray-800 font-bold mb-5">About</h2>
							<div className="flex flex-col md:flex-row space-x-4 py-4">
								<p className="font-semibold">Project Name:</p>
								<p>{projectName}</p>
							</div>
						</div>

						<div className="flex flex-col md:flex-row space-x-4 py-4">
							<p className="font-semibold">Project Ticker:</p>
							<p>{projectTicker.toUpperCase()}</p>
						</div>

						<div className="flex flex-col md:flex-row space-x-4 py-4">
							<p className="font-semibold">Project Description:</p>
							<p>{projectDescription}</p>
						</div>

						<div className="flex flex-col md:flex-row space-x-4 py-4">
							<p className="font-semibold">Views:</p>
							<p>{views}</p>
						</div>

						<div className="flex flex-col md:flex-row space-x-4 py-4">
							<p className="font-semibold">Backers:</p>
							<p>{contributionsCount}</p>
						</div>

						<div className="flex flex-col md:flex-row space-x-4 py-4">
							<p className="font-semibold">Followers:</p>
							<p>{followersCount}</p>
						</div>
					</div>
				) : selected == "similar" ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-2/3 justify-between my-4">{similarProjects && similarProjects.map((project, i) => <ProjectCard key={project.id} projectId={project.id} projectName={project.name} projectTicker={project.ticker} bannerImage={project.bannerImage} description={project.description} creatorName={project.creator.name} projectImage={project.image} raiseTokenAddress={raiseTokenAddress} backers={project._count.contributions} followers={project._count.followers} endDate={project.raiseEndTimestamp} amountRaised={project.amountRaised} target={project.target} amountStaked={project.amountStaked} nftDrop={true} />)}</div>
				) : (
					<div className="flex space-x-6 w-2/3 justify-between my-4">
						<p>Please select a tab.</p>
					</div>
				)}
			</div>
			{isBackingModalOpen && <BackProjectModal id={id} setIsBackingModalOpen={setIsBackingModalOpen} endTime={endDate && new Date(endDate * 1000).toUTCString()} projectId={id} projectName={projectName} tokenId={tokenId} raiseTokenAddress={raiseTokenAddress} raiseTokenTicker={raiseTokenData?.symbol ?? "ETH"} tokenPrice={tokenPrice} projectTicker={projectTicker} target={target} />}
			{isStakingModalOpen && <StakeTokenModal tokenId={tokenId} userTokenBalance={userTokenBalance} setIsStakingModalOpen={setIsStakingModalOpen} endTime={endDate && new Date(endDate * 1000).toUTCString()} projectId={id} projectName={projectName} tokenPrice={tokenPrice} tokenTicker={projectTicker} />}
		</main>
	);
}
export default Project;

export async function getServerSideProps({ params }: any) {
	const id = params.id;

	return {
		props: {
			id,
		},
	};

	// const docRef = doc(db, "projects", id);
	// const docSnap = await getDoc(docRef);

	// if (docSnap.exists()) {
	// 	const amountStaked = docSnap.data().amountStaked;
	// 	const bannerImage = docSnap.data().bannerImage;
	// 	const contributions = docSnap.data().contributions;
	// 	const contributionsCount = docSnap.data().contributionsCount;
	// 	const contributionsValue = docSnap.data().contributionsValue;
	// 	const createdTimestamp = docSnap.data().createdTimestamp;
	// 	const creatorAddress = docSnap.data().creatorAddress;
	// 	const creatorName = docSnap.data().creatorName;
	// 	const discord = docSnap.data().discord;
	// 	const endDate = docSnap.data().endDate;
	// 	const followers = docSnap.data().followers;
	// 	const followersCount = docSnap.data().followersCount;
	// 	const linkedIn = docSnap.data().linkedIn;
	// 	const projectDescription = docSnap.data().projectDescription;
	// 	const projectImage = docSnap.data().projectImage;
	// 	const projectName = docSnap.data().projectName;
	// 	const projectTicker = docSnap.data().projectTicker;
	// 	const tags = docSnap.data().tags;
	// 	const target = docSnap.data().target;
	// 	const telegram = docSnap.data().telegram;
	// 	const tokenId = docSnap.data().tokenId;
	// 	const tokenPrice = docSnap.data().tokenPrice;
	// 	const twitter = docSnap.data().twitter;
	// 	const views = docSnap.data().views;

	// 	const ended = Date.now() / 1000 > docSnap.data().endDate;
	// 	const secondsLeft = secondsToDhms(endDate - Date.now() / 1000);

	// 	await updateDoc(doc(db, "projects", id), {
	// 		views: increment(1),
	// 	});

	// 	// Get Project NFTS
	// 	let nfts: Object[] = [];
	// 	const nftQuery = query(collection(db, "nfts"), where("projectId", "==", id));
	// 	const nftQuerySnapshot = await getDocs(nftQuery);
	// 	nftQuerySnapshot.forEach((doc) => {
	// 		nfts.push({ id: doc.id, ...doc.data() });
	// 	});

	// 	return {
	// 		props: {
	// 			id,
	// 			projectName,
	// 			projectTicker,
	// 			projectDescription,
	// 			projectImage,
	// 			bannerImage,
	// 			endDate,
	// 			ended,
	// 			creatorAddress,
	// 			creatorName,
	// 			contributionsValue,
	// 			target,
	// 			secondsLeft,
	// 			tokenId,
	// 			tokenPrice,
	// 			amountStaked,
	// 			views,
	// 			contributionsCount,
	// 			followersCount,
	// 			followers,
	// 			linkedIn,
	// 			twitter,
	// 			telegram,
	// 			discord,
	// 			nfts,
	// 		},
	// 	};
	// } else {
	// 	return {
	// 		redirect: {
	// 			destination: "/",
	// 			permanent: false,
	// 		},
	// 	};
	// }
}
