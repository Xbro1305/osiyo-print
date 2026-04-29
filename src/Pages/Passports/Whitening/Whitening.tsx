import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaCheck, FaPen, FaPlus } from "react-icons/fa";
import { LuShare, LuTrash2 } from "react-icons/lu";
import { NumericFormat } from "react-number-format";
import { toast } from "react-toastify";

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
  length?: number | string;
  user?: IUserInfo;
}

interface Data {
  _id?: string;
  passNo: string;
  date?: string;
  user?: IUserInfo;
  gazapalId: string;
  gazapal?: IPassData;
}

interface GroupedData {
  _id: Record<string, string | number>;
  count: number;
  totalGazapalLength?: number;
  items: Data[];
}

const rowClass =
  "grid grid-cols-[30px_150px_150px_150px_200px_150px_minmax(200px,1fr)_150px_50px] w-full gap-[10px] p-lg text-primary border-b border-primary items-center min-w-fit w-full";

const headerClass =
  "grid grid-cols-[30px_150px_150px_150px_200px_150px_minmax(200px,1fr)_150px_50px] w-full gap-[10px] p-lg bg-secondary text-primary rounded-t-[8px] border-b border-primary min-w-fit w-full";

const inputClass =
  "border-primary border-solid border-[1px] w-[80%] rounded bg-[transparent] outline-none p-sm";

const groupOptions = [
  { label: "Passport No.", value: "passNo" },
  { label: "Sana", value: "date" },
  { label: "Operator", value: "user.name" },
  { label: "Smena", value: "user.shift" },
  { label: "Gazapal", value: "gazapal.passNo" },
  { label: "Mato nomi", value: "gazapal.cloth.name" },
  { label: "Gazapal sanasi", value: "gazapal.date" },
  { label: "Gazapal operatori", value: "gazapal.user.name" },
];

const getGroupTitle = (group: GroupedData) =>
  Object.entries(group._id)
    .map(([key, value]) => {
      const option = groupOptions.find(
        (item) => item.value.replace(/\./g, "_") === key
      );

      return `${option?.label || key}: ${value || "Bo'sh"}`;
    })
    .join(" | ");

const getGroupLength = (group: GroupedData) =>
  group.totalGazapalLength ??
  group.items.reduce((sum, item) => sum + Number(item.gazapal?.length || 0), 0);

