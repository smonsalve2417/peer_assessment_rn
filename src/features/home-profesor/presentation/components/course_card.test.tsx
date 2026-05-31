import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { CourseCard } from "./course_card";

describe("CourseCard (home-profesor) component", () => {
  it("renders and triggers onTap", () => {
    const mock = {
      code: "MATH1",
      name: "Math",
      period: "S1",
      activeEvaluations: 0,
    } as any;
    const onTap = jest.fn();
    const { getByText } = render(<CourseCard course={mock} onTap={onTap} />);

    expect(getByText("MATH1")).toBeTruthy();
    expect(getByText("Math")).toBeTruthy();
    fireEvent.press(getByText("Math"));
    expect(onTap).toHaveBeenCalled();
  });
});
