import toast from "react-hot-toast";
import { BigNumber, ethers } from "ethers";
import { ContractFactory } from "ethers";
import abi from "../../public/taffy-raisingeth-abi.json";
import bytecode from "../../public/taffy-raisingeth-bytecode.json";

export default async function deployErc20(_endTimestamp: number, _target: BigNumber, _beneficiary1: string, _ben1Portion: number, _beneficiary2: string, _ben2Portion: number, _beneficiary3: string, _ben3Portion: number, _beneficiary4: string, _ben4Portion: number, _beneficiary5: string, _ben5Portion: number) {
	try {
		if (!window.ethereum) {
			throw new Error("No wallet found.");
		}

		toast.loading("Deploying Contract...");

		const provider = new ethers.providers.Web3Provider(window.ethereum);
		console.log("Provider", provider);

		const signer = provider.getSigner();
		console.log("Signer", signer);

		const factory = new ContractFactory(abi, bytecode, signer);
		console.log("Factory", factory);

		const contract = await factory.deploy(_endTimestamp, _target, _beneficiary1, _ben1Portion, _beneficiary2, _ben2Portion, _beneficiary3, _ben3Portion, _beneficiary4, _ben4Portion, _beneficiary5, _ben5Portion);
		console.log(contract.address);

		const tx = contract.deployTransaction;
		console.log("tx", tx);

		await contract.deployTransaction.wait();
		toast.dismiss();

		toast.success(
			() => (
				<span>
					Raising Contract Deployed!{" "}
					<a className="text-blue-500 underline cursor-pointer" href={`https://goerli.etherscan.io/tx/${tx.hash}`} rel="noreferrer" target="_blank">
						Click to View Transaction
					</a>
				</span>
			),
			{
				duration: 50000,
			}
		);
		return tx;
	} catch (e) {
		if (typeof e === "string") {
			toast.dismiss();
			toast.error(e.toUpperCase());
			return;
		} else if (e instanceof Error) {
			toast.dismiss();
			toast.error(e.message);
			return;
		}
	}
}
