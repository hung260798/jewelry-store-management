// import { createFormInputs } from "@/components/Forms/FormInputs/Product";
import CRUD, { CRUDProps } from "@/components/CRUD";
import SmartImage from "@/components/Images/Lazy/SmartImage";
import MyCkeditorFormInput from "@/components/Inputs/MyCkeditorFormInput";
import useMyQuery, { GetOneOrMany } from "@/hooks/useMyQuery";
import useWindowWidth from "@/hooks/useWidth";
import { axiosClientJson } from "@/libraries/axiosClient";
import { GetManyData } from "@/utils/mutationFn";
import {
  Active,
  Product as Base,
  Category,
  Supplier,
  WithId,
} from "@/utils/types/Entities";
import { FormControl } from "@/utils/types/Form";
import {
  CheckOutlined,
  ClearOutlined,
  SearchOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Badge,
  Button,
  DatePicker,
  Flex,
  Form,
  Image,
  Input,
  InputNumber,
  Select,
  Skeleton,
  Space,
  Switch,
  Tag,
} from "antd";
import Search from "antd/es/input/Search";
import { ColumnType } from "antd/es/table";
import "ckeditor5-premium-features/ckeditor5-premium-features.css";
import "ckeditor5/ckeditor5.css";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
// import { devLog } from "@/utils/logger";
import crudStyle from "@/components/CRUD/crud.module.css";
import { useModalForm } from "@/components/Forms/ModalForm";
import { DataSelect, DataSelectProps } from "@/components/Inputs/Select";
import { useFileUploadBox } from "@/components/Modals/UploadBox";
import { IdAndNameWise } from "@/components/Modals/UploadBox/useFileUploadBox";
import { getSortOrder } from "@/utils/stringUtils";
import React, { memo } from "react";
import { useSearchParams } from "react-router-dom";
import style from "./style.module.css";

interface CustomSelectProps {
  value?: string;
  onChange?: (value: string) => void;
}

const CategorySelect: React.FC<CustomSelectProps> = (props) => {
  return (
    <>
      <DataSelect
        queryOpts={
          {
            queryKey: ["categories"],
            queryFn: () => {
              return axiosClientJson.get<GetManyData<WithId<Category>>>(
                `/categories`
              );
            },
            retry: false,
            refetchInterval: 3 * 60 * 1000,
          } as DataSelectProps["queryOpts"]
        }
        value={props.value}
        onChange={props.onChange}
        selectProps={{ placeholder: "Chọn danh mục" }}
      />
    </>
  );
};

const SupplierSelect: React.FC<CustomSelectProps> = (props) => {
  return (
    <>
      <DataSelect
        queryOpts={
          {
            queryKey: ["suppliers"],
            queryFn: () => {
              return axiosClientJson.get<GetManyData<WithId<Supplier>>>(
                `/suppliers`
              );
            },
            retry: false,
            refetchInterval: 3 * 60 * 1000,
          } as DataSelectProps["queryOpts"]
        }
        value={props.value}
        onChange={props.onChange}
      />
    </>
  );
};

