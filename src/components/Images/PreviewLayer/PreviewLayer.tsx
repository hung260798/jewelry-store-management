import { ASSET_URL } from "@/utils/constants/URLS";
import { appendDomain } from "@/utils/stringUtils";
import { CloseOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import React, { useEffect, useRef } from "react";
import styles from "./styles.module.css";
import { usePreviewLayer } from "./usePreviewLayer";

interface CustomDivProps extends React.HTMLAttributes<HTMLDivElement> {
  customProp?: string;
  shape?: "circle" | "square";
}

function FloatButton({ children, className, shape, ...props }: CustomDivProps) {
  return (
    <div
      className={`absolute w-12 h-12 select-none ${shape === "circle" ? "rounded-[50%]" : "rounded-none"} ${className}`}
      {...props}
    >
      <button className="bg-transparent w-12 h-12 border text-amber-50 border-amber-50 rounded-lg cursor-pointer hover:bg-amber-50 hover:text-blue-900 hover:outline-amber-50 outline-transparent outline-1 outline-offset-2 active:bg-gray-400 active:text-white active:outline-offset-4 transition-all">
        {children}
      </button>
    </div>
  );
}

export function PreviewLayer({ onClose }: { onClose?: () => void }) {
  const srcs = usePreviewLayer((s) => s.src);
  const currentIndex = usePreviewLayer((s) => s.currentIndex);
  const setCurrentIndex = usePreviewLayer((s) => s.setCurrentIndex);
  const closeLayer = usePreviewLayer((s) => s.closeLayer);
  const ref = useRef<HTMLDivElement | null>(null);

  const isNonEmptyArray = Array.isArray(srcs) && srcs.length > 0;
  const isShowing =
    typeof srcs === "string"
      ? srcs
        ? true
        : false
      : srcs.length
        ? true
        : false;

  useEffect(() => {
    if (ref.current) {
      if (!isShowing) {
        ref.current.blur();
      } else {
        ref.current.focus();
      }
    }
  }, [isShowing, ref.current]);

  const currentSrc = Array.isArray(srcs)
    ? srcs[(currentIndex ?? 0) % srcs.length]
    : srcs;

  return (
    <>
      <div
        className={`fixed inset-0 z-2050 bg-[rgba(0,0,0)] ${
          isShowing ? styles.show : styles.hide
        } ${styles.mask}`}
      >
        <div
          className={`fixed inset-0 z-2050 flex justify-center items-center ${isShowing ? "block" : "hidden"}`}
          tabIndex={0}
          autoFocus
          onKeyDown={(event) => {
            event.stopPropagation();
            if (event.key === "Escape") {
              closeLayer();
              onClose?.();
              event.currentTarget.blur();
            } else if (event.key === "ArrowLeft" && isNonEmptyArray) {
              setCurrentIndex((n) => {
                if (n === undefined) return 0;
                return (n - 1 + srcs.length) % srcs.length;
              });
            } else if (event.key === "ArrowRight" && isNonEmptyArray) {
              setCurrentIndex((n) => {
                if (n === undefined) return 0;
                return (n + 1) % srcs.length;
              });
            }
          }}
          ref={ref}
        >
          <img
            src={appendDomain(currentSrc!, ASSET_URL)}
            alt="image"
            className="max-h-125 transition-all opacity-100 bg-none"
            onClick={(e) => {
              e.stopPropagation();
            }}
          />
          {/** Close modal button */}
          <FloatButton
            shape="circle"
            className="top-12.5 right-12.5 bg-[rgba(0,0,0,0.1)]"
            onClick={() => {
              closeLayer();
              onClose?.();
            }}
          >
            <CloseOutlined style={{ fontSize: "1.5rem" }} />
          </FloatButton>
          <FloatButton
            className="absolute left-12.5 top-[50%] -translate-y-1/2 bg-[rgba(0,0,0,0.1)] text-white"
            onClick={(e) => {
              e.stopPropagation();
              if (isNonEmptyArray) {
                setCurrentIndex((n) => {
                  if (n === undefined) return 0;
                  return (n - 1 + srcs.length) % srcs.length;
                });
              }
            }}
          >
            <LeftOutlined style={{ fontSize: "1.5rem" }} />
          </FloatButton>
          <FloatButton
            className="absolute right-12.5 top-[50%] -translate-y-1/2 bg-[rgba(0,0,0,0.1)] text-white"
            onClick={(e) => {
              e.stopPropagation();
              if (isNonEmptyArray) {
                setCurrentIndex((n) => {
                  if (n === undefined) return 0;
                  return (n + 1) % srcs.length;
                });
              }
            }}
          >
            <RightOutlined style={{ fontSize: "1.5rem" }} />
          </FloatButton>
          {typeof currentIndex === "number" && Array.isArray(srcs) && (
            <span className="fixed z-10 bottom-25 left-1/2 -translate-x-1/2 text-white text-lg text-shadow-blue-400">
              {currentIndex + 1} / {srcs.length}
            </span>
          )}
        </div>
      </div>
    </>
  );
}
