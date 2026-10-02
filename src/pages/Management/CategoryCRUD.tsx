import CRUD from "@/components/CRUD";
import SmartImage from "@/components/Images/Lazy/SmartImage";
import { UploadInput } from "@/components/Inputs/FileUpload";
import { useGetListQuery } from "@/hooks/useMyQuery";
import { ASSET_URL } from "@/utils/constants/URLS";
import { appendDomain, getSortOrder } from "@/utils/stringUtils";
import { Active, Category, WithId } from "@/utils/types/Entities";
import { FormControl } from "@/utils/types/Form";
import { UploadOutlined } from "@ant-design/icons";
import { Button, Checkbox, Input, InputNumber, Select, Space, Tag } from "antd";
import Search from "antd/es/input/Search";
import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";

type Entity = WithId<Category> & Active;

type CategoryOption = {
  value: string;
  label: string;
};

const imageSizes = [
  [80, 80],
  [120, 120],
];

const coverImageSizes = [
  [240, 80],
  [300, 100],
];

const getControls = (categoryOptions: CategoryOption[]): FormControl[] => [
  {
    label: "Id",
    name: "_id",
    className: "hidden",
    component: <Input />,
    defaultValue: "",
  },
  {
    label: "Tên",
    name: "name",
    rules: [{ required: true, message: "Please input Name!" }],
    component: <Input />,
    className: "texxt basis-full",
    defaultValue: "",
  },
  {
    label: "Mô tả",
    name: "description",
    rules: [{ required: true, message: "Please input Description!" }],
    component: <Input />,
    className: "basis-full",
    defaultValue: "",
  },
  {
    label: "Danh mục cha",
    name: "parentCategory",
    component: (
      <Select
        allowClear
        showSearch
        placeholder="Chọn danh mục cha"
        optionFilterProp="label"
        filterOption={(input, option) =>
          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
        }
        options={categoryOptions}
      />
    ),
    className: "basis-full",
    defaultValue: "",
  },
  {
    label: "Quảng bá",
    name: "promotionPosition",
    component: (
      <Select
        mode="multiple"
        allowClear
        showSearch
        placeholder="Chọn mục quảng bá"
        optionFilterProp="children"
        filterOption={(input, option) =>
          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
        }
        options={[
          {
            value: "TOP-MONTH",
            label: "Top bán chạy trong tháng",
          },
          {
            value: "DEAL",
            label: "Ưu đãi",
          },
        ]}
      />
    ),
    className: "basis-full",
    defaultValue: [],
  },
  {
    label: "Vị trí sắp xếp",
    name: "displayOrder",
    component: <InputNumber min={1} />,
    className: "basis-1/3",
    defaultValue: "",
  },
  {
    label: "Hoạt động",
    name: "active",
    valuePropName: "checked",
    component: <Checkbox />,
    className: "basis-1/3",
    defaultValue: true,
  },
  {
    label: "Đã xóa",
    name: "isDeleted",
    valuePropName: "checked",
    component: <Checkbox />,
    className: "basis-1/3",
    defaultValue: false,
  },
  {
    label: "Ghi chú",
    name: "note",
    component: <Input />,
    defaultValue: "",
  },
  {
    label: "Ảnh",
    name: ["files", "imageUrl"],
    component: (
      <UploadInput maxCount={1}>
        <Button icon={<UploadOutlined />} />
      </UploadInput>
    ),
    valuePropName: "value",
  },
  {
    label: "Nền",
    name: ["files", "coverImageUrl"],
    component: (
      <UploadInput maxCount={1}>
        <Button icon={<UploadOutlined />} />
      </UploadInput>
    ),
    valuePropName: "value",
  },
];

