import { PreviewLayer } from "@/components/Images/PreviewLayer";
import usePopupMessage from "@/hooks/usePopupMessage";
import { axiosClientForm, axiosClientJson } from "@/libraries/axiosClient";
import { createFormData, getBase64 } from "@/utils/stringUtils";
import { GetMany, IdWise } from "@/utils/types/Entities";
import { useQueryClient } from "@tanstack/react-query";
import { Modal, UploadFile } from "antd";
import _ from "lodash";
import React, { useState } from "react";
import { FileField } from "utils/types/Form";
import FilePickerAndList from "./FilePickerAndList";
import styles from "./style.module.css";
import useFileUploadBox from "./useFileUploadBox";

// uploadTo = /upload/gcs-upload
export default function FileUploadBox({
  fields,
  uploadTo = `/upload`,
  modalTitle,
}: {
  fields: FileField[];
  uploadTo?: string;
  refetch?: () => void;
  modalTitle?: string | ((record: unknown) => string);
}) {
  // console.log("UploadBox render");
  const queryClient = useQueryClient();
  // const [searchParams] = useSearchParams();
  const boxContent_ = useFileUploadBox((s) => s.boxContent);
  const queryKey_ = useFileUploadBox((state) => state.queryKey) ?? [
    boxContent_?.collection,
  ];
  const setBoxContent = useFileUploadBox((s) => s.setBoxContent);
  const setQueryKey = useFileUploadBox((s) => s.setQueryKey);
  const open = useFileUploadBox((s) => s.open);
  const setOpen = useFileUploadBox((s) => s.setOpen);
  const inOperation = useFileUploadBox((s) => s.inOperation);
  const setInOperation = useFileUploadBox((s) => s.setInOperation);

  const messageApi = usePopupMessage()?.[0];
  const key = usePopupMessage()?.[2];

  const [fileFields_, setFileFields] = useState<
    ({ currentFileList: UploadFile[] } & FileField)[]
  >(() =>
    fields.map((field) => ({
      name: field.name,
      sizes: field.sizes,
      fileType: field.fileType,
      maxCount: field.maxCount ?? 1,
      currentFileList: [],
    }))
  );

  const [markedServerFilesToDelete_, setMarkedServerFilesToDelete] = useState<
    [FileField, Set<string>][]
  >([]);

  function closeModalAndCleanup() {
    // Cleanup the modal
    setBoxContent(null);
    // Làm trống danh sách file đã chọn để upload
    setFileFields(fields.map((field) => ({ ...field, currentFileList: [] })));
    // Làm trống danh sách server file đã chọn để xoá
    setMarkedServerFilesToDelete([]);
    // Reset query key
    setQueryKey?.([]);
    // Đóng modal
    setOpen(false);
  }

  const isOperating =
    inOperation
      .values()
      .find(
        (v) =>
          v.collection === boxContent_?.collection &&
          v._id === boxContent_.item._id
      ) != undefined;

  return (
    <Modal
      open={open && !isOperating}
      title={
        typeof modalTitle === "function"
          ? modalTitle(boxContent_?.item)
          : modalTitle ||
            boxContent_?.item.name ||
            `${boxContent_?.collection || ""} ${boxContent_?.item._id || ""}`
      }
      onOk={function onOK() {
        setOpen(false);
        if (!boxContent_ || isOperating) {
          return closeModalAndCleanup();
        }

        // Clone state trước khi đóng modal.
        const boxContentClone = _.clone(boxContent_);
        const fileFieldsClone = _.clone(fileFields_);
        const filesOnServerToDeleteClone = _.clone(markedServerFilesToDelete_);
        const qKey = [`${boxContentClone?.collection}`, ..._.clone(queryKey_)];
        const itemClone = _.clone(boxContentClone?.item);

        const previousCache = queryClient.getQueryData<GetMany<IdWise>>(qKey);
        const fieldsHaveUpload = fileFieldsClone
          .filter((f) => Boolean(f.currentFileList.length))
          .map((f) => {
            return { ...f, maxCount: f.maxCount || 1 };
          });

        closeModalAndCleanup();
        const stopOperating = () => {
          setInOperation((s) => {
            const newSet = new Set(
              s
                .values()
                .filter(
                  (v) =>
                    !(
                      v._id === boxContentClone.item._id &&
                      v.collection === boxContentClone.collection
                    )
                )
            );
            return newSet;
          });
        };
        try {
          const formDatas = fieldsHaveUpload
            .map((field) => {
              const fd = createFormData(
                field.currentFileList
                  .map((item) => item.originFileObj)
                  .filter((file) => file != null)
                  .slice(0, field.maxCount),
                "file"
              );
              fd?.append("sizes", JSON.stringify(field.sizes ?? []));
              return fd;
            })
            .filter((fd) => !!fd);

          // Không upload thêm file nào cũng không xoá đi file nào
          if (formDatas.length === 0 && !filesOnServerToDeleteClone.length) {
            return;
          }

          if (formDatas.length != fieldsHaveUpload.length) {
            return messageApi?.open({
              key,
              type: "error",
              content: "Lỗi khác",
              duration: 1,
            });
          }

          messageApi?.open({
            key,
            type: "loading",
            content: "Đang xử lí",
            duration: 1,
          });

          setInOperation((s) => {
            const newSet = new Set(s);
            newSet.add({
              collection: boxContentClone.collection,
              _id: boxContentClone.item._id,
            });
            return newSet;
          });

          // Object thể hiện các trường và các server file được chọn thủ công để xoá đi
          const manuallyDelete: {
            [fieldName: string]: Set<string> | undefined;
          } = filesOnServerToDeleteClone
            .filter(
              ([fieldInfo]) =>
                fieldInfo.maxCount != null && fieldInfo.maxCount > 1
            )
            .map(([fieldInfo, sources]) => {
              return { [fieldInfo.name]: sources };
            })
            .reduce(
              (prev, curr) => ({
                ...prev,
                ...curr,
              }),
              {}
            );

          const constructUpdateBody = (
            fields: typeof fileFieldsClone,
            uploaded: Record<string, any>
          ) => {
            const updateBody: typeof uploaded = {};
            // Tính toán updateBody
            fields.map((field) => {
              if (!field.maxCount || field.maxCount === 1) {
                if (Object.keys(uploaded).includes(field.name)) {
                  updateBody[field.name] = uploaded[field.name];
                }
              } else {
                const uploadedFiles = (uploaded[field.name] as string[]) || [];
                const oldFiles = itemClone[field.name] as string[];
                const newArray = [...uploadedFiles, ...oldFiles]
                  .filter((src) => !manuallyDelete[field.name]?.has(src))
                  .slice(0, field.maxCount);
                updateBody[field.name] = newArray;
              }
            });
            // Loại bỏ undefined
            return JSON.parse(JSON.stringify(updateBody));
          };

          const setCacheArray = (updateBody: object) => {
            // Optimistic Update
            queryClient.setQueryData<GetMany<IdWise>>(qKey, (prev) => {
              if (!prev) return;
              if (!Array.isArray(prev?.results)) return prev;
              const copyArray = prev?.results.slice();
              const foundIndex = copyArray?.findIndex(
                (elem) => elem._id === itemClone._id
              );
              if (foundIndex < 0) return prev;
              const found = copyArray[foundIndex];
              copyArray[foundIndex] = {
                ...found,
                ...updateBody,
              };
              return { ...prev, results: copyArray };
            });
          };

          const optimisticUpdate = async () => {
            try {
              const promiseBase64Srcs = fileFieldsClone
                .map((field) => field.currentFileList)
                .map((fileList) =>
                  Promise.all(
                    fileList
                      .map((uploadFile) => uploadFile.originFileObj)
                      .filter((file) => !!file)
                      .map(getBase64)
                  )
                );
              const arrArrSource = await Promise.all(promiseBase64Srcs);
              // Object thể hiện các trường và các client file được chọn để upload
              const body1 = arrArrSource
                .map((arrSrc, fieldsIndex) => {
                  const field = fields[fieldsIndex];
                  return {
                    [field.name]: field.maxCount === 1 ? arrSrc[0] : arrSrc,
                  };
                })
                .reduce((p, c) => ({ ...p, ...c }), {});
              // Optimistic Update 1
              setCacheArray(constructUpdateBody(fileFieldsClone, body1));
            } catch {
              // Pass
            }
          };

          const updateAsync = async () => {
            try {
              // await optimisticUpdate();
              const promiseUploadResponses = formDatas.map((fd) =>
                axiosClientForm.postForm<{ publicUrls: string[] }>(uploadTo, fd)
              );

              const responses = await Promise.all(promiseUploadResponses);
              const body2 = JSON.parse(
                JSON.stringify(
                  responses
                    .map((response, idx) => ({
                      [fieldsHaveUpload[idx].name]:
                        fieldsHaveUpload[idx].maxCount == 1
                          ? response.data.publicUrls[0]
                          : response.data.publicUrls,
                    }))
                    .reduce((p, c) => ({ ...p, ...c }), {})
                )
              );
              const updateReqBody = constructUpdateBody(fileFieldsClone, body2);
              await axiosClientJson.patch(
                `/${boxContentClone.collection}/${boxContentClone.item._id}`,
                updateReqBody
              );
              // Optimistic update 2
              setCacheArray(updateReqBody);
              messageApi?.open({
                key,
                type: "success",
                content: "Đã cập nhật",
              });
            } catch (error) {
              messageApi?.open({
                key,
                type: "error",
                content: "Lỗi khi cập nhật",
              });
              // Rollback optimistic update nếu request fail
              queryClient.setQueryData(qKey, previousCache);
            }
            stopOperating();
          };
          updateAsync();
        } catch (error) {
          messageApi?.open({
            key,
            type: "error",
            content: "Tải lên thất bại",
          });
          stopOperating();
        }
      }}
      onCancel={function onCancel() {
        closeModalAndCleanup();
      }}
      width={780}
      centered
      cancelText="Hủy"
      okText="Lưu"
      rootClassName={styles.modalRoot}
    >
      <div className={styles.modalIntro} autoFocus>
        <div>
          <div className={styles.modalIntroSubtitle}>
            Thêm hoặc thay đổi file.
          </div>
        </div>
        <div className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-500">
          Hỗ trợ nhiều file
        </div>
      </div>
      <div className="space-y-3">
        {fields.map((field, i) => (
          <FilePickerAndList
            field={field}
            collection={boxContent_?.collection}
            item={boxContent_?.item}
            onChange={(fileList, type) => {
              if (type === "local")
                setFileFields((prev) => {
                  return prev.map((item) => {
                    if (item.name === field.name) {
                      return {
                        ...item,
                        currentFileList: fileList as UploadFile[],
                      };
                    }
                    return item;
                  });
                });
              else {
                setMarkedServerFilesToDelete((prev) => {
                  const index = prev.findIndex(
                    ([fieldInfo]) => fieldInfo.name === field.name
                  );
                  return [
                    ...prev.slice(0, index),
                    [field, fileList as Set<string>],
                    ...prev.slice(index + 1),
                  ];
                });
              }
            }}
            key={`${boxContent_?.item._id}_${field.name}_${i}`}
          />
        ))}
      </div>
      <PreviewLayer
        onClose={() => {
          (
            document.querySelector(
              `div.${styles.modalRoot} .ant-modal>div:first-child`
            ) as HTMLDivElement | undefined
          )?.focus();
        }}
      />
    </Modal>
  );
}
