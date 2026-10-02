import { createStoreHook } from "@/hooks/stores/useMyStore";

export type IdAndNameWise = { _id: string; name: string; [k: string]: unknown };

type StateFields<TPayload extends { _id: string } = IdAndNameWise> = {
  boxContent: {
    collection: string;
    item: TPayload;
  } | null;
  queryKey: unknown[] | undefined;
  open: boolean;
  inOperation: Set<{ collection: string; _id: string }>;
};

const useFileUploadBox = createStoreHook<StateFields>({
  boxContent: null,
  open: false,
  queryKey: [],
  inOperation: new Set(),
})({
  openModal:
    (set) =>
    (
      boxContent: StateFields["boxContent"],
      queryKey?: StateFields["queryKey"]
    ) =>
      set({
        open: true,
        queryKey: queryKey || [],
        boxContent,
      }),
});

export default useFileUploadBox;
