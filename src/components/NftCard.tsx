import Link from "next/link";
import { useRouter } from "next/router";

type NftCardType = {
	id: string;
	nftUrl: string;
	nftName: string;
	projectName: string;
};

function NftCard({ id, nftUrl, nftName, projectName }: NftCardType) {
	const router = useRouter();

	return (
		<Link href={`/nft/${id}`} passHref>
			<div className="cursor-pointer hover:bg-gray-200 p-4 transition transform ease-in-out shadow-sm">
				<img src={nftUrl} className="mb-2" />
				<div>
					<a className="font-semibold text-black">{nftName}</a>
					<h5 className="text-sm text-gray-400 font-light">{projectName}</h5>
				</div>
			</div>
		</Link>
	);
}
export default NftCard;
