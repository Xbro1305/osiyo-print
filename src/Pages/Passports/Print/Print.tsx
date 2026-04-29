import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaCheck, FaPen, FaPlus } from "react-icons/fa";
import { LuShare, LuTrash2 } from "react-icons/lu";
import { NumericFormat } from "react-number-format";
import { toast } from "react-toastify";
import { MultipleSelect } from "../../../Components/MultipleSelect";
import { DesignSelect } from "../../../Components/DesignSelect";

interface ICloth {
  id: string;
  name: string;
}

interface IUserInfo {
  id: string;
  name: string;
  role: string;
  shift: string;
}

interface IPassData {
  _id?: string;
  passNo?: string;
  date?: string;
  cloth?: ICloth;
  length?: number;
  user?: IUserInfo;
}

interface Data {
  _id?: string;
  passNo: string;
  date?: string;
  user?: IUserInfo;
  gazapalIds?: { id: number | string; value: string }[];
  gazapals?: IPassData[] | IPassData;
  order?: {
    name?: string;
    cloth?: string;
    length?: number;
    printed?: number;
    stretch?: number;
    status?: boolean;
  };
  designArt: string;
  design?: {
    imageUrl?: string;
    image?: string;
    article: string;
    cloth?: string;
    amount?: number;
    id?: string;
  };
}

interface GroupedData {
  _id: Record<string, string | number | boolean>;
  count: number;
  items: Data[];
  totalGazapalLength?: number;
  totalOrderLength?: number;
  totalPrinted?: number;
}

interface User {
  _id: string;
  firstname: string;
  lastname: string;
  role: string;
}

const rowClass =
  "grid grid-cols-[30px_150px_150px_250px_150px_150px_200px_250px_250px_150px_150px_200px_150px_minmax(200px,1fr)_150px_50px] w-full gap-[10px] p-lg text-primary border-b border-primary items-center min-w-fit";

const headerClass =
  "grid grid-cols-[30px_150px_150px_250px_150px_150px_200px_250px_250px_150px_150px_200px_150px_minmax(200px,1fr)_150px_50px] w-full gap-[10px] p-lg bg-secondary text-primary rounded-t-[8px] border-b border-primary min-w-fit";

const groupOptions = [
  { label: "Passport No.", value: "passNo" },
  { label: "Sana", value: "date" },
  { label: "Zakaz", value: "order.name" },
  { label: "Zakaz matosi", value: "order.cloth" },
  { label: "Holat", value: "order.status" },
  { label: "Design", value: "designArt" },
  { label: "Operator", value: "user.name" },
  { label: "Smena", value: "user.shift" },
  { label: "Gazapal passporti", value: "gazapals.passNo" },
  { label: "Gazapal matosi", value: "gazapals.cloth.name" },
];

const getGazapalsArray = (gazapals: any) => {
  if (!gazapals) return [];
  return Array.isArray(gazapals) ? gazapals : [gazapals];
};

const formatGroupValue = (key: string, value: string | number | boolean) => {
  if (key === "order_status") {
    return value ? "Tugallangan" : "Jarayonda";
  }

  return value || "Bo'sh";
};

const getGroupTitle = (group: GroupedData) =>
  Object.entries(group._id)
    .map(([key, value]) => {
      const option = groupOptions.find(
        (item) => item.value.replace(/\./g, "_") === key
      );

      return `${option?.label || key}: ${formatGroupValue(key, value)}`;
    })
    .join(" | ");

const getGroupGazapalLength = (group: GroupedData) =>
  group.totalGazapalLength ??
  group.items.reduce((sum, item) => {
    const total = getGazapalsArray(item.gazapals).reduce(
      (innerSum, gazapal) => innerSum + Number(gazapal.length || 0),
      0
    );

    return sum + total;
  }, 0);

const getGroupOrderLength = (group: GroupedData) =>
  group.totalOrderLength ??
  group.items.reduce((sum, item) => sum + Number(item.order?.length || 0), 0);

const getGroupPrinted = (group: GroupedData) =>
  group.totalPrinted ??
  group.items.reduce((sum, item) => sum + Number(item.order?.printed || 0), 0);

