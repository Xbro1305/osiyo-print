import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaCheck, FaPen, FaPlus } from "react-icons/fa";
import { LuShare, LuTrash2 } from "react-icons/lu";
import { NumericFormat } from "react-number-format";
import { toast } from "react-toastify";

interface Cloth {
  _id: string;
  name: string;
}

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
  passNo: string;
  date: string;
  cloth: ICloth;
  length: number;
  user?: IUserInfo;
}

interface User {
  _id: string;
  firstname: string;
  lastname: string;
  name?: string;
  role: string;
}

interface GroupedGazapal {
  _id: Record<string, string | number>;
  totalLength: number;
  count: number;
  items: IPassData[];
}

interface RowProps {
  baseUrl: string;
  user: User;
  clothes: Cloth[];
}

interface GazapalAddRowProps extends RowProps {
  adding: IPassData;
  setAdding: React.Dispatch<React.SetStateAction<IPassData | null>>;
  setClothes: React.Dispatch<React.SetStateAction<Cloth[]>>;
  handleSubmit: (e: React.FormEvent) => void;
}

interface GazapalViewRowProps extends RowProps {
  item: IPassData;
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  setEditing: React.Dispatch<React.SetStateAction<IPassData | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  refresh: () => void;
}

interface GazapalEditRowProps extends RowProps {
  editing: IPassData;
  setEditing: React.Dispatch<React.SetStateAction<IPassData | null>>;
  handleEdit: (e: React.FormEvent) => void;
}

const rowClass =
  "grid grid-cols-[50px_150px_150px_200px_150px_minmax(200px,1fr)_150px_50px] gap-[10px] p-lg text-primary border-b border-primary items-center min-w-fit w-full";

const inputClass =
  "border-primary border-solid border-[1px] w-[80%] rounded bg-[transparent] outline-none p-sm";

const groupOptions = [
  { label: "Sana", value: "date" },
  { label: "Mato nomi", value: "cloth.name" },
  { label: "Operator", value: "user.name" },
  { label: "Smena", value: "user.shift" },
  { label: "Passport No.", value: "passNo" },
];

const getUserName = (user: User) =>
  user.name || `${user.firstname} ${user.lastname}`;

const getGroupTitle = (group: GroupedGazapal) =>
  Object.entries(group._id)
    .map(([key, value]) => {
      const label =
        groupOptions.find((option) => option.value.replace(/\./g, "_") === key)
          ?.label || key;

      const displayValue =
        key === "user_shift" ? (value === "day" ? "B" : "A") : value;

      return `${label}: ${displayValue}`;
    })
    .join(" | ");

