import { IdWise } from "@/utils/types/Entities";
import { SearchBoxOptions } from "@/utils/types/Form";
import { CloseCircleFilled, SearchOutlined } from "@ant-design/icons";
import { Button, Input, List, Skeleton } from "antd";
import { useEffect, useRef, useState } from "react";
import style from "./style.module.css";

const SEARCH_DELAY_MS = 500;

export default function SearchBox<T extends object = IdWise>({
  searchHook: useSearch,
  renderItemFn: renderItem,
  renderListFn: renderList,
  searchProps = {},
  onBlur,
  zIndex = 100,
}: SearchBoxOptions<T>) {
  const { data, error, isLoading, onSearch, loadMore } = useSearch();

  const searchTimeout = useRef<NodeJS.Timeout>();
  const removeMaskTimeout = useRef<NodeJS.Timeout>();
  const [isTyping, setIsTyping] = useState(false);
  const [isShowingResult, setIsShowingResult] = useState(false);
  const [maskHasBg, setMaskHasBg] = useState(false);
  const [didMaskAppear, setDidMaskAppear] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);
  const [term, setTerm] = useState("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      event.stopPropagation();
      if (event.key === "Escape") {
        hideMask();
      }
    };
    if (!isTyping && isShowingResult) {
      const elem = divRef.current;
      elem?.addEventListener("keydown", handleKeyDown);
      return () => {
        elem?.removeEventListener("keydown", handleKeyDown);
        elem?.blur();
      };
    }
  }, [isTyping, isShowingResult]);

  const DataRender = (data: T[]) => {
    const dataArray = data;
    if (renderList) {
      return renderList(dataArray, { term, clickItem: hideMask });
    } else if (renderItem) {
      return (
        <List className="rounded shadow max-h-40 overflow-y-auto" size="small">
          {[
            ...dataArray.map((item, index) => {
              const key =
                "_id" in item && typeof item._id === "string"
                  ? item._id
                  : index;
              return <List.Item key={key}>{renderItem(item, {})}</List.Item>;
            }),
            <List.Item key={"load more"}>
              <div className="flex justify-center items-center w-full">
                <Button size="small" type="link" onClick={() => loadMore?.()}>
                  Load more
                </Button>
              </div>
            </List.Item>,
          ]}
        </List>
      );
    } else {
      return null;
    }
  };

  const hideMask = () => {
    onBlur?.();
    setIsShowingResult(false);
    setMaskHasBg(false);
    clearTimeout(removeMaskTimeout.current);
    removeMaskTimeout.current = setTimeout(() => {
      setDidMaskAppear(false);
    }, 600);
  };

  const showMask = () => {
    setIsShowingResult(true);
    clearTimeout(removeMaskTimeout.current);
    setDidMaskAppear(true);
    removeMaskTimeout.current = setTimeout(() => {
      setMaskHasBg(true);
    }, 0);
  };

  return (
    <div className={`${style.searchShell}`} style={{ zIndex }} tabIndex={0}>
      {didMaskAppear && (
        <div
          className={`${style.mask} ${maskHasBg ? style.showing : ""}`}
          onClick={() => {
            hideMask();
          }}
        ></div>
      )}
      <Input.Search
        name="search"
        className={`${style.searchInput} w-full relative`}
        prefix={<SearchOutlined className={style.searchIcon} />}
        placeholder="Tìm..."
        onClear={hideMask}
        allowClear={{ clearIcon: <CloseCircleFilled className="text-xl" /> }}
        onChange={(e) => {
          setIsTyping(true);
          clearTimeout(searchTimeout.current);
          const trimmed = e.target.value.trim();
          searchTimeout.current = setTimeout(() => {
            onSearch(trimmed);
            setIsTyping(false);
            setTerm(trimmed);
          }, SEARCH_DELAY_MS);
          if (trimmed) {
            showMask();
          } else {
            hideMask();
          }
        }}
        onKeyDown={(e) => e.stopPropagation()}
        {...searchProps}
      />
      <div
        className={`${style.resultPanel} ${isShowingResult ? "opacity-100" : "opacity-0 h-0"}`}
        tabIndex={0}
        ref={divRef}
      >
        {error ? (
          <div className={"flex justify-center items-center"}>
            {error instanceof Error ? error.message : "Unknown error"}
          </div>
        ) : isLoading || isTyping ? (
          <div className="text-center p-6 bg-white w-full min-h-52">
            <Skeleton active />
          </div>
        ) : data ? (
          DataRender(data)
        ) : null}
      </div>
    </div>
  );
}
