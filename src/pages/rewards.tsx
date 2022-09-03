import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import EarningsTable from "../components/EarningsTable";
import PaginationBar from "../components/PaginationBar";
import { TAFFY_TOKEN_DATA } from "../../public/taffyTokenData";
import StakeTokenModal from "../components/StakeTokenModal";
import { useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";
import { TAFFY_TOKEN_ADDRESS } from "../utils/constants";
import { useBalance } from "wagmi";
import { Project } from "@prisma/client";

type taffyData = {
	price: number;
	staked: number;
	apy: number;
};

type Rewards = {
	stake: number;
	rewards: number;
};

type BackedProjectType = {
	Project: Project;
	amount: number;
	contributionTimestamp: Date;
};

function Rewards() {
	const { data: session, status } = useSession();
	const { data: backedProjects, isFetching: fetchingUserBackedProjects } = trpc.useQuery(["contribution.getUserBackProjects"]);
	const [earning, setEarning] = useState<boolean>(false);
	const [taffyData, setTaffyData] = useState<taffyData>();
	const [taffyBalance, setTaffyBalance] = useState<number>(0);
	const [userStakedValue, setUserStakedValue] = useState<number>(0);
	const [rewards, setRewards] = useState<number>(0);
	const [isStakingModalOpen, setIsStakingModalOpen] = useState<boolean>(false);
	const { data: fetchedTaffyBalance, refetch } = useBalance({
		addressOrName: session?.user?.id,
		token: TAFFY_TOKEN_ADDRESS,
		watch: true,
	});

	const stakeTokenModalWrapper = useRef(null);
	useOutsideAlerter(stakeTokenModalWrapper);

	function useOutsideAlerter(ref: any) {
		useEffect(() => {
			function handleClickOutside(event: any) {
				if (ref.current && !ref.current.contains(event.target)) {
					// if (ref === backProjectModalWrapper) {
					// 	setIsBackingModalOpen(false);
					// }
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

	// useEffect(() => {
	// 	if (!account || !db) {
	// 		return;
	// 	}
	// 	onSnapshot(query(collection(db, "projects"), where("backers", "array-contains", account), orderBy("timestamp", "desc"), startAt(0), limit(20)), (snapshot) => {
	// 		setRewards(snapshot.docs);
	// 	});
	// }, [db, account]);

	useEffect(() => {
		if (!backedProjects) {
			return;
		}

		let countingUserStakedValue = 0;

		for (let i = 0; i < backedProjects.length; i++) {
			countingUserStakedValue += (backedProjects[i] as BackedProjectType).amount;
		}
		setUserStakedValue(countingUserStakedValue);
	}, [backedProjects]);

	useEffect(() => {
		if (!session?.user?.id || !TAFFY_TOKEN_ADDRESS) {
			return;
		}

		refetch();
	}, [session?.user?.id, TAFFY_TOKEN_ADDRESS]);

	useEffect(() => {
		if (!fetchedTaffyBalance) return;
		if (parseFloat(fetchedTaffyBalance.formatted) >= 0) return;

		setTaffyBalance(parseFloat(fetchedTaffyBalance.formatted));
	}, [fetchedTaffyBalance]);

	return (
		<main className="w-full flex flex-col items-center bg-gray-100">
			<div className="flex flex-col w-full py-24 bg-cover text-white bg-[url('/rewards_hero.png')] justify-center mb-12" />

			<div className="-m-48 w-11/12 sm:w-5/6 md:2/3 flex flex-col mb-48">
				<h1 className="text-3xl font-bold mb-8 font-sans">Rewards</h1>

				<div className="bg-white flex flex-col md:grid grid-cols-2 gap-6 sm:gap-16 rounded-sm shadow-md p-8 mb-12 text-center">
					<div className="flex flex-col col-span-1 space-y-8">
						<div className="flex flex-col sm:flex-row justify-center sm:space-x-8">
							<div>
								<p className="text-lg font-semibold">${10} ETH</p>
								<p className="text-sm text-gray-400">Latest Price (ETH)</p>
							</div>
							<div className="border-l-[1px] border-gray-100 pl-4">
								<p className="text-lg font-semibold">${TAFFY_TOKEN_DATA.staked.toLocaleString()}</p>
								<p className="text-sm text-gray-400">Staked (USD)</p>
							</div>
							<div className="border-l-[1px] border-gray-100 pl-4">
								<p className="text-lg font-semibold">{10}%</p>
								<p className="text-sm text-gray-400">Est APY</p>
							</div>
						</div>
						<div className="flex justify-center items-center space-x-2">
							<button className="flex-1 text-sm py-2 border-[1px] rounded-sm border-blue-100 text-[#5082fb] font-semibold hover:bg-[#5082fb] hover:text-white">Buy Taffy</button>
							<button onClick={() => setIsStakingModalOpen(true)} className="flex-1 text-sm py-2 border-[1px] rounded-sm border-blue-100 text-[#5082fb] font-semibold hover:bg-[#5082fb] hover:text-white">
								Stake Taffy/ETH
							</button>
						</div>
					</div>
					<div className="col-span-1 flex justify-between flex-col space-y-8">
						<div className="flex justify-center space-x-8">
							<div className="border-l-[1px] border-gray-100 pl-4">
								<p className="text-lg font-semibold">${userStakedValue}</p>
								<p className="text-sm text-gray-400">My Stake (USD)</p>
							</div>
							<div className="border-l-[1px] border-gray-100 pl-4">
								<p className="text-lg font-semibold">${rewards}</p>
								<p className="text-sm text-gray-400">Latest Rewards</p>
							</div>
						</div>
						<button className="py-2 rounded-sm text-sm font-semibold bg-[#21c275] text-white hover:bg-white hover:text-[#21c275] hover:border-[1px] hover:border-[#21c275]">Claim</button>
					</div>
				</div>

				<h2 className="text-xl font-bold mb-5">All projects using Taffy</h2>
				<div className="flex flex-col sm:flex-row justify-between sm:mb-8 ">
					<div className="flex space-x-3 mb-2 sm:mb-0">
						<button onClick={() => setEarning(false)} className={`${earning ? "bg-gray-100" : "bg-blue-500 text-white"} px-4 py-2 rounded-sm border-[1px] border-gray-300 text-sm font-semibold hover:bg-blue-600 hover:text-white`}>
							Rewards
						</button>
						<button onClick={() => setEarning(true)} className={`${!earning ? "bg-gray-100" : "bg-blue-500 text-white"} px-4 py-2 rounded-sm border-[1px] border-gray-300 text-sm font-semibold hover:bg-blue-600 hover:text-white`}>
							Earning
						</button>
					</div>

					<div className="flex mb-2 sm:mb-0">
						<div className="flex items-center bg-gray-50 rounded-sm p-2 shadow-sm border-[1px] text-sm">
							<input type="text" className="flex-1 outline-none bg-transparent" placeholder="Search" />
						</div>
					</div>
				</div>
				<EarningsTable />
				<div className="mt-8">
					<PaginationBar />
				</div>
			</div>
			{isStakingModalOpen && (
				<div ref={stakeTokenModalWrapper}>
					<StakeTokenModal tokenId={TAFFY_TOKEN_ADDRESS} userTokenBalance={taffyBalance} setIsStakingModalOpen={setIsStakingModalOpen} endTime={Math.floor(Date.now() / 1000)} projectId={1} projectName={"Taffy"} tokenPrice={10} tokenTicker={"TAFFY"} />
				</div>
			)}
		</main>
	);
}
export default Rewards;