const GazapalAddRow = ({
  adding,
  setAdding,
  setClothes,
  handleSubmit,
  baseUrl,
  user,
  clothes,
}: GazapalAddRowProps) => {
  return (
    <div className={rowClass}>
      <div></div>

      <input
        type="text"
        className={inputClass}
        value={adding.passNo}
        onChange={(e) =>
          setAdding((prev) =>
            prev
              ? { ...prev, passNo: e.target.value }
              : {
                  passNo: e.target.value,
                  date: new Date().toISOString().slice(0, 10),
                  cloth: { id: "", name: "" },
                  length: 0,
                }
          )
        }
      />

      <p>{adding.date}</p>

      <select
        className={inputClass}
        value={adding.cloth.id}
        onChange={(e) => {
          if (e.target.value === "add") {
            const name = prompt("Mato nomini kiriting:");

            if (name) {
              axios(`${baseUrl}/printing/clothes`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                data: { name },
              })
                .then((res) => {
                  toast.success(res.data?.message || res.data?.msg);
                  setClothes((prev) => [...prev, res?.data?.saved]);

                  setAdding((prev) =>
                    prev
                      ? {
                          ...prev,
                          cloth: {
                            name,
                            id: res.data.saved._id,
                          },
                        }
                      : {
                          passNo: "",
                          date: new Date().toISOString().slice(0, 10),
                          cloth: { id: res.data.saved._id, name },
                          length: 0,
                        }
                  );
                })
                .catch((err) =>
                  toast.error(err.response?.data?.msg || "Nimadir xato")
                );
            }

            return;
          }

          setAdding((prev) =>
            prev
              ? {
                  ...prev,
                  cloth: {
                    name:
                      clothes.find((cloth) => cloth._id == e.target.value)
                        ?.name || "",
                    id: e.target.value,
                  },
                }
              : {
                  passNo: e.target.value,
                  date: new Date().toISOString().slice(0, 10),
                  cloth: { id: "", name: "" },
                  length: 0,
                }
          );
        }}
      >
        <option value="">Mato turini tanlang</option>
        {clothes.map((cloth) => (
          <option key={cloth._id} value={cloth._id}>
            {cloth.name}
          </option>
        ))}
        <option value="add">Mato qo'shish</option>
      </select>

      <NumericFormat
        className={inputClass}
        value={adding.length}
        thousandSeparator=" "
        suffix=" metr"
        onValueChange={(values) => {
          setAdding((prev) =>
            prev
              ? {
                  ...prev,
                  length: values.floatValue ?? 0,
                }
              : {
                  passNo: "",
                  date: new Date().toISOString().slice(0, 10),
                  cloth: { id: "", name: "" },
                  length: values.floatValue ?? 0,
                }
          );
        }}
      />

      <p>
        {user.firstname} {user.lastname}
      </p>

      <select
        className={inputClass}
        value={adding.user?.shift}
        onChange={(e) =>
          setAdding((prev) =>
            prev
              ? {
                  ...prev,
                  user: prev.user
                    ? { ...prev.user, shift: e.target.value }
                    : {
                        id: user._id,
                        name: getUserName(user),
                        role: user.role,
                        shift: e.target.value,
                      },
                }
              : {
                  passNo: e.target.value,
                  date: new Date().toISOString().slice(0, 10),
                  cloth: { id: "", name: "" },
                  length: 0,
                  user: {
                    id: user._id,
                    name: getUserName(user),
                    role: user.role,
                    shift: e.target.value,
                  },
                }
          )
        }
      >
        <option value="">Smenani tanlang</option>
        <option value="day">B smena</option>
        <option value="night">A smena</option>
      </select>

      <div className="flex items-center justify-end gap-[13px]">
        <button className="text-[20px]" onClick={() => setAdding(null)}>
          &times;
        </button>
        <button onClick={handleSubmit}>
          <FaCheck />
        </button>
      </div>
    </div>
  );
};

const GazapalViewRow = ({
  item,
  selectedIds,
  setSelectedIds,
  setEditing,
  setLoading,
  refresh,
  baseUrl,
  user,
}: GazapalViewRowProps) => {
  return (
    <div className={rowClass}>
      <div className="flex items-center jutify-center">
        <input
          type="checkbox"
          className="w-[50px] h-[20px]"
          checked={selectedIds.includes(item._id!)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedIds((prev) => [...prev, item._id!]);
            } else {
              setSelectedIds((prev) => prev.filter((id) => id !== item._id));
            }
          }}
        />
      </div>

      <p>{item.passNo}</p>
      <p>{item.date}</p>
      <p>{item.cloth.name}</p>

      <NumericFormat
        value={item.length}
        thousandSeparator=" "
        displayType="text"
        suffix=" metr"
      />

      <p>{item?.user?.name}</p>
      <p>{item.user?.shift == "day" ? "B" : "A"}</p>

      <div className="flex items-center gap-[10px] justify-end">
        {user.role == "superadmin" && (
          <button
            onClick={() => {
              const confirm = window.confirm("O'chirilsinmi?");

              if (confirm) {
                setLoading(true);

                axios(`${baseUrl}/printing/gazapal/${item._id}`, {
                  method: "DELETE",
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                })
                  .then((res) => toast.success(res.data.msg))
                  .catch(() => toast.error("Nimadir xato"))
                  .finally(() => refresh());
              }
            }}
          >
            <LuTrash2 />
          </button>
        )}

        {(["admin", "superadmin"].includes(user.role) ||
          user._id == item.user?.id) && (
          <button onClick={() => setEditing(item)}>
            <FaPen />
          </button>
        )}
      </div>
    </div>
  );
};

