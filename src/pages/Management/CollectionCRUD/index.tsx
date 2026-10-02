import CRUD from "@/components/CRUD";
import SmartImage from "@/components/Images/Lazy/SmartImage";
import { UploadInput } from "@/components/Inputs/FileUpload";
import { useGetListQuery } from "@/hooks/useMyQuery";
import { ASSET_URL } from "@/utils/constants/URLS";
import { appendDomain, getSortOrder } from "@/utils/stringUtils";
import { UnorderedListOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Input, Switch, Tag } from "antd";
import { memo, useMemo, useState } from "react";
import {
  Active,
  Collection as Collection0,
  WithId,
} from "utils/types/Entities";
import { FormControl } from "utils/types/Form";
import AddProductBox from "./AddProductBox";

type DataRecord = WithId<Collection0 & Active>;

const imageSmallSizes: [number, number][] = [[200, 200]];
const MemoCRUD = memo(CRUD<DataRecord>);

const converRecordToFormValues = (record?: Collection0) => {
  return record
    ? {
        ...record,
        files: {
          image: { fileList: [] },
          coverImage: { fileList: [] },
        },
      }
    : {
        name: "",
        slug: "",
        image: "",
        coverImage: "",
        products: [],
        description: "",
        active: true,
        isDeleted: false,
      };
};

