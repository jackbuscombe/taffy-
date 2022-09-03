import { XIcon } from "@heroicons/react/outline";
import { useEffect, useState } from "react";
import { Beneficiary } from "../types/typings";

type Props = {
	beneficiaryId: string;
	_name?: string;
	_percentage?: number;
	_vestingFrequency?: number;
	_vestingLength?: number;
	_cliff?: number;
	immutable?: boolean;
	raisenomicsBeneficiaries?: Beneficiary[];
	setRaisenomicsBeneficiaries?: React.Dispatch<React.SetStateAction<Beneficiary[]>> | undefined;
};

function RaisenomicsEntry({ beneficiaryId, _name, _percentage, _vestingFrequency, _vestingLength, _cliff, immutable, raisenomicsBeneficiaries, setRaisenomicsBeneficiaries }: Props) {
	const [name, setName] = useState<string | undefined>();
	const [percentage, setPercentage] = useState<number | undefined>();
	const [vestingFrequency, setVestingFrequency] = useState<number | undefined>();
	const [vestingLength, setVestingLength] = useState<number | undefined>(0);
	const [cliff, setCliff] = useState<number | undefined>();
	const [address, setAddress] = useState<string | undefined>("");

	useEffect(() => {
		setName(_name);
		setPercentage(_percentage);
		setVestingFrequency(_vestingFrequency);
		setVestingLength(_vestingLength);
		setCliff(_cliff);
	}, [beneficiaryId, _name, _percentage, _vestingFrequency, _vestingLength, _cliff, immutable]);

	// const handleChangeBeneficiaryAttribute = (e: any, attribute: string) => {
	// 	if (raisenomicsBeneficiaries && setRaisenomicsBeneficiaries) {
	// 		let newState = [...raisenomicsBeneficiaries];
	// 		console.log("new state", newState);
	// 		(newState[parseInt(beneficiaryId) - 1] as string | number).attribute = e.target.value;
	// 		setRaisenomicsBeneficiaries(newState);
	// 	}
	// }

	return (
		<div className="flex flex-col space-y-2 bg-gray-100 rounded text-sm p-4">
			<div className="flex justify-between items-center">
				<h3 className="text-lg font-semibold mb-2 underline">Raise Beneficiary {beneficiaryId}</h3>
				<XIcon
					onClick={() => {
						if (raisenomicsBeneficiaries && setRaisenomicsBeneficiaries) {
							const newState = [...raisenomicsBeneficiaries];
							newState.splice(parseInt(beneficiaryId) - 1, 1);
							setRaisenomicsBeneficiaries(newState);
						}
					}}
					className="h-8 w-8 sm:h-10 sm:w-10 cursor-pointer sm:p-2 hover:bg-gray-300 rounded-full shrink-0"
				/>
			</div>

			<div className="flex flex-wrap items-center text-left space-x-2">
				<p className="w-1/2 font-semibold">Beneficiary Name</p>
				<input
					type="text"
					value={name}
					onChange={(e) => {
						setName(e.target.value);
						if (raisenomicsBeneficiaries && setRaisenomicsBeneficiaries) {
							const newState = [...raisenomicsBeneficiaries];
							console.log("new state", newState);
							(newState[parseInt(beneficiaryId) - 1] as Beneficiary).name = e.target.value;
							setRaisenomicsBeneficiaries(newState);
						}
					}}
					id={`beneficiary${beneficiaryId}_name`}
					className={`flex justify-between items-center px-4 border-[1px] border-gray-200 rounded-sm py-2 min-w-0 ${immutable && "bg-gray-200"}`}
					placeholder="Beneficiary Name"
					disabled={immutable}
				/>
			</div>

			<div className="flex flex-wrap items-center text-left space-x-2">
				<p className="w-1/2 font-semibold">Percent</p>
				<div className={`flex w-48 items-center px-4 border-[1px] border-gray-200 rounded-sm py-2 min-w-0 bg-white ${immutable && "bg-gray-200"}`}>
					<input
						type="number"
						value={percentage ?? 0}
						onChange={(e) => {
							setPercentage(parseInt(e.target.value));
							if (raisenomicsBeneficiaries && setRaisenomicsBeneficiaries) {
								const newState = [...raisenomicsBeneficiaries];
								console.log("new state", newState);
								(newState[parseInt(beneficiaryId) - 1] as Beneficiary).percentage = parseInt(e.target.value);
								setRaisenomicsBeneficiaries(newState);
							}
						}}
						id={`beneficiary${beneficiaryId}_percentage`}
						className={`outline-none bg-transparent min-w-0 ${immutable && "bg-gray-200"}`}
						placeholder="% of funds raised"
						disabled={immutable}
						onWheel={(e) => (e.target as HTMLInputElement).blur()}
					/>
					<p className="text-gray-500 cursor-default ml-2">%</p>
				</div>
			</div>

			<div className="flex flex-wrap items-center text-left space-x-2">
				<p className="w-1/2 font-semibold">Vested every</p>
				<div className={`flex w-48 items-center px-4 border-[1px] border-gray-200 rounded-sm py-2 min-w-0 bg-white ${immutable && "bg-gray-200"}`}>
					<input
						type="number"
						value={vestingFrequency}
						onChange={(e) => {
							setVestingFrequency(parseInt(e.target.value));
							if (raisenomicsBeneficiaries && setRaisenomicsBeneficiaries) {
								const newState = [...raisenomicsBeneficiaries];
								console.log("new state", newState);
								(newState[parseInt(beneficiaryId) - 1] as Beneficiary).vestingFrequency = parseInt(e.target.value);
								setRaisenomicsBeneficiaries(newState);
							}
						}}
						min={1}
						max={365}
						id={`beneficiary${beneficiaryId}_vesting_frequency`}
						className={`w-full outline-none bg-transparent min-w-0 ${immutable && "bg-gray-200"}`}
						placeholder="Vesting Frequency"
						disabled={immutable}
					/>
					<p className="text-gray-500 cursor-default ml-2">Days</p>
				</div>
			</div>

			<div className="flex flex-wrap items-center text-left space-x-2">
				<p className="w-1/2 font-semibold">Over</p>
				<div className={`flex w-48 items-center px-4 border-[1px] border-gray-200 rounded-sm py-2 min-w-0 bg-white ${immutable && "bg-gray-200"}`}>
					<input
						type="number"
						value={vestingLength}
						onChange={(e) => {
							setVestingLength(parseInt(e.target.value));
							if (raisenomicsBeneficiaries && setRaisenomicsBeneficiaries) {
								const newState = [...raisenomicsBeneficiaries];
								console.log("new state", newState);
								(newState[parseInt(beneficiaryId) - 1] as Beneficiary).vestingLength = parseInt(e.target.value);
								setRaisenomicsBeneficiaries(newState);
							}
						}}
						min={1}
						max={365}
						id={`beneficiary${beneficiaryId}_vesting_length`}
						className={`w-full outline-none bg-transparent min-w-0 ${immutable && "bg-gray-200"}`}
						placeholder="Vesting Days"
						disabled={immutable}
						onWheel={(e) => (e.target as HTMLInputElement).blur()}
					/>
					<p className="text-gray-500 cursor-default ml-2">Days</p>
				</div>
				{/* <input type="text" value={vestingLength} onChange={(e) => setVestingLength(e.target.value)} id={`beneficiary${beneficiaryId}_vesting_length`} className={`flex justify-between items-center px-4 border-[1px] border-gray-200 rounded-sm py-2 min-w-0 ${immutable && "bg-gray-200"}`} placeholder="Vesting Length" disabled={immutable} /> */}
			</div>

			<div className="flex flex-wrap items-center text-left space-x-2">
				<p className="w-1/2 font-semibold">With a cliff at</p>
				<div className={`flex w-48 items-center px-4 border-[1px] border-gray-200 rounded-sm py-2 min-w-0 bg-white ${immutable && "bg-gray-200"}`}>
					<input
						type="number"
						value={cliff}
						onChange={(e) => {
							setCliff(parseInt(e.target.value));
							if (raisenomicsBeneficiaries && setRaisenomicsBeneficiaries) {
								const newState = [...raisenomicsBeneficiaries];
								console.log("new state", newState);
								(newState[parseInt(beneficiaryId) - 1] as Beneficiary).cliff = parseInt(e.target.value);
								setRaisenomicsBeneficiaries(newState);
							}
						}}
						min={1}
						max={365}
						id={`beneficiary${beneficiaryId}_cliff`}
						className={`w-full outline-none bg-transparent min-w-0 ${immutable && "bg-gray-200"}`}
						placeholder="Vesting Cliff"
						disabled={immutable}
					/>
					<p className="text-gray-500 cursor-default ml-2">Days</p>
				</div>
			</div>

			<div className="flex flex-wrap items-center text-left space-x-2">
				<p className="w-1/2 font-semibold">That can be claimed by</p>
				<input
					type="text"
					value={address}
					onChange={(e) => {
						setAddress(e.target.value);
						if (raisenomicsBeneficiaries && setRaisenomicsBeneficiaries) {
							const newState = [...raisenomicsBeneficiaries];
							console.log("new state", newState);
							(newState[parseInt(beneficiaryId) - 1] as Beneficiary).address = e.target.value;
							setRaisenomicsBeneficiaries(newState);
						}
					}}
					id={`beneficiary${beneficiaryId}_address`}
					placeholder="Enter Address"
					className={`flex justify-between items-center px-4 border-[1px] border-gray-200 rounded-sm py-2 min-w-0 ${immutable && "bg-gray-200"}`}
					disabled={immutable}
				/>
			</div>
		</div>
	);
}
export default RaisenomicsEntry;
