import type { Preview } from "@storybook/react";
import { withMockApi } from "../packages/app-admin/src/storybook/mockApiDecorator";
import { withMockTrpc } from "../packages/app-admin/src/storybook/mockTrpcDecorator";

const preview: Preview = {
  decorators: [withMockTrpc, withMockApi],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