const GazapalEditRow = ({
  editing,
  setEditing,
  handleEdit,
  user,
  clothes,
}: GazapalEditRowProps) => {
  return (
    <div className={rowClass}>
      <p></p>

      <input
        type="text"
        className={inputClass}
        value={editing.passNo}
        onChange={(e) =>
          setEditing((prev) =>
            prev
              ? { ...prev, passNo: e.target.value }
              : {
                  passNo: e.target.value,
                  date: new Date().toISOString().slice(0, 10),
                  cloth: { id: "", name: "" },
                  length: 0,
                }
          )
        }
      />

      <p>{editing.date}</p>

      <select
        className={inputClass}
        value={editing.cloth.id}
        onChange={(e) =>
          setEditing((prev) =>
            prev
              ? {
                  ...prev,
                  cloth: {
                    name:
                      clothes.find((cloth) => cloth._id == e.target.value)
                        ?.name || "",
                    id: e.target.value,
                  },
                }
              : {
                  passNo: e.target.value,
                  date: new Date().toISOString().slice(0, 10),
                  cloth: { id: "", name: "" },
                  length: 0,
                }
          )
        }
      >
        <option value="">Mato turini tanlang</option>
        {clothes.map((cloth) => (
          <option key={cloth._id} value={cloth._id}>
            {cloth.name}
          </option>
        ))}
      </select>

      <NumericFormat
        className={inputClass}
        value={editing.length}
        thousandSeparator=" "
        suffix=" metr"
        onValueChange={(values) => {
          setEditing((prev) =>
            prev
              ? {
                  ...prev,
                  length: values.floatValue ?? 0,
                }
              : {
                  passNo: "",
                  date: new Date().toISOString().slice(0, 10),
                  cloth: { id: "", name: "" },
                  length: values.floatValue ?? 0,
                }
          );
        }}
      />

      <p>
        {user.firstname} {user.lastname}
      </p>

      <select
        className={inputClass}
        value={editing.user?.shift}
        onChange={(e) =>
          setEditing((prev) =>
            prev
              ? {
                  ...prev,
                  user: prev.user
                    ? { ...prev.user, shift: e.target.value }
                    : {
                        id: user._id,
                        name: getUserName(user),
                        role: user.role,
                        shift: e.target.value,
                      },
                }
              : {
                  passNo: e.target.value,
                  date: new Date().toISOString().slice(0, 10),
                  cloth: { id: "", name: "" },
                  length: 0,
                  user: {
                    id: user._id,
                    name: getUserName(user),
                    role: user.role,
                    shift: e.target.value,
                  },
                }
          )
        }
      >
        <option value="">Smenani tanlang</option>
        <option value="day">B smena</option>
        <option value="night">A smena</option>
      </select>

      <div className="flex items-center justify-end gap-[13px]">
        <button className="text-[20px]" onClick={() => setEditing(null)}>
          &times;
        </button>
        <button onClick={handleEdit}>
          <FaCheck />
        </button>
      </div>
    </div>
  );
};

