import React from "react";
import { render } from "@testing-library/react-native";
import ScoreBar from "./ScoreBar";

describe("ScoreBar component", () => {
  it("renders score text", () => {
    const { getByText } = render(
      (<ScoreBar value={75} label="Progress" />) as any,
    );
    expect(getByText("Progress")).toBeTruthy();
    expect(getByText(/75/)).toBeTruthy();
  });
});