export const Whitening = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [whitening, setWhitening] = useState<Data[]>([]);
  const [groupedData, setGroupedData] = useState<GroupedData[]>([]);
  const [groupKeys, setGroupKeys] = useState<string[]>([]);
  const [groupModalOpen, setGroupModalOpen] = useState<boolean>(false);
  const [isGrouped, setIsGrouped] = useState<boolean>(false);
  const [adding, setAdding] = useState<Data | null>(null);
  const [editing, setEditing] = useState<Data | null>(null);
  const [gazapal, setGazapal] = useState<IPassData[] | null>(null);

  const baseUrl = import.meta.env.VITE_APP_API_URL;
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const refresh = () =>
    axios(`${baseUrl}/printing/whitening`)
      .then((res) => setWhitening(res.data.whitening))
      .catch(() => toast.error("Nimadir xato"))
      .finally(() => setLoading(false));

  useEffect(() => {
    axios(`${baseUrl}/printing/gazapal`)
      .then((res) => setGazapal(res.data.gazapal))
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

    axios(`${baseUrl}/printing/whitening/group`, {
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

    axios(`${baseUrl}/printing/whitening`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      data: adding,
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

    axios(`${baseUrl}/printing/whitening/${editing?._id}`, {
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

    axios(`${baseUrl}/printing/whitening/group`, {
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

  const exportExcel = async () => {
    try {
      const response = await axios.post(
        `${baseUrl}/printing/whitening/export`,
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
      link.setAttribute("download", "Oqartirish.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Export qilishda xatolik");
    }
  };

  const deleteOne = (item: Data) => {
    if (!window.confirm("O'chirilsinmi?")) return;

    setLoading(true);

    axios(`${baseUrl}/printing/whitening/${item._id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => {
        toast.success(res.data.message || res.data.msg);
        setIsGrouped(false);
        setGroupedData([]);
      })
      .catch(() => toast.error("Nimadir xato"))
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
              gazapalId: "",
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
          <p>Miqdori</p>
          <p>Operator</p>
          <p>Smena</p>
          <p></p>
        </div>

        {!isGrouped && adding && (
          <WhiteningRow
            value={adding}
            gazapal={gazapal}
            user={user}
            onChange={setAdding}
            onCancel={() => setAdding(null)}
            onSubmit={handleSubmit}
          />
        )}

        {!isGrouped &&
          whitening.map((item) =>
            editing?._id !== item._id ? (
              <WhiteningRow
                key={item._id}
                value={item}
                gazapal={gazapal}
                user={user}
                readOnly
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
                setEditing={setEditing}
                onDelete={() => deleteOne(item)}
              />
            ) : (
              <WhiteningRow
                key={item._id}
                value={editing!}
                gazapal={gazapal}
                user={user}
                onChange={setEditing}
                onCancel={() => setEditing(null)}
                onSubmit={handleEdit}
              />
            )
          )}

        {isGrouped &&
          groupedData.map((group, index) => (
            <div key={index} className="flex flex-col min-w-fit w-full">
              <div className="grid grid-cols-[1fr_160px_180px] gap-[10px] p-lg bg-secondary text-primary border-b border-primary min-w-fit w-full">
                <p>{getGroupTitle(group)}</p>
                <p>Yozuvlar: {group.count}</p>
                <p>
                  Jami:{" "}
                  <NumericFormat
                    value={getGroupLength(group)}
                    thousandSeparator=" "
                    displayType="text"
                    suffix=" metr"
                  />
                </p>
              </div>

              {group.items.map((item) =>
                editing?._id !== item._id ? (
                  <WhiteningRow
                    key={item._id}
                    value={item}
                    gazapal={gazapal}
                    user={user}
                    readOnly
                    selectedIds={selectedIds}
                    setSelectedIds={setSelectedIds}
                    setEditing={setEditing}
                    onDelete={() => deleteOne(item)}
                  />
                ) : (
                  <WhiteningRow
                    key={item._id}
                    value={editing!}
                    gazapal={gazapal}
                    user={user}
                    onChange={setEditing}
                    onCancel={() => setEditing(null)}
                    onSubmit={handleEdit}
                  />
                )
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

type WhiteningRowProps = {
  value: Data;
  gazapal: IPassData[] | null;
  user: any;
  readOnly?: boolean;
  selectedIds?: string[];
  setSelectedIds?: React.Dispatch<React.SetStateAction<string[]>>;
  onChange?: React.Dispatch<React.SetStateAction<Data | null>>;
  onCancel?: () => void;
  onSubmit?: (e: React.FormEvent) => void;
  setEditing?: React.Dispatch<React.SetStateAction<Data | null>>;
  onDelete?: () => void;
};

const WhiteningRow = ({
  value,
  gazapal,
  user,
  readOnly = false,
  selectedIds,
  setSelectedIds,
  onChange,
  onCancel,
  onSubmit,
  setEditing,
  onDelete,
}: WhiteningRowProps) => {
  const selectedGazapal = gazapal?.find((g) => g._id === value.gazapalId);

  const update = (patch: Partial<Data>) =>
    onChange?.((prev) => (prev ? { ...prev, ...patch } : prev));

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

      {readOnly ? (
        <p>{value.passNo}</p>
      ) : (
        <input
          type="text"
          className={inputClass}
          value={value.passNo || ""}
          onChange={(e) => update({ passNo: e.target.value })}
        />
      )}

      {readOnly ? (
        <p>{value.date}</p>
      ) : (
        <input
          type="text"
          className={inputClass}
          value={value.date || ""}
          onChange={(e) => update({ date: e.target.value })}
        />
      )}

      {readOnly ? (
        <p>{value.gazapal?.passNo}</p>
      ) : (
        <select
          className={inputClass}
          value={value.gazapalId || ""}
          onChange={(e) => update({ gazapalId: e.target.value })}
        >
          <option value="">Tanlang</option>
          {gazapal?.map((g) => (
            <option value={g._id} key={g._id}>
              {g.passNo}
            </option>
          ))}
        </select>
      )}

      <p>
        {readOnly
          ? value.gazapal?.cloth?.name
          : selectedGazapal?.cloth?.name || ""}
      </p>

      <NumericFormat
        value={readOnly ? value.gazapal?.length : selectedGazapal?.length}
        thousandSeparator=" "
        displayType="text"
        suffix=" metr"
      />

      <p>
        {readOnly ? value.user?.name : `${user.firstname} ${user.lastname}`}
      </p>

      {readOnly ? (
        <p>{value.user?.shift == "B" ? "B" : "A"}</p>
      ) : (
        <select
          className={inputClass}
          value={value.user?.shift || ""}
          onChange={(e) =>
            update({
              user: {
                ...(value.user || {
                  id: user._id,
                  name: `${user.firstname} ${user.lastname}`,
                  role: user.role,
                }),
                shift: e.target.value,
              },
            })
          }
        >
          <option value="">Smenani tanlang</option>
          <option value="B">B</option>
          <option value="night">A</option>
        </select>
      )}

      <div className="flex items-center justify-end gap-[13px]">
        {readOnly ? (
          <>
            {user.role == "superadmin" && (
              <button onClick={onDelete}>
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
            <button className="text-[20px]" onClick={onCancel}>
              &times;
            </button>
            <button onClick={onSubmit}>
              <FaCheck />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