export const Print = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [prints, setPrint] = useState<Data[]>([]);
  const [groupedData, setGroupedData] = useState<GroupedData[]>([]);
  const [groupKeys, setGroupKeys] = useState<string[]>([]);
  const [groupModalOpen, setGroupModalOpen] = useState<boolean>(false);
  const [isGrouped, setIsGrouped] = useState<boolean>(false);
  const [adding, setAdding] = useState<Data | null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [gazapal, setGazapal] = useState<IPassData[] | null>(null);
  const [deleting, setDeleting] = useState<Data | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [items, setItems] = useState<any[] | null>(null);
  const [query, setQuery] = useState<string>("");

  const baseUrl = import.meta.env.VITE_APP_API_URL;
  const user: User = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token") || "";

  const refresh = () =>
    axios(`${baseUrl}/printing/prints`)
      .then((res) => setPrint(res.data.prints))
      .catch(() => toast.error("Nimadir xato"))
      .finally(() => setLoading(false));

  useEffect(() => {
    axios(`${baseUrl}/printing/gazapal`)
      .then((res) => setGazapal(res.data.gazapal))
      .catch(() => toast.error("Nimadir xato"));

    refresh();
  }, []);

  useEffect(() => {
    getByQuery();
  }, [query]);

  const getByQuery = () => {
    axios(`${baseUrl}/designs?article=${query}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => setItems(res.data.innerData || []))
      .catch((err) => console.error("Error fetching items:", err))
      .finally(() => setLoading(false));
  };

  const handleGroupKeyChange = (key: string) => {
    setGroupKeys((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const groupData = () => {
    if (!groupKeys.length) {
      toast.info("Guruhlash uchun kamida bitta maydon tanlang.");
      return;
    }

    setLoading(true);
    setAdding(null);
    setEditing(null);

    axios(`${baseUrl}/printing/prints/group`, {
      method: "GET",
      params: { keys: groupKeys.join(",") },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => {
        setGroupedData(res.data.grouped || []);
        setIsGrouped(true);
        setGroupModalOpen(false);
      })
      .catch((err) => toast.error(err.response?.data?.msg || "Nimadir xato"))
      .finally(() => setLoading(false));
  };

  const clearGrouping = () => {
    setIsGrouped(false);
    setGroupedData([]);
    setGroupKeys([]);
    setGroupModalOpen(false);
    refresh();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      ...adding,
      order: {
        ...adding?.order,
        stretch: adding?.order?.length
          ? Math.round(
              ((adding?.order?.printed || 0) * 100) /
                (adding?.order?.length || 1) -
                100
            )
          : 0,
      },
    };

    axios(`${baseUrl}/printing/prints`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      data,
    })
      .then((res) => {
        toast.success(res.data.message || res.data.msg);
        setAdding(null);
        setIsGrouped(false);
        setGroupedData([]);
      })
      .catch((err) => toast.error(err.response?.data?.msg || "Nimadir xato"))
      .finally(() => refresh());
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    axios(`${baseUrl}/printing/prints/${editing?._id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      data: editing,
    })
      .then((res) => {
        toast.success(res.data.message || res.data.msg);
        setEditing(null);
        setIsGrouped(false);
        setGroupedData([]);
      })
      .catch((err) => toast.error(err.response?.data?.msg || "Nimadir xato"))
      .finally(() => refresh());
  };

  const exportExcel = async () => {
    try {
      const response = await axios.post(
        `${baseUrl}/printing/prints/export`,
        { ids: selectedIds },
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", "prints.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Export qilishda xatolik");
    }
  };

  const groupDelete = () => {
    if (selectedIds.length === 0) {
      toast.info("Iltimos, o'chirmoqchi bo'lgan yozuvlarni tanlang.");
      return;
    }

    if (
      !window.confirm("Haqiqatan ham tanlangan yozuvlarni o'chirmoqchimisiz?")
    ) {
      return;
    }

    setLoading(true);

    axios(`${baseUrl}/printing/prints/group`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      data: { ids: selectedIds },
    })
      .then((res) => {
        toast.success(res.data.message || res.data.msg);
        setSelectedIds([]);
        setIsGrouped(false);
        setGroupedData([]);
      })
      .catch((err) => toast.error(err.response?.data?.msg || "Nimadir xato"))
      .finally(() => refresh());
  };

  return (
    <div className="flex flex-col gap-[24px] p-[50px]">
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-[#00000070] flex items-center justify-center z-50">
          <div className="bg-secondary p-5xl rounded-xl text-primary text-2xl">
            Yuklanmoqda...
          </div>
        </div>
      )}

      {groupModalOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-[#00000070] flex items-center justify-center z-40">
          <div className="bg-secondary text-primary rounded-xl p-xl w-[430px] max-w-[90%] flex flex-col gap-[18px]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl">Guruhlash</h2>
              <button
                className="text-[24px]"
                onClick={() => setGroupModalOpen(false)}
              >
                &times;
              </button>
            </div>

            <div className="flex flex-col gap-[10px]">
              {groupOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-[10px] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={groupKeys.includes(option.value)}
                    onChange={() => handleGroupKeyChange(option.value)}
                  />
                  {option.label}
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-[10px]">
              <button
                className="p-sm rounded border border-primary px-lg"
                onClick={clearGrouping}
              >
                Tozalash
              </button>
              <button
                className="p-sm rounded bg-primary text-secondary px-lg"
                onClick={groupData}
              >
                Guruhlash
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-[10px] justify-end text-primary">
        <button
          className="p-sm rounded bg-secondary w-fit flex items-center gap-[10px] px-lg"
          onClick={() => {
            setIsGrouped(false);
            setGroupedData([]);
            setAdding({
              passNo: "",
              date: new Date().toISOString().slice(0, 10),
              user: {
                id: user._id,
                name: `${user.firstname} ${user.lastname}`,
                role: user.role,
                shift: "",
              },
              designArt: "",
            });
          }}
        >
          <FaPlus /> Qo'shish
        </button>

        <button
          className="p-sm rounded bg-secondary w-fit px-lg"
          onClick={() => setGroupModalOpen(true)}
        >
          Guruhlash
        </button>

        {isGrouped && (
          <button
            className="p-sm rounded bg-secondary w-fit px-lg"
            onClick={clearGrouping}
          >
            Oddiy jadval
          </button>
        )}

        <button
          className="p-sm rounded bg-secondary w-fit flex items-center gap-[10px] px-lg"
          onClick={exportExcel}
        >
          <LuShare /> Export
        </button>

        <button
          className="p-sm rounded bg-secondary w-fit flex items-center gap-[10px] px-lg"
          onClick={groupDelete}
        >
          <LuTrash2 /> O'chirib tashlash
        </button>
      </div>

      <div className="flex flex-col max-w-full w-full overflow-x-auto">
        <div className={headerClass}>
          <p></p>
          <p>Passport No.</p>
          <p>Sana</p>
          <p>Gazapal</p>
          <p>Mato nomi</p>
          <p>Xom miqdori</p>
          <p>Zakaz</p>
          <p>Zakaz matosi</p>
          <p>Design</p>
          <p>Zakaz metri</p>
          <p>Bosildi</p>
          <p>Zakazga qo'shildi</p>
          <p>Holat</p>
          <p>Operator</p>
          <p>Smena</p>
          <p></p>
        </div>

        {!isGrouped &&
          prints.map((row) =>
            editing?._id === row._id ? (
              <PrintRow
                key={row._id}
                value={editing}
                gazapal={gazapal as any[]}
                user={user}
                items={items as any[]}
                query={query}
                setQuery={setQuery}
                onChange={setEditing}
                onCancel={() => setEditing(null)}
                onSubmit={() =>
                  handleEdit(new Event("submit") as unknown as React.FormEvent)
                }
              />
            ) : (
              <PrintRow
                key={row._id}
                value={row}
                gazapal={gazapal as any[]}
                user={user}
                items={items as any[]}
                query={query}
                readOnly
                setEditing={setEditing}
                setDeleting={setDeleting}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
              />
            )
          )}

        {!isGrouped && adding && (
          <PrintRow
            key="adding-row"
            value={adding}
            gazapal={gazapal as any[]}
            user={user}
            items={items as any[]}
            query={query}
            setQuery={setQuery}
            onChange={setAdding}
            onCancel={() => setAdding(null)}
            onSubmit={() =>
              handleSubmit(new Event("submit") as unknown as React.FormEvent)
            }
          />
        )}

        {isGrouped &&
          groupedData.map((group, index) => (
            <div key={index} className="flex flex-col min-w-fit w-full">
              <div className="grid grid-cols-[1fr_160px_190px_190px_190px] gap-[10px] p-lg bg-secondary text-primary border-b border-primary min-w-fit w-full">
                <p>{getGroupTitle(group)}</p>
                <p>Yozuvlar: {group.count}</p>
                <p>
                  Xom:{" "}
                  <NumericFormat
                    value={getGroupGazapalLength(group)}
                    thousandSeparator=" "
                    displayType="text"
                    suffix=" metr"
                  />
                </p>
                <p>
                  Zakaz:{" "}
                  <NumericFormat
                    value={getGroupOrderLength(group)}
                    thousandSeparator=" "
                    displayType="text"
                    suffix=" metr"
                  />
                </p>
                <p>
                  Bosildi:{" "}
                  <NumericFormat
                    value={getGroupPrinted(group)}
                    thousandSeparator=" "
                    displayType="text"
                    suffix=" metr"
                  />
                </p>
              </div>

              {group.items.map((row) =>
                editing?._id === row._id ? (
                  <PrintRow
                    key={row._id}
                    value={editing}
                    gazapal={gazapal as any[]}
                    user={user}
                    items={items as any[]}
                    query={query}
                    setQuery={setQuery}
                    onChange={setEditing}
                    onCancel={() => setEditing(null)}
                    onSubmit={() =>
                      handleEdit(
                        new Event("submit") as unknown as React.FormEvent
                      )
                    }
                  />
                ) : (
                  <PrintRow
                    key={row._id}
                    value={row}
                    gazapal={gazapal as any[]}
                    user={user}
                    items={items as any[]}
                    query={query}
                    readOnly
                    setEditing={setEditing}
                    setDeleting={setDeleting}
                    selectedIds={selectedIds}
                    setSelectedIds={setSelectedIds}
                  />
                )
              )}
            </div>
          ))}
      </div>

      {deleting && (
        <div className="fixed top-0 left-0 w-full h-full bg-[#00000070] flex items-center justify-center z-50">
          <div className="bg-secondary p-5xl rounded-xl text-primary text-2xl flex flex-col gap-lg">
            <p>Haqiqatan ham ushbu yozuvni o'chirmoqchimisiz?</p>
            <div className="flex items-center gap-lg justify-end">
              <button
                className="p-sm rounded bg-primary text-secondary px-lg"
                onClick={() => setDeleting(null)}
              >
                Bekor qilish
              </button>
              <button
                className="p-sm rounded bg-red-600 text-white px-lg"
                onClick={() => {
                  setLoading(true);

                  axios(`${baseUrl}/printing/prints/${deleting._id}`, {
                    method: "DELETE",
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  })
                    .then((res) => {
                      toast.success(res.data.message || res.data.msg);
                      setDeleting(null);
                      setIsGrouped(false);
                      setGroupedData([]);
                    })
                    .catch((err) =>
                      toast.error(err.response?.data?.msg || "Nimadir xato")
                    )
                    .finally(() => refresh());
                }}
              >
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

type PrintRowProps = {
  value: any;
  gazapal: any[];
  user: any;
  items: any[];
  query: string;
  readOnly?: boolean;
  setQuery?: (v: string) => void;
  onChange?: React.Dispatch<React.SetStateAction<any>>;
  onCancel?: () => void;
  onSubmit?: () => void;
  setEditing?: (v: any) => void;
  setDeleting?: (v: any) => void;
  selectedIds?: string[];
  setSelectedIds?: React.Dispatch<React.SetStateAction<string[]>>;
};

const PrintRow = ({
  value,
  gazapal,
  user,
  items,
  query,
  readOnly = false,
  setQuery,
  onChange,
  onCancel,
  onSubmit,
  setEditing,
  setDeleting,
  selectedIds,
  setSelectedIds,
}: PrintRowProps) => {
  if (!value) return null;

  const update = (patch: any) =>
    onChange?.((prev: any) => (prev ? { ...prev, ...patch } : prev));

  const updateOrder = (patch: any) =>
    onChange?.((prev: any) =>
      prev
        ? {
            ...prev,
            order: { ...prev.order, ...patch },
          }
        : prev
    );

  return (
    <div className={rowClass}>
      {readOnly ? (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            className="w-[50px] h-[20px]"
            checked={!!value._id && selectedIds?.includes(value._id)}
            disabled={!value._id}
            onChange={(e) => {
              if (!value._id) return;

              if (e.target.checked) {
                setSelectedIds?.((prev) => [...prev, value._id]);
              } else {
                setSelectedIds?.((prev) =>
                  prev.filter((id) => id !== value._id)
                );
              }
            }}
          />
        </div>
      ) : (
        <p></p>
      )}

      <input
        className={`rounded bg-transparent outline-none p-sm ${
          !readOnly && "border-primary border border-solid w-[80%]"
        }`}
        value={value.passNo || ""}
        onChange={(e) => update({ passNo: e.target.value })}
        readOnly={readOnly}
      />

      <input
        className={`rounded bg-transparent outline-none p-sm ${
          !readOnly && "border-primary border border-solid w-[80%]"
        }`}
        value={value.date || ""}
        onChange={(e) => update({ date: e.target.value })}
        readOnly={readOnly}
      />

      {readOnly ? (
        <p className="flex flex-wrap gap-[6px]">
          {getGazapalsArray(value.gazapals).map((g: any, index: number) => (
            <span key={g._id || g.id || index}>{g.passNo},</span>
          ))}
        </p>
      ) : (
        <MultipleSelect
          values={value.gazapalIds || []}
          data={
            gazapal?.map((g) => ({
              id: g._id,
              value: g.passNo,
            })) || []
          }
          onChange={(items) => update({ gazapalIds: items })}
        />
      )}

      <p className="flex flex-wrap gap-[6px]">
        {readOnly
          ? getGazapalsArray(value.gazapals).map((g: any, index: number) => (
              <span key={g._id || g.id || index}>{g.cloth?.name},</span>
            ))
          : gazapal
              ?.filter((g) =>
                (value.gazapalIds || []).some((i: any) => i.id === g._id)
              )
              .map((g) => <span key={g._id}>{g.cloth?.name},</span>)}
      </p>

      <p className="flex flex-wrap gap-[6px]">
        {readOnly
          ? getGazapalsArray(value.gazapals).map((g: any, index: number) => (
              <span key={g._id || g.id || index}>
                <NumericFormat
                  value={g.length}
                  displayType="text"
                  thousandSeparator=" "
                  suffix=" metr"
                />
                ,
              </span>
            ))
          : gazapal
              ?.filter((g) =>
                (value.gazapalIds || []).some((i: any) => i.id === g._id)
              )
              .map((g) => (
                <span key={g._id}>
                  <NumericFormat
                    value={g.length}
                    displayType="text"
                    thousandSeparator=" "
                    suffix=" metr"
                  />
                  ,
                </span>
              ))}
      </p>

      <input
        className={`rounded bg-transparent outline-none p-sm ${
          !readOnly && "border-primary border border-solid w-[80%]"
        }`}
        value={value.order?.name || ""}
        onChange={(e) => updateOrder({ name: e.target.value })}
        readOnly={readOnly}
      />

      {readOnly ? (
        <p>{value.order?.cloth}</p>
      ) : (
        <select
          className="rounded bg-transparent outline-none p-sm border-primary border border-solid w-[80%]"
          value={value.order?.cloth || ""}
          onChange={(e) => updateOrder({ cloth: e.target.value })}
        >
          <option value="">Tanlang</option>
          <option value="Poplin Open">Poplin Open</option>
          <option value="Poplin Close">Poplin Close</option>
          <option value="Byaz Open">Byaz Open</option>
          <option value="Byaz Close">Byaz Close</option>
          <option value="Ranforce Open">Ranforce Open</option>
          <option value="Ranforce Close">Ranforce Close</option>
        </select>
      )}

      {readOnly ? (
        <div className="flex items-center gap-[15px]">
          {value?.design?.imageUrl && (
            <img
              src={`${import.meta.env.VITE_APP_API_URL}${
                value.design.imageUrl
              }`}
              alt={value?.design?.article}
              className="w-[100px]"
            />
          )}
          {value.design?.article}
        </div>
      ) : (
        <DesignSelect
          props={items}
          query={query}
          changeQuery={setQuery || (() => {})}
          creating={false}
          selected={
            value.designArt && value.design
              ? {
                  ...value.design,
                  article: value.designArt,
                  cloth: value.design.cloth ?? "",
                  amount: value.design.amount ?? 0,
                  id: value.design.id ?? "",
                }
              : undefined
          }
          onChange={(design) =>
            update({
              designArt: design?.article || "",
              design: design
                ? {
                    article: design.article,
                    image: design.image,
                    imageUrl: design?.imageUrl || "",
                    cloth: design.cloth,
                    amount: design.amount,
                    id: design.id,
                  }
                : undefined,
            })
          }
        />
      )}

      <NumericFormat
        readOnly={readOnly}
        className={`rounded bg-transparent outline-none p-sm ${
          !readOnly && "border-primary border border-solid w-[80%]"
        }`}
        value={value.order?.length || ""}
        thousandSeparator=" "
        onValueChange={(v) => updateOrder({ length: v.floatValue })}
      />

      <NumericFormat
        readOnly={readOnly}
        className={`rounded bg-transparent outline-none p-sm ${
          !readOnly && "border-primary border border-solid w-[80%]"
        }`}
        value={value.order?.printed || ""}
        thousandSeparator=" "
        onValueChange={(v) => updateOrder({ printed: v.floatValue })}
      />

      <NumericFormat
        readOnly
        displayType="text"
        value={Math.round(
          ((value.order?.printed || 0) * 100) / (value.order?.length || 1) - 100
        )}
        suffix=" %"
      />

      {readOnly ? (
        <p>{value.order?.status ? "Tugallangan" : "Jarayonda"}</p>
      ) : (
        <select
          className="rounded bg-transparent outline-none p-sm border-primary border border-solid w-[80%]"
          value={
            value.order?.status == null
              ? ""
              : value.order?.status
              ? "completed"
              : "inprogress"
          }
          onChange={(e) =>
            updateOrder({ status: e.target.value === "completed" })
          }
        >
          <option value="">Tanlanmagan</option>
          <option value="inprogress">Jarayonda</option>
          <option value="completed">Tugallangan</option>
        </select>
      )}

      <p>
        {readOnly ? value.user?.name : `${user.firstname} ${user.lastname}`}
      </p>

      {readOnly ? (
        <p>{value.user?.shift || "Smena tanlanmagan"}</p>
      ) : (
        <select
          className="rounded bg-transparent outline-none p-sm border-primary border border-solid w-[80%]"
          value={value.user?.shift || ""}
          onChange={(e) =>
            update({
              user: { ...value.user, shift: e.target.value },
            })
          }
        >
          <option value="">Smena</option>
          <option value="A">A</option>
          <option value="B">B</option>
        </select>
      )}

      <div className="flex items-center justify-end gap-[13px]">
        {readOnly ? (
          <>
            {user.role == "superadmin" && (
              <button onClick={() => setDeleting?.(value)}>
                <LuTrash2 />
              </button>
            )}
            {(["admin", "superadmin"].includes(user.role) ||
              user._id == value.user?.id) && (
              <button onClick={() => setEditing?.(value)}>
                <FaPen />
              </button>
            )}
          </>
        ) : (
          <>
            {onCancel && (
              <button className="text-[20px]" onClick={onCancel}>
                &times;
              </button>
            )}
            {onSubmit && (
              <button onClick={onSubmit}>
                <FaCheck />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
