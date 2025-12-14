const loading = () => {
	return (
		<>
			<div className="fixed inset-0 z-[9998] bg-gray-950 opacity-70" />
			<div
				id="loading"
				className="fixed z-9999 flex h-full w-full items-center justify-center"
			>
				<span className="loader"></span>
			</div>
		</>
	)
}
export default loading
