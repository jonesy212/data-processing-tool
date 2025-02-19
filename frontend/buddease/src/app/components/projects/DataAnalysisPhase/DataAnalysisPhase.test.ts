 
import "@testing-library/jest-dom/extend-expect";
import { render, screen } from "@testing-library/react";
import DataAnalysisPhase from "./DataAnalysisPhase";

describe("DataAnalysisPhase component", () => {
  test("renders without crashing", () => {
    render(<typeof DataAnalysisPhase />);

    expect(screen.getByText(/Data Analysis Phase/i)).toBeInTheDocument();
  });
});
