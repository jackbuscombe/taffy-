import React, { useState } from "react";

type FilterBarProps = {
	filterName: any;
	status: any;
	setStatus: any;
	categories: any;
	setCategories: any;
	sortBy: any;
	setSortBy: any;
};

function FilterBar({ filterName, status, setStatus, categories, setCategories, sortBy, setSortBy }: FilterBarProps) {
	const [showFilters, setShowFilters] = useState(false);

	const handleCategoryChange = (e: any) => {
		const newCategoriesArray = [...categories];
		const index = categories.indexOf(e.target.value);
		if (index > -1) {
			newCategoriesArray.splice(index, 1);
			setCategories(newCategoriesArray);
			return;
		}
		setCategories([...categories, e.target.value]);
		return;
	};

	return (
		<div className="bg-white p-4 rounded-sm shadow text-gray-500">
			<h3 className="hidden sm:block font-semibold mb-4">{filterName}</h3>
			<button onClick={() => setShowFilters(!showFilters)} className="block w-full font-semibold text-black self-center sm:hidden rounded-lg">
				{showFilters ? "Hide" : "Show"} filters
			</button>
			<div className={`${!showFilters && "hidden"} sm:block`}>
				<div className="flex flex-col space-y-3 text-sm pb-4 border-b-[1px]">
					<div onClick={() => setStatus("all")} className="flex space-x-2 items-center cursor-pointer">
						<input checked={status === "all"} type="radio" className="cursor-pointer" />
						<p>All</p>
					</div>
					<div onClick={() => setStatus("upcoming")} className="flex space-x-2 items-center cursor-pointer">
						<input checked={status === "upcoming"} type="radio" className="cursor-pointer" />
						<p>Upcoming games</p>
					</div>
					<div onClick={() => setStatus("released")} className="flex space-x-2 items-center cursor-pointer">
						<input checked={status === "released"} type="radio" className="cursor-pointer" />
						<p>Already released</p>
					</div>
				</div>

				<h3 className="font-semibold my-4">Categories</h3>
				<div className="flex flex-col space-y-3 text-sm pb-4 border-b-[1px]">
					<div className="flex space-x-2 items-center cursor-pointer">
						<input onChange={handleCategoryChange} value={"art"} type="checkbox" className="cursor-pointer" />
						<p>Art</p>
					</div>
					<div className="flex space-x-2 items-center cursor-pointer">
						<input onChange={handleCategoryChange} value={"celebrities"} type="checkbox" className="cursor-pointer" />
						<p>Celebrities</p>
					</div>
					<div className="flex space-x-2 items-center cursor-pointer">
						<input onChange={handleCategoryChange} value={"gaming"} type="checkbox" className="cursor-pointer" />
						<p>Gaming</p>
					</div>
					<div className="flex space-x-2 items-center cursor-pointer">
						<input onChange={handleCategoryChange} value={"sport"} type="checkbox" className="cursor-pointer" />
						<p>Sport</p>
					</div>
					<div className="flex space-x-2 items-center cursor-pointer">
						<input onChange={handleCategoryChange} value={"music"} type="checkbox" className="cursor-pointer" />
						<p>Music</p>
					</div>
					<div className="flex space-x-2 items-center cursor-pointer">
						<input onChange={handleCategoryChange} value={"crypto"} type="checkbox" className="cursor-pointer" />
						<p>Crypto</p>
					</div>
					<div className="flex space-x-2 items-center cursor-pointer">
						<input onChange={handleCategoryChange} value={"cross_chain"} type="checkbox" className="cursor-pointer" />
						<p>Cross Chain</p>
					</div>
				</div>

				<h3 className="font-semibold my-4">Sort by</h3>
				<div className="flex flex-col space-y-3 text-sm pb-4 border-b-[1px]">
					<div onClick={() => setSortBy("time")} className="flex space-x-2 items-center cursor-pointer">
						<input checked={sortBy === "time"} type="radio" className="cursor-pointer" />
						<p>Time Remaining</p>
					</div>
					<div onClick={() => setSortBy("backers")} className="flex space-x-2 items-center cursor-pointer">
						<input checked={sortBy === "backers"} type="radio" className="cursor-pointer" />
						<p>Number of backers</p>
					</div>
					<div onClick={() => setSortBy("raised")} className="flex space-x-2 items-center cursor-pointer">
						<input checked={sortBy === "raised"} type="radio" className="cursor-pointer" />
						<p>Amount raise</p>
					</div>
					<div onClick={() => setSortBy("followers")} className="flex space-x-2 items-center cursor-pointer">
						<input checked={sortBy === "followers"} type="radio" className="cursor-pointer" />
						<p>Followers</p>
					</div>
				</div>
			</div>
		</div>
	);
}
export default FilterBar;
