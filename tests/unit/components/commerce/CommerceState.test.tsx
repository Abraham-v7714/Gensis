import * as React from "react";
import { render, screen } from "@testing-library/react";
import { CommerceState } from "@/components/commerce/CommerceState";
import { describe, it, expect } from "vitest";

describe("CommerceState", () => {
  it("renders unavailable state with status role", () => {
    render(<CommerceState type="unavailable" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Commerce Unavailable")).toBeInTheDocument();
  });

  it("renders error state with alert role", () => {
    render(<CommerceState type="error" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Service Error")).toBeInTheDocument();
  });

  it("renders custom title and message when provided", () => {
    render(
      <CommerceState
        type="empty"
        title="Custom Empty Title"
        message="Custom message body"
      />
    );
    expect(screen.getByText("Custom Empty Title")).toBeInTheDocument();
    expect(screen.getByText("Custom message body")).toBeInTheDocument();
  });
});