export const Gazapal = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [clothes, setClothes] = useState<Cloth[]>([]);
  const [gazapal, setGazapal] = useState<IPassData[]>([]);
  const [groupedGazapal, setGroupedGazapal] = useState<GroupedGazapal[]>([]);
  const [groupKeys, setGroupKeys] = useState<string[]>([]);
  const [isGrouped, setIsGrouped] = useState<boolean>(false);
  const [adding, setAdding] = useState<IPassData | null>(null);
  const [editing, setEditing] = useState<IPassData | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const baseUrl = import.meta.env.VITE_APP_API_URL;
  const user: User = JSON.parse(localStorage.getItem("user") || "{}");

  const refresh = () =>
    axios(`${baseUrl}/printing/gazapal`)
      .then((res) => setGazapal(res.data.gazapal))
      .catch(() => toast.error("Nimadir xato"))
      .finally(() => setLoading(false));

  useEffect(() => {
    axios(`${baseUrl}/printing/clothes`)
      .then((res) => setClothes(res.data.clothes))
      .catch(() => toast.error("Nimadir xato"));

    refresh();
  }, []);

  const handleGroupKeyChange = (key: string) => {
    setGroupKeys((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const groupGazapal = () => {
    if (!groupKeys.length) {
      toast.info("Guruhlash uchun kamida bitta maydon tanlang.");
      return;
    }

    setLoading(true);
    setEditing(null);
    setAdding(null);

    axios(`${baseUrl}/printing/gazapal/group`, {
      method: "GET",
      params: {
        keys: groupKeys.join(","),
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => {
        setGroupedGazapal(res.data.grouped || []);
        setIsGrouped(true);
      })
      .catch((err) => toast.error(err.response?.data?.msg || "Nimadir xato"))
      .finally(() => setLoading(false));
  };

  const showDefaultTable = () => {
    setIsGrouped(false);
    setGroupedGazapal([]);
    refresh();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    axios(`${baseUrl}/printing/gazapal`, {
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
        setGroupedGazapal([]);
      })
      .catch((err) => toast.error(err.response?.data?.msg || "Nimadir xato"))
      .finally(() => refresh());
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    axios(`${baseUrl}/printing/gazapal/${editing?._id}`, {
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
        setGroupedGazapal([]);
      })
      .catch((err) => toast.error(err.response?.data?.msg || "Nimadir xato"))
      .finally(() => refresh());
  };

  const exportExcel = async () => {
    try {
      const response = await axios.post(
        `${baseUrl}/printing/gazapal/export`,
        {
          ids: selectedIds,
        },
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
      link.setAttribute("download", "Gazapal.xlsx");
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

    axios(`${baseUrl}/printing/gazapal/group`, {
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
        setGroupedGazapal([]);
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

      <div className="flex flex-wrap items-center gap-[10px] justify-end text-primary">
        <button
          className="p-sm rounded bg-secondary w-fit flex items-center gap-[10px] px-lg"
          onClick={() => {
            setIsGrouped(false);
            setGroupedGazapal([]);
            setAdding({
              passNo: "",
              date: new Date().toISOString().slice(0, 10),
              cloth: { id: "", name: "" },
              length: 0,
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

      <div className="flex flex-wrap items-center gap-[10px] text-primary">
        {groupOptions.map((option) => (
          <label
            key={option.value}
            className="p-sm rounded bg-secondary flex items-center gap-[8px] px-lg cursor-pointer"
          >
            <input
              type="checkbox"
              checked={groupKeys.includes(option.value)}
              onChange={() => handleGroupKeyChange(option.value)}
            />
            {option.label}
          </label>
        ))}

        <button
          className="p-sm rounded bg-secondary w-fit px-lg"
          onClick={groupGazapal}
        >
          Guruhlash
        </button>

        {isGrouped && (
          <button
            className="p-sm rounded bg-secondary w-fit px-lg"
            onClick={showDefaultTable}
          >
            Oddiy jadval
          </button>
        )}
      </div>

      <div className="flex flex-col max-w-full w-full overflow-x-auto">
        <div className="grid grid-cols-[50px_150px_150px_200px_150px_minmax(200px,1fr)_150px_50px] gap-[10px] p-lg bg-secondary text-primary rounded-t-[8px] border-b border-primary min-w-fit w-full">
          <p></p>
          <p>Passport No.</p>
          <p>Sana</p>
          <p>Mato nomi</p>
          <p>Miqdori</p>
          <p>Operator</p>
          <p>Smena</p>
          <p></p>
        </div>

        {!isGrouped && adding && (
          <GazapalAddRow
            adding={adding}
            setAdding={setAdding}
            setClothes={setClothes}
            handleSubmit={handleSubmit}
            baseUrl={baseUrl}
            user={user}
            clothes={clothes}
          />
        )}

        {!isGrouped &&
          gazapal.map((item) =>
            editing?._id != item._id ? (
              <GazapalViewRow
                key={item._id}
                item={item}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
                setEditing={setEditing}
                setLoading={setLoading}
                refresh={refresh}
                baseUrl={baseUrl}
                user={user}
                clothes={clothes}
              />
            ) : (
              <GazapalEditRow
                key={item._id}
                editing={editing!}
                setEditing={setEditing}
                handleEdit={handleEdit}
                baseUrl={baseUrl}
                user={user}
                clothes={clothes}
              />
            )
          )}

        {isGrouped &&
          groupedGazapal.map((group, index) => (
            <div key={index} className="flex flex-col min-w-fit w-full">
              <div className="grid grid-cols-[1fr_180px_180px] gap-[10px] p-lg bg-secondary text-primary border-b border-primary min-w-fit w-full">
                <p>{getGroupTitle(group)}</p>
                <p>Yozuvlar: {group.count}</p>
                <p>
                  Jami:{" "}
                  <NumericFormat
                    value={group.totalLength}
                    thousandSeparator=" "
                    displayType="text"
                    suffix=" metr"
                  />
                </p>
              </div>

              {group.items.map((item) =>
                editing?._id != item._id ? (
                  <GazapalViewRow
                    key={item._id}
                    item={item}
                    selectedIds={selectedIds}
                    setSelectedIds={setSelectedIds}
                    setEditing={setEditing}
                    setLoading={setLoading}
                    refresh={refresh}
                    baseUrl={baseUrl}
                    user={user}
                    clothes={clothes}
                  />
                ) : (
                  <GazapalEditRow
                    key={item._id}
                    editing={editing!}
                    setEditing={setEditing}
                    handleEdit={handleEdit}
                    baseUrl={baseUrl}
                    user={user}
                    clothes={clothes}
                  />
                )
              )}
            </div>
          ))}
      </div>
    </div>
  );
};
