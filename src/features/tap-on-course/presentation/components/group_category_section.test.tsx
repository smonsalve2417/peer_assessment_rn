import React from "react";
import { render } from "@testing-library/react-native";
import { GroupCategorySection } from "./group_category_section";

describe("GroupCategorySection component", () => {
  it("renders category, groups and members", () => {
    const mock = {
      name: "Project Groups",
      source: "Auto",
      groups: [
        {
          code: "g1",
          name: "Group A",
          members: [
            { email: "a@example.com", fullName: "Alice", initials: "A" },
          ],
        },
      ],
    } as any;

    const { getByText } = render(<GroupCategorySection category={mock} />);

    expect(getByText("Project Groups")).toBeTruthy();
    expect(getByText("Auto")).toBeTruthy();
    expect(getByText("Group A")).toBeTruthy();
    expect(getByText("Alice")).toBeTruthy();
    expect(getByText("a@example.com")).toBeTruthy();
  });
});
