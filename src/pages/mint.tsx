import { ChevronDownIcon, PaperClipIcon, PlusCircleIcon } from "@heroicons/react/outline";
import React, { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/router";
import { XIcon } from "@heroicons/react/outline";
import capitalizeFirstLetter from "../hooks/capitalizeFirstLetter";
import { useSession, signOut } from "next-auth/react";
import { trpc } from "../utils/trpc";
import deployNft from "../utils/deployNft";
import axios from "axios";
import { Project } from "@prisma/client";
import { Beneficiary } from "../types/typings";
import { unstable_getServerSession } from "next-auth/next";
import { GetServerSideProps, NextApiRequest, NextApiResponse } from "next";
import { authOptions } from "../pages/api/auth/[...nextauth]";

type TraitType = {
	traitName: string;
	traitValue: string;
};

function Mint() {
	const { data: session, status } = useSession();
	const createNft = trpc.useMutation(["nft.createNft"]);
	const updateNftAddress = trpc.useMutation(["nft.updateNftAddress"]);
	const { data: recentTraits, isFetching: fetchingRecentTraits } = trpc.useQuery(["nft.getRecentTraits"]);
	const { data: userProjects, isFetching: fetchingUserProjects } = trpc.useQuery(["project.getLoggedInUserProjects"]);
	const router = useRouter();
	const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
	const [selectedProject, setSelectedProject] = useState<Project>();

	const [suggestedTraitNames, setSuggestedTraitNames] = useState<string[]>([]);
	const [suggestedTraitValues, setSuggestedTraitValues] = useState<string[]>([]);

	const [showSuggestedTraitNames, setShowSuggestedTraitNames] = useState<boolean>(false);
	const [showSuggestedTraitValues, setShowSuggestedTraitValues] = useState<boolean>(false);

	const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);

	const projectDropdownWrapperRef = useRef(null);
	useOutsideAlerter(projectDropdownWrapperRef);

	const [imageUrl, setImageUrl] = useState<string>("");
	const [uploadingImage, setUploadingImage] = useState<boolean>(false);
	const imagePickerRef = useRef<HTMLInputElement>(null);

	const handleImageDialogue = () => {
		// 👇️ open file input box on click of other element
		imagePickerRef.current?.click();
	};

	const name = useRef<HTMLInputElement>(null);
	const description = useRef<HTMLTextAreaElement>(null);
	const [traitCount, setTraitCount] = useState<number>(0);
	const [royaltyCount, setRoyaltyCount] = useState<number>(0);

	// Populate Suggested Traits
	useEffect(() => {
		console.log("selectedProject", selectedProject);
		if (!selectedProject) {
			return;
		}
		async function getSuggestedTraits() {
			if (!recentTraits) {
				return;
			}
			recentTraits.forEach((doc) => {
				for (let i = 0; i < doc.traits.length; i++) {
					setSuggestedTraitNames((suggestedTraitNames) => [...suggestedTraitNames, (doc.traits[i] as TraitType).traitName as string]);
					setSuggestedTraitValues((suggestedTraitValues) => [...suggestedTraitValues, (doc.traits[i] as TraitType).traitValue as string]);
					// setSuggestedTraitNames((suggestedTraitNames) => [...suggestedTraitNames, doc.data().traits[i].traitName]);
					// setSuggestedTraitValues((suggestedTraitValues) => [...suggestedTraitValues, doc.data().traits[i].traitValue]);
				}
			});
		}

		getSuggestedTraits();
	}, [selectedProject]);

	const mintNft = async (queued: boolean) => {
		if (!session?.user?.id) {
			toast.dismiss();
			toast.error("You must be logged in to mint");
			return;
		}
		toast.loading("Minting NFT");

		// Form Error Handling
		if (!name.current?.value) {
			name.current?.scrollIntoView({
				behavior: "smooth",
				block: "center",
				inline: "center",
			});
			setTimeout(() => {
				name.current?.focus();
			}, 500);
			return toast.error("You must enter a name");
		}

		if (!imageUrl) {
			document.getElementById("image_button")?.scrollIntoView({
				behavior: "smooth",
				block: "center",
				inline: "center",
			});
			setTimeout(() => {
				document.getElementById("image_button")?.focus();
			}, 500);
			return toast.error("You must choose a file to upload");
		}

		if (!selectedProject) {
			document.getElementById("project_select")?.scrollIntoView({
				behavior: "smooth",
				block: "center",
				inline: "center",
			});
			setTimeout(() => {
				document.getElementById("project_select")?.focus();
			}, 500);
			return toast.error("You must select a project to mint to");
		}

		// Build Traits Object
		const traitsObject: { traitName: string; traitValue: string }[] = [];
		let traitName;
		let traitValue;

		for (let i = 0; i < traitCount; i++) {
			traitName = (document.getElementById(`trait_${i}`) as HTMLInputElement).value || "name";
			traitValue = (document.getElementById(`trait_${i}_value`) as HTMLInputElement).value;
			traitsObject.push({
				traitName: traitName,
				traitValue: traitValue,
			});
		}

		// Check That beneficiary addresses exist
		for (let i = 0; i < beneficiaries.length; i++) {
			if (!beneficiaries[i]?.address) {
				toast.dismiss();
				toast.error("Missing Royalty Address");
				return;
			}
		}

		try {
			// This creates an NFT on the DB, but does not mint => contractAddress is empty
			const createdNft = await createNft.mutateAsync({
				chainId: 1,
				contractAddress: "",
				creatorId: session.user.id,
				description: description.current?.value || "",
				mintTimestamp: Math.floor(Date.now() / 1000),
				name: name.current.value,
				nftUrl: imageUrl,
				projectId: selectedProject.id ?? undefined,
				tokenId: 1,
				traits: traitsObject,
				beneficiaries,
			});

			if (!createdNft) {
				toast.dismiss();
				toast.error("Unable to create NFT");
				return;
			}

			if (!queued) {
				// Deploy NFT -> Obviously fix the function but the process stands
				const deployedNft = await deployNft(name.current.value, name.current.value);
				console.log("Deployed NFT", deployedNft);

				const updatedNft = await updateNftAddress.mutateAsync({ id: createdNft.id, address: deployedNft?.creates ?? "Unable to get NFT Address" });
				console.log("Updated NFT", updatedNft);

				if (!updatedNft) {
					toast.dismiss();
					toast.error("Failed to mint NFT!");
					return;
				}
				toast.dismiss();
				toast.success("Successfully Minted NFT!");
				return router.push(`/nft/${createdNft.id}`);
			}
			toast((t) => (
				<span>
					<b>NFT successfully created</b>
					<button onClick={() => router.reload()}>Create another Nft</button>
					<button onClick={() => router.push(`/nft/${createdNft.id}`)}>Take me to this NFT</button>
					<button onClick={() => toast.dismiss(t.id)}>Dismiss</button>
				</span>
			));
		} catch (error) {
			toast.dismiss();
			toast.error("There was an Error minting your NFT");
		}
	};

	const handleLogout = async () => {
		await signOut();
		router.push("/");
	};

	function useOutsideAlerter(ref: any) {
		useEffect(() => {
			function handleClickOutside(event: any) {
				if (ref.current && !ref.current.contains(event.target)) {
					setIsProjectDropdownOpen(false);
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
	}, [userProjects, router.query]);

	const uploadImage = async (e: any) => {
		const file = e.target.files[0];
		const reader = new FileReader();
		if (file) {
			if (file.size <= 10 * 1024 * 1024 /* 10MB */) {
				reader.readAsDataURL(file);
			} else {
				// setPictureError("File size is exceeding 10MB.");
				toast.error("Image exceeds 10MB.");
				return;
			}
		}

		reader.addEventListener(
			"load",
			async function () {
				try {
					const image = reader.result;

					if (!image) return;

					let toastId;
					try {
						setUploadingImage(true);

						toastId = toast.loading("Uploading Image");
						const { data } = await axios.post("/api/image-upload", { image });
						if (data) {
							console.log("Upload data is", data);
							setImageUrl(data.url);
							toast.success("Successfully uploaded", { id: toastId });
						} else {
							toast.error("Unable to upload", { id: toastId });
							return;
						}
					} catch (e) {
						toast.error("Unable to upload", { id: toastId });
						return;
					} finally {
						setUploadingImage(false);
					}
				} catch (err) {
					toast.error("Unable to update image");
					return;
				} finally {
					setUploadingImage(false);
				}
			},
			false
		);
	};

	return (
		<main className="w-full bg-blue-50 flex justify-center py-8">
			<div className="flex flex-col justify-items-center bg-white w-11/12 px-6 md:w-3/4 md:px-24 py-8 divide-y text-gray-700 text-center">
				{/* Row 1 */}
				<div className="flex flex-col py-4">
					<div className="flex flex-col md:flex-row items-center text-center py-4 md:space-x-20 space-y-6 md:space-y-0">
						<h1 className="w-full md:w-1/3 text-2xl font-bold text-gray-900">Mint NFT</h1>
						<div className="bg-[url('/watch_mint_bg.png')] w-full md:w-2/3 h-24 flex justify-center md:justify-start items-center px-8 cursor-pointer hover:opacity-90 transition transform ease-in-out">
							<img src="/watch_mint_text.png" alt="" className="" />
						</div>
					</div>

					<div className="flex flex-col md:flex-row py-8 md:items-center md:space-x-20 space-y-6 md:space-y-0">
						<p className="md:w-1/3 font-semibold">Creator Wallet Address</p>
						<div className="md:w-2/3 flex flex-col justify-center space-y-3">
							<p className="break-words md:hidden">{session?.user?.id}</p>
							<p className="hidden md:block mb-4 break-words">{session?.user?.id}</p>
							<button onClick={handleLogout} className="bg-green-500 text-white px-4 py-2 rounded-sm font-semibold hover:bg-transparent border-[1px] hover:text-green-500 border-green-500 transition transform ease-in-out">
								Change Wallet
							</button>
						</div>
					</div>
				</div>

				{/* Select Project Row */}
				<div id="project_select" className="flex flex-col md:flex-row md:items-center py-8 md:space-x-20 space-y-6 md:space-y-0">
					<p className="md:w-1/3 font-semibold">
						Select Project <span className="text-red-500">*</span>
					</p>
					<div className="md:w-2/3">
						<div onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)} className="flex items-center justify-between h-16 border-[1px] border-gray-200 rounded-sm px-4 py-2 cursor-pointer bg-white hover:bg-gray-100">
							<div className="block items-center w-full">
								{selectedProject ? (
									<div className="flex justify-between items-center w-full">
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
											before minting an NFT!
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

				{/* Row 2 */}
				<div className="flex flex-col md:flex-row py-8 md:items-center md:space-x-20 space-y-6 md:space-y-0">
					<p className="md:w-1/3 font-semibold">
						NFT name <span className="text-red-500">*</span>
					</p>
					<input ref={name} type="text" placeholder="NFT name" className="md:w-2/3 border-[1px] border-gray-200 rounded-sm px-4 py-2" />
				</div>

				{/* Row 3 */}
				<div className="flex flex-col md:flex-row py-8 md:space-x-20 space-y-6 md:space-y-0">
					<div className="md:w-1/3 space-y-2">
						<p className="font-semibold">NFT description</p>
						<p className="font-light text-sm">The description will be included on the items detail page underneath its image. Markdown syntax is supported.</p>
					</div>
					<textarea ref={description} placeholder="Description" className="md:w-2/3 h-28 border-[1px] border-gray-200 rounded-sm px-4 py-2 resize-none" />
				</div>

				{/* Row 4 */}
				<div className="flex flex-col md:flex-row py-8 md:space-x-20 space-y-6 md:space-y-0">
					<div className="md:w-1/3 space-y-2">
						<p className="font-semibold">
							File <span className="text-red-500">*</span>
						</p>
						<p className="font-light text-sm">File types supported: JPG, PNG, GIF, SVG, MP4, WEBM, MP3, WAV, OGG, GLB, GLTF. Max size: 10 MB</p>
					</div>
					<div className="md:w-2/3 flex justify-center">
						{!imageUrl ? (
							<button id="image_button" onClick={handleImageDialogue} className="flex items-center h-20 border-[1px] border-gray-200 rounded-sm px-10 py-1 hover:bg-blue-500 hover:text-white group transition transform ease-in-out">
								<PaperClipIcon className="h-6 w-6 mr-2" />
								<p className="text-blue-500 font-semibold group-hover:text-white">Add Image</p>
							</button>
						) : (
							<img onClick={handleImageDialogue} id="nftImage" src={imageUrl} alt="NFT Image" className={`max-h-52 cursor-pointer max-w-2xl rounded-sm hover:opacity-90 object-cover transition transform ease-in-out ${!imageUrl && "hidden"}`} />
						)}
						<input ref={imagePickerRef} type="file" accept="image/*" onChange={uploadImage} disabled={uploadingImage} className="hidden" />
					</div>
				</div>

				{/* Row 5 */}
				<div className="">
					<div className="flex flex-col md:flex-row py-8 md:space-x-20 space-y-3 md:space-y-0">
						<div className="md:w-1/3 space-y-2">
							<p className="font-semibold">Add traits</p>
							<p className="font-light text-sm">Add traits to your NFT. You may add up to 10 unique traits with corresponding values.</p>
						</div>
						<div className="md:w-2/3 px-4 flex flex-col items-center">
							<div id="traits_container">
								{[...Array(traitCount)].map((_, i) => (
									// <TraitContainer key={i} traitNumber={i + 1} />
									<div key={i} className="flex items-center space-x-2 mb-2">
										<input
											onFocus={() => setShowSuggestedTraitNames(true)}
											onBlur={() => {
												setShowSuggestedTraitNames(false);
											}}
											id={`trait_${i}`}
											type="text"
											placeholder={`Trait ${i + 1} Name`}
											className="w-2/3 border-[1px] border-gray-200 rounded-sm px-4 py-2"
										/>
										<input onFocus={() => setShowSuggestedTraitValues(true)} onBlur={() => setShowSuggestedTraitValues(false)} id={`trait_${i}_value`} type="text" placeholder={`Trait ${i + 1} Value`} className="w-2/3 border-[1px] border-gray-200 rounded-sm px-4 py-2" />
										<XIcon onClick={() => setTraitCount(traitCount - 1)} className="h-8 w-8 text-gray-300 cursor-pointer hover:text-black hover:scale-110" />
									</div>
								))}
							</div>
							{showSuggestedTraitNames && suggestedTraitNames.length > 0 && (
								<div className="flex flex-col flex-wrap justify-center items-center space-y-2">
									<h4 className="italic text-lg">Existing project traits</h4>
									<div className="flex flex-col space-y-1 justify-center items-center">
										{suggestedTraitNames.length > 1 && (
											<div
												onMouseDown={() => {
													setTraitCount(suggestedTraitNames.length);
													setTimeout(() => {
														for (let i = 0; i < suggestedTraitNames.length; i++) {
															if (traitCount >= 10) {
																return;
															}
															(document.getElementById(`trait_${i}`) as HTMLInputElement).value = suggestedTraitNames[i] ?? "";
														}
													}, 500);
												}}
												className="flex w-40 items-center justify-between bg-slate-200 hover:bg-gray-800 text-gray-700 hover:text-white font-semibold p-2 rounded-sm cursor-pointer border transform transition ease-in-out"
											>
												<p className="truncate">Add all {suggestedTraitNames.length}</p>
												<PlusCircleIcon className="h-6 w-6" />
											</div>
										)}
										{suggestedTraitNames.map((traitName, i) => (
											<div
												key={i}
												onMouseDown={() => {
													(document.activeElement as HTMLInputElement).value = traitName;
												}}
												className="flex w-40 items-center justify-between bg-gray-100 hover:bg-gray-800 text-gray-700 hover:text-white font-semibold p-2 rounded-sm cursor-pointer border transform transition ease-in-out"
											>
												<p className="truncate">{traitName}</p>
												<PlusCircleIcon className="h-6 w-6" />
											</div>
										))}
									</div>
								</div>
							)}
							{showSuggestedTraitValues && suggestedTraitValues.length > 0 && (
								<div className="flex flex-col flex-wrap justify-center items-center space-y-2">
									<h4 className="italic text-lg">Existing project values</h4>
									<div className="flex flex-col space-y-1 justify-center items-center">
										{suggestedTraitValues.length > 1 && (
											<div
												onMouseDown={() => {
													setTraitCount(suggestedTraitValues.length);
													setTimeout(() => {
														for (let i = 0; i < suggestedTraitValues.length; i++) {
															if (traitCount >= 10) {
																return;
															}
															(document.getElementById(`trait_${i}_value`) as HTMLInputElement).value = suggestedTraitValues[i] ?? "";
														}
													}, 500);
												}}
												className="flex w-40 items-center justify-between bg-slate-200 hover:bg-gray-800 text-gray-700 hover:text-white font-semibold p-2 rounded-sm cursor-pointer border transform transition ease-in-out"
											>
												<p className="truncate">Add all {suggestedTraitValues.length}</p>
												<PlusCircleIcon className="h-6 w-6" />
											</div>
										)}
										{suggestedTraitValues.map((traitValue, i) => (
											<div
												key={i}
												onMouseDown={(e) => {
													(document.activeElement as HTMLInputElement).value = traitValue;
												}}
												className="flex w-40 items-center justify-between bg-gray-100 hover:bg-gray-800 text-gray-700 hover:text-white font-semibold p-2 rounded-sm cursor-pointer border transform transition ease-in-out"
											>
												<p className="truncate">{traitValue}</p>
												<PlusCircleIcon className="h-6 w-6" />
											</div>
										))}
									</div>
								</div>
							)}
							<button
								onClick={() => {
									if (traitCount >= 10) {
										toast.dismiss();
										toast(
											<p>
												😱 You may have a <span className="font-bold text-red-500">maximum</span> of 10 traits
											</p>
										);
										return;
									}
									setTraitCount(traitCount + 1);
								}}
								className="text-blue-500 px-4 py-2 mt-4 rounded-sm font-semibold hover:bg-blue-500 border-[1px] hover:text-white border-gray-300 transition transform ease-in-out"
							>
								+ Add New Trait
							</button>
						</div>
					</div>
				</div>

				{/* Row 6 */}
				<div className="">
					<div className="flex flex-col md:flex-row py-8 md:space-x-20 space-y-3 md:space-y-0">
						<div className="md:w-1/3 space-y-2">
							<p className="font-semibold">Add royalties</p>
							<p className="font-light text-sm">Add royalties to your NFT. You may add up to 5 unique addresses to receive a fee for each transfer.</p>
						</div>
						<div className="md:w-2/3 px-4 flex flex-col items-center">
							<div id="traits_container">
								{[...Array(royaltyCount)].map((_, i) => (
									// <TraitContainer key={i} traitNumber={i + 1} />
									<div key={i} className="flex items-center space-x-2 mb-2">
										<input
											id={`royalty_${i}`}
											onChange={(e) => {
												const newState = [...beneficiaries];
												console.log("new state", newState);
												(newState[royaltyCount - 1] as Beneficiary).address = e.target.value;
												setBeneficiaries(newState);
											}}
											type="text"
											placeholder={`Royalty ${i + 1} Address`}
											className="w-2/3 border-[1px] border-gray-200 rounded-sm px-4 py-2"
										/>
										<input
											id={`royalty_${i}_value`}
											onChange={(e) => {
												const newState = [...beneficiaries];
												console.log("new state", newState);
												(newState[royaltyCount - 1] as Beneficiary).percentage = parseInt(e.target.value);
												setBeneficiaries(newState);
											}}
											type="number"
											min={0}
											placeholder={`Royalty ${i + 1} Value`}
											className="w-2/3 border-[1px] border-gray-200 rounded-sm px-4 py-2"
											onWheel={(e) => (e.target as HTMLInputElement).blur()}
										/>
										<XIcon
											onClick={() => {
												setRoyaltyCount(royaltyCount - 1);
												const newState = [...beneficiaries];
												newState.pop();
												setBeneficiaries(newState);
												beneficiaries.length;
											}}
											className="h-8 w-8 text-gray-300 cursor-pointer hover:text-black hover:scale-110"
										/>
									</div>
								))}
							</div>
							<button
								onClick={() => {
									if (royaltyCount >= 10) {
										toast.dismiss();
										toast(
											<p>
												😱 You may have a <span className="font-bold text-red-500">maximum</span> of 5 royalty beneficiaries
											</p>
										);
										return;
									}
									setRoyaltyCount(royaltyCount + 1);
									const newState = [...beneficiaries];
									newState.push({
										name: "Royalty",
										address: "",
										percentage: 0,
										benefit: "ROYALTY",
									});
									setBeneficiaries(newState);
								}}
								className="text-blue-500 px-4 py-2 mt-4 rounded-sm font-semibold hover:bg-blue-500 border-[1px] hover:text-white border-gray-300 transition transform ease-in-out"
							>
								+ Add New Roytalty
							</button>
						</div>
					</div>

					{/* Submit Row */}
					<div className="w-full flex flex-col-reverse md:flex-row justify-center md:space-x-6 py-8">
						<button onClick={() => router.back()} className="text-gray-500 md:px-14 py-2 rounded-sm font-semibold hover:bg-gray-500 border-[1px] hover:text-white border-gray-300 transition transform ease-in-out">
							Cancel
						</button>
						<button onClick={() => mintNft(true)} disabled={uploadingImage} className="bg-transparent text-green-500 md:px-14 py-2 mb-2 md:mb-0 rounded-sm font-semibold hover:bg-transparent border-[1px] hover:text-white hover:bg-green-500 border-green-500 transition transform ease-in-out">
							Queue
						</button>
						<button onClick={() => mintNft(false)} disabled={uploadingImage} className="bg-blue-500 text-white md:px-14 py-2 mb-2 md:mb-0 rounded-sm font-semibold hover:bg-transparent border-[1px] hover:text-blue-500 border-blue-500 transition transform ease-in-out">
							Mint
						</button>
					</div>
				</div>
			</div>
		</main>
	);
}
export default Mint;

export const getServerSideProps: GetServerSideProps = async (context) => {
	const session = await unstable_getServerSession(context.req, context.res, authOptions);

	if (!session) {
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
		},
	};
};
