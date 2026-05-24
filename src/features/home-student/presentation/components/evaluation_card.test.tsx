import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { EvaluationCard } from "./evaluation_card";

describe("EvaluationCard component", () => {
  it("renders and triggers onTap", () => {
    const mock = {
      status: "open",
      courseCode: "CS101",
      timeRemaining: "2d",
      title: "Midterm",
      courseName: "Computer Sci",
    } as any;
    const onTap = jest.fn();
    const { getByText } = render(
      <EvaluationCard evaluation={mock} onTap={onTap} />,
    );

    expect(getByText("CS101")).toBeTruthy();
    expect(getByText("Midterm")).toBeTruthy();
    const btn = getByText(/Evaluate now|View results/);
    fireEvent.press(btn);
    expect(onTap).toHaveBeenCalled();
  });
});
