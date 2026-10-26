export type AsyncStatus = "idle" | "loading" | "success" | "error";

export type NavItem = {
  label: string;
  href: string;
  description?: string;
};

export type Breadcrumb = {
  label: string;
  href?: string;
};

export type Money = {
  amount: number;
  currency: string;
};

export type ImageAsset = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};
