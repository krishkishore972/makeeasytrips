import { describe, expect, it } from "vitest";
import {
  cn,
  firstParam,
  formatCompactNumber,
  formatCurrency,
  pluralize,
  toQueryString,
} from "@/lib/utils";

describe("formatCurrency", () => {
  it("formats rupees without decimals by default", () => {
    expect(formatCurrency(7400)).toBe("₹7,400");
    expect(formatCurrency(77175)).toBe("₹77,175");
  });

  it("supports custom currency and precision", () => {
    expect(formatCurrency(1234.5, { maximumFractionDigits: 2 })).toBe("₹1,234.50");
  });
});

describe("formatCompactNumber", () => {
  it("compacts large numbers", () => {
    expect(formatCompactNumber(1200)).toBe("1.2K");
  });
});

describe("pluralize", () => {
  it("selects the singular only for one", () => {
    expect(pluralize(1, "traveller")).toBe("traveller");
    expect(pluralize(0, "traveller")).toBe("travellers");
    expect(pluralize(2, "night")).toBe("nights");
  });

  it("accepts an explicit plural", () => {
    expect(pluralize(2, "person", "people")).toBe("people");
  });
});

describe("firstParam", () => {
  it("unwraps arrays and passes through scalars", () => {
    expect(firstParam("value")).toBe("value");
    expect(firstParam(["first", "second"])).toBe("first");
    expect(firstParam(undefined)).toBeUndefined();
  });
});

describe("toQueryString", () => {
  it("skips empty values and encodes the rest", () => {
    expect(
      toQueryString({
        type: "flight",
        pax: 2,
        cabin: null,
        empty: "",
        flag: false,
        label: "a b",
      }),
    ).toBe("?type=flight&pax=2&flag=false&label=a+b");
  });

  it("returns an empty string when nothing is set", () => {
    expect(toQueryString({})).toBe("");
    expect(toQueryString({ a: null, b: undefined })).toBe("");
  });
});

describe("cn", () => {
  it("merges conditional classes and resolves conflicts", () => {
    expect(cn("px-2", false && "hidden", "px-4")).toBe("px-4");
  });
});
