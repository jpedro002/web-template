const SkeletonLoading = () => {
	return (
		<div className="p-6 space-y-6">
			{/* Header Skeleton */}
			<div className="space-y-2">
				<div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
				<div className="h-4 w-64 bg-slate-100 rounded-lg animate-pulse" />
			</div>

			{/* Table Header Skeleton */}
			<div className="space-y-3">
				<div className="grid grid-cols-4 gap-4 mb-4">
					<div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
					<div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
					<div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
					<div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
				</div>

				{/* Table Rows Skeleton */}
				{[...Array(5)].map((_, i) => (
					<div key={i} className="grid grid-cols-4 gap-4">
						<div className="h-12 bg-slate-100 rounded-lg animate-pulse" />
						<div className="h-12 bg-slate-100 rounded-lg animate-pulse" />
						<div className="h-12 bg-slate-100 rounded-lg animate-pulse" />
						<div className="h-12 bg-slate-100 rounded-lg animate-pulse" />
					</div>
				))}
			</div>
		</div>
	)
}

export default SkeletonLoading
