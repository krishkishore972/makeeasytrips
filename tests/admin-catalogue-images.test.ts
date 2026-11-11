import { describe, expect, it } from "vitest";
import { catalogueImageId, catalogueImageUrls } from "@/lib/admin/catalogue-images";

describe("catalogue image deletion", () => {
  it("extracts managed public IDs from delivery and original URLs", () => {
    expect(
      catalogueImageId(
        "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/v123/tripnest/hotels/room-123",
        "demo",
      ),
    ).toBe("tripnest/hotels/room-123");
    expect(
      catalogueImageId(
        "https://res.cloudinary.com/demo/image/upload/v123/tripnest/hotels/room-123.jpg",
        "demo",
      ),
    ).toBe("tripnest/hotels/room-123");
  });
  it("does not accept other clouds, hosts, folders or encoded path traversal", () => {
    for (const url of [
      "https://res.cloudinary.com/other/image/upload/v1/tripnest/hotels/room.jpg",
      "https://example.com/demo/image/upload/v1/tripnest/hotels/room.jpg",
      "https://res.cloudinary.com/demo/image/upload/v1/private/hotels/room.jpg",
      "https://res.cloudinary.com/demo/image/upload/v1/tripnest/hotels/%2e%2e%2froom.jpg",
    ])
      expect(catalogueImageId(url, "demo")).toBeNull();
  });
  it("collects unique main and gallery URLs", () => {
    expect(catalogueImageUrls({ image: "a", gallery: ["a", "b", null] })).toEqual(["a", "b"]);
  });
});
