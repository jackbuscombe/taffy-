import { useState, useEffect } from "react";
import { Beneficiary } from "@prisma/client";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend } from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

type DatasetObject = {
	fill: boolean;
	label: string;
	data: number[];
	borderColor: string;
	backgroundColor: string;
};

const backgroundColorPallette = ["rgba(255, 99, 132, 0.2)", "rgba(54, 162, 235, 0.2)", "rgba(255, 206, 86, 0.2)", "rgba(75, 192, 192, 0.2)", "rgba(153, 102, 255, 0.2)", "rgba(255, 159, 64, 0.2)", "Red", "Green", "Yellow", "Blue"];
const borderColorPallette = ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)", "rgba(255, 206, 86, 1)", "rgba(75, 192, 192, 1)", "rgba(153, 102, 255, 1)", "rgba(255, 159, 64, 1)", "Red", "Green", "Yellow", "Blue"];

function TokenomicsLineChart({ beneficiaries, tokenSupply }: { beneficiaries: Beneficiary[]; tokenSupply: number }) {
	const [beneficiaryNames, setBeneficaryNames] = useState<string[]>([]);
	const [beneficiaryPercentages, setBeneficaryPercentages] = useState<number[]>([]);
	const [totalVestingDuration, setMaxVestingDuration] = useState<number>(0);
	const [chartDataset, setChartDataset] = useState<DatasetObject[]>([]);

	useEffect(() => {
		if (!beneficiaries) return;

		const beneficiaryNameArray = [];
		const beneficiaryPercentageArray = [];
		const beneficiaryVestingFrequencyArray = [];
		const beneficiaryVestingTimestampArray = [];
		const beneficiaryMovingBalanceArray = [];
		const chartDatasetArray = [];

		const totalVestingDurationArray = [];

		for (let i = 0; i < beneficiaries.length; i++) {
			beneficiaryNameArray.push((beneficiaries[i] as Beneficiary).name ?? (beneficiaries[i] as Beneficiary).address);
			beneficiaryPercentageArray.push((beneficiaries[i] as Beneficiary).percentage);
			// To work out the max date
			totalVestingDurationArray.push((beneficiaries[i] as Beneficiary).vestingLength ?? 0);

			const userTimestamps = [];
			const userAmounts = [];
			const userAllocation = tokenSupply * ((beneficiaries[i] as Beneficiary).percentage / 100);
			let carryingBalance = 0;

			// Find each timestamp the balance changes
			if ((beneficiaries[i] as Beneficiary).vestingLength != null && (beneficiaries[i] as Beneficiary).vestingFrequency != null) {
				const numberOfIncrements = ((beneficiaries[i] as Beneficiary).vestingLength as number) / ((beneficiaries[i] as Beneficiary).vestingFrequency as number);
				const periodicIncrements = userAllocation / numberOfIncrements;
				for (let j = 0; j < ((beneficiaries[i] as Beneficiary).vestingLength ?? 0); j += (beneficiaries[i] as Beneficiary).vestingFrequency as number) {
					userTimestamps.push(j);
					userAmounts.push(carryingBalance);
					carryingBalance = carryingBalance + periodicIncrements;
				}
				beneficiaryVestingTimestampArray.push(userTimestamps);
				beneficiaryMovingBalanceArray.push(userAmounts);
			}
		}
		setBeneficaryNames(beneficiaryNameArray);
		setBeneficaryPercentages(beneficiaryPercentageArray);
		setMaxVestingDuration(Math.max(...totalVestingDurationArray));

		for (let k = 0; k < beneficiaryNameArray.length; k++) {
			chartDatasetArray.push({
				fill: true,
				label: beneficiaryNameArray[k] as string,
				data: beneficiaryMovingBalanceArray[k] as number[],
				borderColor: borderColorPallette[k] as string,
				backgroundColor: backgroundColorPallette[k] as string,
			});
		}
		setChartDataset(chartDatasetArray);
	}, []);

	return (
		<Line
			data={{
				labels: [`Day ${0}`, `Day ${Math.floor((1 / 6) * totalVestingDuration)}`, `Day ${Math.floor((2 / 6) * totalVestingDuration)}`, `Day ${Math.floor((3 / 6) * totalVestingDuration)}`, `Day ${Math.floor((4 / 6) * totalVestingDuration)}`, `Day ${Math.floor((5 / 6) * totalVestingDuration)}`, `Day ${totalVestingDuration}`],
				datasets: chartDataset,
			}}
			options={{
				// responsive: true,
				scales: {
					x: {
						title: {
							display: true,
							text: "Days after launch",
						},
					},
					y: {
						stacked: true,
						title: {
							display: true,
							text: "Tokens",
						},
						min: 0,
						max: tokenSupply,
					},
				},
				plugins: {
					legend: {
						position: "top" as const,
					},
					title: {
						display: true,
						text: "Token Vesting Schedule",
					},
				},
			}}
		/>
	);
}

export default TokenomicsLineChart;
