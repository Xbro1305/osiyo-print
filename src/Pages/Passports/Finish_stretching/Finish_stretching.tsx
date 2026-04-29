import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaCheck, FaPen, FaPlus } from "react-icons/fa";
import { LuShare, LuTrash2 } from "react-icons/lu";
import { NumericFormat } from "react-number-format";
import { toast } from "react-toastify";
import { MultipleSelect } from "../../../Components/MultipleSelect";

interface IUserInfo {
  id: string;
  name: string;
  role: string;
  shift: string;
}

interface PrintItem {
  _id?: string;
  passNo: string;
  printed: number | string;
  orderName: string;
  orderCloth: string;
}

interface Data {
  _id?: string;
  passNo: string;
  date?: string;
  user?: IUserInfo;
  status?: string;
  printIds?: { id: number | string; value: string }[];
  prints?: PrintItem[] | PrintItem;
  measured?: number;
  stretched?: number | string;
  printedMeters?: number;
}

interface GroupedData {
  _id: Record<string, string | number>;
  count: number;
  items: Data[];
  totalMeasured?: number;
  totalStretched?: number;
  totalPrintedMeters?: number;
}

const rowClass =
  "grid grid-cols-[30px_150px_150px_250px_150px_150px_150px_150px_250px_minmax(200px,1fr)_150px_150px_50px] w-full gap-[10px] p-lg text-primary border-b border-primary items-center min-w-fit";

const headerClass =
  "grid grid-cols-[30px_150px_150px_250px_150px_150px_150px_150px_250px_minmax(200px,1fr)_150px_150px_50px] w-full gap-[10px] p-lg bg-secondary text-primary rounded-t-[8px] border-b border-primary min-w-fit";

const groupOptions = [
  { label: "Passport No.", value: "passNo" },
  { label: "Sana", value: "date" },
  { label: "Holat", value: "status" },
  { label: "Operator", value: "user.name" },
  { label: "Smena", value: "user.shift" },
  { label: "Pechat passporti", value: "prints.passNo" },
  { label: "Zakaz nomi", value: "prints.orderName" },
  { label: "Mato nomi", value: "prints.orderCloth" },
];

const getPrintsArray = (prints: any): PrintItem[] => {
  if (!prints) return [];
  return Array.isArray(prints) ? prints : [prints];
};

