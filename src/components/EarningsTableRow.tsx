import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import StakeTokenModal from "./StakeTokenModal";

function EarningsTableRow({ key, projectId, projectName, sales, royalty, revenue }: any) {
	const router = useRouter();
	const [isStakingModalOpen, setIsStakingModalOpen] = useState(false);
	const stakeTokenModalWrapper = useRef(null);
	useOutsideAlerter(stakeTokenModalWrapper);

	function useOutsideAlerter(ref: any) {
		useEffect(() => {
			function handleClickOutside(event: any) {
				if (ref.current && !ref.current.contains(event.target)) {
					// if (ref === backProjectModalWrapper) {
					// 	setIsBackingModalOpen(false);
					// }
					if (ref === stakeTokenModalWrapper) {
						setIsStakingModalOpen(false);
					}
				}
			}
			document.addEventListener("mousedown", handleClickOutside);
			return () => {
				document.removeEventListener("mousedown", handleClickOutside);
			};
		}, [ref]);
	}

	return (
		<tr className="bg-white border-b hover:bg-gray-50">
			<th onClick={() => router.push(`/project/${projectId}`)} scope="row" className="text-blue-600 font-semibold px-4 py-2 border-[1px] border-gray-300 whitespace-nowrap cursor-pointer hover:underline">
				{projectName}
			</th>
			<td className="px-4 py-2 border-[1px] border-gray-300">${parseFloat(sales).toLocaleString()}</td>
			<td className="px-4 py-2 border-[1px] border-gray-300">{royalty.toFixed(5)}%</td>
			<td className="px-4 py-2 border-[1px] border-gray-300">${parseFloat(revenue).toLocaleString()}</td>
			<td className="px-4 py-2 border-[1px] border-gray-300 text-right">
				<div className="flex space-x-2">
					<button className="text-blue-600 hover:text-white hover:bg-blue-600 border-[1px] border-blue-200 rounded-sm px-2 py-1">Buy</button>
					<button onClick={() => setIsStakingModalOpen(true)} className="text-blue-600 hover:text-white hover:bg-blue-600 border-[1px] border-blue-200 rounded-sm px-2 py-1">
						Stake
					</button>
				</div>
			</td>
			{isStakingModalOpen && (
				<div ref={stakeTokenModalWrapper}>
					<StakeTokenModal tokenId={projectId} userTokenBalance={1} setIsStakingModalOpen={setIsStakingModalOpen} endTime={Math.floor(Date.now() / 1000)} projectId={projectId} projectName={projectName} tokenPrice={sales} tokenTicker={projectName} />
				</div>
			)}
		</tr>
	);
}
export default EarningsTableRow;
