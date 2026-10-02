import { ModalForm, useModalForm } from "@/components/Forms/ModalForm";
import FileUploadBox from "@/components/Modals/UploadBox";
import { axiosClientJson } from "@/libraries/axiosClient";
import {
  ClearOutlined,
  DeleteOutlined,
  EditOutlined,
  FilterOutlined,
  LoadingOutlined,
  PlusCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Empty,
  Flex,
  Grid,
  Popconfirm,
  Spin,
  Table,
} from "antd";
import { ColumnsType, ColumnType, TableProps } from "antd/es/table";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { GetOneOrMany, IdWise, WithId } from "utils/types/Entities";
import { FileField, FormControl, FormProps } from "utils/types/Form";
import cssStyles from "./crud.module.css";
// import ErrorPage from "@/components/fallbacks/Error";
import { ModalFormProps } from "@/components/Forms/ModalForm/ModalForm";
import useFileUploadBox, {
  IdAndNameWise,
} from "@/components/Modals/UploadBox/useFileUploadBox";
import { defaultQueryObj } from "@/hooks/stores/useParam";
import { MyQueryReturnType, useGetListQuery } from "@/hooks/useMyQuery";
import usePopupMessage from "@/hooks/usePopupMessage";
import { devLog, getErrorMessage } from "@/utils/logger";

export type CRUDFunctions = {
  handleDelete?: (record: IdWise) => void | Promise<void>;
  handlePageChange?: (current: number, pageSize: number) => void;
  clearParams?: () => void;
};

type FormComponent = React.FC<
  Omit<FormProps, "submitFn" | "formControls" | "modalTitle">
>;

export interface CRUDProps<T> {
  collectionName: string;
  columns: ColumnsType<T>;
  functions?: CRUDFunctions;
  filterButtons?: ReactNode;
  fileFields?: FileField[];
  uploadModalTitle?: string | ((record: T) => string);
  form?:
    | {
        controls: FormControl[];
        title: string;
        submitFn?: (values: unknown) => Promise<void>;
        modalProps?: ModalFormProps["modalProps"];
      }
    | FormComponent;
  createFormValues?: (record?: T) => unknown;
  functionColumn?: {
    extraFunctions?: ((record: T) => ReactNode)[];
    override?: (record: T) => ReactNode;
  };
  layout?: (...parts: ReactNode[]) => JSX.Element;
  query: MyQueryReturnType<GetOneOrMany<T>>;
}

const DEFAULT_PAGE_SIZE = 10;

const collectionTitleMap: Record<string, string> = {
  categories: "Danh mục",
  collections: "Bộ sưu tập",
  customers: "Khách hàng",
  employees: "Nhân viên",
  features: "Tính năng",
  orders: "Đơn hàng",
  products: "Sản phẩm",
  slides: "Slides",
  suppliers: "Nguồn cung",
};

/**
 * A reusable CRUD (Create, Read, Update, Delete) component for managing data in a table format.
 * @param props CRUDProps<DataType>
 * @returns
 */
