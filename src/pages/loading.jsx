import { useEffect, useRef } from 'react'

const Loading = () => {
	// const renderCount = useRef(0);
	// const instanceId = useRef(Math.random().toString(36).substring(7));

	// renderCount.current += 1;

	// console.log(`[Loading #${instanceId.current}] Render ${renderCount.current} - ${new Date().toISOString()}`);
	// console.trace('Loading render stack trace');

	// useEffect(() => {
	// 	console.log(`[Loading #${instanceId.current}] Mount - ${new Date().toISOString()}`);

	// 	return () => {
	// 		console.log(`[Loading #${instanceId.current}] Unmount - ${new Date().toISOString()}`);
	// 	};
	// }, [])

	return (
		<>
			<div className="fixed inset-0 z-9998 bg-black/50 backdrop-blur-sm" />
			<div
				id="loading"
				className="fixed inset-0 z-9999 flex flex-col items-center justify-center gap-4"
			>
				<div className="relative w-16 h-16">
					<div className="absolute inset-0 rounded-full border-4 border-slate-700" />
					<div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
				</div>
				<p className="text-white text-sm font-medium tracking-wide animate-pulse">
					Carregando...
				</p>
			</div>
		</>
	)
}
export default Loading
