import AboutRow from "../components/AboutRow";

function About() {
	return (
		<main className="w-full flex flex-col items-center bg-[#f3f6fc]">
			<div className="flex flex-col w-full py-8 md:py-16 bg-cover text-white bg-[url('/about_hero.png')] justify-center mb-12">
				<div className="flex flex-col space-y-6 w-full p-10 lg:p-0 lg:w-3/4 self-center">
					<h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-snug md:w-1/2">Achieve your financial goals sooner</h2>
					<h3>Start trading 500+ listed cryptos today</h3>
					<button className="bg-[#5082fb] p-3 rounded-md flex-grow-0 text-center w-36">View all</button>
				</div>
			</div>
			<div className="flex flex-col items-center px-16 w-2/3 space-y-32 mb-20">
				<AboutRow imageLeft={false} image="/about_hero.png" title="World-Class Security and Risk Management System" subtitle="All-round protection of user asset with our offline storage, multi-factor encryption, and 24/7 security monitoring" image1="/face-1.png" data1="20,000BTC" description1="Security Reserve Fund" image2="/face-1.png" data2="0 security incidents for 9 years" description2="Top-tier security and risk managament" />
				<AboutRow imageLeft={true} image="/about_hero.png" title="World-Class Security and Risk Management System" subtitle="All-round protection of user asset with our offline storage, multi-factor encryption, and 24/7 security monitoring" image1="/face-1.png" data1="20,000BTC" description1="Security Reserve Fund" image2="/face-1.png" data2="0 security incidents for 9 years" description2="Top-tier security and risk managament" />
				<AboutRow imageLeft={false} image="/about_hero.png" title="World-Class Security and Risk Management System" subtitle="All-round protection of user asset with our offline storage, multi-factor encryption, and 24/7 security monitoring" image1="/face-1.png" data1="20,000BTC" description1="Security Reserve Fund" image2="/face-1.png" data2="0 security incidents for 9 years" description2="Top-tier security and risk managament" />
			</div>
		</main>
	);
}
export default About;
