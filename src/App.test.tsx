import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { App } from "./App";
import { renderWithProviders } from "./utils/test-utils";

// Mock chart and wallet components to simplify testing
vi.mock("./features/charts/components/ChartContainer", () => ({
  default: () => <div data-testid="chart-container">Mock Chart Container</div>,
}));

vi.mock("./features/wallet/components/WalletContainer", () => ({
  WalletContainer: () => (
    <div data-testid="wallet-container">Mock Wallet Container</div>
  ),
}));

describe("App Component", () => {
  it("should render the app title correctly", () => {
    renderWithProviders(<App />);

    // Check that the app title contains both "Mesh" and "Crypto Tracker"
    expect(screen.getByText("Mesh")).toBeInTheDocument();
    expect(screen.getByText("- Crypto Tracker")).toBeInTheDocument();
  });

  it("should render tabs with Chart selected by default", () => {
    renderWithProviders(<App />);

    const chartTab = screen.getByRole("tab", { name: /chart/i });
    const walletTab = screen.getByRole("tab", { name: /wallet/i });

    // Tabs should be in the document
    expect(chartTab).toBeInTheDocument();
    expect(walletTab).toBeInTheDocument();

    // Chart tab should be selected by default
    expect(chartTab).toHaveAttribute("aria-selected", "true");
    expect(walletTab).toHaveAttribute("aria-selected", "false");

    // Chart content should be visible
    expect(screen.getByTestId("chart-container")).toBeInTheDocument();

    // Wallet content should not be visible yet
    expect(screen.queryByTestId("wallet-container")).toBeNull();
  });

  it("should switch between tabs when clicked", async () => {
    const { user } = renderWithProviders(<App />);

    const chartTab = screen.getByRole("tab", { name: /chart/i });
    const walletTab = screen.getByRole("tab", { name: /wallet/i });

    // Click on Wallet tab
    await user.click(walletTab);

    // Wallet tab should now be selected
    expect(walletTab).toHaveAttribute("aria-selected", "true");
    expect(chartTab).toHaveAttribute("aria-selected", "false");

    // Wallet content should be visible
    expect(screen.getByTestId("wallet-container")).toBeInTheDocument();

    // Chart content should not be visible
    expect(screen.queryByTestId("chart-container")).toBeNull();

    // Click back on Chart tab
    await user.click(chartTab);

    // Chart tab should now be selected again
    expect(chartTab).toHaveAttribute("aria-selected", "true");
    expect(walletTab).toHaveAttribute("aria-selected", "false");

    // Chart content should be visible again
    expect(screen.getByTestId("chart-container")).toBeVisible();

    // Wallet content should no longer be visible
    expect(screen.queryByTestId("wallet-container")).toBeNull();
  });

  it("should have responsive layout classes", () => {
    renderWithProviders(<App />);

    // Check that the main title has the proper classes for responsive design
    const title = screen.getByText("Mesh").closest("h1");
    expect(title).toHaveClass("text-3xl", "md:text-4xl", "lg:text-5xl");

    // Check that the parent container has proper width classes
    const meshElement = screen.getAllByText("Mesh")[0];
    const parentDiv = meshElement.closest("div");
    expect(parentDiv).not.toBeNull();

    const parentContainer = parentDiv?.querySelector("div.w-full");
    expect(parentContainer).not.toBeNull();
    expect(parentContainer).toHaveClass("max-w-5xl", "mx-auto");
  });
});
