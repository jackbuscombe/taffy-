import { XIcon } from "@heroicons/react/outline";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useBalance } from "wagmi";
import capitalizeFirstLetter from "../hooks/capitalizeFirstLetter";
import dateToUnix from "../hooks/dateToUnix";
import { trpc } from "../utils/trpc";

type ComponentProps = {
	setIsBackingModalOpen: any;
	id: any;
	endTime: any;
	raiseTokenAddress: string;
	raiseTokenTicker: string;
	projectId: string;
	projectName: string;
	tokenId: string;
	tokenPrice: any;
	projectTicker: string;
	target: number;
};

function BackProjectModal({ setIsBackingModalOpen, endTime, raiseTokenAddress, raiseTokenTicker, projectId, projectName, tokenId, tokenPrice, projectTicker, target }: ComponentProps) {
	const { data: session, status } = useSession();
	const createContribution = trpc.useMutation(["contribution.createContribtuion"]);
	const [raiseTokenBalance, setRaiseTokenBalance] = useState(0);
	const [ethBalance, setEthBalance] = useState(5.1232323);
	const [backingAmount, setBackingAmount] = useState<number>(0);
	const [termsAgreed, setTermsAgreed] = useState(false);
	const router = useRouter();
	const backProjectModalWrapper = useRef(null);
	const { data: fetchedTokenBalance, refetch } = useBalance({
		addressOrName: session?.user?.id,
		token: raiseTokenAddress,
		watch: true,
	});

	useOutsideAlerter(backProjectModalWrapper);

	const confirmContribution = async () => {
		toast.loading("Making contribution");

		if (!session?.user?.id) {
			toast.error("There was no account found. Make sure you are signed in and try again.");
			return;
		}

		if (!termsAgreed) {
			toast.error("You may not contribute without agreeing to the Taffy terms.");
		}

		try {
			const createdContribution = await createContribution.mutateAsync({
				amount: backingAmount,
				contributedTokenAddress: tokenId,
				projectId: projectId,
			});

			if (!createdContribution) {
				toast.dismiss();
				toast.error("Unable to make contribution.");
				return;
			}

			toast.dismiss();
			toast.success("Your contrubution was successful!");
			router.reload();
		} catch (error) {
			toast.dismiss();
			toast.error("There was an error contributing to the project.");
			console.log(error);
			return;
		}

		setIsBackingModalOpen(false);
	};

	function useOutsideAlerter(ref: any) {
		useEffect(() => {
			function handleClickOutside(event: any) {
				if (ref.current && !ref.current.contains(event.target)) {
					setIsBackingModalOpen(false);
				}
			}
			document.addEventListener("mousedown", handleClickOutside);
			return () => {
				document.removeEventListener("mousedown", handleClickOutside);
			};
		}, [ref]);
	}

	// Find current balance of raise token
	useEffect(() => {
		if (!session?.user?.id || !tokenId) {
			return;
		}

		refetch();
	}, [session?.user?.id, tokenId]);

	useEffect(() => {
		if (!fetchedTokenBalance) return;
		if (parseFloat(fetchedTokenBalance.formatted) >= 0) return;

		setRaiseTokenBalance(parseFloat(fetchedTokenBalance.formatted));
	}, [fetchedTokenBalance]);

	return (
		<div className="flex justify-center items-center fixed top-0 right-0 left-0 z-50 w-full h-full overflow-y-auto overflow-x-hidden bg-black bg-opacity-50 cursor-auto">
			<div ref={backProjectModalWrapper} className="h-full md:h-auto">
				<div className="relative p-6 w-full max-w-md h-full md:h-auto bg-gray-50 rounded-lg shadow-2xl border border-gray-900">
					<div className="flex justify-between items-center">
						<h2 className="text-xl mb-2">Back {capitalizeFirstLetter(projectName)}</h2>
						<XIcon onClick={() => setIsBackingModalOpen(false)} className="h-8 w-8 sm:h-10 sm:w-10 cursor-pointer sm:p-2 hover:bg-gray-300 rounded-full" />
					</div>
					<p className="text-gray-500 mb-4">Nor again is there anyone who loves or pursues or desires to obtain pain of itself</p>
					<hr className="border-gray-200 mb-4" />

					<div className="flex text-gray-500 mb-4">
						<p>
							Balance:{" "}
							<span onClick={() => setBackingAmount(raiseTokenBalance)} className="text-blue-500 cursor-pointer">
								{raiseTokenBalance} {raiseTokenTicker.toUpperCase()}
							</span>
						</p>
					</div>

					<div className="w-full border border-gray-200 flex flex-col sm:flex-row justify-between p-2 mb-4">
						<input type="number" placeholder={`0 ${raiseTokenTicker}`} className="flex-grow flex-1 outline-none bg-transparent placeholder:text-gray-400" value={`${backingAmount}`} onChange={(e) => setBackingAmount(parseFloat(e.target.value))} onWheel={(e) => (e.target as HTMLInputElement).blur()} />
						<p onClick={() => setBackingAmount(raiseTokenBalance)} className="font-semibold text-gray-400 cursor-pointer">
							MAX
						</p>
					</div>

					<div className="flex flex-col sm:flex-row justify-between mb-4">
						<p className="flex flex-col justify-center sm:items-center sm:flex-row text-gray-500">
							Your % contribution to{" "}
							{target.toLocaleString("en", {
								minimumFractionDigits: 0,
								maximumFractionDigits: 4,
							})}{" "}
							{raiseTokenTicker.toUpperCase()} target:
							{/* <span className="text-xs sm:ml-2 text-gray-400">
								(based on {target} {raiseTokenTicker.toUpperCase()} target:)
								{raiseTokenAddress} = 1{projectTicker.toUpperCase()})
							</span> */}
						</p>
						<p className="font-semibold">
							{parseFloat(((backingAmount / target) * 100).toFixed(5)) ?? 0}%{/* {outputAmount.toFixed(5)} {projectTicker.toUpperCase()} */}
						</p>
					</div>

					<hr className="border-gray-200 mb-4" />

					<div className="flex space-x-2 mb-4 items-center">
						<input type="checkbox" checked={termsAgreed} onChange={() => setTermsAgreed(!termsAgreed)} className="cursor-pointer" />
						<p className="text-gray-500">
							I agree to the <span className="underline">Terms and Conditions</span>
						</p>
					</div>

					<button disabled={!termsAgreed || !backingAmount} onClick={confirmContribution} className="w-full py-2 rounded-md font-semibold mb-4 bg-blue-500 text-white border hover:bg-blue-600 disabled:bg-transparent disabled:text-gray-500 disabled:outline-gray-500 disabled:cursor-not-allowed transition transform ease-in-out">
						Confirm
					</button>

					<p className="text-gray-500">This is an all or nothing and if project does not raise funds by {endTime} then funds will be returned. </p>
					<Toaster />
				</div>
			</div>
		</div>
	);
}
export default BackProjectModal;
