import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { CourseEvaluationCard } from "./course_evaluation_card";

describe("CourseEvaluationCard component", () => {
  it("renders evaluation info and calls onEvaluate", () => {
    const mockEval = {
      name: "Eval 1",
      status: "active",
      visibility: "public",
      deadline: new Date("2026-05-24T15:30:00"),
    } as any;

    const onEvaluate = jest.fn();
    const { getByText } = render(
      <CourseEvaluationCard evaluation={mockEval} onEvaluate={onEvaluate} />,
    );

    expect(getByText("Eval 1")).toBeTruthy();
    expect(getByText("Active")).toBeTruthy();
    expect(getByText("Public")).toBeTruthy();
    // CTA
    const cta = getByText(/Evaluate now/);
    fireEvent.press(cta);
    expect(onEvaluate).toHaveBeenCalled();
  });
});
