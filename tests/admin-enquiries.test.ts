import { describe, expect, it } from "vitest";
import { enquiryMongoFilter, parseEnquiryFilters, serialiseEnquiry } from "@/lib/admin/enquiries";
import { Types } from "mongoose";

describe("admin enquiry filters", () => {
  it("rejects malformed filters and bounds the search and page", () => {
    expect(
      parseEnquiryFilters({
        service: "nope",
        status: "deleted",
        from: "2027-02-30",
        page: "-1",
        q: "a".repeat(150),
      }),
    ).toMatchObject({
      service: undefined,
      status: undefined,
      from: undefined,
      page: 1,
      q: "a".repeat(100),
    });
  });
  it("searches literally and includes legacy new statuses", () => {
    expect(enquiryMongoFilter(parseEnquiryFilters({ q: "a.*", status: "new" }))).toEqual({
      $and: [
        { $or: [{ status: "new" }, { status: null }] },
        {
          $or: ["name", "phone", "title", "itemId"].map((key) => ({
            [key]: { $regex: "a\\.\\*", $options: "i" },
          })),
        },
      ],
    });
  });
  it("uses inclusive IST calendar days", () => {
    expect(
      enquiryMongoFilter(parseEnquiryFilters({ from: "2026-11-11", to: "2026-11-12" })),
    ).toEqual({
      $and: [
        {
          createdAt: {
            $gte: new Date("2026-11-10T18:30:00Z"),
            $lt: new Date("2026-11-12T18:30:00Z"),
          },
        },
      ],
    });
  });
  it("defaults legacy status and rejects unsafe listing paths", () => {
    expect(
      serialiseEnquiry({
        _id: new Types.ObjectId(),
        name: "Test",
        phone: "9999999999",
        service: "hotel",
        title: "Stay",
        itemHref: "//evil.example",
      }),
    ).toMatchObject({ status: "new", itemHref: undefined, context: [] });
  });
});
