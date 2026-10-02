import {
  getCardControlsFromRecord,
  ModalCard,
  useModalCard,
} from "@/components/Forms/ModalCard";
import SmartImage from "@/components/Images/Lazy/SmartImage";
import { useSearchProducts } from "@/hooks/useSearchProducts";
import { axiosClientJson } from "@/libraries/axiosClient";
import { ASSET_URL } from "@/utils/constants/URLS";
import { devLog } from "@/utils/logger";
import { appendDomain } from "@/utils/stringUtils";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Flex, List, Modal } from "antd";
import { AxiosResponse } from "axios";
import SearchBox from "components/Inputs/Searchbox";
import { useEffect, useState } from "react";
import {
  Active,
  Collection as Collection0,
  GetOne,
  Product as Product0,
  WithId,
} from "utils/types/Entities";
import style from "../style.module.css";

type DataRecord = WithId<Collection0 & Active>;
type Product = WithId<Product0>;

export default function AddProductBox({
  collection,
  close,
}: {
  collection: DataRecord | null;
  close: () => void;
  refetch?: () => void;
}) {
  const queryClient = useQueryClient();
  const openModal = useModalCard((s) => s.openModal);
  const cardValues = useModalCard((s) => s.cardValues);
  const collectionId = collection?._id;
  const [added, setAdded] = useState<Product[]>([]);
  const { data: response } = useQuery({
    queryFn: async () => {
      return collectionId
        ? axiosClientJson.get<GetOne<DataRecord>>(
            `/collections/${collectionId}`
          )
        : null;
    },
    queryKey: ["collections", { _id: collectionId }],
  });

  useEffect(() => {
    const products = response?.data.result.products;
    setAdded(products ?? []);
  }, [collection, response]);

  return (
    <>
      <Modal
        open={collection != null}
        onOk={async () => {
          try {
            if (collection != null) {
              await axiosClientJson.patch(`/collections/${collection._id}`, {
                products: added,
              });
              queryClient.setQueryData<AxiosResponse<GetOne<DataRecord>>>(
                ["collections", { _id: collectionId }],
                (prev) => {
                  const response = prev;
                  if (response)
                    return {
                      ...response,
                      data: {
                        ...response.data,
                        result: { ...response.data.result, products: added },
                      },
                    };
                  return undefined;
                }
              );
            }
          } catch (error) {
            // logError(error);
            devLog(error);
          } finally {
            close();
          }
        }}
        onCancel={() => close()}
        className="relative"
        width={"60rem"}
        height={"40rem"}
        rootClassName={`${style.modalRoot}`}
      >
        <Flex className="relative min-h-52 h-full w-full flex-col" gap={"1rem"}>
          <div>
            BST: <strong>{collection?.name}</strong>
          </div>
          <SearchBox
            searchHook={useSearchProducts}
            renderItemFn={(item, context) => {
              const product = item as any as Product;
              const isExisted = added.some((p) => p._id === product._id);
              return (
                <Flex
                  className="px-3 w-full text-[0.8rem]"
                  justify="space-between"
                  align="center"
                >
                  <Flex align="center">
                    <SmartImage
                      src={appendDomain(product.imageUrl, ASSET_URL)}
                      width={"2rem"}
                      height={"2rem"}
                      fallback="/placeholder-image.jpg"
                    />
                    {/* {product.name} */}
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => {
                        openModal(item, "search-product");
                        context?.clickItem?.();
                        context?.clearTerm?.();
                      }}
                    >
                      {product.name}
                    </button>
                  </Flex>
                  <Button
                    onClick={() => {
                      setAdded((prev) => {
                        const currentProducts = prev as Product[];
                        const newArr = [...currentProducts, product];
                        return [
                          ...new Map(newArr.map((p) => [p._id, p])).values(),
                        ];
                      });
                      context?.clearTerm?.();
                    }}
                    size="small"
                    className="text-[.8rem]"
                    icon={<PlusOutlined />}
                    disabled={isExisted}
                  >
                    {isExisted ? "Đã thêm" : "Thêm"}
                  </Button>
                </Flex>
              );
            }}
            onBlur={() => {
              (
                document.querySelector(
                  `div.${style.modalRoot} .ant-modal>div:first-child`
                ) as HTMLDivElement | undefined
              )?.focus();
            }}
            zIndex={1100}
            key={Date.now()}
          />
          <div className="max-h-80 overflow-auto">
            <h6>Sản phẩm hiện tại:</h6>
            <List size="small">
              {added.map((item) => {
                const { _id } = item;
                return (
                  <List.Item key={_id} className="text-[.8rem]">
                    <Flex
                      justify="space-between"
                      align="center"
                      className="w-full"
                    >
                      <Flex align="center">
                        <SmartImage
                          src={appendDomain(item.imageUrl, ASSET_URL)}
                          width={"2rem"}
                          height={"2rem"}
                          fallback="/placeholder-image.jpg"
                        />
                        <button
                          type="button"
                          className="w-full text-left"
                          onClick={() => {
                            openModal(item, "search-product");
                          }}
                        >
                          {item.name}
                        </button>
                      </Flex>
                      <Button
                        onClick={() => {
                          setAdded((prev) => {
                            const i = prev.findIndex(
                              (elem) => elem._id === _id
                            );
                            if (i >= 0) {
                              const newArr = prev.slice();
                              newArr.splice(i, 1);
                              return newArr;
                            }
                            return prev;
                          });
                        }}
                        size="small"
                        icon={<DeleteOutlined />}
                        danger
                        type="dashed"
                      >
                        Xóa
                      </Button>
                    </Flex>
                  </List.Item>
                );
              })}
            </List>
          </div>
        </Flex>
      </Modal>
      <ModalCard
        cardControls={getCardControlsFromRecord(
          (cardValues ?? {}) as Record<string, unknown>
        )}
        collectionName="products"
        key={"search-product"}
      />
    </>
  );
}
