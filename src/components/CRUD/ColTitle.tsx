import { MyQueryReturnType } from "@/hooks/useMyQuery";
import { Badge } from "antd";

const ColTitle = ({
  paramKey,
  label,
  searchParams,
}: {
  paramKey: string;
  label: string;
  searchParams: MyQueryReturnType<unknown>["searchParams"];
}) => (
  <Badge dot={searchParams.has(paramKey)} size="default">
    <div>{label}</div>
  </Badge>
);

export default ColTitle;
