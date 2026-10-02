import { describe, expect, it } from "vitest";
import { computeTotals, displayStatus } from "./totals";

describe("computeTotals", () => {
  it("suma líneas sin descuento ni impuesto", () => {
    const t = computeTotals([{ qty: 2, unitPrice: 50 }, { qty: 1, unitPrice: 100 }], 0, 0);
    expect(t.subtotal).toBe(200);
    expect(t.total).toBe(200);
  });

  it("aplica el impuesto sobre la base descontada", () => {
    const t = computeTotals([{ qty: 1, unitPrice: 1000 }], 10, 19);
    expect(t.discount).toBe(100);
    expect(t.taxable).toBe(900);
    expect(t.tax).toBeCloseTo(171);
    expect(t.total).toBeCloseTo(1071);
  });

  it("devuelve ceros sin líneas", () => {
    expect(computeTotals([], 10, 19).total).toBe(0);
  });
});

describe("displayStatus", () => {
  it("pagada siempre es pagada", () => {
    expect(displayStatus("pagada", "2000-01-01", "2026-01-01")).toBe("pagada");
  });
  it("pendiente con fecha pasada es vencida", () => {
    expect(displayStatus("pendiente", "2026-01-01", "2026-01-02")).toBe("vencida");
  });
  it("vence hoy sigue pendiente", () => {
    expect(displayStatus("pendiente", "2026-01-02", "2026-01-02")).toBe("pendiente");
  });
});
