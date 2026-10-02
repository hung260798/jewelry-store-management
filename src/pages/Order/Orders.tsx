import CRUD from "@/components/CRUD";
import { useModalForm } from "@/components/Forms/ModalForm/useModalForm";
import usePopupMessage from "@/hooks/usePopupMessage";
import { axiosClientJson } from "@/libraries/axiosClient";
import { devLog } from "@/utils/logger";
import { GetManyData } from "@/utils/mutationFn";
import {
  CheckOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Input, Popconfirm, Select, Tag } from "antd";
import Search from "antd/es/input/Search";
import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import useMyQuery from "hooks/useMyQuery";
import { useState } from "react";
import { Order, WithId } from "utils/types/Entities";
import OrderDetailModal from "./OrderDetailModal";
import { HiMagnifyingGlass } from "react-icons/hi2";
dayjs.extend(customParseFormat);

const OrderCRUD: React.FC = () => {
  const queryResults = useMyQuery<GetManyData<WithId<Order>>>({
    url: "/orders",
    queryKey: ["orders"],
    // initParams: { active: "true" },
  });
  const {
    searchItems,
    query: { refetch },
  } = queryResults;
  const [messageApi] = usePopupMessage() || [];
  const queryClient = useQueryClient();

  //Setting column
  const columns: ColumnsType<WithId<Order>> = [
    {
      title: "Mã",
      dataIndex: "_id",
      key: "_id",
      render: (text, record, index) => {
        return <strong title={record._id}>{index}</strong>;
      },
      filterDropdown: () => {
        return (
          <div className="p-2">
            <Input.Search
              allowClear
              placeholder="Enter Order Id"
              onSearch={(e) => {
                const searchValue = { type: "orderId", value: e };
                searchItems(searchValue);
              }}
              style={{ width: 200 }}
            />
          </div>
        );
      },
      className: "w-[6rem]",
    },
    {
      title: "Ngày đặt hàng",
      dataIndex: "createdDate",
      render(date: string) {
        const d: Date = new Date(date);
        return (
          <>
            <span>{d.toLocaleDateString()}</span>
            <br />
            <span>{d.toLocaleTimeString()}</span>
          </>
        );
      },
      sorter: true,
      className: "w-[10rem]",
    },
    {
      title: "Ngày giao",
      dataIndex: "shippedDate",
      render(date: string | undefined, record) {
        if (!date || record.status.toUpperCase() !== "COMPLETED") {
          return "";
        }
        const d: Date = new Date(date);
        return (
          <>
            <span>{d.toLocaleDateString()}</span>
            <br />
            <span>{d.toLocaleTimeString()}</span>
          </>
        );
      },
      sorter: true,
      className: "w-[10rem]",
    },
    {
      title: "Khách hàng",
      dataIndex: "customer.firstName",
      key: "customer",
      render: (text, record) => {
        return `${record.customer?.firstName ?? ""} ${
          record.customer?.lastName ?? ""
        }`;
      },
      filterDropdown: () => {
        return (
          <div className="w-37.5">
            <Search
              allowClear
              style={{ width: "100%" }}
              placeholder="Select one"
              onSearch={(e) => {
                const searchValue = { type: "firstName", value: e };
                searchItems(searchValue);
              }}
            />
          </div>
        );
      },
      sorter: true,
      className: "w-[11rem]",
    },
    {
      title: "Hình thức thanh toán",
      dataIndex: "paymentType",
      key: "paymentType",
      filterDropdown: () => {
        return (
          <Select
            allowClear
            showSearch
            style={{ width: "100%" }}
            placeholder="Select a product"
            optionFilterProp="children"
            onChange={(e) => {
              const searchValue = { type: "methodPay", value: e };
              searchItems(searchValue);
            }}
            filterOption={(input, option) =>
              (option?.label ?? "")
                .toLowerCase()
                .indexOf(input.toLowerCase()) >= 0
            }
            options={[
              { label: "CASH", value: "CASH" },
              { label: "MOMO", value: "MOMO" },
              { label: "VNPAY", value: "VNPAY" },
            ]}
          />
        );
      },
      sorter: false,
      className: "w-[10rem]",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      sorter: true,
      render: (status) => {
        const colors: Record<string, string> = {
          WAITING: "gold",
          ECONFIRMED: "blue",
          COMPLETED: "green",
          CANCELED: "red",
        };
        const tagColor = colors[status] ?? "blue";
        return (
          <div>
            <Tag color={tagColor}>{status}</Tag>
          </div>
        );
      },
      filterDropdown: () => {
        return (
          <div className="w-37.5">
            <Select
              allowClear
              showSearch
              style={{ width: "100%" }}
              placeholder="Select a product"
              optionFilterProp="children"
              onChange={(e) => {
                const searchValue = { type: "status", value: e };
                searchItems(searchValue);
              }}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .indexOf(input.toLowerCase()) >= 0
              }
              options={[
                { label: "WAITING", value: "WAITING" },
                { label: "ECONFIRMED", value: "ECONFIRMED" },
                { label: "COMPLETED", value: "COMPLETED" },
                { label: "CANCELED", value: "CANCELED" },
              ]}
            />
          </div>
        );
      },
      className: "w-[8rem]",
    },
    {
      title: "Địa chỉ giao hàng",
      dataIndex: "shippingAddress",
      key: "shippingAddress",
      sorter: true,
      className: "w-[12rem]",
    },
    {
      title: "Xác nhận bởi",
      dataIndex: "employee",
      key: "employee",
      render: (employee: Order["employee"] | undefined) => {
        return (
          <strong>
            {employee?.firstName} {employee?.lastName}
          </strong>
        );
      },
      sorter: true,
      className: "w-[9rem]",
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      render: (total) => {
        return (
          <strong>
            {typeof +total !== "number"
              ? 0
              : (+total).toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
          </strong>
        );
      },
      sorter: true,
      className: "w-[6rem]",
    },
  ];

  const setFormValues = useModalForm((s) => s.setFormValues);
  const setOpen = useModalForm((s) => s.setOpen);

  // KEEP UPDATE ID:
  // useEffect(() => {
  //   // Check if the selected order exists in the updated dataResource
  //   const orders = ordersData?.results || [];
  //   const updatedSelectedOrder = orders.find(
  //     (order) => order._id === selectedOrder?._id
  //   );
  //   setSelectedOrder(updatedSelectedOrder);
  // }, [ordersData?.results]);
  // return null;
  return (
    <>
      <CRUD
        collectionName="orders"
        columns={columns}
        query={queryResults}
        form={OrderDetailModal}
        functionColumn={{
          override: (record) => (
            <>
              <Button
                icon={<SearchOutlined />}
                title="Xem"
                // type="dashed"
                onClick={() => {
                  setFormValues({
                    selectedOrder: record,
                    functions: {
                      refetch,
                    },
                  });
                  // setTitle("orders");
                  setOpen(true);
                }}
              />
              <Popconfirm
                title="Xác nhận xóa"
                okType="danger"
                onConfirm={() => {
                  async function defaultHandleDelete({ _id }: WithId<Order>) {
                    try {
                      await axiosClientJson.delete(`/orders/${_id}`);
                      messageApi?.success("Delete success", 1);
                      await queryClient.invalidateQueries({
                        queryKey: [`orders`],
                      });
                    } catch (error) {
                      const errorName =
                        error instanceof Error ? error.name : "Unknown error";
                      messageApi?.error(`Delete fail: ${errorName}`, 1);
                    }
                  }
                  defaultHandleDelete(record);
                }}
                cancelText="Hủy"
              >
                <Button
                  title="Xóa"
                  // type="dashed"
                  danger
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            </>
          ),
          extraFunctions: [
            (order) =>
              order.status === "WAITING" && (
                <Button
                  icon={<CheckOutlined />}
                  onClick={() => {
                    messageApi?.open({
                      key: "confirmOrder",
                      type: "loading",
                      content: "Đang xác nhận đơn hàng",
                    });
                    axiosClientJson
                      .patch(`/orders/${order._id}`, { status: "ECONFIRMED" })
                      .then(() => {
                        messageApi?.open({
                          key: "confirmOrder",
                          type: "success",
                          content: "Đã xác nhận đơn hàng",
                          duration: 1,
                        });
                      })
                      .catch((reason) => {
                        devLog(reason);
                        messageApi?.open({
                          key: "confirmOrder",
                          type: "error",
                          content: "Xác nhận đơn hàng bị lỗi",
                          duration: 1,
                        });
                      })
                      .finally(() => {
                        refetch();
                      });
                  }}
                ></Button>
              ),
          ],
        }}
      />
    </>
  );
};

export default OrderCRUD;
