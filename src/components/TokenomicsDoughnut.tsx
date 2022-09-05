import { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { Beneficiary } from "@prisma/client";

ChartJS.register(ArcElement, Tooltip, Legend);

function TokenomicsDoughnut({ beneficiaries }: { beneficiaries: Beneficiary[] }) {
	const [beneficiaryNames, setBeneficaryNames] = useState<string[]>([]);
	const [beneficiaryPercentages, setBeneficaryPercentages] = useState<number[]>([]);

	useEffect(() => {
		if (!beneficiaries) return;

		const beneficiaryNameArray = [];
		const beneficiaryPercentageArray = [];

		for (let i = 0; i < beneficiaries.length; i++) {
			beneficiaryNameArray.push((beneficiaries[i] as Beneficiary).name ?? (beneficiaries[i] as Beneficiary).address);
			beneficiaryPercentageArray.push((beneficiaries[i] as Beneficiary).percentage);
		}
		setBeneficaryNames(beneficiaryNameArray);
		setBeneficaryPercentages(beneficiaryPercentageArray);
	}, [beneficiaries]);

	return (
		<Doughnut
			data={{
				labels: beneficiaryNames,
				datasets: [
					{
						label: "% of Token DistributionVotes",
						data: beneficiaryPercentages,
						backgroundColor: ["rgba(255, 99, 132, 0.2)", "rgba(54, 162, 235, 0.2)", "rgba(255, 206, 86, 0.2)", "rgba(75, 192, 192, 0.2)", "rgba(153, 102, 255, 0.2)", "rgba(255, 159, 64, 0.2)"],
						borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)", "rgba(255, 206, 86, 1)", "rgba(75, 192, 192, 1)", "rgba(153, 102, 255, 1)", "rgba(255, 159, 64, 1)"],
						borderWidth: 1,
					},
				],
			}}
			options={{
				responsive: true,
				plugins: {
					legend: {
						position: "top" as const,
					},
					title: {
						display: true,
						text: "Initial Token Distribution",
					},
				},
			}}
		/>
	);
}

export default TokenomicsDoughnut;
