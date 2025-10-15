import { cn } from "./lib";

interface ExampleButtonProps {
	label: string;
	variant?: "primary" | "secondary";
	size?: "sm" | "md" | "lg";
	onClick?: () => void;
}

export function ExampleButton({
	label,
	variant = "primary",
	size = "md",
	onClick,
}: ExampleButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"rounded-md font-medium transition-colors",
				variant === "primary" &&
					"bg-blue-600 text-white hover:bg-blue-700",
				variant === "secondary" &&
					"bg-gray-200 text-gray-900 hover:bg-gray-300",
				size === "sm" && "px-3 py-1.5 text-sm",
				size === "md" && "px-4 py-2 text-base",
				size === "lg" && "px-6 py-3 text-lg",
			)}
		>
			{label}
		</button>
	);
}
