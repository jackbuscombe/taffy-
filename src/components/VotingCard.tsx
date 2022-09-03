import { CheckIcon, ChevronDownIcon } from "@heroicons/react/outline";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import capitalizeFirstLetter from "../hooks/capitalizeFirstLetter";
import { trpc } from "../utils/trpc";

type VotingCardProps = {
	proposalId: any;
	title: string;
	description: string;
	question: string;
	options: any;
	projectId: string;
	projectName: string;
	projectTicker: string;
	projectImage: string;
	timeLeft: any;
};

function VotingCard({ proposalId, title, description, question, options, projectId, projectName, projectTicker, projectImage, timeLeft }: VotingCardProps) {
	const { data: session, status } = useSession();
	const createVote = trpc.useMutation(["vote.createVote"]);
	const { data: existingVote, isFetching: fetchingExistingVote } = trpc.useQuery(["vote.checkforExistingVote", { proposalId: proposalId }]);
	const router = useRouter();

	const [isExpanded, setIsExpanded] = useState(false);
	const [closingTimestamp, setClosingTimestamp] = useState();
	const [selectedOption, setSelectedOption] = useState<number>(-1);
	const [submittedVoteId, setSubmittedVoteId] = useState(-1);

	useEffect(() => {
		setClosingTimestamp(timeLeft);
	}, []);

	useEffect(() => {
		if (!existingVote) {
			return;
		}

		if (!existingVote) {
			setSubmittedVoteId(-1);
			return;
		}
		console.log("Submitted Vote ID", existingVote);
		setSubmittedVoteId(existingVote.selection);
		return;
	}, [existingVote]);

	useEffect(() => {
		if (submittedVoteId > -1) {
			setSelectedOption(submittedVoteId);
		}
	}, [submittedVoteId]);

	const submitVote = async () => {
		// e.preventDefault();
		if (!session?.user?.id) {
			toast.dismiss();
			toast.error("Please sign in to vote");
			return;
		}

		if (typeof selectedOption !== "number") {
			toast.error("Make a selection before submitting a vote");
			return;
		}

		toast.dismiss();
		toast.loading("Submitting vote");

		try {
			const submittedVote = await createVote.mutateAsync({ proposalId: proposalId, selection: selectedOption });

			if (!submittedVote) {
				toast.dismiss();
				toast.error("Vote not submitted");
				return;
			}
			toast.dismiss();
			toast.success("Successfully submitted vote!");
			setSubmittedVoteId(selectedOption);
			setIsExpanded(false);
		} catch (error) {
			toast.dismiss();
			toast.error(error as any);
			return;
		}
	};

	return (
		<div
			onClick={() => {
				setIsExpanded(!isExpanded);
			}}
			className={`group rounded-md p-6 shadow-md cursor-pointer mb-2 border-[1px] ${submittedVoteId > -1 ? "bg-green-50 hover:bg-green-100" : "bg-white hover:bg-gray-50"}`}
		>
			<div className=" flex flex-col md:grid grid-cols-12 justify-between pb-4 items-center gap-1">
				{submittedVoteId > -1 && (
					<div className="col-span-1 flex flex-col items-start">
						<CheckIcon className="h-8 w-8 p-2 rounded-full border text-green-600" />
						{/* <div className="hidden group-hover:flex  ">
							<p className="whitespace-nowrap p-2 rounded-xl text-xs text-white mb-1 bg-black">{"You've voted!"}</p>
						</div> */}
					</div>
				)}
				<div className={`flex flex-col md:flex-row items-center space-x-4 ${submittedVoteId > -1 ? "col-span-4" : "col-span-5"}`}>
					<img src={projectImage} alt="profile" className="h-16 w-16 rounded-full" />
					<div>
						<div className="flex flex-col text-center lg:flex-row justify-center items-center md:space-x-2">
							<h2 className="text-gray-700 font-bold text-lg">{projectName}</h2>
							<p className="text-gray-400 text-light">{projectTicker.toUpperCase()}</p>
						</div>
						<p className="text-green-500 font-semibold text-xs cursor-pointer hover:underline hidden lg:block">Participate</p>
					</div>
				</div>

				<div className={`flex justify-center text-center col-span-4 md:space-x-8 py-4`}>
					<div className="flex flex-col md:border-l-2 border-gray-100 pl-4">
						<p className="text-lg font-semibold">{title}</p>
						<p className="text-sm text-gray-400">Voting Closes {closingTimestamp}</p>
					</div>
				</div>

				<div className={`flex col-span-3 justify-end items-center space-x-2`}>
					<button
						onClick={(e) => {
							e.stopPropagation();

							router.push(`/project/${projectId}`);
						}}
						className="w-24 p-1 border-[1px] rounded-sm border-[#5082fb] text-[#5082fb] font-semibold hover:bg-[#5082fb] hover:text-white"
					>
						Visit {projectTicker.toUpperCase()}
					</button>
					<button onClick={() => setIsExpanded(!isExpanded)} className="ml-2 p-1 border-[1px] rounded-sm border-gray-400 hover:bg-gray-100 hover:text-white flex justify-center items-center">
						<ChevronDownIcon className={`h-6 w-6 text-gray-400 ${isExpanded && "rotate-180"} transition transform ease-in-out`} />
					</button>
				</div>
			</div>

			{isExpanded && (
				<form className="border-t-[1px] border-t-gray-100 flex flex-col md:grid grid-cols-3 col-span-full gap-12 mb-4 pt-6">
					<div className="col-span-1">
						<h4 className="font-semibold">{title}</h4>
						<p className="text-xs text-gray-400">{description}</p>
					</div>

					<div className="col-span-2 space-y-2">
						<h3 className="text-lg font-semibold">{question}</h3>
						{options.map((option: any, i: number) => (
							<div
								key={option.id}
								onClick={(e) => {
									e.stopPropagation();

									setSelectedOption(option.id);
								}}
								className="flex flex-1 items-center p-4 space-x-4 text-sm border-[1px] rounded-sm border-gray-200 cursor-pointer hover:bg-blue-50"
							>
								<input type="radio" value={option.id} checked={selectedOption === option.id} className="cursor-pointer" />
								<label className="cursor-pointer">{option.value}</label>
							</div>
						))}
						<button
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								submitVote();
							}}
							className="bg-blue-500 text-white px-6 py-2 mt-4 rounded-sm font-semibold hover:bg-transparent border-[1px] hover:text-blue-500 border-blue-500 transition transform ease-in-out"
						>
							Submit Vote
						</button>
					</div>
				</form>
			)}
		</div>
	);
}
export default VotingCard;
