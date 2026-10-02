import CRUD from "@/components/CRUD";
import SmartImage from "@/components/Images/Lazy/SmartImage";
import { getSortOrder } from "@/utils/stringUtils";
import { FormControl } from "@/utils/types/Form";
import { Badge, DatePicker, Input, Select, Space, Switch, Tag } from "antd";
import locale from "antd/es/date-picker/locale/en_US";
import Search from "antd/es/input/Search";
import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useGetListQuery } from "hooks/useMyQuery";
import { Active, Customer, WithId } from "utils/types/Entities";

const formItems: FormControl[] = [
  {
    label: "Id",
    name: "_id",
    className: "hidden",
    component: <Input disabled readOnly />,
    defaultValue: "",
  },
  {
    label: "Email",
    name: "email",
    rules: [{ required: true, message: "Please input Email!" }],
    component: <Input />,
    defaultValue: "",
  },
  {
    label: "Tên",
    name: "firstName",
    rules: [{ required: true, message: "Please input First name!" }],
    component: <Input />,
    defaultValue: "",
  },
  {
    label: "Họ",
    name: "lastName",
    rules: [{ required: true, message: "Please input Last name!" }],
    component: <Input />,
    defaultValue: "",
  },
  {
    label: "Số điện thoại",
    name: "phoneNumber",
    rules: [{ required: true, message: "Please input Phone number!" }],
    component: <Input />,
    defaultValue: "",
  },
  // {
  //   label: "Mật khẩu",
  //   name: "password",
  //   rules: {
  //     add: [
  //       {
  //         required: true,
  //         message: "Please input password!",
  //       },
  //     ],
  //     update: [],
  //   },
  //   component: <Input.Password />,
  //   defaultValue: "",
  // },
  {
    label: "Địa chỉ",
    name: "address",
    rules: [{ required: true, message: "Please input Address!" }],
    component: <Input />,
    defaultValue: "",
  },
  {
    label: "Bị khóa",
    name: "Locked",
    component: <Switch />,
    valuePropName: "checked",
    defaultValue: false,
  },
  {
    label: "Ghi chú",
    name: "note",
    component: <Input />,
    defaultValue: "",
  },
  {
    label: "Ngày sinh",
    name: "birthday",
    rules: [{ required: true, message: "Please input Birthday!" }],
    component: (
      <DatePicker
        size="middle"
        placement="bottomLeft"
        format="YYYY-MM-DD"
        locale={locale}
      />
    ),
    getValueProps: (value) => {
      return {
        value: value ? dayjs(value, { format: "YYYY-MM-DD" }) : undefined,
      };
    },
    // getValueFromEvent: (date) => {
    //   console.log("get from event")
    //   return date ? date.format("YYYY-MM-DD") : null;
    // },
    // onSubmit: (date) => {
    //   return date ? dayjs(date).format("YYYY-MM-DD") : null;
    // },
    normalize: (date) => {
      return date ? dayjs(date).format("YYYY-MM-DD") : null;
    },
    defaultValue: dayjs(Date(), { format: "YYYY-MM-DD" }),
  },
];

const { RangePicker } = DatePicker;
dayjs.extend(customParseFormat);
const dateFormat = "DD/MM/YYYY";

type CustomerWithId = WithId<Customer> & Active & { Locked: boolean };

