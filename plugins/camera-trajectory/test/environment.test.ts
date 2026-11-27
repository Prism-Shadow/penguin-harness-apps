import { describe, expect, it } from "vitest";
import {
  pythonCandidates,
  windowsBlenderCandidates,
} from "../workbenches/camera-trajectory/environment.js";

describe("camera workbench Windows discovery", () => {
  it("selects python.exe before Windows Store aliases and respects an override", () => {
    expect(pythonCandidates({}, "win32")).toEqual(["python", "python3"]);
    const executable = "D:\\Python310\\python.exe";
    expect(
      pythonCandidates({ PENGUIN_CAMERA_PYTHON: executable }, "win32"),
    ).toEqual([executable]);
  });

  it("checks the MSI install paths in descending version order", () => {
    const roots = windowsBlenderCandidates({
      ProgramW6432: "D:\\Program Files",
      ProgramFiles: "D:\\Program Files",
      "ProgramFiles(x86)": "relative",
    });
    expect(roots).toEqual(
      ["5.3", "4.5", "4.2"].flatMap((version) =>
        ["D", "C"].map(
          (drive) =>
            `${drive}:\\Program Files\\Blender Foundation\\Blender ${version}\\blender.exe`,
        ),
      ),
    );
  });
});
