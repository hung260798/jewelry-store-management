import { axiosClientJson } from "@/libraries/axiosClient";
import { WithId } from "@/utils/types/Entities";
import { Bar, BarConfig, Column, ColumnConfig, Pie } from "@ant-design/plots";
import { useQuery } from "@tanstack/react-query";
import { Card, Col, DatePicker, Empty, Row, Spin, Table } from "antd";
import dayjs from "dayjs";
import moment from "moment";
import { useState } from "react";
import { API_URL } from "utils/constants/URLS";

const MonthlyRevenueInfo = () => {
  const [year, setYear] = useState(moment().year());
  // const [messageApi, , key] = usePopupMessage() || [];
  const { data, isLoading, error } = useQuery({
    queryKey: ["questions/23b"],
    queryFn: () =>
      axiosClientJson
        .get<{ month: unknown; revenue: number }[]>(
          `${API_URL}/questions/23b`,
          {
            params: { year: year },
          }
        )
        .then((res) => res.data),
    refetchInterval: 60 * 1000,
  });

  let monthlyRevenuesData: { month: string; revenue: number }[] = [];
  if (data && data.length) {
    monthlyRevenuesData = data.map((item) => ({
      month: `${item.month}`,
      revenue: item.revenue,
    }));
  }
  const monthlyRevenuesConfig: ColumnConfig = {
    data: monthlyRevenuesData,
    xField: "month",
    yField: "revenue",
    seriesField: "month",
    color: "#2563eb",
    tooltip: {
      customContent: (title, items) => {
        const formattedItems = items.map((item) => {
          const formattedValue = item.value
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
          let name = item.name;
          if (name) {
            name = name.split(":")[1]?.trim(); // Extract the text after the colon and remove leading/trailing spaces
          }
          return ` ${formattedValue}`;
        });
        return `<div> Tháng ${title} :</div><div>${formattedItems.join(
          "<br/>"
        )} VND</div>`;
      },
    },
    xAxis: {
      title: {
        text: "Tháng",
        style: {
          fill: "#475569",
        },
      },
      label: {
        autoHide: true,
        autoRotate: false,
        style: {
          fill: "#475569",
          line: [4, 4],
        },
      },
      grid: {
        line: {
          style: {
            stroke: "#e2e8f0",
            lineDash: [4, 4],
          },
        },
      },
    },
    yAxis: {
      title: {
        text: "Doanh thu ",
        style: {
          fill: "#475569",
        },
      },
      label: {
        autoHide: true,
        autoRotate: false,
        style: {
          fill: "#475569",
        },
        formatter: (value) => {
          const formattedPrice = value
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
          const data = `${formattedPrice}đ`;
          return data;
        },
      },
      grid: {
        line: {
          style: {
            stroke: "#e2e8f0",
            lineDash: [4, 4],
          },
        },
      },
    },
    columnStyle: {
      radius: [5, 5, 5, 5],
    },
  };

  return (
    <Col xs={24} xl={10}>
      <Card
        className="dashboard-card dashboard-chart-card"
        title={"Doanh thu trong năm"}
        variant="borderless"
        extra={
          <DatePicker
            onChange={(value) => {
              if (value) {
                const year = value.year();
                setYear(year);
              }
            }}
            picker="year"
            value={year ? dayjs().year(year) : undefined}
          />
        }
      >
        <div className="dashboard-chart-surface">
          <Spin spinning={isLoading}>
            {monthlyRevenuesData.length ? (
              <Column {...monthlyRevenuesConfig} />
            ) : (
              <Empty description="Chưa có dữ liệu doanh thu" />
            )}
          </Spin>
        </div>
      </Card>
    </Col>
  );
};

