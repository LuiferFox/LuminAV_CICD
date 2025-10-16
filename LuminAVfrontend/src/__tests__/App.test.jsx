import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "../App";

describe("Componente principal", () => {
  it("Renderiza correctamente el título o elemento principal", () => {
    render(<App />);
    // Busca texto visible en pantalla (ajústalo según lo que muestre tu App.jsx)
    expect(screen.getByText(/LuminAV/i)).toBeInTheDocument();
  });
});
