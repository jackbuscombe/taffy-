// src/pages/_app.tsx
import { withTRPC } from "@trpc/next";
import type { AppRouter } from "../server/router";
import type { AppType } from "next/dist/shared/lib/utils";
import superjson from "superjson";
import { SessionProvider } from "next-auth/react";
import "../styles/globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { createClient, WagmiConfig, chain, configureChains } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { getDefaultProvider } from "ethers";

const { chains, provider } = configureChains([chain.mainnet, chain.polygon], [alchemyProvider({ apiKey: process.env.ALCHEMY_API_KEY })]);

const client = createClient({
	autoConnect: false,
	provider,
	// provider: getDefaultProvider(),
});

const MyApp: AppType = ({ Component, pageProps: { session, ...pageProps } }) => {
	return (
		<WagmiConfig client={client}>
			<SessionProvider session={session}>
				<Header />
				<Component {...pageProps} />
				<Footer />
			</SessionProvider>
		</WagmiConfig>
	);
};

const getBaseUrl = () => {
	if (typeof window !== "undefined") return ""; // browser should use relative url
	if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
	return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export default withTRPC<AppRouter>({
	config() {
		/**
		 * If you want to use SSR, you need to use the server's full URL
		 * @link https://trpc.io/docs/ssr
		 */
		const url = `${getBaseUrl()}/api/trpc`;

		return {
			url,
			transformer: superjson,
			/**
			 * @link https://react-query.tanstack.com/reference/QueryClient
			 */
			// queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
		};
	},
	/**
	 * @link https://trpc.io/docs/ssr
	 */
	ssr: false,
})(MyApp);
