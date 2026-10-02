import { MessageInstance } from "antd/es/message/interface";
import { createContext, useContext } from "react";

export const PopupContext = createContext<
  null | [MessageInstance, React.ReactElement, string]
>(null);

export default function usePopupMessage() {
  return useContext(PopupContext);
}
