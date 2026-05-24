import React from "react";
import { render } from "@testing-library/react-native";
import RadarChart from "./RadarChart";

describe("RadarChart component", () => {
  it("renders without crashing with data", () => {
    const data = {
      punctuality: 80,
      contributions: 70,
      commitment: 90,
      attitude: 85,
    };
    const { getByText } = render(
      (
        <RadarChart
          punctuality={data.punctuality}
          contributions={data.contributions}
          commitment={data.commitment}
          attitude={data.attitude}
        />
      ) as any,
    );
    // labels should be present
    expect(getByText("Punc")).toBeTruthy();
    expect(getByText("Cont")).toBeTruthy();
    expect(getByText("Comm")).toBeTruthy();
    expect(getByText("Atti")).toBeTruthy();
  });
});