const formControls: FormControl[] = [
  {
    label: "Id",
    name: "_id",
    className: "hidden",
    component: <Input />,
    defaultValue: "",
  },
  {
    label: "Danh mục",
    name: "categoryId",
    rules: [
      {
        required: true,
        message: "Danh mục là bắt buộc",
      },
    ],
    flex: "basis-[364px] grow-0",
    component: <CategorySelect />,
    defaultValue: "",
  },
  {
    label: "Nhà cung cấp",
    name: "supplierId",
    rules: [
      {
        required: true,
        message: "Nhà cung cấp là bắt buộc",
      },
    ],
    flex: `grow-0`,
    component: <SupplierSelect />,
    defaultValue: "",
  },
  {
    label: "Tên sản phẩm",
    name: "name",
    rules: [
      {
        required: true,
        message: "Tên sản phẩm là bắt buộc",
      },
    ],
    component: <Input placeholder="Nhẫn 123" />,
    flex: "grow-0 basis-[100%]",
    defaultValue: "",
  },
  {
    label: "Giá",
    name: "price",
    rules: [
      {
        required: true,
        message: "Hãy nhập giá sản phẩm",
      },
    ],
    component: (
      <InputNumber<number>
        placeholder="123.000.000"
        style={{ width: "100%" }}
        min={1}
        max={1_000_000_000}
        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
        parser={(value) =>
          +(value?.replace(/\s?d|(\.*)/g, "").replace(/\./g, "") || 0)
        }
        step={1000}
      />
    ),
    flex: `basis-[33%] grow-0`,
    defaultValue: "",
  },
  {
    label: "Giảm giá",
    name: "discount",
    rules: [
      {
        required: true,
        message: "Nhập mức giảm giá (%)",
      },
      {
        type: "integer",
        min: 0,
        message: "Phần trăm giảm giá phải là số nguyên không âm",
      },
    ],
    component: <InputNumber max={75} placeholder="10" />,
    flex: `basis-[30%] grow-0`,
    defaultValue: "",
  },
  {
    label: "Số lượng",
    name: "stock",
    rules: [
      {
        required: true,
        message: "Nhập số lượng hàng",
      },
      {
        type: "integer",
        min: 0,
        message: "Số lượng hàng phải là số nguyên không âm",
      },
    ],
    component: <InputNumber min={1} />,
    flex: `basis-[30%] grow-0`,
    defaultValue: 1,
  },
  {
    label: "Đang hoạt động",
    name: "active",
    component: <Switch />,
    valuePropName: "checked",
    flex: "basis-[30%] grow-0",
    defaultValue: true,
  },
  {
    label: "Đã xóa",
    name: "isDeleted",
    component: <Switch />,
    valuePropName: "checked",
    flex: "basis-[30%] grow-0",
    defaultValue: false,
  },
  {
    label: "Vị trí quảng bá",
    name: "promotionPosition",
    component: (
      <Select
        mode="multiple"
        allowClear
        showSearch
        placeholder="Select promotion"
        optionFilterProp="children"
        filterOption={(input, option) =>
          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
        }
        options={[
          {
            value: "TOP-MONTH",
            label: "TOP-MONTH",
          },
          {
            value: "DEAL",
            label: "DEAL",
          },
        ]}
      />
    ),
    flex: "basis-[364px] grow-0",
    defaultValue: [],
  },
  {
    label: "Ghi chú",
    name: "note",
    component: <Input />,
    flex: "basis-[364px] grow-0",
    defaultValue: "",
  },
  {
    label: "Đường dẫn",
    name: "slug",
    component: <Input readOnly disabled />,
    flex: "grow-0 basis-[100%]",
    defaultValue: "",
    method: "patch",
  },
  {
    label: "Mô tả",
    name: "description",
    component: <MyCkeditorFormInput />,
    flex: "basis-[364px] grow-0",
    defaultValue: "",
  },
  {
    label: "Hình ảnh",
    component: function ImageButton() {
      const setUploadBoxContent = useFileUploadBox((s) => s.setBoxContent);
      const setUploaderQueryKey = useFileUploadBox((s) => s.setQueryKey);
      const setOpenUploadBox = useFileUploadBox((s) => s.setOpen);
      const formValues = useModalForm((s) => s.formValues as Product);
      const [searchParams] = useSearchParams();
      return (
        <Button
          icon={<UploadOutlined />}
          title="Tải tệp lên"
          onClick={function () {
            setUploadBoxContent({
              collection: "products",
              item: formValues as unknown as IdAndNameWise,
            });
            setUploaderQueryKey?.([
              Object.fromEntries(searchParams?.entries() ?? []),
            ]);
            setOpenUploadBox(true);
          }}
        />
      );
    },
    method: "patch",
  },
];

dayjs.extend(customParseFormat);
type Product = WithId<Partial<Base & Active>>;

const IMG_SIZES: [number, number][] = [
  [100, 100],
  [200, 200],
];
const dateFormat = "DD/MM/YYYY";

