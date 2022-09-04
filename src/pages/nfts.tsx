import FilterBar from "../components/FilterBar";
import NftCardExtended from "../components/NftCardExtended";
import PaginationBar from "../components/PaginationBar";
import { useEffect, useState } from "react";
import { NftType } from "../types/typings";
import { trpc } from "../utils/trpc";
import { Pulsar } from "@uiball/loaders";

type NftPageType = {
	nfts: NftType[];
};

function Nfts() {
	const [status, setStatus] = useState("all");
	const [categories, setCategories] = useState<string[]>([]);
	const [sortBy, setSortBy] = useState("time");
	const { data: nfts, refetch: refetchNfts, isFetching: fetchingNfts } = trpc.useQuery(["nft.getSomeNfts", { amount: 12, status: status, sortBy: sortBy }]);

	useEffect(() => {
		refetchNfts();
	}, [sortBy, status]);

	return (
		<div className="flex w-full justify-center bg-[#f3f6fc] py-12">
			<div className="w-4/5">
				<h1 className="text-black text-4xl font-bold mb-8">NFTs</h1>
				<div className="grid gap-5 grid-cols-5">
					<div className="sm:block col-span-5 md:col-span-1 sm:col-span-2">
						<FilterBar filterName="NFTs" status={status} setStatus={setStatus} categories={categories} setCategories={setCategories} sortBy={sortBy} setSortBy={setSortBy} />
					</div>

					{/* Main */}
					<div className="col-span-5 sm:col-span-3 md:col-span-4">
						{!nfts ? (
							<div className="w-full flex justify-center pt-12">
								<Pulsar size={40} speed={1.75} color="#21c275" />
							</div>
						) : (
							<>
								{nfts && fetchingNfts && (
									<div className="w-full flex justify-center items-center py-2">
										<Pulsar size={40} speed={1.75} color="#21c275" />
										<h2 className="text-lg font-semibold">Fetching NFTs...</h2>
									</div>
								)}
								<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
									{nfts.map((nft, i: number) => (
										<NftCardExtended key={nft.id} id={nft.id} nftUrl={nft.nftUrl} nftName={nft.name} projectName={nft.project?.name ?? nft.name} price={10} creatorImage={nft.creator.image} creatorName={nft.creator.name} />
									))}
								</div>
							</>
						)}

						{nfts && nfts.length > 12 && <PaginationBar />}
					</div>
				</div>
			</div>
		</div>
	);
}
export default Nfts;
