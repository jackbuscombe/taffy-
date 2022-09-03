import Image from "next/image";

type ComponentProps = {
	imageLeft: boolean;
	image: string;
	title: string;
	subtitle: string;
	image1: string;
	data1: any;
	description1: string;
	image2: string;
	data2: any;
	description2: string;
};

function AboutRow({ imageLeft, image, title, subtitle, image1, data1, description1, image2, data2, description2 }: ComponentProps) {
	return (
		<div className={`flex flex-col-reverse items-center sm:items-start sm:flex-row ${imageLeft && "sm:flex-row-reverse"} my-2 sm:my-6 text-gray-800 gap-6 sm:gap-24 w-full`}>
			<div className="flex flex-col sm:w-1/2 space-y-8 itmes-center">
				<h2 className="text-2xl font-bold">{title}</h2>
				<h3 className="font-light">{subtitle}</h3>
				<div className="grid grid-cols-1 gap-2 sm:gap-16 sm:grid-cols-2">
					<div className="col-span-1">
						<img src={image1} alt="" className="h-10 w-10 rounded-full" />
						<p className="font-bold text-gray-600">{data1}</p>
						<p className="font-light text-gray-400">{description1}</p>
					</div>
					<div className="col-span-1">
						<img src={image2} alt="" className="h-10 w-10 rounded-full" />
						<p className="font-bold text-gray-600">{data1}</p>
						<p className="font-light text-gray-400">{description1}</p>
					</div>
				</div>
			</div>
			<div className="flex w-full sm:w-1/2 justify-center">
				<img src={image} alt="" className="w-64 h-64 rounded-full object-cover" />
			</div>
		</div>
	);
}
export default AboutRow;
