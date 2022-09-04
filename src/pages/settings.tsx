import { PaperClipIcon } from "@heroicons/react/outline";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { UserType } from "../types/typings";
import { signOut, useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";
import axios from "axios";
import { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";

function Settings() {
	const { data: session, status } = useSession();
	const { data: loggedInUser, isFetching: fetchingLoggedInUser } = trpc.useQuery(["user.getLoggedInUser"]);
	const updateUser = trpc.useMutation(["user.updateUser"]);

	const router = useRouter();

	const [name, setName] = useState<string>("");
	const [bio, setBio] = useState<string | undefined>();
	const [email, setEmail] = useState<string>("");
	const [imageUrl, setImageUrl] = useState<string>("");

	const [uploadingImage, setUploadingImage] = useState<boolean>(false);
	const imagePickerRef = useRef<HTMLInputElement>(null);

	const handleImageDialogue = () => {
		// 👇️ open file input box on click of other element
		imagePickerRef.current?.click();
	};

	const save = async () => {
		if (!session?.user?.id || !name || fetchingLoggedInUser) {
			return;
		}

		try {
			toast.loading("Saving your details!");

			const updatedUser = await updateUser.mutateAsync({
				name: name,
				bio: bio ?? "",
				image: imageUrl,
				email: email ?? "",
			});

			if (!updateUser) {
				toast.dismiss();
				toast.error("Unable to update profile");
				return;
			}

			console.log("UpdatedUser:", updatedUser);
			toast.dismiss();
			toast.success("Successfully updated profile!");
			router.push(`/profile/${updatedUser?.id}`);
			return;
		} catch (error) {
			toast.dismiss();
			toast.error("Failed to update account. Try again or refresh.");
		}
	};

	const handleLogout = () => {
		signOut();
		router.push("/");
	};

	useEffect(() => {
		if (!loggedInUser) return;
		setBio(loggedInUser.bio ?? "");
		setImageUrl(loggedInUser.image);
		setName(loggedInUser.name);
		setEmail(loggedInUser.email ?? "");
	}, [loggedInUser]);

	const uploadImage = async (e: any) => {
		if (!session) return;
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
						<h1 className="w-full md:w-1/3 text-2xl font-bold text-gray-900">Account Settings</h1>
						<div className="bg-[url('/watch_mint_bg.png')] w-full md:w-2/3 h-24 flex justify-center md:justify-start items-center px-8 cursor-pointer hover:opacity-90 transition transform ease-in-out">
							<img src="/watch_mint_text.png" alt="" className="" />
						</div>
					</div>

					<div className="flex flex-col md:flex-row py-8 md:items-center md:space-x-20 space-y-6 md:space-y-0">
						<p className="md:w-1/3 font-semibold align-middle">Your Wallet Address</p>
						<div className="md:w-2/3 flex flex-col justify-center space-y-3">
							<p className="break-words md:hidden">{session?.user?.id}</p>
							<p className="hidden md:block mb-4 break-words">{session?.user?.id}</p>
							<button onClick={handleLogout} className="bg-green-500 text-white px-4 py-2 rounded-sm font-semibold hover:bg-transparent border-[1px] hover:text-green-500 border-green-500 transition transform ease-in-out">
								Change Wallet
							</button>
						</div>
					</div>
				</div>

				{/* Row 1 */}
				<div className="flex flex-col md:flex-row py-8 md:space-x-20 space-y-6 md:space-y-0">
					<div className="md:w-1/3 space-y-2">
						<p className="font-semibold">
							Profile picture <span className="text-red-500">*</span>
						</p>
						<p className="hidden md:block font-light text-sm">File types supported: JPG, PNG, GIF, SVG, MP4, WEBM, MP3, WAV, OGG, GLB, GLTF. Max size: 10 MB</p>
					</div>
					<div className="md:w-2/3 flex justify-center">
						{!imageUrl ? (
							<button id="image_button" onClick={handleImageDialogue} className="flex items-center h-20 border-[1px] border-gray-200 rounded-sm px-10 py-1 hover:bg-blue-500 hover:text-white group transition transform ease-in-out">
								<PaperClipIcon className="h-6 w-6 mr-2" />
								<p className="text-blue-500 font-semibold group-hover:text-white">Add Image</p>
							</button>
						) : (
							<img onClick={handleImageDialogue} id="profile_image" src={imageUrl} alt="Profile Image" className={`h-32 w-32 cursor-pointer rounded-full hover:opacity-90 transition transform ease-in-out object-cover ${!imageUrl && "hidden"}`} />
						)}
						<input ref={imagePickerRef} type="file" accept="image/*" onChange={uploadImage} className="hidden" />
					</div>
				</div>

				{/* Row 2 */}
				<div className="flex flex-col md:flex-row md:items-center py-8 md:space-x-20 space-y-6 md:space-y-0">
					<div className="md:w-1/3 space-y-2">
						<p className="font-semibold">
							Your name <span className="text-red-500">*</span>
						</p>
						<p className="text-gray-500 font-light">This will be displayed on your profile.</p>
					</div>

					<div className="md:w-2/3 flex flex-col lg:flex-row lg:space-x-3 space-y-6 lg:space-y-0">
						<div className="w-full flex flex-col space-y-1">
							<input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Your Name" className="w-full border-[1px] border-gray-200 rounded-sm px-4 py-2" />
						</div>
					</div>
				</div>

				{/* Row 3 */}
				<div className="flex flex-col md:flex-row py-8 md:space-x-20 space-y-6 md:space-y-0">
					<div className="md:w-1/3 space-y-2">
						<p className="font-semibold">Bio</p>
						<p className="font-light text-sm">Tell people a bit about yourself.</p>
					</div>
					<textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Write something about yourself" className="md:w-2/3 h-28 border-[1px] border-gray-200 rounded-sm px-4 py-2 resize-none" />
				</div>

				{/* Submit Row */}
				<div className="w-full flex flex-col-reverse md:flex-row justify-center md:space-x-6 py-8">
					<button onClick={() => router.push(`/profile/${session?.user?.id}`)} className="text-gray-500 md:px-20 py-2 rounded-sm font-semibold hover:bg-gray-500 border-[1px] hover:text-white border-gray-300 transition transform ease-in-out">
						Cancel
					</button>
					<button onClick={save} disabled={uploadingImage} className="bg-blue-500 text-white md:px-20 py-2 mb-2 md:mb-0 rounded-sm font-semibold hover:bg-transparent border-[1px] hover:text-blue-500 border-blue-500 transition transform ease-in-out">
						Save
					</button>
				</div>
			</div>
		</main>
	);
}
export default Settings;

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
