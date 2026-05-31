import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { ButtonHome } from "./ButtonHome";

describe("ButtonHome component", () => {
  it("renders text and calls onPressed", () => {
    const onPressed = jest.fn();
    const { getByText } = render(
      <ButtonHome text="Start" onPressed={onPressed} />,
    );

    const btn = getByText("Start");
    fireEvent.press(btn);
    expect(onPressed).toHaveBeenCalled();
  });
});
