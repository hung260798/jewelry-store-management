import { PopupContext } from "@/hooks/usePopupMessage";
import { message } from "antd";

type PopupContextProviderProps = {
  children: React.ReactNode;
};

const PopupContextProvider: React.FC<PopupContextProviderProps> = ({
  children,
}: PopupContextProviderProps) => {
  const [messageApi, contextHolder] = message.useMessage();
  const key = "updatable-msg";
  return (
    <PopupContext.Provider value={[messageApi, contextHolder, key]}>
      {children}
    </PopupContext.Provider>
  );
};

export default PopupContextProvider;
