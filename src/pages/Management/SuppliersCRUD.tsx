import { useGetListQuery } from "@/hooks/useMyQuery";
import CRUD from "@/components/CRUD";
import * as Types from "utils/types/Entities";
import { Checkbox, Input, Select, Space, Tag } from "antd";
import Search from "antd/es/input/Search";
import { ColumnsType } from "antd/es/table";
import { getSortOrder } from "@/utils/stringUtils";
import { FormControl } from "@/utils/types/Form";
import { devLog } from "@/utils/logger";
import React from "react";

const formItems: FormControl[] = [
  {
    label: "Id",
    name: "_id",
    className: "hidden",
    component: <Input />,
    defaultValue: "",
  },
  {
    label: "Tên nhà cung cấp",
    name: "name",
    rules: [{ required: true, message: "Please input Name!" }],
    component: <Input />,
    className: "basis-1/2",
    defaultValue: "",
  },
  {
    label: "Email",
    name: "email",
    rules: [{ required: true, message: "Please input Email!" }],
    component: <Input />,
    className: "basis-1/2",
    defaultValue: "",
  },
  {
    label: "Số điện thoại",
    name: "phoneNumber",
    component: <Input />,
    className: "basis-1/2",
    defaultValue: "",
  },
  {
    label: "Địa chỉ",
    name: "address",
    rules: [{ required: true, message: "Please input Address!" }],
    component: <Input />,
    className: "basis-1/2",
    defaultValue: "",
  },
  {
    label: "Đang hoạt động",
    name: "active",
    component: <Checkbox />,
    valuePropName: "checked",
    className: "basis-1/2",
    defaultValue: true,
  },
  {
    label: "Đã xóa",
    name: "isDeleted",
    component: <Checkbox />,
    valuePropName: "checked",
    className: "basis-1/2",
    defaultValue: false,
  },
  {
    label: "Ghi chú",
    name: "note",
    component: <Input />,
    className: "basis-full",
    defaultValue: "",
  },
];

type Supplier = Types.WithId<Types.Supplier> & Types.Active;