function ProductCRUD() {
  const queryResult = useMyQuery<GetOneOrMany<Product>>({
    url: "/products",
    queryKey: ["products"],
  });

  const { searchParams, searchItems } = queryResult;

  //GET CATEGORIES
  const { data: categoriesData, isLoading: loadingCat } = useQuery({
    queryKey: ["categories"],
    queryFn: () => {
      return axiosClientJson.get<GetManyData<WithId<Category>>>(`/categories`);
    },
    retry: false,
    refetchInterval: 3 * 60 * 1000,
  });

  //GET SUPPLIERS
  const { data: suppliersData, isLoading: loadingSup } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => {
      return axiosClientJson.get<GetManyData<WithId<Supplier>>>(`/suppliers`);
    },
    retry: false,
    refetchInterval: 3 * 60 * 1000,
  });

  const createColumns = () => {
    const createFns = (name1: string, name2: string) => ({
      onSubmit: (values: any) => {
        searchItems([
          { type: name1, value: values[name1] },
          { type: name2, value: values[name2] },
          { type: "skip", value: "0" },
        ]);
      },
      onReset: () => {
        searchItems([
          { type: name1, value: "" },
          { type: name2, value: "" },
          { type: "skip", value: "0" },
        ]);
      },
    });

    //Setting column
    const columns: ColumnType<Product>[] = [
      // NO
      {
        title: () => <div>No</div>,
        dataIndex: "id",
        key: "id",
        render: (text: string, record: Product, index: number) => {
          return (
            <div>
              <Space className="text-center">
                {+(searchParams.get("skip") ?? 0) + index + 1}
              </Space>
            </div>
          );
        },
        responsive: ["xl"],
        className: "w-20",
      },
      {
        title: () => {
          const isSearched = searchParams.get("productName") != null;
          return (
            <div className={isSearched ? "text-fuchsia-700" : ""}>
              Tên sản phẩm
            </div>
          );
        },
        dataIndex: "name",
        key: "name",
        filterDropdown: () => {
          return (
            <Search
              allowClear
              placeholder="Nhẫn kim cương"
              onSearch={(e) => {
                searchItems([
                  {
                    type: "productName",
                    value: e,
                  },
                  { type: "skip", value: "0" },
                ]);
              }}
              defaultValue={searchParams.get("productName") ?? ""}
              className="w-50"
            />
          );
        },
        sorter: true,
        sortOrder: getSortOrder(searchParams.toString(), "name"),
        render(text) {
          return <div>{text}</div>;
        },
        className: "w-60",
      },
      // State
      {
        title: (
          <div className="">
            <Badge dot={!!searchParams.get("active")}>Trạng thái</Badge>
          </div>
        ),
        dataIndex: "active",
        key: "active",
        render: (active: string) => {
          let content = <Tag color="green">Đang hoạt động</Tag>;
          if (!active) {
            content = <Tag color="gold">Tạm ẩn</Tag>;
          }
          return <div className="w-35">{content}</div>;
        },
        filterDropdown: () => {
          return (
            <Select
              allowClear
              onClear={() => {
                searchItems([{ type: "active", value: "" }]);
              }}
              style={{ width: "125px" }}
              placeholder="Chọn trạng thái"
              optionFilterProp="children"
              showSearch
              onChange={(e) => {
                if (e === "active") {
                  searchItems([{ type: "active", value: "true" }]);
                } else if (e === "inActive") {
                  searchItems([{ type: "active", value: "false" }]);
                }
              }}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={[
                {
                  value: "active",
                  label: "Hoạt động",
                },
                {
                  value: "inActive",
                  label: "Tạm ẩn",
                },
              ]}
            />
          );
        },
        responsive: ["xl"],
        className: "w-[12rem]",
      },
      // Is Deleted
      {
        title: (
          <div className="">
            <Badge dot={!!searchParams.get("isDeleted")}>Đã xóa?</Badge>
          </div>
        ),
        dataIndex: "isDeleted",
        key: "isDeleted",
        render: (isDeleted: boolean) => {
          return (
            <div>
              <Flex justify={"center"} align={"center"}>
                {isDeleted ? <CheckOutlined /> : null}
              </Flex>
            </div>
          );
        },
        filterDropdown: () => {
          return (
            <Select
              allowClear
              onClear={() => {
                searchItems([{ type: "isDeleted", value: "" }]);
              }}
              placeholder="Chọn trạng thái"
              optionFilterProp="children"
              showSearch
              onChange={(e) => {
                if (e === "isDeleted") {
                  searchItems(
                    {
                      type: "isDeleted",
                      value: "true",
                    },
                    { replace: true }
                  );
                }
              }}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={[
                {
                  value: "nonDeleted",
                  label: "Chưa xóa",
                },
                {
                  value: "isDeleted",
                  label: "Đã xóa",
                },
              ]}
            />
          );
        },
        className: "w-[8rem]",
        responsive: ["xl"],
      },
      // ImageUrl
      {
        title: <div className="truncate">Ảnh</div>,
        key: "imageUrl",
        dataIndex: "imageUrl",
        render: (url, record) => {
          return (
            <div className="flex flex-row justify-between items-center min-h-26">
              {url ? (
                <Image.PreviewGroup items={[url, ...(record?.images || [])]}>
                  <SmartImage
                    src={url}
                    smallSizes={IMG_SIZES}
                    width={"80px"}
                    height={"80px"}
                    fallback="/placeholder-image.jpg"
                    alt={record.name}
                  />
                </Image.PreviewGroup>
              ) : (
                <SmartImage
                  src="/placeholder-image.jpg"
                  width={"80px"}
                  height={"80px"}
                  alt={"No image"}
                />
              )}
            </div>
          );
        },
        className: "w-38",
        shouldCellUpdate: (record, prevRecord) =>
          record.imageUrl !== prevRecord.imageUrl ||
          record.images !== prevRecord.images,
      },
      // Category
      {
        title: () => {
          return (
            <div className="">
              <Badge
                dot={
                  !!(
                    searchParams.get("categoryId[]") ||
                    searchParams.get("categoryId")
                  )
                }
              >
                Danh mục
              </Badge>
            </div>
          );
        },
        dataIndex: "categoryId",
        key: "category",
        sorter: true,
        sortOrder: getSortOrder(searchParams.toString(), "categoryId"),
        filterDropdown: () => {
          if (loadingCat) {
            return <Skeleton active />;
          }
          return (
            <Select
              allowClear
              showSearch
              className="w-37.5"
              placeholder="Chọn danh mục"
              onChange={(e) => {
                searchItems([
                  {
                    type: "categoryId[]",
                    value: e,
                  },
                  { type: "skip", value: "0" },
                ]);
              }}
              filterOption={(input, option) => {
                if (typeof option?.label !== "string") {
                  return false;
                }
                return (
                  (option?.label ?? "")
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                );
              }}
              options={
                categoriesData?.data?.results?.map((item) => ({
                  label: item.name,
                  value: item._id,
                })) || []
              }
            />
          );
        },
        render: (text, record) => (
          <div className="" title={record.category?.name}>
            {record.category?.name}
          </div>
        ),
        className: "w-48",
      },
      // Supplier
      {
        title: () => {
          return (
            <div className="">
              <Badge
                dot={
                  !!(
                    searchParams.get("supplierId[]") ||
                    searchParams.get("supplierId")
                  )
                }
              >
                Nhà cung cấp
              </Badge>
            </div>
          );
        },
        dataIndex: "supplierId",
        render: (supId, record) => (
          <div className="">{record.supplier?.name}</div>
        ),
        sorter: true,
        sortOrder: getSortOrder(searchParams.toString(), "supplierId"),
        key: "supplier",
        filterDropdown: () => {
          if (loadingSup) {
            return <Skeleton active />;
          }
          return (
            <Select
              allowClear
              className="w-37.5"
              placeholder="Chọn nhà cung cấp"
              onChange={(val: string) => {
                searchItems([
                  {
                    type: "supplierId[]",
                    value: val,
                  },
                  { type: "skip", value: "0" },
                ]);
              }}
              showSearch={true}
              filterOption={(input, option) => {
                if (typeof option?.label !== "string") {
                  return false;
                }
                return (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase());
              }}
              options={
                suppliersData?.data?.results?.map(
                  (item: { _id: string; name: string }) => {
                    return {
                      label: `${item.name}`,
                      value: item._id,
                    };
                  }
                ) || []
              }
            />
          );
        },
        className: "w-32",
      },
      // Price
      {
        title: () => {
          return (
            <div className="">
              <Badge
                dot={
                  !!(
                    searchParams.get("fromPrice") || searchParams.get("toPrice")
                  )
                }
              >
                Giá (VND)
              </Badge>
            </div>
          );
        },
        sorter: true,
        sortOrder: getSortOrder(searchParams.toString(), "price"),
        dataIndex: "price",
        key: "price",
        render: (ogPrice: number, product) => {
          const reducePrice = ogPrice * (1 - (product.discount ?? 0) / 100);
          const formattedPrice = reducePrice.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
          });
          return (
            <div className="">
              <span className="line-through">
                {ogPrice.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </span>
              <br />
              <span className="font-semibold text-lg text-amber-600">
                {formattedPrice}
              </span>
            </div>
          );
        },
        filterDropdown: () => {
          return (
            <NumRangeForm
              functions={createFns("fromPrice", "toPrice")}
              from={{
                label: "Từ",
                name: "fromPrice",
                min: 100_000,
                placeholder: "100.000",
                value: Number(searchParams.get("fromPrice") ?? 0),
              }}
              to={{
                label: "Đến",
                name: "toPrice",
                min: 100_000,
                placeholder: "1.000.000.000",
                value: Number(searchParams.get("toPrice") ?? 0),
              }}
              form={{ name: "priceRange" }}
            />
          );
        },
        className: "w-35",
        filterDropdownProps: {
          align: {
            dynamicInset: false,
            autoArrow: false,
            htmlRegion: "visible",
          },
          autoAdjustOverflow: false,
          overlayStyle: {},
        },
      },
      // Sold
      {
        title: () => <div>Doanh số</div>,
        dataIndex: "sold",
        key: "sold",
        filterDropdown: () => {
          return (
            <NumRangeForm
              functions={createFns("fromSold", "toSold")}
              from={{
                label: "Từ",
                name: "fromSold",
                min: 0,
                placeholder: "0",
              }}
              to={{
                label: "Đến",
                name: "toSold",
                min: 0,
                placeholder: "100",
              }}
              form={{ name: "soldRange" }}
            />
          );
        },
        sorter: true,
        sortOrder: getSortOrder(searchParams.toString(), "sold"),
        render: (v = 0) => v,
        className: "w-30",
      },
      // Stock
      {
        title: () => {
          return <div>Còn lại</div>;
        },
        dataIndex: "stock",
        key: "stock",
        filterDropdown: () => {
          return (
            <NumRangeForm
              functions={createFns("fromStock", "toStock")}
              from={{
                label: "Từ",
                name: "fromStock",
                min: 0,
                placeholder: "0",
              }}
              to={{
                label: "Đến",
                name: "toStock",
                min: 0,
                placeholder: "100",
              }}
              form={{ name: "stockRange" }}
            />
          );
        },
        sorter: true,
        sortOrder: getSortOrder(searchParams.toString(), "stock"),
        render: (v = 0) => v,
        className: "w-30",
      },
      // Discount
      {
        title: <div>Mức % KM</div>,
        dataIndex: "discount",
        key: "discount",
        filterDropdown: () => {
          return (
            <NumRangeForm
              functions={createFns("fromDiscount", "toDiscount")}
              from={{
                label: "Từ",
                name: "fromDiscount",
                min: 0,
                placeholder: "0",
              }}
              to={{
                label: "Đến",
                name: "toDiscount",
                min: 0,
                placeholder: "100",
              }}
              form={{ name: "stockRange" }}
            />
          );
        },
        sorter: true,
        sortOrder: getSortOrder(searchParams.toString(), "discount"),
        render: (v = 0) => <div>{v}</div>,
        className: "w-30",
      },
      // Note
      {
        title: <div>Lưu ý</div>,
        dataIndex: "note",
        key: "note",
        width: "100px",
        render: (v) => (
          <div className={v ? "" : "text-gray-300"}>{v || "Trống"}</div>
        ),
        className: "w-30",
      },
      // Average Rating
      {
        title: <div>Đánh giá</div>,
        dataIndex: "averageRate",
        key: "averageRate",
        width: "100px",
        render: (averageRating: number) => {
          return <div>{averageRating ? averageRating.toFixed(1) : "0.0"}</div>;
        },
        className: "w-24",
      },
      // CreatedDate
      {
        title: <div>Tạo vào lúc</div>,
        dataIndex: "createdDate",
        key: "createdDate",
        sorter: true,
        sortOrder: getSortOrder(searchParams.toString(), "createdDate"),
        render: (createdDate: string) => {
          return <div>{dayjs(createdDate).format("DD/MM/YYYY HH:mm")}</div>;
        },
        filterDropdown: () => {
          return (
            <div className="p-2">
              <DatePicker.RangePicker
                allowClear
                defaultValue={[
                  dayjs("01/01/1900", dateFormat),
                  dayjs("01/01/2023", dateFormat),
                ]}
                format={dateFormat}
                onChange={async (e) => {
                  const searchValues: { type: string; value?: string }[] = [
                    { type: "createdDateFrom", value: undefined },
                    { type: "createdDateTo", value: undefined },
                  ];
                  const data = e?.map((date) =>
                    dayjs(date).format("YYYY/MM/DD")
                  );
                  if (data) {
                    searchValues[0] = {
                      type: "createdDateFrom",
                      value: data[0],
                    };
                    searchValues[1] = { type: "createdDateTo", value: data[1] };
                  }
                  searchItems([...searchValues, { type: "skip", value: "0" }]);
                }}
              />
            </div>
          );
        },
        className: "w-32",
      },
      // CreatedBy
      {
        title: <div>Tạo bởi</div>,
        dataIndex: "createdBy",
        key: "createdBy",
        sortOrder: getSortOrder(searchParams.toString(), "createdBy"),
        render: (v) => (
          <div className={v ? "" : "text-gray-300"}>{v || "Trống"}</div>
        ),
        className: "w-32",
      },
      // UpdatedDate
      {
        title: <div>Chỉnh sửa gần nhất</div>,
        dataIndex: "updatedDate",
        key: "updatedDate",
        // sorter: true,
        sortOrder: getSortOrder(searchParams.toString(), "updatedDate"),
        render: (updatedDate: string) => {
          return (
            <div>
              <div>{dayjs(updatedDate).format("DD/MM/YYYY")}</div>
              <div>{dayjs(updatedDate).format("HH:mm")}</div>
            </div>
          );
        },
        filterDropdown: () => {
          return (
            <div className="p-2">
              <DatePicker.RangePicker
                allowClear
                defaultValue={[
                  dayjs("01/01/1900", dateFormat),
                  dayjs("01/01/2023", dateFormat),
                ]}
                format={dateFormat}
                onChange={async (e) => {
                  const searchValues: { type: string; value?: string }[] = [
                    { type: "updatedDateFrom", value: undefined },
                    { type: "updatedDateTo", value: undefined },
                  ];
                  const data = e?.map((date) =>
                    dayjs(date).format("YYYY/MM/DD")
                  );
                  if (data) {
                    searchValues[0] = {
                      type: "updatedDateFrom",
                      value: data[0],
                    };
                    searchValues[1] = { type: "updatedDateTo", value: data[1] };
                  }
                  searchItems([...searchValues, { type: "skip", value: "0" }]);
                }}
              />
            </div>
          );
        },
        className: "w-32",
      },
      // functionColumn,
    ];
    return columns;
  };

  const activeParam = searchParams.get("active");
  const isDeletedParam = searchParams.get("isDeleted");
  const showingInActive = !activeParam || activeParam == "false";
  const showingDeleted = !isDeletedParam || isDeletedParam == "true";
  const crudProps: CRUDProps<Product> = {
    columns: createColumns(),
    collectionName: "products",
    fileFields: [
      {
        name: "imageUrl",
        maxCount: 1,
        fileType: "image",
        label: "Avatar",
        sizes: IMG_SIZES,
      },
      {
        name: "images",
        maxCount: 5,
        fileType: "image",
        label: "Images",
        sizes: IMG_SIZES,
      },
    ],
    filterButtons: (
      <>
        <Button
          key={1}
          style={{ width: "13em" }}
          className={crudStyle.secondaryAction}
          onClick={async () => {
            searchItems([
              { type: "active", value: showingInActive ? "true" : "" },
              { type: "skip", value: "0" },
            ]);
          }}
        >
          {showingInActive ? "Ẩn" : "Hiện"} không hoạt động
        </Button>
        <Button
          key={2}
          style={{ width: "8em" }}
          className={crudStyle.secondaryAction}
          onClick={async () => {
            searchItems([
              {
                type: "isDeleted",
                value: showingDeleted ? "false" : "",
              },
              { type: "skip", value: "0" },
            ]);
          }}
        >
          {showingDeleted ? "Ẩn" : "Hiện"} đã xóa
        </Button>
      </>
    ),
    form: {
      controls: formControls,
      title: "Sản phẩm",
    },
    query: queryResult,
    createFormValues: (record) => {
      if (!record) {
        return {
          name: "",
          price: "",
          stock: "",
          discount: "",
          note: "",
          imageUrl: "",
          images: [],
          category: "",
          supplier: "",
          description: "",
          active: true,
          isDeleted: false,
        };
      }
      return record;
    },
  };

  return <CRUD {...crudProps} />;
}