export default function CustomerCRUD() {
  const queryProps = {
    url: "/customers",
    queryKey: ["customers"],
    // initData: { results: [], amountResults: 0 },
  };
  const queryResult = useGetListQuery<CustomerWithId>(queryProps);

  const { searchItems, searchParams } = queryResult;

  const renderTitle = (paramKey: string, label: string) => <div>{label}</div>;

  //Setting column
  const columns: ColumnsType<CustomerWithId> = [
    //NO
    {
      title: () => {
        return (
          <div>
            {searchParams.get("Locked") ? (
              <div className="text-danger">No</div>
            ) : (
              <div className="secondary">No</div>
            )}
          </div>
        );
      },
      dataIndex: "id",
      key: "id",
      render: (text: string, record, index: number) => {
        return (
          <div>
            <Space>
              {index + 1}
              {!record.Locked && (
                <span style={{ fontSize: "16px", color: "#08c" }}>
                  {/* <CheckCircleOutlined /> Active */}
                  <Tag color="green">ACTIVE</Tag>
                </span>
              )}
              {record.Locked === true && (
                <span style={{ fontSize: "16px", color: "#dc3545" }}>
                  {/* <CheckCircleOutlined /> Locked */}
                  <Tag color="gold">LOCKED</Tag>
                </span>
              )}
            </Space>
          </div>
        );
      },
      filterDropdown: () => {
        return (
          <>
            <div>
              <Select
                allowClear
                style={{ width: "125px" }}
                placeholder="Select a supplier"
                optionFilterProp="children"
                showSearch
                onChange={(e) => {
                  searchItems([
                    { type: "Locked", value: e },
                    { type: "skip", value: "0" },
                  ]);
                }}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={[
                  {
                    value: "false",
                    label: "Active",
                  },

                  {
                    value: "true",
                    label: "Locked",
                  },
                ]}
              />
            </div>
          </>
        );
      },
      className: "w-[9rem]",
      responsive: ["xl", "xxl"],
    },
    //IMAGE
    {
      width: "110px",
      title: "Ảnh đại diện",
      key: "imageUrl",
      dataIndex: "imageUrl",
      render: (url, record) => {
        return (
          <div className="flex justify-center items-center  w-27.5 h-26">
            {url && (
              <SmartImage
                src={url}
                smallSizes={[[100, 150]]}
                alt="record.imageUrl"
                width={100}
                height={100}
                fallback="/placeholder-image.jpg"
              />
            )}
          </div>
        );
      },
      responsive: ["md"],
      className: "w-[9rem]",
    },
    //Email
    {
      title: () => renderTitle("email", "Email"),
      dataIndex: "email",
      key: "email",
      sorter: true,
      sortOrder: getSortOrder(searchParams.toString(), "email"),
      filterDropdown: () => {
        return (
          <div style={{ padding: 8 }}>
            <Search
              allowClear
              onSearch={(e) => {
                searchItems([
                  { type: "email", value: e },
                  { type: "skip", value: "0" },
                ]);
              }}
              placeholder="Enter email"
              // style={{ width: "200px" }}
            />
          </div>
        );
      },
      responsive: ["lg", "xl"],
      className: "w-[12rem]",
    },
    //Phone number
    {
      title: () => renderTitle("phoneNumber", "Số điện thoại"),
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      filterDropdown: () => {
        return (
          <div style={{ padding: 8 }}>
            <Search
              onSearch={(e) => {
                const searchValue = { type: "phoneNumber", value: e };
                searchItems([searchValue, { type: "skip", value: "0" }]);
              }}
              allowClear
              placeholder="Enter phone number"
              style={{ width: "200px" }}
            />
          </div>
        );
      },
      responsive: ["lg"],
      width: "120px",
      className: "w-[9rem]",
    },
    //First Name
    {
      title: () => renderTitle("firstName", "Tên khách hàng"),
      dataIndex: "firstName",
      key: "firstName",
      sorter: true,
      sortOrder: getSortOrder(searchParams.toString(), "firstName"),
      filterDropdown: () => {
        return (
          <div style={{ padding: 8 }}>
            <Search
              allowClear
              placeholder="Enter first name"
              onSearch={(e) => {
                const searchValue = { type: "firstName", value: e };
                searchItems([searchValue, { type: "skip", value: "0" }]);
              }}
              style={{ width: "200px" }}
            />
          </div>
        );
      },
      width: "160px",
      className: "w-[9rem]",
    },
    //Last Name
    {
      title: () => renderTitle("lastName", "Họ đệm"),
      dataIndex: "lastName",
      key: "lastName",
      sorter: true,
      sortOrder: getSortOrder(searchParams.toString(), "lastName"),
      filterDropdown: () => {
        return (
          <div style={{ padding: 8 }}>
            <Search
              allowClear
              onSearch={(e) => {
                const searchValue = { type: "lastName", value: e };
                searchItems([searchValue, { type: "skip", value: "0" }]);
              }}
              placeholder="Enter last name"
              style={{ width: "200px" }}
            />
          </div>
        );
      },
      width: "160px",
      className: "w-[9rem]",
    },
    //Birthday
    {
      title: () => {
        return (
          <div>
            {searchParams.get("birthdayFrom") ||
            searchParams.get("birthdayTo") ? (
              <div className="text-danger">Ngày sinh</div>
            ) : (
              <div className="secondary">Ngày sinh</div>
            )}
          </div>
        );
      },
      dataIndex: "birthday",
      key: "birthday",
      render: (birthday) => {
        const formattedBirthday = dayjs(birthday).format("DD/MM/YYYY");
        return <span>{formattedBirthday}</span>;
      },
      sorter: true,
      sortOrder: getSortOrder(searchParams.toString(), "birthday"),
      filterDropdown: () => {
        return (
          <div style={{ padding: 8 }}>
            <RangePicker
              allowClear
              defaultValue={[
                dayjs("01/01/1900", dateFormat),
                dayjs("01/01/2023", dateFormat),
              ]}
              format={dateFormat}
              onChange={async (e) => {
                const searchValues: { type: string; value?: string }[] = [
                  { type: "birthdayFrom", value: undefined },
                  { type: "birthdayTo", value: undefined },
                ];
                const data = e?.map((date) => dayjs(date).format("YYYY/MM/DD"));
                if (data) {
                  searchValues[0] = { type: "birthdayFrom", value: data[0] };
                  searchValues[1] = { type: "birthdayTo", value: data[1] };
                }
                searchItems([...searchValues, { type: "skip", value: "0" }]);
              }}
            />
          </div>
        );
      },
      responsive: ["lg"],
      width: "80px",
      className: "w-[9rem]",
    },
    //Address
    {
      title: () => renderTitle("address", "Địa chỉ"),
      dataIndex: "address",
      key: "address",
      filterDropdown: () => {
        return (
          <div style={{ padding: 8 }}>
            <Search
              allowClear
              onSearch={(e) => {
                const searchValue = { type: "address", value: e };
                searchItems([searchValue, { type: "skip", value: "0" }]);
              }}
              placeholder="Enter address"
              style={{ width: 200 }}
            />
          </div>
        );
      },
      responsive: ["xl"],
      width: "180px",
      className: "w-[9rem]",
    },
    //Note
    // {
    //   title: "Ghi chú",
    //   dataIndex: "note",
    //   key: "note",
    //   width: 100,
    //   responsive: ["xl"],
    // },
    // Created date
    {
      title: (
        <div
          className={
            searchParams.get("createdDateFrom") ||
            searchParams.get("createdDateTo")
              ? "text-danger"
              : "secondary"
          }
        >
          Ngày đăng ký
        </div>
      ),
      dataIndex: "createdDate",
      key: "createdDate",
      width: "100px",
      responsive: ["xl"],
      render: (createdDate) => {
        const formattedDate = dayjs(createdDate).format("DD/MM/YYYY");
        return <span>{formattedDate}</span>;
      },
      filterDropdown: () => {
        return (
          <div style={{ padding: 8 }}>
            <RangePicker
              allowClear
              defaultValue={[
                dayjs("01/01/1900", dateFormat),
                dayjs("01/01/2023", dateFormat),
              ]}
              format={dateFormat}
              onChange={async (e) => {
                const searchValues: { type: string; value?: string }[] = [
                  { type: "createdDateFrom", value: undefined },
                  { type: "createdDateTo", value: undefined },
                ];
                const data = e?.map((date) => dayjs(date).format("YYYY/MM/DD"));
                if (data) {
                  searchValues[0] = { type: "createdDateFrom", value: data[0] };
                  searchValues[1] = { type: "createdDateTo", value: data[1] };
                }
                searchItems([...searchValues, { type: "skip", value: "0" }]);
              }}
            />
          </div>
        );
      },
      sorter: true,
      sortOrder: getSortOrder(searchParams.toString(), "createdDate"),
      className: "w-[9rem]",
    },
    // Số đơn hàng
    {
      title: () => renderTitle("orderCount", "Số đơn hàng"),
      dataIndex: "orderCount",
      key: "orderCount",
      sorter: true,
      sortOrder: getSortOrder(searchParams.toString(), "orderCount"),
      width: "100px",
      responsive: ["xl"],
      render: (orderCount) => {
        return <span>{orderCount ?? 0}</span>;
      },
      className: "w-[9rem]",
    },
  ];

  return (
    <CRUD
      columns={columns}
      collectionName="customers"
      form={{ controls: formItems, title: "Khách hàng" }}
      fileFields={[
        {
          name: "imageUrl",
          fileType: "image",
          label: "Image",
          maxCount: 1,
          sizes: [[100, 150]],
        },
      ]}
      query={queryResult}
      uploadModalTitle={(customer) =>
        customer ? `${customer?.firstName} ${customer?.lastName}` : "customers"
      }
      createFormValues={(r) =>
        r ?? {
          firstName: "",
          lastName: "",
          birthday: Date.now(),
          phoneNumber: "",
          address: "",
          email: "",
          locked: false,
          active: true,
          isDeleted: false,
          note: "",
        }
      }
    />
  );
}
