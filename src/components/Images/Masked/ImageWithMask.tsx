import { ComponentPropsWithoutRef, ReactNode, useState } from "react";
import styles from "./style.module.css";
import { usePreviewLayer } from "../PreviewLayer";
import { EyeOutlined } from "@ant-design/icons";
import { Button, Skeleton } from "antd";

type Props = ComponentPropsWithoutRef<"img"> & {
  src: string;
  placeHolderSrc?: string;
  style?: React.CSSProperties;
  badge?: ReactNode;
  hoverMask?: ReactNode;
  loadingMask?: ReactNode;
};

const ImageWithMask: React.FC<Props> = ({
  src,
  style = {},
  badge,
  hoverMask,
  ...props
}: Props) => {
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={`relative shadow-md shadow-violet-200 ${styles.root}`}
      style={style}
      title="DeletableImage"
    >
      {badge && <span className="absolute top-1 right-1">{badge}</span>}
      <div>
        <img
          loading={props.loading || "lazy"}
          className={`h-full w-full object-cover ${hasError ? "opacity-80" : ""}`}
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.src = props.placeHolderSrc || "/placeholder-image.jpg";
            setHasError(true);
          }}
          onLoad={() => {
            setLoaded(true);
          }}
          {...props}
        />
      </div>
      <div
        className={`absolute inset-0 flex justify-center items-center transition-all`}
      >
        {hoverMask}
      </div>
      <div
        className={`absolute inset-0 flex justify-center items-center ${loaded ? "hidden" : ""} transition-all`}
      >
        {props.loadingMask}
      </div>
    </div>
  );
};

export default ImageWithMask;

export const PreviewableImageList = (
  props: Props & { buttons?: ReactNode; sources?: string[] }
) => {
  const { src, sources } = props;
  const setPreviewSrc = usePreviewLayer((s) => s.setSrc);
  const setCurrentIndex = usePreviewLayer((s) => s.setCurrentIndex);

  const hoverMask = (
    <>
      <Button
        type="text"
        onClick={() => {
          setPreviewSrc(sources || src);
          setCurrentIndex((prev) => (sources ? 0 : prev));
        }}
      >
        <EyeOutlined />
      </Button>
      {props.buttons}
    </>
  );

  const loadingMask = <Skeleton.Image active />;

  return (
    <ImageWithMask
      hoverMask={hoverMask}
      loadingMask={loadingMask}
      {...props}
      src={sources?.[0] || src}
    />
  );
};
