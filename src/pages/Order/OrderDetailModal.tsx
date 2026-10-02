import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
} from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import _ from "lodash";
import numeral from "numeral";
import { useEffect, useRef, useState } from "react";

import { useModalForm } from "@/components/Forms/ModalForm/useModalForm";
import usePopupMessage from "@/hooks/usePopupMessage";
import { axiosClientJson } from "@/libraries/axiosClient";
import { devLog } from "@/utils/logger";
import { capitalizeFirstLetter } from "@/utils/stringUtils";
import { Order, OrderLine, WithId } from "@/utils/types/Entities";
import { DeleteOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import ProductDrawer from "@/components/Drawers/ProductDrawer";
dayjs.extend(customParseFormat);

type OrderFormValues = {
  selectedOrder?: WithId<Order>;
  functions: {
    setIsSelectingProducts: (b: boolean) => void;
    refetch?: () => void;
  };
};

export default function OrderDetailModal() {
  const [messageApi] = usePopupMessage() || [];
  const formValues = useModalForm((s) => s.formValues);
  const open = useModalForm((s) => s.open);
  const closeModal = useModalForm((s) => s.closeModal);
  const { selectedOrder, functions } = (formValues ?? {}) as OrderFormValues;
  const changes = useRef<Partial<Order>>({});
  const [localOrder, setLocalOrder] = useState<Partial<Order> | undefined>(
    _.clone(selectedOrder)
  );
  const [openDrawer, setOpenDrawer] = useState(false);

  useEffect(() => {
    setLocalOrder(_.clone(selectedOrder));
  }, [selectedOrder]);

  const {
    _id,
    status,
    customer,
    employee,
    orderDetails,
    shippingAddress,
    createdDate,
  } = {
    ...selectedOrder,
    ...localOrder,
  };

  const isDataReadOnly =
    selectedOrder?.status != null &&
    ["COMPLETED", "CANCELED"].includes(selectedOrder?.status);

  return (
    <>
      <Modal
        width={"1000px"}
        onCancel={() => {
          // setLocalOrder(undefined);
          closeModal();
          changes.current = {};
        }}
        onOk={() => {
          closeModal();
          // setLocalOrder(undefined);
          if (_.isEmpty(changes.current)) {
            return;
          }
          axiosClientJson
            .patch(`/orders/${_id}`, changes.current)
            .then((res) => {
              if (res.data) {
                messageApi?.open({
                  key: "updateOrder",
                  type: "success",
                  content: "Đã cập nhật thông tin đơn hàng",
                  duration: 1,
                });
                functions?.refetch?.();
              }
            })
            .catch((error) => {
              messageApi?.open({
                key: "updateOrder",
                type: "error",
                content: "Cập nhật thông tin đơn hàng thất bại",
                duration: 1,
              });
              devLog(error);
            })
            .finally(() => {
              changes.current = {};
            });
        }}
        okType="dashed"
        open={open}
        okText="OK"
        title="Đơn hàng"
        cancelText="Hủy"
      >
        <Card title="Chi tiết đơn hàng">
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Trạng thái đơn hàng">
              <Space>
                <Select
                  allowClear
                  showSearch
                  value={localOrder?.status || status}
                  style={{ width: "100%" }}
                  optionFilterProp="children"
                  onChange={async (newStatus) => {
                    if (newStatus !== status) {
                      changes.current.status = newStatus;
                    } else {
                      delete changes.current.status;
                    }
                    setLocalOrder((prev) => {
                      return { ...prev, status: newStatus };
                    });
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
                  disabled={isDataReadOnly}
                />
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Khách hàng">
              <Space>
                <Input
                  disabled={true}
                  placeholder={
                    customer?.firstName && customer?.lastName
                      ? `${customer?.firstName} ${customer?.lastName}`
                      : ``
                  }
                />
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày đặt hàng">
              <Space>
                {createdDate &&
                  capitalizeFirstLetter(
                    new Date(createdDate).toLocaleString("vi-VN", {
                      dateStyle: "full",
                      timeStyle: "full",
                    })
                  )}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Nhân viên xác nhận">
              <Space>
                {employee ? (
                  <Input
                    disabled={true}
                    placeholder={`${employee?.firstName} ${employee?.lastName}`}
                  />
                ) : (
                  "Chưa xác nhận"
                )}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ giao hàng">
              <Row gutter={10} className="py-2">
                <Col span={20}>
                  <Input
                    value={
                      localOrder ? localOrder.shippingAddress : shippingAddress
                    }
                    style={{ width: "100%" }}
                    onChange={async (e) => {
                      const newAddress = e.target.value;
                      if (newAddress !== shippingAddress) {
                        changes.current.shippingAddress = newAddress;
                      } else {
                        delete changes.current.shippingAddress;
                      }
                      setLocalOrder((prev) => {
                        return { ...prev, shippingAddress: newAddress };
                      });
                      return;
                    }}
                  />
                </Col>
              </Row>
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          {/* Table include product of orderDetails */}
          <Table<OrderLine>
            bordered
            scroll={{ x: 200 }}
            rowKey="_id"
            dataSource={orderDetails}
            columns={[
              {
                title: "Số lượng",
                dataIndex: "quantity",
                key: "quantity",
                render: (
                  quantity: number,
                  orderLine: OrderLine,
                  index: number
                ) => {
                  const limitNum = (num: number, min: number, max: number) => {
                    return num > max ? max : num < min ? min : num;
                  };
                  const min = 1;
                  const max = 5;

                  const changeQty = async (delta: number) => {
                    try {
                      const newOrderDetails = _.clone(orderDetails);
                      if (!newOrderDetails) return;
                      newOrderDetails[index].quantity = limitNum(
                        newOrderDetails[index].quantity + delta,
                        min,
                        max
                      );
                      changes.current.orderDetails = newOrderDetails;
                      setLocalOrder((localOrder) => {
                        if (!localOrder) return localOrder;
                        return { ...localOrder, orderDetails: newOrderDetails };
                      });
                    } catch (error) {
                      messageApi?.open({
                        key: "updateOrder",
                        type: "error",
                        content: "Cập nhật số lượng sản phẩm thất bại",
                      });
                    }
                  };

                  return (
                    <div className="flex flex-nowrap justify-center items-center">
                      <Button
                        type="dashed"
                        className="text-xl"
                        disabled={isDataReadOnly}
                        onClick={() => changeQty(1)}
                      >
                        <PlusOutlined />
                      </Button>
                      <span className="px-3 py-2 text-center align-self-center justify-content-center ">
                        {quantity}
                      </span>

                      <Button
                        type="dashed"
                        className="text-xl"
                        disabled={isDataReadOnly}
                        onClick={() => changeQty(-1)}
                      >
                        <MinusOutlined />
                      </Button>
                    </div>
                  );
                },
                className: "w-[8rem]",
              },
              {
                title: "Tên sản phẩm",
                dataIndex: "product.name",
                key: "product.name",
                render: (text, record) => {
                  return <strong>{record?.product?.name}</strong>;
                },
                className: "w-[10rem]",
              },
              {
                title: "Giá",
                dataIndex: "product.price",
                key: "product.price",
                render: (text, record) => {
                  return (
                    <div className="text-right">
                      {numeral(record?.product?.price).format("0,0$")}
                    </div>
                  );
                },
                className: "w-[4rem]",
              },
              {
                title: "Giảm giá",
                dataIndex: "product.discount",
                key: "product.discount",
                render: (text, record) => {
                  return (
                    <div className="text-right">
                      {numeral(record?.product?.discount).format("0,0")}%
                    </div>
                  );
                },
                className: "w-[4rem]",
              },
              {
                title: "",
                key: "actions",
                render: (text, record) => {
                  return (
                    <>
                      <div>
                        {orderDetails && status && (
                          <Button
                            danger
                            type="dashed"
                            icon={<DeleteOutlined />}
                            onClick={async () => {
                              try {
                                const productId = record.product._id;
                                if (orderDetails.length === 1) {
                                  messageApi?.open({
                                    key: "updateOrder",
                                    type: "error",
                                    content:
                                      "Đơn hàng phải có ít nhất 1 sản phẩm, nếu muốn xóa sản phẩm vui lòng hủy đơn hàng",
                                    duration: 2,
                                  });
                                  return;
                                }
                                const newOrderDetails = orderDetails.filter(
                                  (line) => line.product._id !== productId
                                );
                                setLocalOrder((prev) => {
                                  if (!prev) return prev;
                                  return {
                                    ...prev,
                                    orderDetails: newOrderDetails,
                                  };
                                });
                                changes.current.orderDetails = newOrderDetails;
                                functions?.refetch?.();
                              } catch {
                                const msg =
                                  "Xóa sản phẩm khỏi đơn hàng thất bại";
                                messageApi?.open({
                                  key: "updateOrder",
                                  type: "error",
                                  content: msg,
                                  duration: 1,
                                });
                              }
                            }}
                            disabled={isDataReadOnly}
                          >
                            Xoá
                          </Button>
                        )}
                      </div>
                    </>
                  );
                },
                className: "w-[4rem]",
              },
            ]}
            footer={(orderLines) => {
              const total = orderLines
                .map(
                  ({ quantity, price, discount }) =>
                    quantity * price * (1 - discount / 100)
                )
                .reduce((prev, cur) => prev + cur, 0.0);
              return (
                <div className="flex flex-wrap justify-between items-center">
                  <strong>Tổng:</strong>
                  <strong>
                    {total.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </strong>
                </div>
              );
            }}
          />

          {status && (
            <Button
              onClick={() => {
                setOpenDrawer(true);
              }}
              disabled={isDataReadOnly}
            >
              Thêm sản phẩm
            </Button>
          )}
        </Card>
      </Modal>
      <ProductDrawer
        open={openDrawer}
        setOpen={setOpenDrawer}
        selectedOrder={selectedOrder}
        onAdd={(product) => {
          if (!selectedOrder) return;
          const { _id, discount = 0, price } = product;
          const newOrderDetails = (orderDetails || []).slice();
          const detail = newOrderDetails.find((e) => e.product._id === _id);
          if (detail) {
            detail.quantity = Math.min(5, detail.quantity + 1);
          } else {
            newOrderDetails.push({
              productId: _id,
              discount,
              price,
              quantity: 1,
              product: { ...product, total: price },
            });
          }
          changes.current.orderDetails = newOrderDetails;
          setLocalOrder({ ...localOrder, orderDetails: newOrderDetails });
        }}
      />
    </>
  );
}
