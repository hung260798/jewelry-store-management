import AppSearch from "@/components/AppSearch";
import PopupContextProvider from "@/components/Providers/PopupContext";
import {
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { QueryClientProvider } from "@tanstack/react-query";
import { Badge, Button, Dropdown, Flex, Layout, Space, Spin } from "antd";
import Avatar from "antd/es/avatar/Avatar";
import { AuthUser, useAuthStore, useUser } from "hooks/stores/useAuthStore";
import numeral from "numeral";
import "numeral/locales/vi";
import React, { memo, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { ASSET_URL } from "utils/constants/URLS";
import "./App.css";
import ErrorBoundary from "./components/ErrorBoundary";
import MainContent from "./components/MainContent";
import MainMenu from "./components/MainMenu";
import Error from "./components/Placeholders/Error";
import useParam from "./hooks/stores/useParam";
import useMyQuery from "./hooks/useMyQuery";
import usePopupMessage from "./hooks/usePopupMessage";
import useWindowWidth from "./hooks/useWidth";
import { queryClient } from "./libraries/react-query";
import Login from "./pages/Auth/Login";
import NotFoundPage from "./pages/NotFoundPage";
import { bindNoti, bindUser } from "./utils/constants/socket";
import { appendDomain } from "./utils/stringUtils";
import { GetMany, Order } from "./utils/types/Entities";

numeral.locale("vi");

const MemoSearchBox = memo(AppSearch);

const App: React.FC = () => {
  return (
    <ErrorBoundary fallback={<Error />}>
      <QueryClientProvider client={queryClient}>
        <PopupContextProvider>
          <BrowserRouter>
            <InnerApp />
          </BrowserRouter>
        </PopupContextProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

const InnerApp = () => {
  const authenticatedUser = useUser();
  const loadingAuth = useAuthStore((s) => s.loading);
  const contextHolder = usePopupMessage()?.[1];

  let content = <></>;

  if (loadingAuth) {
    content = (
      <div className="flex flex-col gap-2 justify-center items-center min-h-screen">
        <Spin size="large" />
        Đang tải dữ liệu
      </div>
    );
  } else if (!authenticatedUser?._id) {
    content = (
      <Layout.Content style={{ padding: 24 }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout.Content>
    );
  } else {
    content = <AuthenticatedInnerApp authenticatedUser={authenticatedUser} />;
  }
  return (
    <>
      {contextHolder}
      {content}
    </>
  );
};

const AuthenticatedInnerApp = ({
  authenticatedUser,
}: {
  authenticatedUser: AuthUser;
}) => {
  const windowWidth = useWindowWidth();
  const isSmallScreen = windowWidth < 640;
  const messageAPI = usePopupMessage()?.[0];
  const waitingOrders = useMyQuery<GetMany<Order>>({
    url: `/orders`,
    queryKey: ["orders-noti"],
    initParams: {
      status: "WAITING",
      skip: "0",
      limit: "10",
      sortBy: "_id",
      sortOrder: "1",
    },
    usePrivateParams: true,
  });

  useEffect(() => {
    if (authenticatedUser) {
      bindUser(authenticatedUser._id);
      bindNoti("server-message", (data) => {
        messageAPI?.info(data, 1.5);
      });
    }
  }, [authenticatedUser]);

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    const savedState = localStorage.getItem("sider_collapsed");
    // Nếu đã từng lưu thì dùng giá trị đó, nếu chưa thì mặc định là false (mở)
    return savedState ? JSON.parse(savedState) : false;
  });

  useEffect(() => {
    localStorage.setItem("sider_collapsed", JSON.stringify(collapsed));
  }, [collapsed]);

  const collapseToggleLabel = collapsed ? "Open sidebar" : "Close sidebar";
  const collapseToggleIcon = collapsed ? (
    <MenuUnfoldOutlined />
  ) : (
    <MenuFoldOutlined />
  );
  const navigate = useNavigate();
  const setParam = useParam((s) => s.setSearchParams);

  return (
    <Layout>
      <Layout.Sider
        className="appSider"
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        style={{
          overflow: "auto",
          minHeight: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          minWidth: isSmallScreen ? 0 : "300px",
          zIndex: 1000,
        }}
        breakpoint="lg"
        width={isSmallScreen ? "100%" : 300}
        collapsedWidth={isSmallScreen ? 0 : 100}
      >
        <Flex
          className="appSiderProfile"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1001,
            width: "100%",
          }}
          justify="center"
        >
          <div
            className="m-4 grid place-items-center text-[1.1rem] py-0 px-2.5 cursor-pointer hover:bg-slate-100 rounded-xl"
            onClick={() => {
              navigate("/account/information");
            }}
          >
            {collapsed ? (
              <Avatar
                src={appendDomain(authenticatedUser.imageUrl || "", ASSET_URL)}
                size={44}
              />
            ) : (
              <>
                <Space>
                  <Avatar
                    src={appendDomain(
                      authenticatedUser.imageUrl || "",
                      ASSET_URL
                    )}
                    size={44}
                  />
                  {`${authenticatedUser.firstName} ${authenticatedUser.lastName}`}
                </Space>
              </>
            )}
          </div>
          {isSmallScreen && (
            <Flex justify="center" align="center">
              <Button
                type="text"
                className="appSiderToggle appSiderToggleInSider"
                aria-label={collapseToggleLabel}
                title={collapseToggleLabel}
                icon={collapseToggleIcon}
                onClick={() => {
                  setCollapsed(!collapsed);
                }}
              />
            </Flex>
          )}
        </Flex>
        {/* <div style={{ height: 48 }}></div> */}
        <MainMenu user={authenticatedUser} />
      </Layout.Sider>
      <Layout.Content
        style={{
          minHeight: "100vh",
          overflow: "hidden",
          marginLeft: isSmallScreen ? 0 : collapsed ? "100px" : "300px",
        }}
        className={"mainLayout"}
      >
        <div className="p-0 bg-transparent">
          <div className="appTopbar flex items-center">
            <div>
              <Button
                type="text"
                className="appSiderToggle"
                aria-label={collapseToggleLabel}
                title={collapseToggleLabel}
                icon={collapseToggleIcon}
                onClick={() => {
                  setCollapsed(!collapsed);
                }}
              />
            </div>
            <div className="grow flex flex-col justify-center items-center">
              <div className="w-full flex justify-center items-center">
                <div className={`${!isSmallScreen ? `px-5` : "px-1"} grow`}>
                  <MemoSearchBox />
                </div>
                <Dropdown
                  trigger={["click"]}
                  menu={{
                    items: [
                      {
                        icon: <BellOutlined />,
                        key: "waiting-orders",
                        title: "AVCDF",
                        label: `Bạn có ${waitingOrders?.query?.data?.amountResults || 0} đơn hàng đang chờ xác nhận`,
                        onClick: () => {
                          setParam({
                            skip: "0",
                            limit: "10",
                            sortBy: "_id",
                            sortOrder: "1",
                            status: "WAITING",
                          });
                          navigate("/order/orders", {
                            viewTransition: true,
                          });
                        },
                      },
                    ],
                  }}
                >
                  <Badge
                    count={waitingOrders?.query?.data?.amountResults ? 1 : 0}
                    showZero
                    offset={[-3, 5]}
                  >
                    <Button
                      icon={<BellOutlined style={{ fontSize: "1.15rem" }} />}
                      size="large"
                    />
                  </Badge>
                </Dropdown>
              </div>
            </div>
          </div>
        </div>
        <MainContent />
      </Layout.Content>
    </Layout>
  );
};

export default App;
