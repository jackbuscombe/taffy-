import toast from "react-hot-toast";
import { ethers } from "ethers";
import { ContractFactory } from "ethers";
import abi from "../../public/taffy-staking-abi.json";
import bytecode from "../../public/taffy-staking-bytecode.json";

export default async function deployErc20(_stakingToken: string, _rewardToken: string) {
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

		const contract = await factory.deploy(_stakingToken, _rewardToken);
		console.log(contract.address);

		const tx = contract.deployTransaction;
		console.log("tx", tx);

		await contract.deployTransaction.wait();
		toast.dismiss();

		toast.success(
			() => (
				<span>
					Contract Deployed!{" "}
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
