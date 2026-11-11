export type CatalogueSaveState = {
  status?: "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};
