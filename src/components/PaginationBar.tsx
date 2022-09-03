import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";

function PaginationBar() {
	return (
		<div className="flex justify-between">
			<button className="w-8 h-8 flex bg-transparent hover:bg-gray-800 text-gray-500 font-semibold hover:text-white border border-gray-400 hover:border-transparent rounded justify-center items-center">
				<ChevronLeftIcon className="h-4 w-4" />
			</button>

			<div className="hidden sm:flex space-x-2">
				<button className="w-8 h-8 bg-[#21c275] hover:bg-gray-800 text-white font-semibold hover:text-white border border-gray-400 hover:border-transparent rounded text-sm">1</button>
				<button className="w-8 h-8 bg-transparent hover:bg-gray-800 text-gray-500 font-semibold hover:text-white border border-gray-400 hover:border-transparent rounded text-sm">2</button>
				<button className="w-8 h-8 bg-transparent hover:bg-gray-800 text-gray-500 font-semibold hover:text-white border border-gray-400 hover:border-transparent rounded text-sm">3</button>
				<button className="w-8 h-8 bg-transparent hover:bg-gray-800 text-gray-500 font-semibold hover:text-white border border-gray-400 hover:border-transparent rounded text-sm">4</button>
				<button className="w-8 h-8 bg-transparent hover:bg-gray-800 text-gray-500 font-semibold hover:text-white border border-gray-400 hover:border-transparent rounded text-sm">5</button>
				<button className="w-8 h-8 bg-transparent hover:bg-gray-800 text-gray-500 font-semibold hover:text-white border border-gray-400 hover:border-transparent rounded text-sm">...</button>
				<button className="w-8 h-8 bg-transparent hover:bg-gray-800 text-gray-500 font-semibold hover:text-white border border-gray-400 hover:border-transparent rounded text-sm">48</button>
			</div>

			<button className="w-8 h-8 flex bg-transparent hover:bg-gray-800 text-gray-500 font-semibold hover:text-white border border-gray-400 hover:border-transparent rounded justify-center items-center">
				<ChevronRightIcon className="h-4 w-4" />
			</button>
		</div>
	);
}
export default PaginationBar;