const formatGroupValue = (key: string, value: string | number) => {
  if (key === "status") {
    return value === "completed" ? "Tugallangan" : "Jarayonda";
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

const getGroupPrinted = (group: GroupedData) =>
  group.totalPrintedMeters ??
  group.items.reduce((sum, item) => {
    const fromField = Number(item.printedMeters || 0);
    const fromPrints = getPrintsArray(item.prints).reduce(
      (innerSum, print) => innerSum + Number(print.printed || 0),
      0
    );

    return sum + (fromField || fromPrints);
  }, 0);

const getGroupMeasured = (group: GroupedData) =>
  group.totalMeasured ??
  group.items.reduce((sum, item) => sum + Number(item.measured || 0), 0);

export const Finish_stretching = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<Data[]>([]);
  const [groupedData, setGroupedData] = useState<GroupedData[]>([]);
  const [groupKeys, setGroupKeys] = useState<string[]>([]);
  const [groupModalOpen, setGroupModalOpen] = useState<boolean>(false);
  const [isGrouped, setIsGrouped] = useState<boolean>(false);
  const [adding, setAdding] = useState<Data | null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [print, setPrint] = useState<any[] | null>(null);
  const [deleting, setDeleting] = useState<Data | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const baseUrl = import.meta.env.VITE_APP_API_URL;
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const refresh = () =>
    axios(`${baseUrl}/printing/finish_stretching`)
      .then((res) => setData(res.data.data))
      .catch(() => toast.error("Nimadir xato"))
      .finally(() => setLoading(false));

  useEffect(() => {
    axios(`${baseUrl}/printing/prints`)
      .then((res) => setPrint(res.data.prints))
      .catch(() => toast.error("Nimadir xato"));

    refresh();
  }, []);

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

    axios(`${baseUrl}/printing/finish_stretching/group`, {
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
    if (!adding) return;

    setLoading(true);

    const submitData = {
      ...adding,
      stretched: (
        ((Number(adding.measured) - Number(adding.printedMeters)) /
          (Number(adding.printedMeters) || 1)) *
        100
      ).toFixed(2),
    };

    axios(`${baseUrl}/printing/finish_stretching`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      data: submitData,
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

    axios(`${baseUrl}/printing/finish_stretching/${editing?._id}`, {
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
        `${baseUrl}/printing/finish_stretching/export`,
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
      link.setAttribute("download", "finish cho'zilish.xlsx");
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

    axios(`${baseUrl}/printing/finish_stretching/group`, {
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
          <p>Pechat</p>
          <p>Zakaz nomi</p>
          <p>Mato nomi</p>
          <p>Pechat metri</p>
          <p>Finish qilindi</p>
          <p>Cho'zilish</p>
          <p>Holat</p>
          <p>Operator</p>
          <p>Smena</p>
          <p></p>
        </div>

        {!isGrouped &&
          data.map((row) =>
            editing?._id === row._id ? (
              <Row
                key={row._id}
                value={editing}
                print={print as any[]}
                user={user}
                onChange={setEditing}
                onCancel={() => setEditing(null)}
                onSubmit={() =>
                  handleEdit(new Event("submit") as unknown as React.FormEvent)
                }
              />
            ) : (
              <Row
                key={row._id}
                value={row}
                print={print as any[]}
                user={user}
                readOnly
                setEditing={setEditing}
                setDeleting={setDeleting}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
              />
            )
          )}

        {!isGrouped && adding && (
          <Row
            key="adding-row"
            value={adding}
            print={print as any[]}
            user={user}
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
              <div className="grid grid-cols-[1fr_170px_190px_190px] gap-[10px] p-lg bg-secondary text-primary border-b border-primary min-w-fit w-full">
                <p>{getGroupTitle(group)}</p>
                <p>Yozuvlar: {group.count}</p>
                <p>
                  Pechat:{" "}
                  <NumericFormat
                    value={getGroupPrinted(group)}
                    thousandSeparator=" "
                    displayType="text"
                    suffix=" metr"
                  />
                </p>
                <p>
                  Finish:{" "}
                  <NumericFormat
                    value={getGroupMeasured(group)}
                    thousandSeparator=" "
                    displayType="text"
                    suffix=" metr"
                  />
                </p>
              </div>

              {group.items.map((row) =>
                editing?._id === row._id ? (
                  <Row
                    key={row._id}
                    value={editing}
                    print={print as any[]}
                    user={user}
                    onChange={setEditing}
                    onCancel={() => setEditing(null)}
                    onSubmit={() =>
                      handleEdit(
                        new Event("submit") as unknown as React.FormEvent
                      )
                    }
                  />
                ) : (
                  <Row
                    key={row._id}
                    value={row}
                    print={print as any[]}
                    user={user}
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

                  axios(
                    `${baseUrl}/printing/finish_stretching/${deleting._id}`,
                    {
                      method: "DELETE",
                      headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                          "token"
                        )}`,
                      },
                    }
                  )
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

type RowProps = {
  value: any;
  print: any[];
  user: any;
  readOnly?: boolean;
  onChange?: React.Dispatch<React.SetStateAction<any>>;
  onCancel?: () => void;
  onSubmit?: () => void;
  setEditing?: (v: any) => void;
  setDeleting?: (v: any) => void;
  selectedIds?: string[];
  setSelectedIds?: React.Dispatch<React.SetStateAction<string[]>>;
};

const Row = ({
  value,
  print,
  user,
  readOnly = false,
  onChange,
  onCancel,
  onSubmit,
  setEditing,
  setDeleting,
  selectedIds,
  setSelectedIds,
}: RowProps) => {
  if (!value) return null;

  const update = (patch: any) =>
    onChange?.((prev: any) => (prev ? { ...prev, ...patch } : prev));

  const selectedPrints = print?.filter((g) =>
    (value.printIds || []).some((i: any) => i.id === g._id)
  );

  return (
    <div className={rowClass}>
      {readOnly ? (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            className="w-[50px] h-[20px]"
            checked={selectedIds?.includes(value._id!) || false}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedIds?.((prev) => [...prev, value._id!]);
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
          {getPrintsArray(value.prints).map((g, index) => (
            <span key={g._id || index}>{g.passNo},</span>
          ))}
        </p>
      ) : (
        <MultipleSelect
          values={value.printIds || []}
          data={
            print?.map((g) => ({
              id: g._id,
              value: g.passNo,
            })) || []
          }
          onChange={(items) => {
            const printedMeters =
              print
                ?.filter((g) => (items || []).some((i: any) => i.id === g._id))
                .map((p) => Number(p.order?.printed || 0))
                .reduce((sum, v) => sum + v, 0) || 0;

            update({ printIds: items, printedMeters });
          }}
        />
      )}

      <p className="flex flex-wrap gap-[6px]">
        {readOnly
          ? getPrintsArray(value.prints).map((g, index) => (
              <span key={g._id || index}>{g.orderName},</span>
            ))
          : selectedPrints?.map((g) => (
              <span key={g._id}>{g.order?.name},</span>
            ))}
      </p>

      <p className="flex flex-wrap gap-[6px]">
        {readOnly
          ? getPrintsArray(value.prints).map((g, index) => (
              <span key={g._id || index}>{g.orderCloth},</span>
            ))
          : selectedPrints?.map((g) => (
              <span key={g._id}>{g.order?.cloth},</span>
            ))}
      </p>

      <p className="flex flex-wrap gap-[6px]">
        {readOnly
          ? getPrintsArray(value.prints).map((g, index) => (
              <span key={g._id || index}>
                <NumericFormat
                  value={g.printed}
                  displayType="text"
                  thousandSeparator=" "
                  suffix=" metr"
                />
                ,
              </span>
            ))
          : selectedPrints?.map((g) => (
              <span key={g._id}>
                <NumericFormat
                  value={g.order?.printed}
                  displayType="text"
                  thousandSeparator=" "
                  suffix=" metr"
                />
                ,
              </span>
            ))}
      </p>

      <NumericFormat
        readOnly={readOnly}
        className={`rounded bg-transparent outline-none p-sm ${
          !readOnly && "border-primary border border-solid w-[80%]"
        }`}
        value={value.measured || ""}
        thousandSeparator=" "
        onValueChange={(v) => update({ measured: v.floatValue })}
      />

      <p>
        {readOnly ? (
          <NumericFormat
            displayType="text"
            value={value.stretched || ""}
            thousandSeparator=" "
            suffix=" %"
          />
        ) : (
          value.printIds && (
            <NumericFormat
              value={(
                ((Number(value.measured) - Number(value.printedMeters)) /
                  (Number(value.printedMeters) || 1)) *
                100
              ).toFixed(2)}
              displayType="text"
              thousandSeparator=" "
              suffix=" %"
            />
          )
        )}
      </p>

      {readOnly ? (
        <p>{value.status == "completed" ? "Tugallangan" : "Jarayonda"}</p>
      ) : (
        <select
          className="rounded bg-transparent outline-none p-sm border-primary border border-solid w-[80%]"
          value={value.status || ""}
          onChange={(e) => update({ status: e.target.value })}
        >
          <option value="">Tanlang</option>
          <option value="completed">Tugallangan</option>
          <option value="progress">Jarayonda</option>
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
