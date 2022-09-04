import { XIcon } from "@heroicons/react/outline";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import dateToUnix from "../hooks/dateToUnix";
import unixToDateTime from "../hooks/unixToDateTime";
import { trpc } from "../utils/trpc";
import { useBalance } from "wagmi";

function StakeTokenModal({ setIsStakingModalOpen, tokenId, userTokenBalance, endTime, projectId, projectName, tokenPrice, tokenTicker }: any) {
	const { data: session, status } = useSession();

	const createStake = trpc.useMutation(["stake.createStake"]);
	const [tokenBalance, setTokenBalance] = useState(0);
	const [stakingAmount, setStakingAmount] = useState("");
	const [currentStakeAmount, setCurrentStakeAmount] = useState<number>(0);
	const [termsAgreed, setTermsAgreed] = useState(false);
	const [outputAmount, setOutputAmount] = useState(0);
	const router = useRouter();
	const stakeTokenModalWrapper = useRef(null);
	const { data: fetchedTokenBalance, refetch } = useBalance({
		addressOrName: session?.user?.id,
		token: tokenId,
		watch: true,
	});

	useOutsideAlerter(stakeTokenModalWrapper);

	const confirmStake = async () => {
		toast.loading("Confirming Stake");

		if (!session?.user?.id) {
			toast.error("Make sure you are signed in and try again.");
			return;
		}

		if (!stakingAmount) {
			toast.error("You must enter a non-zero amount to stake");
			return;
		}

		if (parseFloat(stakingAmount) < 0 || parseFloat(stakingAmount) == 0) {
			toast.error("You must enter a positive staking amount");
		}

		if (!termsAgreed) {
			toast.error("You may not contribute without agreeing to the Taffy terms.");
		}

		try {
			if (parseFloat(stakingAmount) > tokenBalance) {
				toast.dismiss();
				toast.error("You can not stake more than your balance!");
				return;
			}

			const createdStake = await createStake.mutateAsync({
				amount: parseFloat(stakingAmount),
				tokenAddress: tokenId,
				projectId: projectId,
			});

			if (!createdStake) {
				toast.dismiss();
				toast.error("Unable to commit stake.");
				return;
			}

			toast.dismiss();
			toast.success("Your stake was successfully submitted!");
			setIsStakingModalOpen(false);
		} catch (error) {
			toast.dismiss();
			toast.error("There was an error making your stake.");
			console.log(error);
			return;
		}

		setIsStakingModalOpen(false);
	};

	// Find current stake amount
	useEffect(() => {
		if (!session?.user?.id || !tokenId) {
			return;
		}

		refetch();
	}, [session?.user?.id, tokenId]);

	useEffect(() => {
		if (!fetchedTokenBalance) return;
		if (parseFloat(fetchedTokenBalance.formatted) >= 0) return;

		setTokenBalance(parseFloat(fetchedTokenBalance.formatted));
	}, [fetchedTokenBalance]);

	function useOutsideAlerter(ref: any) {
		useEffect(() => {
			function handleClickOutside(event: any) {
				if (ref.current && !ref.current.contains(event.target)) {
					setIsStakingModalOpen(false);
				}
			}
			document.addEventListener("mousedown", handleClickOutside);
			return () => {
				document.removeEventListener("mousedown", handleClickOutside);
			};
		}, [ref]);
	}

	return (
		<div className="flex justify-center items-center fixed top-0 right-0 left-0 z-50 w-full h-full overflow-y-auto overflow-x-hidden bg-black bg-opacity-50 cursor-auto">
			<div ref={stakeTokenModalWrapper} className="h-full md:h-auto">
				<div className="relative p-6 w-full max-w-md h-full md:h-auto bg-gray-50 rounded-lg shadow-2xl border border-gray-900">
					<div className="flex justify-between items-center">
						<h2 className="text-xl mb-2">Stake {projectName}</h2>
						<XIcon onClick={() => setIsStakingModalOpen(false)} className="h-8 w-8 sm:h-10 sm:w-10 cursor-pointer sm:p-2 hover:bg-gray-300 rounded-full" />
					</div>
					<p className="text-gray-500 mb-4">Nor again is there anyone who loves or pursues or desires to obtain pain of itself</p>
					<hr className="border-gray-200 mb-4" />

					<div className="flex text-gray-500 mb-4">
						<p>
							Balance:{" "}
							<span onClick={() => setStakingAmount(tokenBalance.toString())} className="text-blue-500 cursor-pointer">
								{tokenBalance} {tokenTicker.toUpperCase()}
							</span>
						</p>
					</div>

					<div className="w-full border border-gray-200 flex flex-col sm:flex-row justify-between p-2 mb-4">
						<input type="number" placeholder={`0 ${tokenTicker.toUpperCase()}`} className="flex-grow flex-1 outline-none placeholder:text-gray-400 bg-transparent" value={stakingAmount} onChange={(e) => setStakingAmount(e.target.value)} />
						<p onClick={() => setStakingAmount(tokenBalance.toString())} className="font-semibold text-gray-400 cursor-pointer">
							MAX
						</p>
					</div>

					<div className="flex flex-col sm:flex-row justify-between mb-4">
						<p className="text-gray-500">Currently Staked</p>
						<p className="font-semibold">
							{currentStakeAmount?.toFixed(5)} {tokenTicker.toUpperCase()}
						</p>
					</div>

					<hr className="border-gray-200 mb-4" />

					<div className="flex space-x-2 mb-4 items-center">
						<input type="checkbox" checked={termsAgreed} onChange={() => setTermsAgreed(!termsAgreed)} className="cursor-pointer" />
						<p className="text-gray-500">
							I agree to the <span className="underline">Terms and Conditions</span>
						</p>
					</div>

					<button disabled={!termsAgreed || !stakingAmount} onClick={confirmStake} className="w-full py-2 rounded-md font-semibold mb-4 bg-blue-500 text-white border hover:bg-blue-600 disabled:bg-transparent disabled:text-gray-500 disabled:outline-gray-500 disabled:cursor-not-allowed transition transform ease-in-out">
						Confirm
					</button>

					<p className="text-gray-500">Confirming this will send your funds to the staking contract. Staking will give you the opportunity to win NFT lotteries and you will be able to withdraw these funds after {unixToDateTime(endTime, "local")}</p>
					<Toaster />
				</div>
			</div>
		</div>
	);
}
export default StakeTokenModal;