const TopEmployeesInfo = () => {
  const [year, setYear] = useState<number>(moment().year());
  // const [messageApi, , key] = usePopupMessage() || [];
  const { data, isLoading, error } = useQuery({
    queryKey: ["questions/27b"],
    queryFn: () =>
      axiosClientJson
        .get<
          {
            firstName: string;
            lastName: string;
            total: unknown;
            month: unknown;
          }[]
        >(`${API_URL}/questions/27b`, {
          params: { year: year },
        })
        .then((res) => res.data),
    refetchInterval: 60 * 1000,
  });

  let topEmployeesData: { name: string; revenue: unknown; month: unknown }[] =
    [];
  if (data && data.length) {
    topEmployeesData = data.map((item) => ({
      name: `${item.firstName} ${item.lastName} `,
      revenue: item.total,
      month: item.month,
    }));
  }
  const config: BarConfig = {
    data: topEmployeesData,
    xField: "revenue",
    yField: "name",
    color: "#0f766e",
    xAxis: {
      title: {
        text: "Doanh thu",
        style: {
          fill: "#475569",
        },
      },
      label: {
        autoHide: true,
        autoRotate: false,
        style: {
          fill: "#475569",
          line: [4, 4],
        },
        formatter: (value) => {
          const formattedPrice = value
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
          const data = `${formattedPrice}đ`;
          return data;
        },
      },
      grid: {
        line: {
          style: {
            stroke: "#e2e8f0",
            lineDash: [4, 2],
          },
        },
      },
    },
    tooltip: {
      customContent: (title, items) => {
        const formattedItems = items.map((item) => {
          const formattedValue = item.value
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
          let name = item.name;
          if (name) {
            name = name.split(":")[1]?.trim(); // Extract the text after the colon and remove leading/trailing spaces
          }
          return ` ${formattedValue}`;
        });
        return `<div> Nhân viên ${title} :</div><div>${formattedItems.join(
          "<br/>"
        )} VND</div>`;
      },
    },
    yAxis: {
      title: {
        text: " Nhân viên",
        style: {
          fill: "#475569",
        },
      },
      label: {
        autoHide: true,
        autoRotate: false,
        style: {
          fill: "#475569",
        },
      },
      grid: {
        line: {
          style: {
            stroke: "#e2e8f0",
            lineDash: [4, 4],
          },
        },
      },
    },
    // columnStyle: {
    //   radius: [10, 10, 10, 10],
    // },
  };
  return (
    <Col xs={24} xl={14}>
      {/* {contextHolder} */}
      <Card
        className="dashboard-card dashboard-chart-card"
        title={`Top nhân viên bán hàng xuất sắc trong năm`}
        variant="borderless"
        extra={
          <DatePicker
            onChange={(value) => {
              if (value) {
                const year = value.year();
                setYear(year);
              }
            }}
            picker="year"
            value={year ? dayjs().year(year) : undefined}
          />
        }
      >
        <div className="dashboard-chart-surface">
          <Spin spinning={isLoading}>
            {topEmployeesData.length ? (
              <Bar {...config} />
            ) : (
              <Empty description="Chưa có dữ liệu nhân viên" />
            )}
          </Spin>
        </div>
      </Card>
    </Col>
  );
};

type CategorySale = WithId<{
  name: string;
  description: string;
  total: number;
}>;

const SalesByCategory = () => {
  const API = "/questions/30";
  const sales = useQuery({
    queryKey: [API],
    queryFn: () =>
      axiosClientJson.get<CategorySale[]>(API).then((res) => res.data),
    refetchInterval: 60 * 1000,
  });
  let data: typeof sales.data = sales.data || [];

  const config: Parameters<typeof Pie>[0] = {
    appendPadding: 10,
    data: data,
    angleField: "total",
    colorField: "name",
    radius: 1,
    color: [
      "#2563eb",
      "#0f766e",
      "#ea580c",
      "#7c3aed",
      "#dc2626",
      "#64748b",
      "#ba510c",
      "#2a510c",
      "#ba910c",
    ],
    label: {
      type: "inner",
      content: ({ percent }) =>
        percent > 0 ? `${(percent * 100).toFixed(0)}%` : "",
      style: {
        textAlign: "center",
        fontSize: 14,
        fill: "#fff",
        fontWeight: 700,
      },
    },
    interactions: [
      {
        type: "element-active",
      },
    ],
  };

  return (
    <Col xs={24} xl={12}>
      <Card
        className="dashboard-card dashboard-chart-card"
        title={"Phân bố theo danh mục"}
        variant="borderless"
      >
        <div className="dashboard-chart-surface">
          {data.length ? (
            <Pie {...config} />
          ) : (
            <Empty description="Chưa có dữ liệu" />
          )}
        </div>
      </Card>
    </Col>
  );
};

const BestSellerByTime = () => {
  const API = "/questions/20";
  const sales = useQuery({
    queryKey: [API],
    queryFn: () => axiosClientJson.get<any[]>(API).then((res) => res.data),
    refetchInterval: 60 * 1000,
  });
  let data: typeof sales.data = sales.data || [];
  return (
    <Col xs={24} xl={12}>
      <Card
        className="dashboard-card dashboard-chart-card"
        title={"Top bán chạy nhất"}
        variant="borderless"
      >
        <div className="dashboard-chart-surface">
          {data.length ? (
            <Table
              dataSource={data}
              columns={[{ dataIndex: "name" }, { dataIndex: "sold" }]}
            />
          ) : (
            <Empty description="Chưa có dữ liệu" />
          )}
        </div>
      </Card>
    </Col>
  );
};

const GeneralInformation = () => {
  return (
    <div className="dashboard-section">
      <div className="dashboard-section-header">
        <h2 className="dashboard-section-title">Tổng quát</h2>
        <span className="dashboard-section-note">
          Doanh thu và hiệu suất bán hàng
        </span>
      </div>
      <Row gutter={[{ xs: 10, sm: 14, md: 18, lg: 20 }, 20]}>
        <MonthlyRevenueInfo />
        <TopEmployeesInfo />
        <SalesByCategory />
        <BestSellerByTime />
      </Row>
    </div>
  );
};

export default GeneralInformation;
