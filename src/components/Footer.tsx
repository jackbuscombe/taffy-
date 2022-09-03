import Link from "next/link";
import { useRouter } from "next/router";

function Footer() {
	const router = useRouter();

	return (
		<footer className="p-4 rounded-t-lg shadow md:px-6 md:py-8 bg-[#252d46]">
			<div className="sm:flex sm:items-center sm:justify-between">
				<Link href={"/"}>
					<a className="flex items-center mb-4 sm:mb-0">
						<img src="/logo_color_2.png" className="mr-3 h-12" alt="Taffy Logo" />
					</a>
				</Link>
				<ul className="flex flex-wrap items-center mb-6 text-sm text-gray-500 sm:mb-0 dark:text-gray-400">
					<li>
						<Link href={"/about"}>
							<a className="cursor-pointer mr-4 hover:underline md:mr-6 ">About</a>
						</Link>
					</li>
					<li>
						<Link href={"/privacy"}>
							<a className="cursor-pointer mr-4 hover:underline md:mr-6">Privacy Policy</a>
						</Link>
					</li>
					<li>
						<Link href={"/licensing"}>
							<a className="cursor-pointer mr-4 hover:underline md:mr-6 ">Licensing</a>
						</Link>
					</li>
					<li>
						<Link href={"/contact"}>
							<a className="cursor-pointer hover:underline">Contact</a>
						</Link>
					</li>
				</ul>
			</div>
			<hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
			<span className="block text-sm text-gray-500 sm:text-center dark:text-gray-400">
				© 2022{" "}
				<Link href={"/"}>
					<a className="hover:underline cursor-pointer">Taffy™</a>
				</Link>
				. All Rights Reserved.
			</span>
		</footer>
	);
}
export default Footer;
