import { createStoreHook } from "@/hooks/stores/useMyStore";

type State = {
  formValues: object | undefined;
  open: boolean;
  formKey: string;
  queryKey: unknown[];
  httpMethod: "PATCH" | "POST";
};

const defaultState: State = {
  formValues: undefined,
  open: false,
  formKey: "",
  queryKey: [],
  httpMethod: "POST",
};

export const useModalForm = createStoreHook<State>(defaultState)({
  closeModal: (set) => () => set(defaultState),
  openModal:
    (set) =>
    (
      initValues: object | undefined,
      formKey: string,
      queryKey?: unknown[],
      httpMethod?: State["httpMethod"]
    ) =>
      set((prev) => ({
        open: true,
        formValues: initValues,
        formKey: formKey,
        queryKey: queryKey || [],
        httpMethod: httpMethod || prev.httpMethod,
      })),
});