function CRUD<DataType extends WithId<object>>(props: CRUDProps<DataType>) {
  const {
    columns,
    functions = {},
    filterButtons: dataChangeButtons = null,
    fileFields,
    collectionName,
    form,
    createFormValues = (record) => record,
    query: queryResults,
  } = props;
  // console.log("CRUD render:", Date.now());

  const { searchParams, setSearchParams, query } = queryResults ?? {};
  const { data, isLoading, error: fetchError, isFetching, refetch } = query;
  const { dataSource, amountResults } = useGetListQuery.extract(data);
  const [messageApi, , key] = usePopupMessage() || [];
  const screens = Grid.useBreakpoint();
  const queryClient = useQueryClient();
  const openModalForm = useModalForm((s) => s.openModal);
  const inOperation = useFileUploadBox((s) => s.inOperation);
  const openUploadBox = useFileUploadBox((s) => s.openModal);
  // const resetParams = useParam((s) => s.resetParams);

  const [currentPage, setCurrentPage] = useState(() => {
    try {
      let skip = Number(searchParams?.get("skip") ?? 0);
      return skip / perPage + 1;
    } catch {
      return 1;
    }
  });
  const [perPage, setPerPage] = useState(DEFAULT_PAGE_SIZE);
  const cachedData = useRef<{
    dataSource: DataType[];
    totalAmount: number;
  }>({
    dataSource: dataSource,
    totalAmount: amountResults,
  });

  const title = collectionTitleMap[collectionName] ?? collectionName;
  // devLog({ data, isLoading, fetchError, isFetching, currentPage, perPage });

  // Update cachedData only when not loading and dataSource changes
  useEffect(() => {
    if (dataSource && dataSource.length > 0 && amountResults) {
      cachedData.current = { dataSource, totalAmount: amountResults };
    }
  }, [dataSource, amountResults]);

  useEffect(() => {
    if (fetchError) {
      if (messageApi && key) {
        messageApi.open({
          content: getErrorMessage(fetchError),
          key,
          type: "error",
        });
      }
    }
  }, [fetchError]);

  useEffect(() => {
    let skip = 0;
    try {
      skip = Number(searchParams?.get("skip") ?? 0);
    } catch (err) {
      devLog(err);
      skip = 0;
    }
    setCurrentPage(skip / perPage + 1);
  }, [searchParams?.get("skip")]);

  // End of hooks, start of functions
  async function handleDeleteDefault({ _id }: IdWise) {
    if (collectionName) {
      try {
        await axiosClientJson.delete(`/${collectionName}/${_id}`);
        messageApi?.success("Delete success", 1);
        await queryClient.invalidateQueries({
          queryKey: [`${collectionName}`],
        });
      } catch (error) {
        const errorName = error instanceof Error ? error.name : "Unknown error";
        messageApi?.error(`Delete fail: ${errorName}`, 1);
      }
    }
  }

  async function resetSearchParams() {
    setSearchParams?.(new URLSearchParams("skip=0&limit=10"));
  }

  const {
    handleDelete = handleDeleteDefault,
    clearParams = resetSearchParams,
  } = functions;

  const handleTableChange: TableProps["onChange"] = (
    pagination,
    filters,
    sorter
  ) => {
    devLog({ pagination, filters, sorter });
    if (!searchParams || !setSearchParams) return;
    const params = new URLSearchParams(searchParams);
    const { current, pageSize } = pagination;
    if (typeof current === "number" && typeof pageSize === "number") {
      setCurrentPage(current);
      setPerPage(pageSize);
      params.set("skip", `${pageSize * (current - 1)}`);
      params.set("limit", `${pageSize}`);
    }
    if (!Array.isArray(sorter)) {
      const { order, field } = sorter;
      const isFieldDefined =
        field !== undefined && (!Array.isArray(field) || field.length > 0);
      if (order && isFieldDefined) {
        const sortBy = Array.isArray(field) ? field.join(".") : `${field}`;
        params.set("sortBy", sortBy);
        params.set("sortOrder", order === "ascend" ? "1" : "-1");
      } else {
        //reset sort
        params.set("sortBy", "_id");
        params.set("sortOrder", "1");
      }
    }
    setSearchParams(params);
  };

  const functionColumn: ColumnType<DataType> = {
    key: "functionCol",
    title: "Thao tác",
    dataIndex: "_id",
    render: (_id, record) => {
      const { extraFunctions, override } = props.functionColumn ?? {};
      const item = record as unknown as IdAndNameWise;
      const isChangingFiles =
        inOperation
          .values()
          .find((e) => e.collection === collectionName && e._id === item._id) !=
        null;
      return (
        <Flex gap={8} wrap className={`w-fit`}>
          {override ? (
            override(record)
          ) : (
            <>
              <Button
                icon={<EditOutlined />}
                title="Chỉnh sửa"
                type="text"
                className={cssStyles.iconButton}
                onClick={() => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  openModalForm(
                    createFormValues(record) as any,
                    collectionName,
                    queryResults.queryKey,
                    "PATCH"
                  );
                }}
              />
              <Popconfirm
                title="Xác nhận xóa"
                okType="danger"
                onConfirm={() => {
                  handleDelete(record);
                }}
                cancelText="Hủy"
              >
                <Button
                  title="Xóa"
                  type="text"
                  danger
                  className={cssStyles.iconButton}
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            </>
          )}
          {fileFields && collectionName && (
            <Spin indicator={<LoadingOutlined />} spinning={isChangingFiles}>
              <Button
                icon={<UploadOutlined />}
                title={isChangingFiles ? "Đang cập nhật tệp" : "Tải tệp lên"}
                type="text"
                className={cssStyles.iconButton}
                disabled={isChangingFiles}
                onClick={
                  isChangingFiles
                    ? undefined
                    : function () {
                        openUploadBox(
                          {
                            collection: collectionName,
                            item,
                          },
                          [Object.fromEntries(searchParams?.entries() ?? [])]
                        );
                      }
                }
              />
            </Spin>
          )}
          {extraFunctions?.map((elem) => elem(record))}
        </Flex>
      );
    },
    filterDropdown: (props) => {
      const { close } = props;
      return (
        <div className="flex flex-col">
          {/* Clear filter */}
          <Button
            style={{ width: "150px", height: "40px" }}
            onClick={() => {
              clearParams();
            }}
            icon={<ClearOutlined />}
            type="text"
          >
            Xóa bộ lọc
          </Button>
          {/* Add */}
          <Button
            style={{ width: "150px", height: "40px" }}
            onClick={() => {
              close();
              openModalForm(
                createFormValues() as object,
                collectionName,
                queryResults.queryKey,
                "POST"
              );
            }}
            icon={<PlusCircleOutlined />}
            type="text"
          >
            Thêm
          </Button>
        </div>
      );
    },
    fixed: screens.xl ? "right" : undefined,
    className: "w-[7rem] min-w-[5rem]",
  };

  const formJSX: ReactNode =
    typeof form === "function"
      ? (() => {
          const CustomForm = form;
          return <CustomForm />;
        })()
      : form
        ? (() => {
            const { controls = [], submitFn, modalProps } = form;
            return (
              <ModalForm
                formControls={controls}
                submitFn={submitFn}
                modalTitle={form.title || collectionName}
                refetch={refetch}
                collectionName={collectionName}
                fileFields={fileFields}
                modalProps={modalProps ?? {}}
              />
            );
          })()
        : null;

  const filterCount = searchParams
    .entries()
    .filter(
      (entry) =>
        Object.entries(defaultQueryObj).find(([k, v]) => k === entry[0]) ==
        undefined
    )
    .toArray().length;

  const addBtnJSX = (
    <>
      <Button
        type="primary"
        className={cssStyles.primaryAction}
        onClick={() => {
          openModalForm(
            createFormValues() as object,
            collectionName,
            queryResults.queryKey,
            "POST"
          );
        }}
        icon={<PlusOutlined />}
      >
        Thêm
      </Button>
      <Badge count={filterCount}>
        <Button
          onClick={() => resetSearchParams()}
          icon={<FilterOutlined />}
          className={cssStyles.secondaryAction}
        >
          Xóa bộ lọc
        </Button>
      </Badge>
      <Button
        onClick={() => {
          queryClient.invalidateQueries({ queryKey: [`${collectionName}`] });
        }}
        icon={<ReloadOutlined />}
        className={cssStyles.secondaryAction}
        disabled={isFetching}
      >
        Làm mới
      </Button>
    </>
  );

  const finalDataSource =
    fetchError || isLoading ? cachedData.current.dataSource || [] : dataSource;

  const finalAmount =
    fetchError || isLoading
      ? cachedData.current.totalAmount || 0
      : amountResults;

  const tableJSX = (
    <Table<DataType>
      columns={[...columns, functionColumn]}
      dataSource={finalDataSource}
      rowKey={(record) => record._id}
      pagination={{
        pageSize: perPage,
        total: finalAmount,
        current: currentPage,
        size: "default",
        pageSizeOptions: [10, 20],
        showQuickJumper: finalAmount > 10 * perPage ? true : false,
        hideOnSinglePage: true,
        showSizeChanger: false,
        locale: {
          jump_to: "Đi đến trang",
          page: "",
        },
      }}
      onChange={handleTableChange}
      scroll={{ x: "max-content" }}
      loading={{
        spinning: isFetching,
        size: "large",
      }}
      locale={{
        emptyText: (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              fetchError ? (
                <span className={`text-red-600`}>Lỗi khi tải dữ liệu</span>
              ) : (
                "Chưa có dữ liệu"
              )
            }
          />
        ),
      }}
      className={cssStyles.crudTable}
      size={"middle"}
      // sticky={{ offsetHeader: 64 }}
      tableLayout="fixed"
    />
  );

  const fileUploadJSX = fileFields && collectionName && (
    <FileUploadBox
      fields={fileFields}
      uploadTo="/upload/gcs-upload"
      modalTitle={
        props.uploadModalTitle as
          | string
          | ((record: unknown) => string)
          | undefined
      }
    />
  );

  const defaultLayoutFn: CRUDProps<DataType>["layout"] = (
    addBtn,
    tablePart,
    formRender,
    fileUploadPart,
    selectOperations
  ) => {
    return (
      <div className={cssStyles.crudPage}>
        <div className={cssStyles.crudPanel}>
          <Flex
            className={cssStyles.toolbar}
            justify="space-between"
            align="center"
            gap={12}
            wrap
          >
            <div className={cssStyles.heading}>
              <h1>{title}</h1>
              <span>
                {isFetching
                  ? "Đang cập nhật dữ liệu"
                  : `${amountResults ?? 0} bản ghi`}
              </span>
            </div>
            <Flex className={cssStyles.toolbarActions} gap={8} wrap>
              {addBtn}
              {dataChangeButtons}
              {selectOperations}
            </Flex>
          </Flex>
          <div className={cssStyles.tableSurface}>{tablePart}</div>
        </div>
        {formRender}
        {fileUploadPart}
      </div>
    );
  };

  const layoutFn = props.layout ?? defaultLayoutFn;

  return layoutFn(addBtnJSX, tableJSX, formJSX, fileUploadJSX);
}

export default CRUD;
