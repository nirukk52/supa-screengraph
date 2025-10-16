import type { Meta, StoryObj } from "@storybook/nextjs";
import React from "react";
import { Container, Grid } from "./lib";

const meta = {
  title: "UI/Layout/ContainerGrid",
  component: Container,
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof Container>;

export const ResponsiveLayout: Story = {
  render: () => (
    <Container size="xl" className="py-8">
      <Grid gap="lg" className="items-stretch">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="min-h-16 rounded-md border border-dashed border-gray-300 bg-gray-50 p-4 text-center text-sm text-gray-600"
          >
            Item {i + 1}
          </div>
        ))}
      </Grid>
    </Container>
  ),
};


