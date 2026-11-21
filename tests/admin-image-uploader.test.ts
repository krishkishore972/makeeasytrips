import { isValidElement, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ImageUploader } from "@/components/admin/image-uploader";

// Exercise the upload event and subsequent render without a browser or a
// Cloudinary account. Keep hook state between the two component renders.
const hooks = vi.hoisted(() => ({
  values: [] as unknown[],
  cursor: 0,
}));

vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  useId: () => "upload-test",
  useRef: () => ({ current: null }),
  useState: (initial: unknown) => {
    const index = hooks.cursor++;
    if (!(index in hooks.values)) hooks.values[index] = initial;
    return [
      hooks.values[index],
      (value: unknown) => {
        hooks.values[index] = value;
      },
    ];
  },
}));

type ElementProps = {
  children?: ReactNode;
  type?: string;
  name?: string;
  value?: string;
  src?: string;
  onChange?: (event: { target: { files: File[] } }) => void;
};

function elements(node: ReactNode): ElementProps[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!isValidElement<ElementProps>(node)) return [];
  return [node.props, ...elements(node.props.children)];
}

function render() {
  hooks.cursor = 0;
  return elements(
    ImageUploader({
      folder: "holidays",
      name: "image",
      initialUrl: "https://example.com/old.jpg",
    }),
  );
}

describe("admin image replacement", () => {
  beforeEach(() => {
    hooks.values = [];
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("shows and submits the replacement URL after uploading", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({
          ok: true,
          image: {
            url: "https://example.com/new.jpg",
            bytes: 100,
            width: 640,
            height: 400,
          },
        }),
      ),
    );
    const file = new File(["photo"], "new.jpg", { type: "image/jpeg" });
    const initial = render();
    expect(initial.find((props) => props.src)?.src).toBe("https://example.com/old.jpg");
    initial.find((props) => props.type === "file")!.onChange!({
      target: { files: [file] },
    });

    await vi.waitFor(() =>
      expect(hooks.values[0]).toMatchObject({ url: "https://example.com/new.jpg" }),
    );
    const updated = render();
    expect(updated.find((props) => props.src)?.src).toBe("https://example.com/new.jpg");
    expect(updated.find((props) => props.name === "image")?.value).toBe(
      "https://example.com/new.jpg",
    );
  });

  it("keeps the existing image when the replacement upload fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(Response.json({ ok: false, error: "Upload failed" }, { status: 502 })),
    );
    render().find((props) => props.type === "file")!.onChange!({
      target: { files: [new File(["photo"], "new.jpg", { type: "image/jpeg" })] },
    });

    await vi.waitFor(() => expect(hooks.values[3]).toBe("Upload failed"));
    const updated = render();
    expect(updated.find((props) => props.src)?.src).toBe("https://example.com/old.jpg");
    expect(updated.find((props) => props.name === "image")?.value).toBe(
      "https://example.com/old.jpg",
    );
  });
});
