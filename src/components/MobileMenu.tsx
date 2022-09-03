import { XIcon } from "@heroicons/react/outline";
import Link from "next/link";

function MobileMenu({ setIsMobileMenuOpen }: any) {
	return (
		<div className="fixed md:hidden top-[0] bottom-[0] left-[0] right-[0] overflow-y-scroll scrollbar-hide m-auto bg-[#252d46] rounded-sm p-4 shadow-lg text-gray-700">
			<div onClick={() => setIsMobileMenuOpen(false)} className="absolute top-5 right-5 hover:bg-gray-700 rounded-full cursor-pointer p-6">
				<XIcon className="h-6 w-6 text-white" />
			</div>

			<nav className="h-full w-full flex flex-col justify-evenly items-center text-center">
				<Link href={"/projects"}>
					<a
						onClick={() => {
							setIsMobileMenuOpen(false);
						}}
						className="text-white text-xl cursor-pointer hover:underline hover:font-semibold"
					>
						Projects
					</a>
				</Link>
				<Link href={"/nfts"}>
					<a
						onClick={() => {
							setIsMobileMenuOpen(false);
						}}
						className="text-white text-xl cursor-pointer hover:underline hover:font-semibold"
					>
						NFTs
					</a>
				</Link>
				<Link href={"/voting"}>
					<a
						onClick={() => {
							setIsMobileMenuOpen(false);
						}}
						className="text-white text-xl cursor-pointer hover:underline hover:font-semibold"
					>
						Voting
					</a>
				</Link>
				<Link href={"/rewards"}>
					<a
						onClick={() => {
							setIsMobileMenuOpen(false);
						}}
						className="text-white text-xl cursor-pointer hover:underline hover:font-semibold"
					>
						Rewards
					</a>
				</Link>
				<Link href={"/about"}>
					<a
						onClick={() => {
							setIsMobileMenuOpen(false);
						}}
						className="text-white text-xl cursor-pointer hover:underline hover:font-semibold"
					>
						About
					</a>
				</Link>
			</nav>
		</div>
	);
}
export default MobileMenu;
