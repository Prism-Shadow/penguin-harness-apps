import type { WorkbenchPackage } from "@prismshadow/penguin-server/plugin";

// The game runs in the workbench tab. It needs no sessions, tools or server-side state.
export default {
  modules: {
    Workbench: {
      create() {
        return {
          api: {
            main: {
              async handle() {
                return { status: 404 };
              },
            },
          },
        };
      },
    },
  },
} satisfies WorkbenchPackage;