const MemoCRUD = memo(ProductCRUD);

export default MemoCRUD;

function NumRangeForm({
  functions,
  from,
  to,
  form,
}: {
  functions: {
    onSubmit: (values: any) => void;
    onReset: (...args: any) => void;
  };
  from: {
    label?: string;
    name: string;
    placeholder: string;
    min?: string | number;
    max?: string | number;
    value?: string | number;
  };
  to: {
    label?: string;
    name: string;
    placeholder: string;
    min?: string | number;
    max?: string | number;
    value?: string | number;
  };
  form: { name: string; className?: string };
}) {
  const [form_] = Form.useForm();
  return (
    <Form
      name={form.name}
      onFinish={functions.onSubmit}
      className={`${style.marginLessForm}`}
      form={form_}
    >
      <div
        className={`flex items-center justify-between w-100 h-20 p-2 ${form.className}`}
      >
        <Form.Item label={from.label || "Từ"} name={from.name}>
          <InputNumber<string | number>
            placeholder={from.placeholder}
            min={from.min}
            max={from.max}
            className="w-28"
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
            }
            parser={(value) =>
              value!.replace(/\s?d|(\.*)/g, "").replace(/\./g, "")
            }
            value={from.value}
          />
        </Form.Item>
        <Form.Item label={to.label || "Đến"} name={to.name}>
          <InputNumber<string | number>
            placeholder={to.placeholder}
            min={to.min}
            max={to.max}
            className="w-28"
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
            }
            parser={(value) =>
              value!.replace(/\s?d|(\.*)/g, "").replace(/\./g, "")
            }
            value={to.value}
          />
        </Form.Item>
        <div className="flex">
          <Form.Item>
            <Button type="dashed" htmlType="submit" icon={<SearchOutlined />} />
          </Form.Item>
          <Form.Item>
            <Button
              type="dashed"
              onClick={() => {
                functions.onReset();
                form_.setFieldsValue({ [from.name]: "", [to.name]: "" });
              }}
              icon={<ClearOutlined />}
            />
          </Form.Item>
        </div>
      </div>
    </Form>
  );
}
