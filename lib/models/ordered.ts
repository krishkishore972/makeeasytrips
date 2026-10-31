/**
 * Every seeded document carries the position it had in the original seed
 * fixture. Reads sort by it so catalogue order stays stable and identical to
 * the order the demo content was authored in.
 */
export type Ordered<T> = T & { sort_order: number };
