import Link from "next/link";
import { useRouter } from "next/router";
import capitalizeFirstLetter from "../hooks/capitalizeFirstLetter";

type NftCardExtendedType = {
	id: string;
	nftUrl: string;
	nftName: string;
	projectName: string;
	price: number;
	creatorImage: string;
	creatorName: string;
};

function NftCardExtended({ id, nftUrl, nftName, projectName, price, creatorImage, creatorName }: NftCardExtendedType) {
	const router = useRouter();

	return (
		<Link href={`/nft/${id}`} passHref>
			<div className="cursor-pointer hover:bg-gray-50 transition transform ease-in-out shadow-md text-sm rounded-md bg-white group">
				<img className=" w-full rounded-t-md group-hover:opacity-80 transition transform ease-in-out" src={nftUrl} />
				<div className="p-4 space-y-3">
					<div>
						<a className="font-semibold text-black">{capitalizeFirstLetter(nftName)}</a>
						<h5 className="text-gray-400 font-light">{capitalizeFirstLetter(projectName)}</h5>
					</div>
					<p className="font-semibold text-gray-500 text-xs">{price} ETH</p>
					<div className="flex flex-col sm:flex-row sm:items-center">
						<img src={creatorImage} alt={creatorName} className="rounded-full h-6 w-6 mr-2 object-cover" />
						<p className="text-black font-semibold overflow-hidden">{creatorName}</p>
					</div>
				</div>
			</div>
		</Link>
	);
}
export default NftCardExtended;
