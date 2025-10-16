import * as React from "react";
import { cn } from "../lib";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
	size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizeToClasses: Record<NonNullable<ContainerProps["size"]>, string> = {
	sm: "max-w-screen-sm",
	md: "max-w-screen-md",
	lg: "max-w-screen-lg",
	xl: "max-w-screen-xl",
	full: "max-w-full",
};

export function Container({
	className,
	size = "xl",
	...props
}: ContainerProps) {
	return (
		<div
			className={cn(
				"mx-auto w-full px-4 sm:px-6 lg:px-8",
				sizeToClasses[size],
				className,
			)}
			{...props}
		/>
	);
}