function CategoryCRUD() {
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);

  const queryResults = useGetListQuery<Entity>({
    url: "/categories",
    queryKey: ["categories"],
  });

  // Build category options for the parent category select
  useEffect(() => {
    const { dataSource } = useGetListQuery.extract(queryResults.query.data);
    const options: CategoryOption[] = (dataSource as Entity[])
      .filter((cat: Entity) => !cat.isDeleted)
      .map((cat: Entity) => ({
        value: cat._id,
        label: cat.name,
      }));
    setCategoryOptions(options);
  }, [queryResults.query.data]);

  const {
    query: { refetch },
    searchItems,
    searchParams,
  } = queryResults;

  //Setting column
  const columns = useMemo(() => {
    return [
      //NO
      {
        title: "No",
        dataIndex: "_id",
        key: "id",
        render: (text: string, record, index) => {
          return <div>{index + 1}</div>;
        },
        // width: "3%",
        responsive: ["xl"],
        className: "w-[4rem]",
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
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
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
        className: "w-[7rem]",
      },
      //Name
      {
        title: (
          <div
            className={searchParams.has("name") ? "text-danger" : "secondary"}
          >
            Tên danh mục
          </div>
        ),
        dataIndex: "name",
        key: "name",
        sorter: true,
        sortOrder: getSortOrder(searchParams.toString(), "name"),
        filterDropdown: () => {
          return (
            <div style={{ padding: 8 }}>
              <Search
                allowClear
                placeholder="Enter name"
                onSearch={(e) => {
                  searchItems([
                    { type: "name", value: e },
                    { type: "skip", value: "0" },
                  ]);
                }}
                style={{ width: 200 }}
              />
            </div>
          );
        },
        className: "w-[10rem]",
      },
      //IMAGE
      {
        title: "Ảnh danh mục",
        key: "imageUrl",
        dataIndex: "imageUrl",
        render: (text, record) => {
          const imageSrc = appendDomain(record.imageUrl, ASSET_URL);
          return (
            <div className="flex justify-center items-center gap-2 h-32">
              {imageSrc && (
                <SmartImage
                  src={`${imageSrc}`}
                  // style={{ width: "100px" }}
                  smallSizes={imageSizes as [number, number][]}
                  alt="record.imageUrl"
                  className="object-fill"
                  width={120}
                  height={120}
                  fallback="/placeholder-image.jpg"
                />
              )}
            </div>
          );
        },
        className: "w-[8rem]",
      },
      // BIG COVER IMAGE
      {
        title: "Ảnh bìa danh mục",
        key: "coverImageUrl",
        dataIndex: "coverImageUrl",
        render: (text, record) => {
          const coverImageUrl = appendDomain(record.coverImageUrl, ASSET_URL);
          return (
            <div className="flex justify-center items-center gap-2 h-32">
              {coverImageUrl && (
                <SmartImage
                  src={coverImageUrl}
                  // style={{ width: "100px" }}
                  smallSizes={coverImageSizes as [number, number][]}
                  alt="coverImage"
                  className="object-center"
                  width={120}
                  height={120}
                  fallback="/placeholder-image.jpg"
                />
              )}
            </div>
          );
        },
        className: "w-[8rem]",
      },
      //Desciption
      {
        title: () => (
          <div
            className={searchParams.has("description") ? "danger" : "secondary"}
          >
            Mô tả
          </div>
        ),
        dataIndex: "description",
        key: "description",
        sorter: true,
        sortOrder: getSortOrder(searchParams.toString(), "description"),
        filterDropdown: () => {
          return (
            <div style={{ padding: 8 }}>
              <Search
                allowClear
                placeholder="Enter description"
                onSearch={(value) => {
                  searchItems([
                    { type: "description", value: value },
                    { type: "skip", value: "0" },
                  ]);
                }}
                style={{ width: 200 }}
              />
            </div>
          );
        },
        className: "w-[9rem]",
      },
      // Thứ tự xuất hiện
      {
        title: () => <div>Thứ tự xuất hiện</div>,
        dataIndex: "displayOrder",
        key: "displayOrder",
        sorter: true,
        sortOrder: getSortOrder(searchParams.toString(), "displayOrder"),
        className: "w-[5rem]",
      },
      // Parent Category
      {
        title: "Danh mục cha",
        dataIndex: ["parentCategory", "name"],
        key: "parentCategory",
        render: (text: string, record: Entity) => {
          if (!record.parentCategory) {
            return <div className="text-gray-400">-</div>;
          }
          const parentCategoryName =
            typeof record.parentCategory === "object"
              ? record.parentCategory.name
              : record.parentCategory;
          return <div className="">{parentCategoryName}</div>;
        },
        className: "w-[10rem]",
      },
      //Note
      {
        title: "Lưu ý",
        dataIndex: "note",
        key: "note",
        sorter: true,
        sortOrder: getSortOrder(searchParams.toString(), "note"),
        // width: "8%",
        className: "w-[6rem]",
      },
      {
        title: "Chỉnh sửa lần cuối",
        dataIndex: "updatedDate",
        key: "updatedDate",
        sorter: true,
        sortOrder: getSortOrder(searchParams.toString(), "updatedDate"),
        // width: "150px",
        render: (updatedDate: string) => {
          const d = dayjs(updatedDate);
          return (
            <div>
              <div>{d.format("DD-MM-YYYY")}</div>
              <div>{d.format("HH:mm")}</div>
            </div>
          );
        },
        className: "w-[12rem]",
      },
    ] as ColumnsType<WithId<Category> & Active>;
  }, [searchItems, searchParams]);

  const converRecordToFormValues = (record?: Entity) => {
    if (!record) {
      return {
        coverImageUrl: "",
        description: "",
        imageUrl: "",
        name: "",
        note: "",
        active: true,
        displayOrder: 0,
        isDeleted: false,
        parentCategory: "",
      };
    }
    const parentCategory =
      typeof record.parentCategory === "object"
        ? record.parentCategory?._id
        : record.parentCategory;

    return {
      ...record,
      parentCategory,
      files: {
        imageUrl: { fileList: [] },
        coverImageUrl: { fileList: [] },
      },
    };
  };

  const controls = getControls(categoryOptions);

  return (
    <CRUD
      columns={columns}
      query={queryResults}
      collectionName="categories"
      form={{
        title: "Danh mục sản phẩm",
        controls: controls,
      }}
      fileFields={[
        {
          name: "imageUrl",
          fileType: "image",
          label: "Image",
          maxCount: 1,
          sizes: imageSizes as [number, number][],
        },
        {
          name: "coverImageUrl",
          fileType: "image",
          label: "Cover Image",
          maxCount: 1,
          sizes: coverImageSizes as [number, number][],
        },
      ]}
      createFormValues={converRecordToFormValues as any}
    />
  );
}

export default React.memo(CategoryCRUD);
