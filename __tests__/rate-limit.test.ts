import { describe, it, expect, beforeEach } from "vitest";
import { rateLimit, __resetRateLimit } from "../lib/rateLimit";

const OPTS = { limit: 3, windowMs: 60_000 };

describe("rateLimit (fixed window)", () => {
  beforeEach(() => __resetRateLimit());

  it("allows requests up to the limit, then blocks", () => {
    const t0 = 1_000_000;
    expect(rateLimit("ip", OPTS, t0).ok).toBe(true); // 1
    expect(rateLimit("ip", OPTS, t0).ok).toBe(true); // 2
    expect(rateLimit("ip", OPTS, t0).ok).toBe(true); // 3
    const blocked = rateLimit("ip", OPTS, t0);
    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });

  it("reports decreasing remaining headroom", () => {
    const t0 = 2_000_000;
    expect(rateLimit("k", OPTS, t0).remaining).toBe(2);
    expect(rateLimit("k", OPTS, t0).remaining).toBe(1);
    expect(rateLimit("k", OPTS, t0).remaining).toBe(0);
  });

  it("resets after the window passes", () => {
    const t0 = 3_000_000;
    rateLimit("ip", OPTS, t0);
    rateLimit("ip", OPTS, t0);
    rateLimit("ip", OPTS, t0);
    expect(rateLimit("ip", OPTS, t0).ok).toBe(false);
    // Just after the window
    expect(rateLimit("ip", OPTS, t0 + 60_001).ok).toBe(true);
  });

  it("tracks different keys independently", () => {
    const t0 = 4_000_000;
    rateLimit("a", OPTS, t0);
    rateLimit("a", OPTS, t0);
    rateLimit("a", OPTS, t0);
    expect(rateLimit("a", OPTS, t0).ok).toBe(false);
    expect(rateLimit("b", OPTS, t0).ok).toBe(true); // different IP unaffected
  });
});
