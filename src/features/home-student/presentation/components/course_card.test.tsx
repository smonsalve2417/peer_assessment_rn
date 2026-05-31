import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { CourseCard } from "./course_card";

describe("CourseCard (home-student) component", () => {
  it("renders course info and calls onTap", () => {
    const mock = {
      code: "CS101",
      name: "Comp",
      period: "2026",
      activeEvaluations: 2,
    } as any;
    const onTap = jest.fn();
    const { getByText } = render(<CourseCard course={mock} onTap={onTap} />);

    expect(getByText("CS101")).toBeTruthy();
    expect(getByText("Comp")).toBeTruthy();
    expect(getByText(/2 active/)).toBeTruthy();
    fireEvent.press(getByText("Comp"));
    expect(onTap).toHaveBeenCalled();
  });
});
