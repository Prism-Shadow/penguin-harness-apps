import type { WorkbenchPackage } from "@prismshadow/penguin-server/plugin";

// Playback is provided by the visible SoundCloud widget in the workbench tab.
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
