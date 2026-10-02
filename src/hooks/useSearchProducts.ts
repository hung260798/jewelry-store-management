import { axiosClientJson } from "@/libraries/axiosClient";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import {
  GetMany as GetList,
  IdWise,
  Product as Product0,
} from "utils/types/Entities";
import { SearchBoxOptions } from "@/utils/types/Form";

type Product = Product0 & IdWise;

export const useSearchProducts: SearchBoxOptions["searchHook"] = () => {
  const [searchParams, setSearchParams] = useState<Record<string, string>>({
    productName: "abc",
    skip: "0",
    limit: "10",
  });
  const skip = useRef<number>(0);
  const {
    data,
    error,
    isLoading,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryFn: async ({ pageParam }) => {
      return axiosClientJson
        .get<GetList<Product>>("/products", {
          params: {
            skip: String(pageParam),
            productName: searchParams.productName,
          },
        })
        .then((res) => res.data.results);
    },
    queryKey: ["products", "infinity", searchParams],
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => skip.current,
  });
  const onSearch = async (name: string) => {
    if (name.trim() !== "") {
      setSearchParams((prev) => ({ ...prev, productName: name }));
    }
  };
  const loadMore = async () => {
    skip.current += 10;
    await fetchNextPage();
  };
  return {
    data: data?.pages.flat() as any,
    error: error,
    isLoading: isLoading,
    onSearch: onSearch,
    loadMore: loadMore,
  };
};
