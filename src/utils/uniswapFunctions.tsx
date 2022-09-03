import { ChainId, Token, WETH, Fetcher, Route } from "@uniswap/sdk";

export const getTokenDecimals = async (tokenAddress: string) => {
	return await Fetcher.fetchTokenData(ChainId.MAINNET, tokenAddress);
};

export const getPairData = async (tokenAddress: string) => {
	const fetchedToken = await getTokenDecimals(tokenAddress);
	console.log("fetchedToken", fetchedToken);
	const TOKEN = new Token(ChainId.MAINNET, tokenAddress, fetchedToken.decimals);
	const pair = await Fetcher.fetchPairData(TOKEN, WETH[TOKEN.chainId]);
	console.log("pair", pair);
};

export const getTokenPrice = async (tokenAddress: string) => {
	const token = new Token(ChainId.MAINNET, tokenAddress, (await getTokenDecimals(tokenAddress)).decimals);

	const pair = await Fetcher.fetchPairData(token, WETH[token.chainId]);

	const route = new Route([pair], WETH[token.chainId]);

	console.log(route.midPrice.toSignificant(6)); // 201.306
	console.log(route.midPrice.invert().toSignificant(6)); // 0.00496756
};

export const getTickerFromAddress = async (tokenAddress: string) => {
	const token: Token = await Fetcher.fetchTokenData(ChainId.MAINNET, tokenAddress);
	return token.symbol;
	// const fetchedToken = await getTokenDecimals(tokenAddress);
	// return fetchedToken.symbol;
};
