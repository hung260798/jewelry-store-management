import useMyQuery from "@/hooks/useMyQuery";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Drawer, Input, Pagination, Spin } from "antd";
import { useEffect, useRef, useState } from "react";
import { GetMany, Order, Product, WithId } from "utils/types/Entities";
import style from "./style.module.css";
import {
  getCardControlsFromRecord,
  ModalCard,
  useModalCard,
} from "../Forms/ModalCard";
import SmartImage from "../Images/Lazy/SmartImage";

const ProductDrawer = (props: {
  open: boolean;
  setOpen: (b: boolean) => void;
  selectedOrder?: Order & WithId<Order>;
  refetch?: () => void;
  onAdd?: (product: WithId<Product>) => void;
}) => {
  const {
    query: { data, isFetching, isPending },
    searchItems,
    searchParams,
  } = useMyQuery<GetMany<WithId<Product>>>({
    url: "/products",
    queryKey: [`products_drawer`],
    usePrivateParams: true,
    initParams: {
      limit: "10",
      skip: "0",
      sortBy: "_id",
      sortOrder: "desc",
      // fieldsIncluded: "name,price",
    },
  });
  const { results: products, amountResults: amountProducts } = data ?? {};
  const { open, setOpen, selectedOrder, onAdd } = props;
  const [searchValue, setSearchValue] = useState("");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const openModal = useModalCard((s) => s.openModal);
  const cardValues = useModalCard((s) => s.cardValues);

  useEffect(() => {
    // Clear the previous timeout
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set a new timeout for the debounced search
    debounceTimerRef.current = setTimeout(() => {
      searchItems([
        { type: "productName", value: searchValue },
        { type: "skip", value: "0" },
      ]);
    }, 500);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchValue]);

  const cachedData = useRef<{
    products: WithId<Product>[];
    amountProducts: number;
  }>({
    products: [],
    amountProducts: 0,
  });

  useEffect(() => {
    if (data) {
      cachedData.current = {
        ...cachedData.current,
        products: data.results,
        amountProducts: data.amountResults,
      };
    }
  }, [data]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const onCardClick = (item: Product) => {
    openModal(item, "product-details");
  };

  const controls = cardValues
    ? getCardControlsFromRecord(cardValues as Record<string, unknown>)
    : [];

  const limit = +(searchParams.get("limit") ?? "10");
  const skip = +(searchParams.get("skip") ?? "0");
  const currentPage = 1 + skip / limit;
  const onPageChange = (page: number, pageSize: number) => {
    searchItems([{ type: "skip", value: "" + (page - 1) * pageSize }]);
  };

  if (!selectedOrder) return null;

  const onAddProduct = async (product: WithId<Product>) => {
    if (onAdd) {
      return onAdd(product);
    }
  };

  const displayData =
    isFetching || !products ? cachedData.current.products : products;

  const displayAmount =
    isFetching || amountProducts === undefined
      ? cachedData.current.amountProducts
      : amountProducts;

  return (
    <>
      <Drawer
        width={"40%"}
        title="Danh sách sản phẩm"
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        placement="right"
      >
        <div className="mb-4">
          <Input
            placeholder="Tìm kiếm sản phẩm theo tên..."
            prefix={<SearchOutlined />}
            onChange={handleSearchChange}
            allowClear
          />
        </div>
        <Spin spinning={isFetching}>
          {displayData.map((product: WithId<Product>) => (
            <Card key={product._id} className={`${style.itemCard}`}>
              <div className="flex justify-between h-full items-center">
                <div className="grow-0 basis-3/4 overflow-hidden lg:flex items-center">
                  <SmartImage
                    src={product.imageUrl}
                    width={100}
                    height={100}
                    alt={product.name}
                  />
                  <div className="flex flex-col">
                    <Button type="text" onClick={() => onCardClick(product)}>
                      {product.name}
                    </Button>
                    <p className="ml-4">
                      {product.price.toLocaleString("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      })}
                    </p>
                  </div>
                </div>
                <Button
                  className="px-2 shrink-0 grow-0"
                  onClick={() => onAddProduct(product)}
                >
                  <PlusOutlined />
                </Button>
              </div>
            </Card>
          ))}
        </Spin>
        <div className="mt-5">
          <Pagination
            current={currentPage}
            onChange={onPageChange}
            total={displayAmount}
            pageSize={limit}
            showSizeChanger={false}
            hideOnSinglePage
          ></Pagination>
        </div>
      </Drawer>
      <ModalCard cardControls={controls} collectionName="products" />
    </>
  );
};

export default ProductDrawer;
