import { createStoreHook } from "@/hooks/stores/useMyStore";
import { NavigateOptions, To, useNavigate } from "react-router-dom";

export const defaultQueryObj: Record<string, string> = {
  skip: "0",
  limit: "10",
  sortBy: "_id",
  sortOrder: "1",
};

const useParam = createStoreHook<{
  params: Record<string, string>;
}>({
  params: defaultQueryObj,
})({
  setSearchParams:
    (set) => (params: URLSearchParams | Record<string, string>) => {
      if (params instanceof URLSearchParams) {
        return set({
          params: params
            .entries()
            .map(([k, v]) => ({ [k]: v }))
            .reduce(
              (previous, current) => ({ ...previous, ...current }),
              {} as Record<string, string>
            ),
        });
      }
      set({ params: params });
    },
  resetParams: (set) => () => set({ params: defaultQueryObj }),
});

export default useParam;

export const useNav = () => {
  const navigate = useNavigate();
  const setSearchParams = useParam((s) => s.setSearchParams);
  const navigateAndResetParam = (
    to: To,
    options: NavigateOptions,
    params: Record<string, string>
  ) => {
    setSearchParams(params);
    navigate(to, options);
  };
  return navigateAndResetParam;
};
