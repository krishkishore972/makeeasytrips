export const enquiryStatusValues = ["new", "contacted", "closed"] as const;
export type EnquiryStatus = (typeof enquiryStatusValues)[number];
