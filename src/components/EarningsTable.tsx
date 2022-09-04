import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { trpc } from "../utils/trpc";
import EarningsTableRow from "./EarningsTableRow";

type TableProps = {
	contributionArray: any;
};

const MOCK_DATA = [
	{
		id: 1,
		projectName: "Project 1",
		sales: 832000,
		royalty: 2.5,
		revenue: 25000,
	},
	{
		id: 2,
		projectName: "Project 2",
		sales: 832000,
		royalty: 2.5,
		revenue: 25000,
	},
	{
		id: 3,
		projectName: "Project 3",
		sales: 832000,
		royalty: 2.5,
		revenue: 25000,
	},
	{
		id: 4,
		projectName: "Project 4",
		sales: 832000,
		royalty: 2.5,
		revenue: 25000,
	},
	{
		id: 5,
		projectName: "Project 5",
		sales: 832000,
		royalty: 2.5,
		revenue: 25000,
	},
];

function EarningsTable() {
	const router = useRouter();
	const { data: backedProjects, isFetching: fetchingUserBackedProjects } = trpc.useQuery(["contribution.getUserBackProjects"]);
	const [tableData, setTableData] = useState<any[]>([]);

	useEffect(() => {
		if (!backedProjects) return;

		const dataArray: any[] = [];

		for (let i = 0; i < backedProjects.length; i++) {
			dataArray.push({
				id: backedProjects[i]?.Project.id,
				projectName: backedProjects[i]?.Project.name,
				sales: backedProjects[i]?.amount,
				royalty: backedProjects[i]?.amount,
				revenue: backedProjects[i]?.amount,
				ticker: backedProjects[i]?.Project.ticker,
			});
		}

		setTableData(dataArray);
	}, [backedProjects]);

	return (
		<div className="relative overflow-x-auto shadow-md rounded-sm">
			<table className="w-full text-sm text-left text-gray-500 border-collapse border-[1px] border-gray-300">
				<thead className="text-xs text-gray-700 bg-blue-50">
					<tr>
						<th scope="col" className="px-4 py-3">
							Project Name
						</th>
						<th scope="col" className="px-4 py-3">
							Sales
						</th>
						<th scope="col" className="px-4 py-3">
							Royalty Amount
						</th>
						<th scope="col" className="px-4 py-3">
							Revenue Amount
						</th>
						<th scope="col" className="px-4 py-3">
							Actions
						</th>
					</tr>
				</thead>
				<tbody>
					{tableData?.map(({ id, projectName, sales, royalty, revenue, ticker }, i) => (
						<EarningsTableRow key={i} projectId={id} projectName={projectName} sales={sales} royalty={royalty} revenue={revenue} ticker={ticker} />
						// <tr key={i} className="bg-white border-b hover:bg-gray-50">
						// 	<th onClick={() => router.push(`/project/${id}`)} scope="row" className="text-blue-600 font-semibold px-4 py-2 border-[1px] border-gray-300 whitespace-nowrap cursor-pointer hover:underline">
						// 		{projectName}
						// 	</th>
						// 	<td className="px-4 py-2 border-[1px] border-gray-300">${parseFloat(sales).toLocaleString()}</td>
						// 	<td className="px-4 py-2 border-[1px] border-gray-300">{royalty.toFixed(5)}%</td>
						// 	<td className="px-4 py-2 border-[1px] border-gray-300">${parseFloat(revenue).toLocaleString()}</td>
						// 	<td className="px-4 py-2 border-[1px] border-gray-300 text-right">
						// 		<div className="flex space-x-2">
						// 			<button className="text-blue-600 hover:text-white hover:bg-blue-600 border-[1px] border-blue-200 rounded-sm px-2 py-1">Buy</button>
						// 			<button onClick={() => setIsStakingModalOpen(true)} className="text-blue-600 hover:text-white hover:bg-blue-600 border-[1px] border-blue-200 rounded-sm px-2 py-1">
						// 				Stake
						// 			</button>
						// 		</div>
						// 	</td>
						// </tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
export default EarningsTable;
