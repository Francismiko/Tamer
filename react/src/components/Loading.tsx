export function Loading(props: LoadingProps): JSX.Element {
	const { size = "xl" } = props;
	const sizeStyles: Record<string, string> = {
		sm: "h-3 w-3",
		md: "h-4 w-4",
		lg: "h-6 w-6",
		xl: "h-8 w-8",
	};

	return (
		<div className="flex items-center justify-center h-full">
			<div
				className={`inline-block ${sizeStyles[size]} animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-info motion-reduce:animate-[spin_1.5s_linear_infinite]`}
				role="status"
			/>
		</div>
	);
}
