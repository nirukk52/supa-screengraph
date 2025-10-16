import type { Meta, StoryObj } from "@storybook/nextjs";
import { ExampleButton } from "./example-button";

const meta = {
	title: "UI/ExampleButton",
	component: ExampleButton,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: ["primary", "secondary"],
		},
		size: {
			control: "select",
			options: ["sm", "md", "lg"],
		},
	},
	args: {
		onClick: () => {},
	},
} satisfies Meta<typeof ExampleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
	args: {
		label: "Primary Button",
		variant: "primary",
		size: "md",
	},
};

export const Secondary: Story = {
	args: {
		label: "Secondary Button",
		variant: "secondary",
		size: "md",
	},
};

export const Small: Story = {
	args: {
		label: "Small",
		size: "sm",
	},
};

export const Large: Story = {
	args: {
		label: "Large Button",
		size: "lg",
	},
};