export default function CollectionCRUD() {
  const queryResult = useGetListQuery<DataRecord>({
    url: "/collections",
    queryKey: ["collections"],
  });

  const { searchParams, searchItems } = queryResult;

  const [targetCollection, setTargetCollection] = useState<DataRecord | null>(
    null
  );

  const memoProps = useMemo<Parameters<typeof MemoCRUD>[0]>(
    () => ({
      form: {
        title: "Bộ sưu tập",
        controls: formControls,
        modalProps: { width: "600px" },
      },
      fileFields: [
        {
          name: "image",
          maxCount: 1,
          fileType: "image",
          sizes: imageSmallSizes,
        },
        {
          name: "coverImage",
          maxCount: 1,
          fileType: "image",
          sizes: [[350, 100]],
        },
      ],
      functionColumn: {
        extraFunctions: [
          (record) => (
            <Button
              key={1}
              icon={<UnorderedListOutlined />}
              onClick={() => {
                setTargetCollection(record);
              }}
              title="Danh sách sản phẩm trong BST"
            />
          ),
        ],
      },
      createFormValues: converRecordToFormValues,
      collectionName: "collections",
      query: queryResult,
      columns: [
        {
          title: "No",
          key: "no",
          dataIndex: "_id",
          render(_id, r, index) {
            return index + 1;
          },
          className: "w-[3rem]",
        },
        {
          title: (
            <div
              className={searchParams.get("name") ? "text-danger" : "secondary"}
            >
              Tên bộ sưu tập
            </div>
          ),
          dataIndex: "name",
          sorter: true,
          sortOrder: getSortOrder(searchParams.toString(), "name"),
          filterDropdown: () => {
            return (
              <Input.Search
                allowClear
                placeholder="bst 123 ..."
                onSearch={(e) => {
                  searchItems([
                    {
                      type: "name",
                      value: e,
                    },
                    { type: "skip", value: "0" },
                  ]);
                }}
                defaultValue={searchParams.get("name") ?? ""}
                style={{ width: 200 }}
              />
            );
          },
          className: "w-[9rem]",
        },
        {
          title: "Đường dẫn",
          dataIndex: "slug",
          render(slug: string | undefined) {
            return slug ?? "";
          },
          className: "w-[10rem]",
        },
        {
          title: (
            <div
              className={
                searchParams.get("description") ? "text-danger" : "secondary"
              }
            >
              Mô tả
            </div>
          ),
          dataIndex: "description",
          // sorter: true,
          sortOrder: getSortOrder(searchParams.toString(), "description"),
          filterDropdown: () => {
            return (
              <Input.Search
                allowClear
                placeholder="input search text"
                onSearch={(e) => {
                  searchItems([
                    {
                      type: "description",
                      value: e,
                    },
                    { type: "skip", value: "0" },
                  ]);
                }}
                defaultValue={searchParams.get("description") ?? ""}
                style={{ width: 200 }}
              />
            );
          },
          className: "w-[9rem]",
        },
        {
          title: "Ngày tạo",
          dataIndex: "createdDate",
          sorter: true,
          sortOrder: getSortOrder(searchParams.toString(), "createdDate"),
          render(date: string | undefined) {
            if (!date) return "";
            const d: Date = new Date(date);
            return (
              <>
                <span>{d.toLocaleDateString()}</span>
                <br />
                <span>{d.toLocaleTimeString()}</span>
              </>
            );
          },
          className: "w-[7rem]",
        },
        {
          title: "Chỉnh sửa lần cuối",
          dataIndex: "modifiedDate",
          // sorter: true,
          sortOrder: getSortOrder(searchParams.toString(), "modifiedDate"),
          render(date: string | undefined) {
            if (!date) return "";
            const d: Date = new Date(date);
            return (
              <>
                <span>{d.toLocaleDateString()}</span>
                <br />
                <span>{d.toLocaleTimeString()}</span>
              </>
            );
          },
          className: "w-[7rem]",
        },
        {
          dataIndex: "status",
          key: "status",
          title: "Trạng thái",
          render: (status: string | undefined) => {
            return (
              <Tag color="blue">
                {status ? status.toUpperCase() : "INACTIVE"}
              </Tag>
            );
          },
          // sorter: true,
          className: "w-[6rem]",
        },
        {
          title: "Ảnh BST",
          dataIndex: "image",
          render(src: string) {
            return (
              <div className="min-h-27 flex justify-center items-center">
                {typeof src === "string" && (
                  <SmartImage
                    src={src}
                    width={100}
                    height={100}
                    smallSizes={imageSmallSizes}
                    fallback="/placeholder-image.jpg"
                  />
                )}
              </div>
            );
          },
          shouldCellUpdate: (record, prevRecord) =>
            record.image !== prevRecord.image,
          className: "w-[6.5rem]",
        },
        {
          title: "Ảnh bìa BST",
          dataIndex: "coverImage",
          render(src: string) {
            return (
              <div className="min-h-27 flex justify-center items-center">
                {typeof src === "string" && (
                  <SmartImage
                    src={appendDomain(src, ASSET_URL)}
                    width={100}
                    height={100}
                    smallSizes={[[350, 100]]}
                    fallback="/placeholder-image.jpg"
                  />
                )}
              </div>
            );
          },
          shouldCellUpdate: (record, prevRecord) =>
            record.coverImage !== prevRecord.coverImage,
          className: "w-[6.5rem]",
        },
      ],
    }),
    [
      queryResult.searchParams,
      queryResult.query.data,
      queryResult.query.isLoading,
      queryResult.query.isFetching,
      queryResult.query.error,
    ]
  );

  return (
    <>
      <MemoCRUD {...memoProps} />
      <AddProductBox
        collection={targetCollection}
        close={() => {
          setTargetCollection(null);
        }}
      />
    </>
  );
}

const formControls: FormControl[] = [
  {
    label: "Id",
    name: "_id",
    className: "hidden",
    component: <Input />,
    defaultValue: "",
  },
  {
    name: "name",
    label: "Tên bộ sưu tập",
    component: <Input />,
    valuePropName: "value",
    defaultValue: "",
  },
  {
    name: "description",
    label: "Mô tả",
    component: <Input />,
    valuePropName: "value",
    defaultValue: "",
  },
  {
    name: "active",
    label: "Kích hoạt",
    component: <Switch />,
    valuePropName: "checked",
    defaultValue: true,
  },
  {
    label: "Ảnh BST",
    name: ["files", "image"],
    valuePropName: "value",
    component: (
      <UploadInput>
        <Button icon={<UploadOutlined />} />
      </UploadInput>
    ),
  },
  {
    label: "Ảnh bìa",
    name: ["files", "coverImage"],
    valuePropName: "value",
    component: (
      <UploadInput maxCount={1}>
        <Button icon={<UploadOutlined />} />
      </UploadInput>
    ),
  },
];
