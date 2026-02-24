import type { Meta, StoryObj } from "@storybook/react";
import { Layout } from "@web/components/Layout";

import "@web/index.css";

const meta: Meta<typeof Layout> = {
  component: Layout,
  title: "Web/Layout",
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Layout>;

export const Default: Story = {
  args: {
    children: (
      <main className="px-6 py-8">
        <p className="text-muted-foreground">Page content goes here.</p>
      </main>
    ),
  },
};