function SupplierCRUD() {
  const queryResult = useGetListQuery<Supplier>({
    queryKey: ["suppliers"],
    url: "/suppliers",
  });

  const {
    query: { refetch },
    searchParams,
    searchItems,
  } = queryResult;

  // devLog("suppliercrud render");

  //Setting column
  const columns: ColumnsType<Supplier> = [
    //NO
    {
      title: "No",
      dataIndex: "_id",
      key: "id",
      render: (text: string, record, index) => {
        return <Space>{index + 1}</Space>;
      },
      // width: "3%",
      responsive: ["xl"],
      className: "w-[3rem]",
    },
    // State
    {
      title: () => {
        const isFiltering =
          searchParams.has("active") || searchParams.has("isDeleted");
        return (
          <div className={isFiltering ? "text-danger" : "secondary"}>
            Trạng thái
          </div>
        );
      },
      dataIndex: "active",
      key: "status",
      render: (active: boolean, record) => {
        return (
          <Space style={{ width: "100%" }}>
            {active === true && !record.isDeleted && (
              <Tag color="green">ACTIVE</Tag>
            )}
            {active === false && !record.isDeleted && (
              <Tag color="yellow">INACTIVE</Tag>
            )}
            {record.isDeleted === true && <Tag color="red">DELETED</Tag>}
          </Space>
        );
      },
      filterDropdown: () => {
        return (
          <Select
            allowClear
            onClear={() => {
              searchParams.delete("active");
              searchParams.delete("isDeleted");
              refetch();
            }}
            style={{ width: "125px" }}
            placeholder="Select a supplier"
            optionFilterProp="children"
            showSearch
            onChange={(value) => {
              switch (value) {
                case "active":
                  searchItems([
                    { type: "active", value: "true" },
                    { type: "isDeleted", value: undefined },
                    { type: "skip", value: "0" },
                  ]);
                  break;
                case "inActive":
                  searchItems([
                    { type: "active", value: "false" },
                    { type: "isDeleted", value: undefined },
                    { type: "skip", value: "0" },
                  ]);
                  break;
                case "isDeleted":
                  searchItems([
                    { type: "isDeleted", value: "true" },
                    { type: "active", value: undefined },
                    { type: "skip", value: "0" },
                  ]);
                  break;
                default:
                  searchItems([
                    { type: "active", value: undefined },
                    { type: "isDeleted", value: undefined },
                    { type: "skip", value: "0" },
                  ]);
              }
            }}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={[
              {
                value: "active",
                label: "Active",
              },
              {
                value: "inActive",
                label: "Inactive",
              },
              {
                value: "isDeleted",
                label: "Deleted",
              },
            ]}
          />
        );
      },
      // width: "10%",
      responsive: ["xl"],
      className: "w-[9rem]",
    },
    //Name
    {
      title: () => {
        return (
          <div
            className={searchParams.has("name") ? "text-danger" : "secondary"}
          >
            Tên nhà cung cấp
          </div>
        );
      },
      dataIndex: "name",
      key: "name",
      filterDropdown: () => {
        return (
          <Input.Search
            step="string"
            allowClear
            placeholder="Nhập tên"
            onSearch={(e) => {
              const valueSearch = { type: "name", value: e };
              searchItems([valueSearch, { type: "skip", value: "0" }]);
            }}
          />
        );
      },
      sorter: true,
      sortOrder: getSortOrder(searchParams.toString(), "name"),
      className: "w-[13rem]",
    },
    // Logo
    {
      title: "Logo",
      dataIndex: "logo",
      key: "logo",
      className: "w-[5rem]",
    },
    //Email
    {
      title: () => {
        return (
          <div
            className={searchParams.has("email") ? "text-danger" : "secondary"}
          >
            Email
          </div>
        );
      },
      dataIndex: "email",
      key: "email",
      filterDropdown: () => {
        return (
          <div style={{ padding: 8 }}>
            <Search
              allowClear
              placeholder="Nhập email nhà cung cấp"
              onSearch={(e) => {
                const valueSearch = { type: "email", value: e };
                searchItems([valueSearch, { type: "skip", value: "0" }]);
              }}
              style={{ width: 200 }}
            />
          </div>
        );
      },
      sorter: true,
      sortOrder: getSortOrder(searchParams.toString(), "email"),
      className: "w-[11rem]",
    },
    //Phone Number
    {
      title: () => (
        <div
          className={
            searchParams.has("phoneNumber") ? "text-danger" : "secondary"
          }
        >
          Điện thoại
        </div>
      ),
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      filterDropdown: () => {
        return (
          <div style={{ padding: 8 }}>
            <Input.Search
              step="string"
              allowClear
              placeholder="Nhập số điện thoại"
              onSearch={(e) => {
                const valueSearch = { type: "phoneNumber", value: e };
                searchItems([valueSearch, { type: "skip", value: "0" }]);
              }}
            />
          </div>
        );
      },
      className: "w-[8rem]",
    },
    //Address
    {
      title: () => {
        return (
          <div
            className={
              searchParams.get("address") ? "text-danger" : "secondary"
            }
          >
            Địa chỉ nhà cung cấp
          </div>
        );
      },
      dataIndex: "address",
      key: "address",
      filterDropdown: () => {
        return (
          <div style={{ padding: 8 }}>
            <Search
              allowClear
              placeholder="Nhập địa chỉ"
              onSearch={(e) => {
                const valueSearch = { type: "address", value: e };
                searchItems([valueSearch, { type: "skip", value: "0" }]);
              }}
              style={{ width: 200 }}
            />
          </div>
        );
      },
      sorter: true,
      sortOrder: getSortOrder(searchParams.toString(), "address"),
      className: "w-[17rem]",
    },
    //Note
    {
      title: "Ghi chú",
      dataIndex: "note",
      key: "note",
      className: "w-[11rem]",
    },
  ];

  return (
    <CRUD<Supplier>
      columns={columns}
      // dataSource={dataSource}
      // totalAmount={amountResults}
      collectionName="suppliers"
      // searchParams={searchParams}
      // setSearchParams={setSearchParams}
      form={{
        controls: formItems,
        title: "Nguồn cung",
        modalProps: { width: "700px" },
      }}
      // fetchError={error}
      // loading={isLoading}
      query={queryResult}
      createFormValues={(r) =>
        r ?? {
          name: "",
          email: "",
          phoneNumber: "",
          address: "",
          note: "",
          active: true,
          isDeleted: false,
          _id: "",
        }
      }
    />
  );
}

export default SupplierCRUD;
