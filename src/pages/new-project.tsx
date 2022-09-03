import { ChevronDownIcon, PaperClipIcon, PlusIcon, SwitchHorizontalIcon, XIcon } from "@heroicons/react/outline";
import React, { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/router";
// import "react-date-range/dist/styles.css"; // main style file
// import "react-date-range/dist/theme/default.css"; // theme css file
// import { Calendar } from "react-date-range";
import dateToUnix from "../hooks/dateToUnix";
import unixToDateTime from "../hooks/unixToDateTime";
import deployErc20 from "../hooks/deployErc20";
import RaisenomicsEntry from "../components/RaisenomicsEntry";
import TokenomicsEntry from "../components/TokenomicsEntry";
import { Beneficiary } from "../types/typings";
import { useSession, signOut } from "next-auth/react";
import { trpc } from "../utils/trpc";
import axios from "axios";
import { utils } from "ethers";
import BenefitType from "../types/typings";

function NewProject() {
	const { data: session, status } = useSession();
	const createProject = trpc.useMutation(["project.createProject"]);

	const router = useRouter();
	const [isPublishing, setIsPublishing] = useState(false);

	const projectNameRef = useRef<HTMLInputElement>(null);
	const projectTickerRef = useRef<HTMLInputElement>(null);
	const [projectTicker, setProjectTicker] = useState<string | undefined>();
	const projectDescriptionRef = useRef<HTMLTextAreaElement>(null);
	const raiseAmountRef = useRef<HTMLInputElement>(null);
	const [tokenAmount, setTokenAmount] = useState<number | undefined>();
	const [tokenPrice, setTokenPrice] = useState<number | undefined>();
	const tokenPriceRef = useRef<HTMLInputElement>(null);
	const linkedInRef = useRef<HTMLInputElement>(null);
	const twitterRef = useRef<HTMLInputElement>(null);
	const telegramRef = useRef<HTMLInputElement>(null);
	const discordRef = useRef<HTMLInputElement>(null);

	const [tagInput, setTagInput] = useState<string | undefined>();
	const [tags, setTags] = useState<string[]>([]);

	const [projectImageUrl, setProjectImageUrl] = useState<string>("");
	const [bannerImageUrl, setBannerImageUrl] = useState<string>("");
	const [uploadingProjectImage, setUploadingProjectImage] = useState<boolean>(false);
	const [uploadingBannerImage, setUploadingBannerImage] = useState<boolean>(false);

	const projectImagePickerRef = useRef<HTMLInputElement>(null);
	const bannerImagePickerRef = useRef<HTMLInputElement>(null);

	const [isRaiseAssetDropdownOpen, setIsRaiseAssetDropdownOpen] = useState<boolean>(false);
	const [isRaisenomicsDropdownOpen, setIsRaisenomicsDropdownOpen] = useState<boolean>(false);
	const [isTokenomicsDropdownOpen, setIsTokenomicsDropdownOpen] = useState<boolean>(false);

	const [raiseAssetAddress, setRaiseAssetAddress] = useState("eth");
	const [raiseAssetTicker, setRaiseAssetTicker] = useState("ETH");
	const [raiseAssetLogo, setRaiseAssetLogo] = useState("https://nomics.com/imgpr/https%3A%2F%2Fs3.us-east-2.amazonaws.com%2Fnomics-api%2Fstatic%2Fimages%2Fcurrencies%2Feth.svg?width=48");

	const [raisenomicsTemplate, setRaisenomicsTemplate] = useState<string>("fair-raise-v1");
	const [tokenomicsTemplate, setTokenomicsTemplate] = useState<string>("fair-token-v1");

	const [raisenomicsBeneficiaries, setRaisenomicsBeneficiaries] = useState<Beneficiary[]>([]);
	const [tokenomicsBeneficiaries, setTokenomicsBeneficiaries] = useState<Beneficiary[]>([]);

	const customRaiseAddressRef = useRef<HTMLInputElement>(null);
	const [isFetchingCustomToken, setIsFetchingCustomToken] = useState<boolean>(false);

	const [endDate, setEndDate] = useState<number>(0);

	const raisenomicsDropdownWrapperRef = useRef(null);
	useOutsideAlerter(raisenomicsDropdownWrapperRef);
	const tokenomicsDropdownWrapperRef = useRef(null);
	useOutsideAlerter(tokenomicsDropdownWrapperRef);
	const raiseAssetDropdownWrapperRef = useRef(null);
	useOutsideAlerter(raiseAssetDropdownWrapperRef);

	const handleProjectImageDialogue = () => {
		// 👇️ open file input box on click of other element
		projectImagePickerRef.current?.click();
	};

	const handleBannerImageDialogue = () => {
		// 👇️ open file input box on click of other element
		bannerImagePickerRef.current?.click();
	};

	const publishProject = async () => {
		// Form Error Handling
		// errorScroll is a template for how the scroll action behaves when there is an error
		const errorScroll: ScrollIntoViewOptions = {
			behavior: "smooth",
			block: "center",
			inline: "center",
		};

		if (!projectNameRef.current?.value) {
			projectNameRef.current?.scrollIntoView(errorScroll);
			setTimeout(() => {
				projectNameRef.current?.focus();
			}, 1000);
			return toast.error("You must enter a project name");
		}

		if (!projectTicker) {
			projectTickerRef.current?.scrollIntoView(errorScroll);
			setTimeout(() => {
				projectTickerRef.current?.focus();
			}, 1000);
			return toast.error("You must enter a project ticker");
		}

		if (!raiseAmountRef.current?.value) {
			raiseAmountRef.current?.scrollIntoView(errorScroll);
			setTimeout(() => {
				raiseAmountRef.current?.focus();
			}, 1000);
			return toast.error("You must enter a raise amount");
		}

		if (!endDate) {
			document.getElementById("end_date_calendar")?.scrollIntoView(errorScroll);
			setTimeout(() => {
				document.getElementById("end_date_calendar")?.focus();
			}, 1000);
			return toast.error("You must add an end date for your raising period.");
		}

		if (!projectImageUrl) {
			document.getElementById("project_image_button")?.scrollIntoView(errorScroll);
			setTimeout(() => {
				document.getElementById("project_image_button")?.focus();
			}, 1000);
			return toast.error("You must add a project image.");
		}

		if (!bannerImageUrl) {
			document.getElementById("banner_image_button")?.scrollIntoView(errorScroll);
			setTimeout(() => {
				document.getElementById("banner_image_button")?.focus();
			}, 1000);
			return toast.error("You must add a banner image.");
		}

		try {
			toast.loading("Deploying token and publishing project");
			const deployedToken = await deployErc20(projectNameRef.current.value, projectTicker);
			console.log("Deployed Token", deployedToken);

			// if (!deployedToken?.creates) {
			// 	toast.error("There was no deployed Token");
			// 	return;
			// }

			// Create Token
			// const tokenRef = await addDoc(collection(db, "tokens"), {
			// 	name: projectNameRef.current.value.toLowerCase(),
			// 	ticker: projectTicker.toLowerCase(),
			// 	tokenPrice: tokenPrice,
			// 	deployHash: deployedToken?.hash,
			// 	tokenAddress: deployedToken?.to,
			// });

			const beneficiaries = [...raisenomicsBeneficiaries, ...tokenomicsBeneficiaries];

			// Create Project
			const createdProject = await createProject.mutateAsync({
				name: projectNameRef.current.value,
				bannerImage: bannerImageUrl,
				discord: discordRef.current?.value.toLowerCase(),
				linkedIn: linkedInRef.current?.value.toLowerCase(),
				twitter: twitterRef.current?.value.toLowerCase(),
				telegram: telegramRef.current?.value.toLowerCase(),
				description: projectDescriptionRef.current?.value || "",
				image: projectImageUrl,
				ticker: projectTicker.toUpperCase(),
				tags,
				raiseTokenAddress: raiseAssetAddress,
				raiseEndTimestamp: endDate,
				target: parseInt(raiseAmountRef.current.value),
				tokenAddress: deployedToken?.creates ?? "Unable to get Token Address",
				tokenSupply: tokenAmount,
				beneficiaries,
			});

			if (!createdProject) {
				toast.dismiss();
				toast.error("Unable to publish project");
				return;
			}
			toast.dismiss();
			toast.success("Successfully Created Project!");
			router.push(`/project/${createdProject.createdProject.id}`);
		} catch (error) {
			toast.dismiss();
			console.log("Error Creating project", error);
			toast.error("There was an Error creating your project");
		}
	};

	const addTag = (e: React.MouseEvent<SVGSVGElement, MouseEvent> | React.KeyboardEvent<HTMLInputElement>) => {
		if (!tagInput) {
			return;
		}
		if (tagInput.length > 14) {
			toast.dismiss();
			toast.error("A tag may only have up to 15 characters!");
			return;
		}
		if (tags.length > 4) {
			toast.dismiss();
			toast.error("You may only add up to 5 tags!");
			return;
		}
		if (tags.includes(tagInput)) {
			toast.dismiss();
			toast.error("You cannot use the same tag twice!");
			return;
		}
		if (typeof tagInput === "string") {
			setTags([...tags, tagInput.toLowerCase()]);
			setTagInput("");
			return;
		}
		return;
	};

	const removeTag = (tag: string) => {
		if (tags.includes(tag)) {
			const index = tags.indexOf(tag);
			setTags([...tags.slice(0, index), ...tags.slice(index + 1)]);
		}
		return;
	};

	const handleLogout = async () => {
		await signOut();
		router.push("/");
	};

	const addSuggestedTag = (tag: string) => {
		if (tags.includes(tag)) {
			toast.dismiss();
			toast.error("You cannot use the same tag twice!");
			return;
		}
		if (tags.length > 4) {
			toast.dismiss();
			toast.error("You may only add up to 5 tags!");
			return;
		}
		if (typeof tag === "string") {
			setTags([...tags, tag.toLowerCase()]);
		}
	};

	useEffect(() => {
		if (!raisenomicsTemplate) {
			return;
		}

		if (raisenomicsTemplate === "fair-raise-v1") {
			setRaisenomicsBeneficiaries([
				{
					name: "Creator/Team",
					address: "0x0",
					percentage: 48,
					benefit: "RAISENOMICS",
					vestingFrequency: 30,
					vestingLength: 365,
					cliff: 180,
				},
				{
					name: "Partners",
					address: "0x0",
					percentage: 2,
					benefit: "RAISENOMICS",
					vestingFrequency: 30,
					vestingLength: 365,
					cliff: 180,
				},
			]);
		}

		if (raisenomicsTemplate === "fair-raise-v2") {
			setRaisenomicsBeneficiaries([
				{
					name: "Creator",
					address: "0x0",
					percentage: 20,
					benefit: "RAISENOMICS",
					vestingFrequency: 30,
					vestingLength: 365,
					cliff: 180,
				},
				{
					name: "Developer",
					address: "0x0",
					percentage: 20,
					benefit: "RAISENOMICS",
					vestingFrequency: 30,
					vestingLength: 365,
					cliff: 180,
				},
				{
					name: "Marketing",
					address: "0x0",
					percentage: 10,
					benefit: "RAISENOMICS",
					vestingFrequency: 30,
					vestingLength: 365,
					cliff: 180,
				},
			]);
		}

		if (raisenomicsTemplate === "solo") {
			setRaisenomicsBeneficiaries([
				{
					name: "Creator/Team",
					address: "0x0",
					percentage: 50,
					benefit: "RAISENOMICS",
					vestingFrequency: 30,
					vestingLength: 365,
					cliff: 180,
				},
			]);
		}
	}, [raisenomicsTemplate]);

	useEffect(() => {
		if (!tokenomicsTemplate) {
			return;
		}

		if (tokenomicsTemplate === "fair-token-v1") {
			setTokenomicsBeneficiaries([
				{
					name: "Taffy Participants",
					address: "0x0",
					percentage: 30,
					benefit: "TOKENOMICS",
					vestingFrequency: 30,
					vestingLength: 365,
					cliff: 180,
				},
				{
					name: "Staking Rewards",
					address: "0x0",
					percentage: 60,
					benefit: "TOKENOMICS",
					vestingFrequency: 30,
					vestingLength: 365,
					cliff: 180,
				},
				{
					name: "Creator/Team",
					address: "0x0",
					percentage: 10,
					benefit: "TOKENOMICS",
					vestingFrequency: 30,
					vestingLength: 365,
					cliff: 180,
				},
				{
					name: "Partners",
					address: "0x0",
					percentage: 10,
					benefit: "TOKENOMICS",
					vestingFrequency: 30,
					vestingLength: 365,
					cliff: 180,
				},
			]);
		}

		if (tokenomicsTemplate === "fair-token-v2") {
			setTokenomicsBeneficiaries([
				{
					name: "Taffy Participants",
					address: "0x0",
					percentage: 20,
					benefit: "TOKENOMICS",
					vestingFrequency: 30,
					vestingLength: 365,
					cliff: 180,
				},
				{
					name: "Staking Rewards",
					address: "0x0",
					percentage: 30,
					benefit: "TOKENOMICS",
					vestingFrequency: 30,
					vestingLength: 365,
					cliff: 180,
				},
				{
					name: "Creator",
					address: "0x0",
					percentage: 20,
					benefit: "TOKENOMICS",
					vestingFrequency: 30,
					vestingLength: 365,
					cliff: 180,
				},
				{
					name: "Developer",
					address: "0x0",
					percentage: 15,
					benefit: "TOKENOMICS",
					vestingFrequency: 30,
					vestingLength: 365,
					cliff: 180,
				},
				{
					name: "Marketing",
					address: "0x0",
					percentage: 15,
					benefit: "TOKENOMICS",
					vestingFrequency: 30,
					vestingLength: 365,
					cliff: 180,
				},
			]);
		}

		if (tokenomicsTemplate === "fair-token-v3") {
			setTokenomicsBeneficiaries([
				{
					name: "Taffy Participants",
					address: "0x0",
					percentage: 40,
					benefit: "TOKENOMICS",
					vestingFrequency: 30,
					vestingLength: 365,
					cliff: 180,
				},
				{
					name: "Staking Rewards",
					address: "0x0",
					percentage: 40,
					benefit: "TOKENOMICS",
					vestingFrequency: 30,
					vestingLength: 365,
					cliff: 180,
				},
				{
					name: "Creator/Team",
					address: "0x0",
					percentage: 20,
					benefit: "TOKENOMICS",
					vestingFrequency: 30,
					vestingLength: 365,
					cliff: 180,
				},
			]);
		}
	}, [tokenomicsTemplate]);

	const addRaisenomicsRow = () => {
		if (raisenomicsBeneficiaries.length > 2) {
			toast.dismiss();
			toast.error("You may only have 3 set beneficiaries!");
			return;
		}

		setRaisenomicsBeneficiaries([
			...raisenomicsBeneficiaries,
			{
				name: "",
				address: "0x0",
				percentage: 0,
				benefit: "RAISENOMICS",
				vestingFrequency: 30,
				vestingLength: 30,
				cliff: 0,
			},
		]);
	};

	const addTokenomicsRow = () => {
		if (tokenomicsBeneficiaries.length > 2) {
			toast.dismiss();
			toast.error("You may only have 3 set tokenomics beneficiaries!");
			return;
		}

		setTokenomicsBeneficiaries([
			...tokenomicsBeneficiaries,
			{
				name: "",
				address: "0x0",
				percentage: 0,
				benefit: "TOKENOMICS",
				vestingFrequency: 30,
				vestingLength: 30,
				cliff: 0,
			},
		]);
	};

	function useOutsideAlerter(ref: any) {
		useEffect(() => {
			function handleClickOutside(event: any) {
				if (ref.current && !ref.current.contains(event.target)) {
					if (ref === raisenomicsDropdownWrapperRef) {
						setIsRaisenomicsDropdownOpen(false);
					}
					if (ref === tokenomicsDropdownWrapperRef) {
						setIsTokenomicsDropdownOpen(false);
					}
					if (ref === raiseAssetDropdownWrapperRef) {
						setIsRaiseAssetDropdownOpen(false);
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
		if (!raiseAssetAddress || status !== "authenticated") {
			return;
		}

		if (raiseAssetAddress === "eth") {
			setRaiseAssetTicker("ETH");
			setRaiseAssetLogo("https://nomics.com/imgpr/https%3A%2F%2Fs3.us-east-2.amazonaws.com%2Fnomics-api%2Fstatic%2Fimages%2Fcurrencies%2Feth.svg?width=48");
			return;
		}

		async function getTokenMetadata() {
			await fetch(`https://api.coinpaprika.com/v1/contracts/eth-ethereum/${raiseAssetAddress}`)
				.then((response) => {
					return response.json();
				})
				.then((data) => {
					if (data.symbol) {
						setRaiseAssetTicker(data.symbol);
					}
					return;
				})
				.catch((err) => {
					// Do something for an error here
					console.log(err);
				});
			setRaiseAssetLogo(`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${raiseAssetAddress}/logo.png` ?? "");
		}

		getTokenMetadata();
	}, [raiseAssetAddress, status]);

	const uploadImage = async (e: any, imageType: string) => {
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
						if (imageType === "projectImage") {
							setUploadingProjectImage(true);
						}
						if (imageType === "bannerImage") {
							setUploadingProjectImage(true);
						}
						toastId = toast.loading("Uploading Image");
						const { data } = await axios.post("/api/image-upload", { image });
						if (data) {
							console.log("Upload data is", data);
							if (imageType === "projectImage") {
								setProjectImageUrl(data?.url);
							}
							if (imageType === "bannerImage") {
								setBannerImageUrl(data?.url);
							}
							toast.success("Successfully uploaded", { id: toastId });
						} else {
							toast.error("Unable to upload", { id: toastId });
							return;
						}
					} catch (e) {
						toast.error("Unable to upload", { id: toastId });
						return;
					} finally {
						setUploadingProjectImage(false);
					}
				} catch (err) {
					toast.error("Unable to update image");
					return;
				} finally {
					if (imageType === "projectImage") {
						setUploadingProjectImage(false);
					}
					if (imageType === "bannerImage") {
						setUploadingBannerImage(false);
					}
				}
			},
			false
		);
	};

	return (
		<main className="w-full bg-blue-50 flex justify-center py-8">
			<div className="flex flex-col justify-items-center bg-white w-11/12 px-6 md:w-3/4 md:px-24 py-8 divide-y text-gray-700 text-center">
				{/* Row */}
				<div className="flex flex-col py-4">
					<div className="flex flex-col md:flex-row items-center text-center py-4 md:space-x-20 space-y-6 md:space-y-0">
						<h1 className="w-full md:w-1/3 text-2xl font-bold text-gray-900">Create New Project</h1>
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

				{/* Row */}
				<div className="flex flex-col md:flex-row md:items-center py-8 md:space-x-20 space-y-6 md:space-y-0">
					<p className="md:w-1/3 font-semibold">
						Project name <span className="text-red-500">*</span>
					</p>
					<input ref={projectNameRef} type="text" placeholder="Project name" className="md:w-2/3 border-[1px] border-gray-200 rounded-sm px-4 py-2" />
				</div>

				{/* Row */}
				<div className="flex flex-col md:flex-row md:items-center py-8 md:space-x-20 space-y-6 md:space-y-0">
					<p className="md:w-1/3 font-semibold">
						Project Ticker <span className="text-red-500">*</span>
					</p>
					<input ref={projectTickerRef} value={projectTicker?.toUpperCase()} onChange={(e) => setProjectTicker(e.target.value)} type="text" placeholder="Project ticker (e.g. TKN)" className="md:w-2/3 border-[1px] border-gray-200 rounded-sm px-4 py-2" />
				</div>

				{/* Row */}
				<div className="flex flex-col md:flex-row md:items-center py-8 md:space-x-20 space-y-6 md:space-y-0">
					<div className="md:w-1/3 space-y-2">
						<p className="font-semibold">Project description</p>
						<p className="font-light text-sm">The description will be included on the items detail page underneath its image. Markdown syntax is supported.</p>
					</div>
					<textarea ref={projectDescriptionRef} placeholder="Description" className="md:w-2/3 h-28 border-[1px] border-gray-200 rounded-sm px-4 py-2 resize-none" />
				</div>

				{/* Row */}
				<div className="flex flex-col md:flex-row md:items-center py-8 md:space-x-20 space-y-6 md:space-y-0">
					<div className="md:w-1/3 space-y-2">
						<p className="font-semibold">
							Project profile photo <span className="text-red-500">*</span>
						</p>
						<p className="font-light text-sm">File types supported: JPG, PNG, GIF, SVG, MP4, WEBM, MP3, WAV, OGG, GLB, GLTF. Max size: 10 MB</p>
					</div>
					<div className="md:w-2/3 flex justify-center">
						{!projectImageUrl ? (
							<button id="project_image_button" onClick={handleProjectImageDialogue} className="flex items-center h-20 border-[1px] border-gray-200 rounded-sm px-10 py-1 hover:bg-blue-500 hover:text-white group transition transform ease-in-out">
								<PaperClipIcon className="h-6 w-6 mr-2" />
								<p className="text-blue-500 font-semibold group-hover:text-white">Add Image</p>
							</button>
						) : (
							<img onClick={handleProjectImageDialogue} id="project_image" src={projectImageUrl} alt="Project Image" className={`h-32 w-32 cursor-pointer object-cover rounded-sm hover:opacity-90 transition transform ease-in-out ${!projectImageUrl && "hidden"}`} />
						)}
						<input ref={projectImagePickerRef} type="file" accept="image/*" onChange={(e) => uploadImage(e, "projectImage")} disabled={uploadingProjectImage} className="hidden" />
					</div>
				</div>

				{/* Row */}
				<div className="flex flex-col md:flex-row md:items-center py-8 md:space-x-20 space-y-6 md:space-y-0">
					<div className="md:w-1/3 space-y-2">
						<p className="font-semibold">
							Project banner photo <span className="text-red-500">*</span>
						</p>
						<p className="font-light text-sm">File types supported: JPG, PNG, GIF, SVG, MP4, WEBM, MP3, WAV, OGG, GLB, GLTF. Max size: 10 MB</p>
					</div>
					<div className="md:w-2/3 flex justify-center">
						{!bannerImageUrl ? (
							<button id="banner_image_button" onClick={handleBannerImageDialogue} className="flex items-center h-20 border-[1px] border-gray-200 rounded-sm px-10 py-1 hover:bg-blue-500 hover:text-white group transition transform ease-in-out">
								<PaperClipIcon className="h-6 w-6 mr-2" />
								<p className="text-blue-500 font-semibold group-hover:text-white">Add Image</p>
							</button>
						) : (
							<img onClick={handleBannerImageDialogue} id="banner_image" src={bannerImageUrl} alt="Project Banner Image" className={`h-32 w-64 cursor-pointer rounded-sm hover:opacity-90 transition object-cover transform ease-in-out ${!bannerImageUrl && "hidden"}`} />
						)}
						<input ref={bannerImagePickerRef} type="file" accept="image/*" onChange={(e) => uploadImage(e, "bannerImage")} disabled={uploadingBannerImage} className="hidden" />
					</div>
				</div>

				{/* Row */}
				<div className="">
					{/* <div className="flex flex-col md:flex-row md:items-center py-8 md:space-x-20 space-y-6 md:space-y-0">
						<p className="md:w-1/3 font-semibold">
							Target Raise amount<span className="text-red-500">*</span>
						</p>
						<div className="md:w-2/3 flex justify-between items-center px-4 border-[1px] border-gray-200 rounded-sm py-2 mb-3">
							<input ref={raiseAmountRef} type="number" onWheel={(e) => (e.target as HTMLInputElement).blur()} placeholder="Amount" className="grow outline-none" />
							<p className="text-gray-500 cursor-default ml-2">ETH</p>
						</div>
					</div> */}

					<div className="flex flex-col md:flex-row md:items-center py-8 md:space-x-20 space-y-6 md:space-y-0">
						<div className="md:w-1/3 space-y-2">
							<p className="font-semibold">
								Raise end date<span className="text-red-500">*</span>
							</p>
							<p className="font-light text-sm">
								Select your <span className="font-bold">local</span> date and time for which raising additional funds will become unavailable. This will be converted to UTC.
							</p>
						</div>

						<div className="md:w-2/3 py-2 flex flex-col space-x-4">
							<input
								type="datetime-local"
								id="end_date_calendar"
								onChange={(e) => {
									setEndDate(Date.parse(e.target.value) / 1000);
								}}
								className="w-full border-[1px] border-gray-200 rounded-sm px-4 py-2 outline-none mb-2"
							/>
							{endDate ? (
								<div className="bg-gray-100 rounded-lg p-2">
									<p>
										<span className="font-semibold">Your Time:</span> {unixToDateTime(endDate, "local")}
									</p>
									<p>
										<span className="font-semibold">UTC Conversion:</span> {unixToDateTime(endDate, "utc")}
									</p>
								</div>
							) : (
								<p className="font-light text-gray-500">Select a date and time to preview UTC conversion.</p>
							)}
						</div>
					</div>
				</div>

				{/* Row */}
				{/* <div className="flex flex-col md:flex-row md:items-center py-8 md:space-x-20 space-y-6 md:space-y-0">
					<div className="md:w-1/3 space-y-2">
						<p className="font-semibold">
							Token price <span className="text-red-500">*</span>
						</p>
						<p className="font-light text-sm">{"ETH price to buy 1 token."}</p>
					</div>
					<div className="md:w-2/3">
						<div className="flex justify-between items-center px-4 border-[1px] border-gray-200 rounded-sm py-2 mb-3">
							<input ref={tokenPriceRef} value={tokenPrice} min={0} onChange={(e) => setTokenPrice(parseFloat(e.target.value))} type="number" onWheel={(e) => (e.target as HTMLInputElement).blur()} placeholder="Token price" className="w-full outline-none" />
							<p className="text-gray-500 cursor-default ml-2">ETH</p>
						</div>
						<div className="flex flex-col md:flex-row md:justify-center md:space-x-4 items-center space-y-2 md:space-y-0">
							<p className="text-black font-semibold bg-gray-100 rounded-lg p-2 whitespace-nowrap">
								1 {projectTicker ? projectTicker.toUpperCase() : "TKN"} = {tokenPrice ? tokenPrice : "0"} ETH
							</p>
							<SwitchHorizontalIcon className="h-6 w-6" />
							<p className="text-black font-semibold bg-gray-100 rounded-lg p-2 whitespace-nowrap">
								1 ETH = {tokenPrice ? 1 / tokenPrice : "0"} {projectTicker ? projectTicker.toUpperCase() : "TKN"}
							</p>
						</div>
					</div>
				</div> */}

				{/* Row */}
				<div className="flex flex-col md:flex-row md:items-start py-8 md:space-x-20 space-y-6 md:space-y-0">
					<div className="w-full md:w-1/3 space-y-2">
						<p className="font-semibold">
							Raisenomics <span className="text-red-500">*</span>
						</p>
						<p className="font-light text-sm">
							Define raise terms. Percentage allocations <span className="font-bold">must</span> add up to 100%
						</p>
					</div>
					<div className="w-full md:w-2/3">
						{/* Raise Amount */}
						<div className="w-full mb-8">
							<p className="font-semibold text-sm mb-2">
								Target raise amount<span className="text-red-500">*</span>
							</p>
							<div className="w-full flex justify-between items-center px-4 border-[1px] border-gray-200 rounded-sm py-2 mb-3 min-w-0">
								<input ref={raiseAmountRef} type="number" onWheel={(e) => (e.target as HTMLInputElement).blur()} placeholder="Amount" className="grow outline-none min-w-0" />
								<div ref={raiseAssetDropdownWrapperRef} className="flex-1 relative inline-block text-left">
									<div className="" onClick={() => setIsRaiseAssetDropdownOpen(!isRaiseAssetDropdownOpen)}>
										<button type="button" className="inline-flex justify-center items-center w-full rounded-md shadow-sm px-4 py-2 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 outline-none">
											<img src={raiseAssetLogo} className="h-5 w-5 mr-2" />
											{raiseAssetTicker?.toUpperCase()}
											<ChevronDownIcon className="min-h-[8px] min-w-[8px] h-5 w-5 ml-2" />
										</button>
									</div>

									{/* Customize Beneficiaries */}
									{isRaiseAssetDropdownOpen && (
										<div className="absolute z-10 w-60 bg-white rounded divide-y divide-gray-100 shadow text-sm">
											<ul className="p-3 space-y-1 text-gray-700" aria-labelledby="dropdownHelperButton">
												<li
													onClick={() => {
														setRaiseAssetAddress("eth");
														setIsRaiseAssetDropdownOpen(false);
													}}
												>
													<div className="flex p-2 rounded hover:bg-gray-100">
														<div className="flex items-center space-x-3 ml-2 text-sm cursor-pointer">
															<img src="https://nomics.com/imgpr/https%3A%2F%2Fs3.us-east-2.amazonaws.com%2Fnomics-api%2Fstatic%2Fimages%2Fcurrencies%2Feth.svg?width=48" alt="" className="h-4 w-4" />
															<label className="font-medium text-gray-900 cursor-pointer">
																<div>ETH</div>
																{/* <p className="text-xs font-normal text-gray-500">Even split between team and liquidity, with 1 investor.</p> */}
															</label>
														</div>
													</div>
												</li>
												<li
													onClick={() => {
														setRaiseAssetAddress("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
														setIsRaiseAssetDropdownOpen(false);
													}}
												>
													<div className="flex p-2 rounded hover:bg-gray-100">
														<div className="flex items-center space-x-3 ml-2 text-sm cursor-pointer">
															<img src="https://nomics.com/imgpr/https%3A%2F%2Fs3.us-east-2.amazonaws.com%2Fnomics-api%2Fstatic%2Fimages%2Fcurrencies%2Fusdc.svg?width=48" alt="" className="h-4 w-4" />
															<label className="font-medium text-gray-900 cursor-pointer">
																<div>USDC</div>
																<p className="text-xs font-normal text-gray-500 cursor-pointer">0xA0b8...606eB48</p>
															</label>
														</div>
													</div>
												</li>
												<li
													onClick={() => {
														setRaiseAssetAddress("0xd2877702675e6cEb975b4A1dFf9fb7BAF4C91ea9");
														setIsRaiseAssetDropdownOpen(false);
													}}
												>
													<div className="flex p-2 rounded hover:bg-gray-100">
														<div className="flex items-center space-x-3 ml-2 text-sm cursor-pointer">
															<img src="https://nomics.com/imgpr/https%3A%2F%2Fs3.us-east-2.amazonaws.com%2Fnomics-api%2Fstatic%2Fimages%2Fcurrencies%2FLUNA.png?width=48" alt="" className="h-4 w-4" />
															<label className="font-medium text-gray-900 cursor-pointer">
																<div>LUNA</div>
																<p className="text-xs font-normal text-gray-500">0xd287...4c91ea9</p>
															</label>
														</div>
													</div>
												</li>
												<li>
													<div className="border flex p-2">
														<input ref={customRaiseAddressRef} type="text" placeholder="Enter custom address" className="bg-transparent outline-none" />
														<button
															className="p-2 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer"
															onClick={() => {
																async function getCustomTokenMetadata() {
																	setIsFetchingCustomToken(true);

																	try {
																		if (!customRaiseAddressRef.current?.value) {
																			toast.dismiss();
																			toast.error("Please enter a valid token address to raise.");
																			return;
																		}

																		fetch(`https://api.coinpaprika.com/v1/contracts/eth-ethereum/${customRaiseAddressRef.current.value}`)
																			.then((response) => {
																				return response.json();
																			})
																			.then((data) => {
																				if (data.symbol) {
																					setRaiseAssetTicker(data.symbol);
																				}
																				return;
																			})
																			.catch((err) => {
																				// Do something for an error here
																				console.log(err);
																			});

																		setRaiseAssetLogo(`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${customRaiseAddressRef.current.value}/logo.png` ?? "");
																		setRaiseAssetAddress(customRaiseAddressRef.current.value);
																		setIsFetchingCustomToken(false);
																		setIsRaiseAssetDropdownOpen(false);
																		return;
																	} catch (error) {
																		toast.dismiss();
																		toast.error("Please enter a valid token address to raise.");
																		setIsFetchingCustomToken(false);
																		return;
																	}
																}
																getCustomTokenMetadata();
															}}
														>
															{isFetchingCustomToken ? (
																<svg role="status" className="inline w-4 h-4 mr-3 text-blue-700 animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
																	<path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
																	<path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
																</svg>
															) : (
																"Save"
															)}
														</button>
													</div>
												</li>
											</ul>
										</div>
									)}
								</div>
								{/* <p className="text-gray-500 cursor-default ml-2">ETH</p> */}
							</div>
						</div>
						{/* Raisenomics Template Dropdown */}
						<div className="w-full flex flex-col">
							<div className="flex flex-wrap items-center space-x-4 mb-4">
								<p className="font-semibold">Raisenomics</p>
								<div ref={raisenomicsDropdownWrapperRef} className="flex-1 relative inline-block text-left">
									<div className="" onClick={() => setIsRaisenomicsDropdownOpen(!isRaisenomicsDropdownOpen)}>
										<button type="button" className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 outline-none">
											{raisenomicsTemplate === "fair-raise-v1" ? "FairRaise_v1" : raisenomicsTemplate === "fair-raise-v2" ? "FairRaise_v2" : raisenomicsTemplate === "solo" ? "Solo" : "Select Template"}
											<ChevronDownIcon className="h-5 w-5 ml-2" />
										</button>
									</div>

									{/* Customize Beneficiaries */}
									{isRaisenomicsDropdownOpen && (
										<div className="absolute z-10 w-60 bg-white rounded divide-y divide-gray-100 shadow text-sm">
											<ul className="p-3 space-y-1 text-gray-700" aria-labelledby="dropdownHelperButton">
												<li
													onClick={() => {
														setRaisenomicsTemplate("fair-raise-v1");
														setIsRaisenomicsDropdownOpen(false);
													}}
												>
													<div className="flex p-2 rounded hover:bg-gray-100">
														<div className="ml-2 text-sm cursor-pointer">
															<label className="font-medium text-gray-900 cursor-pointer">
																<div>FairRaise_v1</div>
																<p className="text-xs font-normal text-gray-500">Even split between team and liquidity, with 1 investor.</p>
															</label>
														</div>
													</div>
												</li>
												<li
													onClick={() => {
														setRaisenomicsTemplate("fair-raise-v2");
														setIsRaisenomicsDropdownOpen(false);
													}}
												>
													<div className="flex p-2 rounded hover:bg-gray-100">
														<div className="ml-2 text-sm cursor-pointer">
															<label className="font-medium text-gray-900 cursor-pointer">
																<div>FairRaise_v2</div>
																<p className="text-xs font-normal text-gray-500 cursor-pointer">Even split between team and liquidity.</p>
															</label>
														</div>
													</div>
												</li>
												<li
													onClick={() => {
														setRaisenomicsTemplate("solo");
														setIsRaisenomicsDropdownOpen(false);
													}}
												>
													<div className="flex p-2 rounded hover:bg-gray-100">
														<div className="ml-2 text-sm cursor-pointer">
															<label className="font-medium text-gray-900 cursor-pointer">
																<div>Solo</div>
																<p className="text-xs font-normal text-gray-500">All funds raised to your wallet.</p>
															</label>
														</div>
													</div>
												</li>
											</ul>
										</div>
									)}
								</div>
								<p>or add custom</p>
							</div>
							<div className="flex flex-col space-y-3">
								<table className="table-auto border rounded-sm">
									<thead>
										<tr className="border-b">
											<th className="w-1/2">Entity</th>
											<th>Allocation</th>
										</tr>
									</thead>
									<tbody>
										{raisenomicsBeneficiaries.map((beneficiary, i) => (
											<tr key={i}>
												<td className="border-r w-1/2">
													{beneficiary.name} <span className="italic text-sm font-light">{beneficiary.address && (beneficiary.address.length > 10 ? `(${beneficiary.address?.slice(0, 5)}...${beneficiary.address?.slice(beneficiary.address?.length - 5)})` : `(${beneficiary.address})`)}</span>
												</td>
												<td>{beneficiary.percentage}%</td>
											</tr>
										))}
										<tr>
											<td className="border-r w-1/2">Liquidity Pool</td>
											<td>48%</td>
										</tr>
										<tr>
											<td className="border-r w-1/2">Taffy DAO</td>
											<td>2%</td>
										</tr>
										<tr className="font-semibold border-t">
											<td className="w-12">Total</td>
											<td>100%</td>
										</tr>
									</tbody>
								</table>
								{raisenomicsBeneficiaries.map((beneficiary, i) => (
									<RaisenomicsEntry key={i} beneficiaryId={(i + 1).toString()} _name={beneficiary.name} _percentage={beneficiary.percentage} _vestingFrequency={beneficiary.vestingFrequency} _vestingLength={beneficiary.vestingLength} _cliff={beneficiary.cliff} raisenomicsBeneficiaries={raisenomicsBeneficiaries} setRaisenomicsBeneficiaries={setRaisenomicsBeneficiaries} />
								))}
								<button onClick={addRaisenomicsRow} className="text-blue-500 px-4 py-2 mt-4 rounded-sm font-semibold hover:bg-blue-500 border-[1px] hover:text-white border-gray-300 transition transform ease-in-out">
									+ Add Row
								</button>
								<RaisenomicsEntry beneficiaryId={"lp"} _name={"Liquidity Pool"} _percentage={48} _vestingFrequency={30} _vestingLength={365} _cliff={0} immutable />
								<RaisenomicsEntry beneficiaryId={"taffy"} _name={"Taffy DAO Fee"} _percentage={2} _vestingFrequency={30} _vestingLength={365} _cliff={0} immutable />
							</div>
						</div>
					</div>
				</div>

				{/* Row */}
				<div className="flex flex-col md:flex-row md:items-start py-8 md:space-x-20 space-y-6 md:space-y-0">
					<div className="w-full md:w-1/3 space-y-2">
						<p className="font-semibold">
							Tokenomics <span className="text-red-500">*</span>
						</p>
						<p className="font-light text-sm">Define the project tokenomics, including the staking terms</p>
					</div>
					<div className="w-full md:w-2/3">
						{/* Token Amount */}
						<div className="w-full mb-8">
							<p className="font-semibold text-sm mb-2">
								Total supply of {projectTicker ?? "tokens"}
								<span className="text-red-500">*</span>
							</p>
							<div className="w-full flex justify-between items-center px-4 border-[1px] border-gray-200 rounded-sm py-2 mb-3 min-w-0">
								<input value={tokenAmount} onChange={(e) => setTokenAmount(parseInt(e.target.value))} type="number" onWheel={(e) => (e.target as HTMLInputElement).blur()} placeholder="Amount" className="grow outline-none min-w-0" />
								<p className="text-gray-500 cursor-default ml-2">{projectTicker?.toUpperCase() ?? "TKN"}</p>
							</div>
						</div>
						{/* Tokenomics Template Dropdown */}
						<div className="w-full flex flex-col">
							<div className="flex flex-wrap items-center space-x-4 mb-4">
								<p className="font-semibold">Tokenomics</p>
								<div ref={tokenomicsDropdownWrapperRef} className="flex-1 relative inline-block text-left">
									<div className="" onClick={() => setIsTokenomicsDropdownOpen(!isTokenomicsDropdownOpen)}>
										<button type="button" className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 outline-none">
											{tokenomicsTemplate === "fair-token-v1" ? "FairToken_v1" : tokenomicsTemplate === "fair-token-v2" ? "FairToken_v2" : tokenomicsTemplate === "fair-token-v3" ? "FairToken_v3" : "Select Template"}
											<ChevronDownIcon className="h-5 w-5 ml-2" />
										</button>
									</div>

									{/* Customize Beneficiaries */}
									{isTokenomicsDropdownOpen && (
										<div className="absolute z-10 w-60 bg-white rounded divide-y divide-gray-100 shadow text-sm">
											<ul className="p-3 space-y-1 text-gray-700" aria-labelledby="dropdownHelperButton">
												<li
													onClick={() => {
														setTokenomicsTemplate("fair-token-v1");
														setIsTokenomicsDropdownOpen(false);
													}}
												>
													<div className="flex p-2 rounded hover:bg-gray-100">
														<div className="ml-2 text-sm cursor-pointer">
															<label className="font-medium text-gray-900 cursor-pointer">
																<div>FairToken_v1</div>
																<p className="text-xs font-normal text-gray-500">I love the v1 token.</p>
															</label>
														</div>
													</div>
												</li>
												<li
													onClick={() => {
														setTokenomicsTemplate("fair-token-v2");
														setIsTokenomicsDropdownOpen(false);
													}}
												>
													<div className="flex p-2 rounded hover:bg-gray-100">
														<div className="ml-2 text-sm cursor-pointer">
															<label className="font-medium text-gray-900 cursor-pointer">
																<div>FairToken_v2</div>
																<p className="text-xs font-normal text-gray-500 cursor-pointer">But I love the v2 token even better.</p>
															</label>
														</div>
													</div>
												</li>
												<li
													onClick={() => {
														setTokenomicsTemplate("fair-token-v3");
														setIsTokenomicsDropdownOpen(false);
													}}
												>
													<div className="flex p-2 rounded hover:bg-gray-100">
														<div className="ml-2 text-sm cursor-pointer">
															<label className="font-medium text-gray-900 cursor-pointer">
																<div>FairToken_v3</div>
																<p className="text-xs font-normal text-gray-500">V3 is the best though.</p>
															</label>
														</div>
													</div>
												</li>
											</ul>
										</div>
									)}
								</div>
								<p>or add custom</p>
							</div>
							<div className="flex flex-col space-y-3">
								<table className="table-auto border rounded-sm">
									<thead>
										<tr className="border-b">
											<th className="w-1/2">Entity</th>
											<th>Allocation</th>
										</tr>
									</thead>
									<tbody>
										{tokenomicsBeneficiaries.map((beneficiary, i) => (
											<tr key={i}>
												<td className="border-r w-1/2">
													{beneficiary.name} <span className="italic text-sm">{beneficiary.address && (beneficiary.address.length > 10 ? `(${beneficiary.address?.slice(0, 5)}...${beneficiary.address?.slice(beneficiary.address?.length - 5)})` : `(${beneficiary.address})`)}</span>
												</td>
												<td>
													{beneficiary.percentage}% <span className="italic text-sm">{tokenAmount && beneficiary.percentage && `(~ ${(tokenAmount * (beneficiary.percentage / 100)).toLocaleString("en", { maximumFractionDigits: 0 })} ${projectTicker?.toUpperCase() ?? "Tokens"})`}</span>
												</td>
											</tr>
										))}
										<tr className="font-semibold border-t">
											<td className="w-12">Total</td>
											<td>100%</td>
										</tr>
									</tbody>
								</table>
								{tokenomicsBeneficiaries.map((beneficiary, i) => (
									<TokenomicsEntry key={i} beneficiaryId={(i + 1).toString()} _name={beneficiary.name} _percentage={beneficiary.percentage} _vestingFrequency={beneficiary.vestingFrequency} _vestingLength={beneficiary.vestingLength} _cliff={beneficiary.cliff} tokenomicsBeneficiaries={tokenomicsBeneficiaries} setTokenomicsBeneficiaries={setTokenomicsBeneficiaries} />
								))}
								<button onClick={addTokenomicsRow} className="text-blue-500 px-4 py-2 mt-4 rounded-sm font-semibold hover:bg-blue-500 border-[1px] hover:text-white border-gray-300 transition transform ease-in-out">
									+ Add Row
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* Row */}
				<div className="flex flex-col md:flex-row md:items-center py-8 md:space-x-20 space-y-6 md:space-y-0">
					<div className="md:w-1/3 space-y-2">
						<p className="font-semibold">Add tags</p>
						<p className="font-light text-sm">Add tags to help users find your project. Be concise. Irrelevant tags may hinder visibility of the project.</p>
					</div>
					<div className="md:w-2/3 flex flex-col items-center md:items-stretch">
						<div className="flex flex-1 justify-between items-center px-4 border-[1px] border-gray-200 rounded-sm py-2 mb-3">
							<input
								value={tagInput}
								onKeyPress={(e) => {
									if (e.key === "Enter") {
										addTag(e);
									}
								}}
								onChange={(e) => setTagInput(e.target.value)}
								type="text"
								placeholder="Enter tag"
								className="flex-1 outline-none bg-transparent"
							/>
							<PlusIcon onClick={addTag} className="text-blue-500 h-4 w-4 cursor-pointer" />
						</div>
						<div className="flex flex-wrap items-center space-x-2">
							{tags.map((tag, i) => (
								<div key={i} className="flex justify-between items-center space-x-3 border-[1px] px-3 py-1 text-sm text-gray-700 hover:bg-blue-400 hover:text-white cursor-default mb-3">
									<p className="font-semibold">{tag}</p>
									<XIcon onClick={() => removeTag(tag)} className="h-3 w-3 cursor-pointer" />
								</div>
							))}
						</div>
						<div>
							<h4 className="font-light text-gray-500 mb-2">Popular:</h4>
							<div className="flex flex-wrap justify-center items-end space-y-2 space-x-2">
								<p onClick={() => addSuggestedTag("art")} className="bg-gray-100 text-gray-700 font-semibold p-2 rounded-lg cursor-pointer">
									art
								</p>
								<p onClick={() => addSuggestedTag("celebrities")} className="bg-gray-100 text-gray-700 font-semibold p-2 rounded-lg cursor-pointer">
									celebrities
								</p>
								<p onClick={() => addSuggestedTag("gaming")} className="bg-gray-100 text-gray-700 font-semibold p-2 rounded-lg cursor-pointer">
									gaming
								</p>
								<p onClick={() => addSuggestedTag("sport")} className="bg-gray-100 text-gray-700 font-semibold p-2 rounded-lg cursor-pointer">
									sport
								</p>
								<p onClick={() => addSuggestedTag("music")} className="bg-gray-100 text-gray-700 font-semibold p-2 rounded-lg cursor-pointer">
									music
								</p>
								<p onClick={() => addSuggestedTag("crypto")} className="bg-gray-100 text-gray-700 font-semibold p-2 rounded-lg cursor-pointer">
									crypto
								</p>
								<p onClick={() => addSuggestedTag("crosschain")} className="bg-gray-100 text-gray-700 font-semibold p-2 rounded-lg cursor-pointer">
									crosschain
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Row */}
				<div className="flex flex-col md:flex-row md:items-center py-8 md:space-x-20 space-y-6 md:space-y-0">
					<p className="md:w-1/3 font-semibold">Add social links</p>
					<div className="md:w-2/3">
						<div className="flex flex-1 justify-between items-center px-4 border-[1px] border-gray-200 rounded-sm py-2 mb-3">
							<p className="text-gray-400 cursor-default mr-2">LinkedIn / </p>
							<input ref={linkedInRef} placeholder="(optional)" type="text" className="flex-1 outline-none bg-transparent" />
						</div>
						<div className="flex flex-1 justify-between items-center px-4 border-[1px] border-gray-200 rounded-sm py-2 mb-3">
							<p className="text-gray-400 cursor-default mr-2">Twitter / </p>
							<input ref={twitterRef} placeholder="(optional)" type="text" className="flex-1 outline-none bg-transparent" />
						</div>
						<div className="flex flex-1 justify-between items-center px-4 border-[1px] border-gray-200 rounded-sm py-2 mb-3">
							<p className="text-gray-400 cursor-default mr-2">Telegram / </p>
							<input ref={telegramRef} placeholder="(optional)" type="text" className="flex-1 outline-none bg-transparent" />
						</div>
						<div className="flex flex-1 justify-between items-center px-4 border-[1px] border-gray-200 rounded-sm py-2 mb-3">
							<p className="text-gray-400 cursor-default mr-2">Discord / </p>
							<input ref={discordRef} placeholder="(optional)" type="text" className="flex-1 outline-none bg-transparent" />
						</div>
					</div>
				</div>

				<div>
					{/* Submit Row */}
					<div className="w-full flex flex-col-reverse md:flex-row justify-center md:space-x-6 py-8">
						<button onClick={() => router.back()} className="text-gray-500 md:px-20 py-2 rounded-sm font-semibold hover:bg-gray-500 border-[1px] hover:text-white border-gray-300 transition transform ease-in-out">
							Cancel
						</button>
						<button onClick={publishProject} className="bg-blue-500 text-white md:px-20 py-2 mb-2 md:mb-0 rounded-sm font-semibold hover:bg-transparent border-[1px] hover:text-blue-500 border-blue-500 transition transform ease-in-out">
							{isPublishing && (
								<svg role="status" className="inline w-4 h-4 mr-3 text-black animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
									<path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
								</svg>
							)}
							Publish Project
						</button>
					</div>
				</div>
			</div>
			<Toaster />
		</main>
	);
}
export default NewProject;
