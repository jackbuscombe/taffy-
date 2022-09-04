import FilterBar from "../components/FilterBar";
import ProjectCard from "../components/ProjectCard";
import NftCard from "../components/NftCard";
import dateToUnix from "../hooks/dateToUnix";
import Nfts from "./nfts";
import { useEffect, useState } from "react";
import unixToDateTime from "../hooks/unixToDateTime";
import { trpc } from "../utils/trpc";
import { Project } from "@prisma/client";
import { Pulsar } from "@uiball/loaders";

function Projects(/*{ projects, nfts }: ProjectsPage*/) {
	const [status, setStatus] = useState("all");
	const [categories, setCategories] = useState<string[]>([]);
	const [sortBy, setSortBy] = useState("time");
	const { data: projects, refetch: refetchProjects, isFetching: fetchingProjects } = trpc.useQuery(["project.getSomeProjects", { amount: 12, status: status, sortBy: sortBy, tags: categories }]);

	useEffect(() => {
		console.log("tags", categories);
		refetchProjects();
	}, [sortBy, categories]);

	useEffect(() => {
		console.log(projects);
	}, [projects]);
	return (
		<div className="w-full flex flex-col items-center bg-[#f3f6fc] py-12">
			<div className="w-4/5 ">
				<h1 className="text-black text-4xl font-bold mb-8">Projects</h1>
				<div className="grid gap-5 grid-cols-5">
					<div className="sm:block col-span-5 sm:col-span-2 md:col-span-1">
						<FilterBar filterName="Projects" status={status} setStatus={setStatus} categories={categories} setCategories={setCategories} sortBy={sortBy} setSortBy={setSortBy} />
					</div>

					{/* Main */}
					<div className="col-span-5 sm:col-span-3 md:col-span-4">
						{!projects ? (
							<div className="w-full flex justify-center pt-12">
								<Pulsar size={40} speed={1.75} color="#21c275" />
							</div>
						) : (
							<>
								{projects && fetchingProjects && (
									<div className="w-full flex justify-center items-center py-2">
										<Pulsar size={40} speed={1.75} color="#21c275" />
										<h2 className="text-lg font-semibold">Fetching projects...</h2>
									</div>
								)}
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									{projects.length > 0 ? (
										projects.map((project, i: number) => <ProjectCard key={project.id} projectId={project.id} projectName={project.name} projectTicker={project.ticker} projectImage={project.image} description={project.description} creatorName={project.creator.name} bannerImage={project.bannerImage} backers={project._count.contributions} followers={project._count.followers} endDate={project.raiseEndTimestamp} raiseTokenAddress={project.raiseTokenAddress} amountRaised={project.amountRaised} target={project.target} amountStaked={project.amountStaked} nftDrop={false} />)
									) : (
										<div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-center font-light pt-6">
											<p>There are no projects with the given filters...</p>
										</div>
									)}
								</div>
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
export default Projects;
