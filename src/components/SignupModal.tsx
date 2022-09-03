import { useEffect, useRef, useState } from "react";
import { XIcon } from "@heroicons/react/outline";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

function SignupModal() {
	const { data: session, status } = useSession();
	const router = useRouter();

	const filePickerRef = useRef<HTMLInputElement>(null);
	const firstName = useRef<HTMLInputElement>(null);
	const lastName = useRef<HTMLInputElement>(null);
	const [image, setImage] = useState<string | Blob | Uint8Array | ArrayBuffer>("");
	const [loading, setLoading] = useState(false);

	// const photoURL = useRef("/avatar_placeholder.jpg");
	// const [previewImage, setPreviewImage] = useState("/avatar_placeholder.jpg");

	const handleImageChange = (e: any) => {
		if (e.target.files[0]) {
			setImage(e.target.files[0]);
			(document.getElementById("showImage") as HTMLImageElement).src = URL.createObjectURL(e.target.files[0]);
		}
	};

	const handleImageDialogue = () => {
		// 👇️ open file input box on click of other element
		filePickerRef.current?.click();
	};

	const registerUser = async () => {
		// if (loading) return;
		// if (!firstName.current || !lastName.current) {
		// 	return;
		// }
		// setLoading(true);
		// const toastLoading = toast.loading("Signing you up! Just a second...");
		// try {
		// 	const docRef = await setDoc(doc(db, "users", session?.user?.id as string), {
		// 		bio: "",
		// 		firstName: firstName.current.value.toLowerCase(),
		// 		lastName: lastName.current.value.toLowerCase(),
		// 		profileImage: "",
		// 		userCreatedTimestamp: Date.now(),
		// 	});
		// 	const storageRef = ref(storage, `users/${session?.user?.id}/image`);
		// 	const uploadTask = uploadBytesResumable(storageRef, image as Blob | Uint8Array | ArrayBuffer);
		// 	uploadTask.on(
		// 		"state_changed",
		// 		(snapshot) => {
		// 			const progress = Math.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
		// 			switch (snapshot.state) {
		// 				case "paused":
		// 					toast("Upload is paused");
		// 					break;
		// 			}
		// 		},
		// 		(error) => {
		// 			switch (error.code) {
		// 				case "storage/unauthorized":
		// 					toast.error("User doesn't have permission to access the object");
		// 					break;
		// 				case "storage/canceled":
		// 					toast.error("User canceled the upload");
		// 					break;
		// 				case "storage/unknown":
		// 					toast.error("Unknown error occurred, inspect error.serverResponse");
		// 					break;
		// 			}
		// 		},
		// 		async () => {
		// 			// Upload completed successfully, now we can get the download URL
		// 			await getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
		// 				updateDoc(doc(db, "users", session?.user?.id as string), {
		// 					profileImage: downloadURL,
		// 				});
		// 			});
		// 			toast.dismiss();
		// 			toast.success("Congrats, you have signed up with Taffy");
		// 			setLoading(false);
		// 			setImage("");
		// 			setSignupModalOpen(false);
		// 		}
		// 	);
		// } catch (error) {
		// 	setLoading(false);
		// 	toast.dismiss(toastLoading);
		// 	toast.error("Error registering user. Try again!");
		// 	return;
		// }
	};

	// useEffect(() => {
	// 	enableWeb3();
	// }, []);

	return (
		<div className="fixed top-[3vh] bottom-[3vh] left-[20vw] right-[20vw] overflow-y-scroll scrollbar-hide m-auto bg-white rounded-sm p-4 shadow-lg text-gray-700">
			<div className="flex flex-col space-y-4 mb-3">
				<div className="flex justify-between">
					<p className="text-xl font-semibold">Hey there, new friend!</p>
					{/* <XIcon onClick={() => setSignupModalOpen(false)} className="h-9 w-9 cursor-pointer hover:bg-gray-200 hover:rounded-full p-2" /> */}
				</div>
				<p>
					We noticed this is your first time signing into Taffy.
					<br />
					Please enter a few details so we can set you up with a profile.
				</p>
			</div>

			<div className="w-full flex flex-col items-center my-4 space-y-3">
				<img onClick={handleImageDialogue} id="showImage" src="/avatar_placeholder.jpg" alt="Profile Picture" className="h-32 w-32 cursor-pointer rounded-full hover:opacity-90 transition transform ease-in-out object-cover" />
				<button onClick={handleImageDialogue} className="bg-blue-500 text-white p-2 rounded-sm font-semibold hover:bg-transparent border-[1px] hover:text-blue-500 border-blue-500 transition transform ease-in-out">
					Change Profile Picture
				</button>
			</div>

			<div className="flex flex-col space-y-4">
				<div className="truncate">
					<p className="bg-gray-100 border p-2 rounded-sm">Address: {session?.user?.id}</p>
				</div>
				<input ref={firstName} type="text" placeholder="First Name (required)" required className="border p-4 rounded-sm" />
				<input ref={lastName} type="text" placeholder="Last Name" className="border p-4 rounded-sm" />
				<input ref={filePickerRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />

				<div className="flex w-full flex-col-reverse sm:flex-row justify-center items-center sm:space-x-2">
					{/* <button onClick={setSignupModalOpen} className="text-gray-600 w-4/5 py-2 rounded-sm font-semibold hover:bg-gray-600 border-[1px] hover:text-white border-gray-300 transition transform ease-in-out">
						Cancel
					</button> */}
					<button onClick={registerUser} className="bg-blue-500 text-white w-4/5 py-2 mb-2 sm:mb-0 rounded-sm font-semibold hover:bg-transparent border-[1px] hover:text-blue-500 border-blue-500 transition transform ease-in-out">
						{loading && (
							<svg role="status" className="inline w-4 h-4 mr-3 text-black animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
								<path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
							</svg>
						)}
						Continue
					</button>
				</div>
			</div>
			<Toaster />
		</div>
	);
}
export default SignupModal;
