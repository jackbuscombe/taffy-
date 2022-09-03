import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { ChevronDownIcon, XIcon } from "@heroicons/react/outline";
import capitalizeFirstLetter from "../hooks/capitalizeFirstLetter";
import unixToDateTime from "../hooks/unixToDateTime";
import { useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";
import { Project } from "@prisma/client";

function CreateProposal() {
	const { data: session, status } = useSession();
	const { data: userProjects, isFetching: fetchingUserProjects } = trpc.useQuery(["project.getLoggedInUserProjects"]);
	const createdProposal = trpc.useMutation(["proposal.createProposal"]);
	const router = useRouter();
	const [isPreviewing, setIsPreviewing] = useState<boolean>(false);

	const titleRef = useRef<HTMLInputElement>(null);
	const descriptionRef = useRef<HTMLTextAreaElement>(null);
	const questionRef = useRef<HTMLInputElement>(null);
	const [closeDate, setCloseDate] = useState<number>();
	const [optionCount, setOptionCount] = useState<number>(2);

	const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState<boolean>(false);
	const [selectedProject, setSelectedProject] = useState<Project>();

	const previewProposalWrapperRef = useRef(null);
	const projectDropdownWrapperRef = useRef(null);
	useOutsideAlerter(previewProposalWrapperRef, "isPreviewing");
	useOutsideAlerter(projectDropdownWrapperRef, "projectDropdown");

	const checkForMissingFields = () => {
		if (!titleRef.current?.value || !descriptionRef.current?.value || !questionRef.current?.value || !selectedProject?.id || !closeDate) {
			toast.dismiss();
			toast.error("Please enter required fields");
			return false;
		} else if (!(document.getElementById("option_0") as HTMLInputElement).value || !(document.getElementById("option_1") as HTMLInputElement).value) {
			toast.dismiss();
			toast.error("You must enter at least 2 options");
			return false;
		} else {
			return true;
		}
	};

	const openPreview = () => {
		if (!checkForMissingFields()) {
			return;
		}
		setIsPreviewing(true);
	};

	const publishProposal = async () => {
		toast.dismiss();
		toast.loading("Publishing Proposal");

		try {
			if (!checkForMissingFields() || !selectedProject) {
				toast.dismiss();
				toast.error("Please enter all required fields");
				return false;
			}
			const options: any[] = [];
			for (let i = 0; i < optionCount; i++) {
				if ((document.getElementById(`option_${i}`) as HTMLInputElement).value) {
					options.push({
						id: i,
						value: (document.getElementById(`option_${i}`) as HTMLInputElement).value,
					});
				}
			}

			const newProposal = await createdProposal.mutateAsync({
				projectId: selectedProject.id,
				title: (titleRef.current as HTMLInputElement).value,
				description: descriptionRef.current?.value,
				question: (questionRef.current as HTMLInputElement).value,
				options,
				votingCloseTimestamp: closeDate as number,
			});

			if (!newProposal) {
				toast.dismiss();
				toast.error("There was an error publishing your proposal");
				return;
			}

			toast.dismiss();
			toast.success("Proposal Published");
			router.push(`/project/${selectedProject.id}`);
		} catch (e) {
			if (typeof e === "string") {
				toast.dismiss();
				toast.error(e.toUpperCase());
			} else if (e instanceof Error) {
				toast.dismiss();
				toast.error(e.message);
			}
		}
	};

	function useOutsideAlerter(ref: any, element: string) {
		useEffect(() => {
			function handleClickOutside(event: any) {
				if (ref.current && !ref.current.contains(event.target)) {
					if (element === "isPreviewing") {
						setIsPreviewing(false);
					} else {
						setIsProjectDropdownOpen(false);
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
		if (!userProjects || !router.query) return;
		console.log("router.query is", router.query);

		if (Object.keys(router.query).length > 0 && userProjects.length > 0) {
			for (let i = 0; i < userProjects.length; i++) {
				if ((userProjects[i] as Project).id === (router.query.id as string)) {
					setSelectedProject(userProjects[i]);
				}
			}
		}
	}, [router.query, userProjects]);

	return (
		<main className="w-full bg-blue-50 flex justify-center py-8">
			<div className="flex flex-col justify-items-center bg-white w-11/12 px-6 md:w-3/4 md:px-24 py-8 divide-y text-gray-700 text-center">
				<h1 className="md:w-1/3 text-2xl font-bold text-gray-900 py-4">Create A Proposal</h1>

				<div id="project_select" className="flex flex-col md:flex-row md:items-center py-8 md:space-x-20 space-y-6 md:space-y-0">
					<p className="md:w-1/3 font-semibold">
						Select Project <span className="text-red-500">*</span>
					</p>
					<div className="md:w-2/3">
						<div onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)} className="flex items-center justify-between h-16 border-[1px] border-gray-200 rounded-sm px-4 py-2 cursor-pointer bg-white hover:bg-gray-100">
							<div className="block items-center w-full">
								{selectedProject ? (
									<div ref={projectDropdownWrapperRef} className="flex justify-between items-center w-full">
										<div className="flex space-x-4 items-center cursor-pointer">
											<img src={selectedProject.image} alt="" className="h-10 w-10" />
											<p className="font-semibold">{selectedProject.name.length < 24 ? selectedProject.name : selectedProject.name.slice(0, 24) + "..."}</p>
										</div>
										<ChevronDownIcon className="h-6 w-6" />
									</div>
								) : (
									<div className="flex justify-between">
										<p>Select project</p>
										<ChevronDownIcon className="h-6 w-6" />
									</div>
								)}
							</div>
						</div>
						{isProjectDropdownOpen && (
							<div ref={projectDropdownWrapperRef} className="absolute border bg-white text-black font-semibold p-2">
								{userProjects ? (
									userProjects.length > 0 ? (
										userProjects.map((result, i: number) => (
											<div
												key={i}
												onClick={() => {
													setSelectedProject(result);
													setIsProjectDropdownOpen(false);
												}}
												className="flex space-x-4 items-center bg-white p-2 border-b hover:bg-gray-100 cursor-pointer"
											>
												<img src={result.image} alt="" className="h-10 w-10" />
												<p>{result.name.length < 24 ? result.name : result.name.slice(0, 24) + "..."}</p>
											</div>
										))
									) : (
										<p className="text-gray-500 font-light mt-4 italic text-center p-3">
											You must{" "}
											<span onClick={() => router.push("/new-project")} className="text-blue-500 cursor-pointer hover:underline font-semibold">
												create a project
											</span>{" "}
											making a proposal!
										</p>
									)
								) : (
									<div className="w-full flex justify-center py-2">
										<svg role="status" className="inline w-10 h-10 text-black animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
											<path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
										</svg>
									</div>
								)}
							</div>
						)}
					</div>
				</div>

				<div className="flex flex-col md:flex-row md:items-center py-8 md:space-x-20 space-y-6 md:space-y-0">
					<h2 className="md:w-1/3 font-semibold">Proposal Title</h2>
					<input ref={titleRef} type="text" placeholder="Proposal title" className="md:w-2/3 border-[1px] border-gray-200 rounded-sm px-4 py-2" />
				</div>

				<div className="flex flex-col md:flex-row md:items-center py-8 md:space-x-20 space-y-6 md:space-y-0">
					<h2 className="md:w-1/3 font-semibold">Proposal Description</h2>
					<textarea ref={descriptionRef} rows={10} placeholder="Describe what is being voted on" className="md:w-2/3 h-28 border-[1px] border-gray-200 rounded-sm px-4 py-2 resize-none"></textarea>
				</div>

				<div className="flex flex-col md:flex-row md:items-center py-8 md:space-x-20 space-y-6 md:space-y-0">
					<div className="md:w-1/3 text-gray-900 space-y-2">
						<p className="font-semibold">
							Voting closing date<span className="text-red-500">*</span>
						</p>
						<p className="font-light text-sm">
							Select your <span className="font-bold">local</span> date and time for which voting will become unavailable. This will be converted to UTC.
						</p>
					</div>
					<div className="md:w-2/3 py-2 flex flex-col space-x-4">
						<input
							type="datetime-local"
							onChange={(e) => {
								setCloseDate(Date.parse(e.target.value) / 1000);
							}}
							className="w-full border-[1px] border-gray-200 rounded-sm px-4 py-2 outline-none cursor-pointer mb-2"
						/>
						{closeDate ? (
							<div className="bg-gray-100 rounded-lg p-2">
								<p>
									<span className="font-semibold">Your Time:</span> {unixToDateTime(closeDate, "local")}
								</p>
								<p>
									<span className="font-semibold">UTC Conversion:</span> {unixToDateTime(closeDate, "utc")}
								</p>
							</div>
						) : (
							<p className="text-light text-gray-500">Select a date and time to preview UTC conversion.</p>
						)}
					</div>
				</div>

				<div className="flex flex-col md:flex-row md:items-center py-8 md:space-x-20 space-y-6 md:space-y-0">
					<div className="md:w-1/3 text-gray-900 py-4 space-y-2">
						<h2 className="font-semibold">Options</h2>
						<p className="font-light text-sm">Describe the options stakeholder can select. These will be deisplayed as multiple-choice.</p>
					</div>

					<div className="md:w-2/3 flex flex-col items-center">
						<input ref={questionRef} type="text" placeholder="Enter call to action question" className="border-[1px] border-gray-200 rounded-sm px-4 py-2 w-full mb-6" />
						<div className="w-full">
							{[...Array(optionCount)].map((_, i) => (
								// <TraitContainer key={i} traitNumber={i + 1} />
								<div key={i} className="flex items-center space-x-2 mb-2">
									<input id={`option_${i}`} type="text" placeholder={`Option ${i + 1} choice`} className="w-full border-[1px] border-gray-500 rounded-sm px-4 py-2 bg-blue-100 font-semibold" />
									{optionCount > 2 && <XIcon onClick={() => setOptionCount(optionCount - 1)} className="h-8 w-8 text-gray-300 cursor-pointer hover:text-black hover:scale-110" />}
								</div>
							))}
						</div>

						<button
							onClick={() => {
								if (optionCount >= 10) {
									toast.dismiss();
									toast(
										<p>
											😱 You may have a <span className="font-bold text-red-500">maximum</span> of 10 options
										</p>
									);
									return;
								}
								setOptionCount(optionCount + 1);
							}}
							className="text-blue-500 px-4 py-2 mt-4 rounded-sm font-semibold hover:bg-blue-500 border-[1px] hover:text-white border-gray-300 transition transform ease-in-out"
						>
							+ Add Option
						</button>
					</div>
				</div>

				<div className="flex flex-col-reverse md:flex-row justify-center md:space-x-6 py-8">
					<button onClick={() => router.back()} className="text-gray-500 md:px-20 py-2 rounded-sm font-semibold hover:bg-gray-500 border-[1px] hover:text-white border-gray-300 transition transform ease-in-out">
						Cancel
					</button>
					<button onClick={openPreview} className="bg-blue-500 text-white md:px-20 py-2 mb-2 md:mb-0 rounded-sm font-semibold hover:bg-transparent border-[1px] hover:text-blue-500 border-blue-500 transition transform ease-in-out">
						Preview
					</button>
				</div>
			</div>

			{isPreviewing && (
				<div ref={previewProposalWrapperRef} className="fixed top-[5vh] bottom-[5vh] left-[20vw] right-[20vw] overflow-y-scroll scrollbar-hide m-auto bg-white rounded-sm p-6 shadow-lg text-gray-700 z-40">
					<h1 className="w-1/3 text-2xl font-bold text-gray-900 py-4">Confirm Proposal</h1>

					<div className="flex py-4 space-x-20">
						<h2 className="w-1/3 font-semibold">Project</h2>
						<div className="w-2/3 flex space-x-2">
							<img src={selectedProject?.image} alt="" className="h-6 w-6" />
							<p className="font-semibold">{selectedProject?.name}</p>
						</div>
					</div>

					<div className="flex py-4 space-x-20">
						<h2 className="w-1/3 font-semibold">Proposal Title</h2>
						<p className="w-2/3">{titleRef.current?.value}</p>
					</div>

					<div className="flex py-4 space-x-20">
						<h2 className="w-1/3 font-semibold">Proposal Description</h2>
						<p className="w-2/3">{descriptionRef.current?.value}</p>
					</div>

					<div className="flex py-4 space-x-20">
						<h2 className="w-1/3 font-semibold">Voting Closes</h2>
						<p className="w-2/3">{closeDate && unixToDateTime(closeDate, "utc")}</p>
					</div>

					<div className="flex py-4 space-x-20">
						<h2 className="w-1/3 font-semibold">Voting Question</h2>
						<p className="w-2/3">{questionRef.current?.value}</p>
					</div>

					<div className="flex py-4 space-x-20">
						<h2 className="w-1/3 font-semibold">Voting Options</h2>
						<div className="w-2/3">
							{[...Array(optionCount)].map((_, i) => (
								<div key={i} className="flex flex-col mb-4 border-[1px] p-2">
									<p className="w-full font-semibold">{`Option ${i + 1}:`}</p>
									<p>{(document.getElementById(`option_${i}`) as HTMLInputElement).value}</p>
								</div>
							))}
						</div>
					</div>

					<div className="w-full flex flex-col-reverse md:flex-row justify-center md:space-x-6 py-8">
						<button onClick={() => setIsPreviewing(false)} className="text-gray-500 px-20 py-2 rounded-sm font-semibold hover:bg-gray-500 border-[1px] hover:text-white border-gray-300 transition transform ease-in-out">
							Close
						</button>
						<button onClick={publishProposal} className="bg-blue-500 text-white px-20 py-2 rounded-sm font-semibold hover:bg-transparent border-[1px] hover:text-blue-500 border-blue-500 transition transform ease-in-out">
							Publish
						</button>
					</div>
				</div>
			)}
			<Toaster containerClassName="z-50" />
		</main>
	);
}
export default CreateProposal;
