import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import TextBox from "./TextBox";

describe("TextBox component", () => {
  it("displays value, calls onChangeText and shows error", () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText, getByText, rerender } = render(
      <TextBox hintText="Email" value="" onChangeText={onChangeText} />,
    );

    const input = getByPlaceholderText("Email");
    fireEvent.changeText(input, "abc");
    expect(onChangeText).toHaveBeenCalledWith("abc");

    // show error prop
    rerender(
      <TextBox
        hintText="Email"
        value="abc"
        onChangeText={onChangeText}
        error={"Invalid"}
      />,
    );
    expect(getByText("Invalid")).toBeTruthy();
  });
});
