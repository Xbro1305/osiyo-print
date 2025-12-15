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

export const Gazapal = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [clothes, setClothes] = useState<Cloth[]>([]);
  const [gazapal, setGazapal] = useState<IPassData[]>([]);
  const [adding, setAdding] = useState<IPassData | null>(null);
  const [editing, setEditing] = useState<IPassData | null>(null);
  const baseUrl = import.meta.env.VITE_APP_API_URL;
  const user = JSON.parse(localStorage.getItem("user") || "");

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

  const handleSubmit = (e: React.FormEvent) => {
    setLoading(true);

    e.preventDefault();

    axios(`${baseUrl}/printing/gazapal`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      data: adding,
    })
      .then((res) => {
        toast.success(res.data.message);
        setAdding(null);
      })
      .catch((err) => toast.success(err.response.data.msg || "Nimadir xato"))
      .finally(() => refresh());
  };

  const handleEdit = (e: React.FormEvent) => {
    setLoading(true);

    e.preventDefault();

    axios(`${baseUrl}/printing/gazapal/${editing?._id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      data: editing,
    })
      .then((res) => {
        toast.success(res.data.message);
        setEditing(null);
      })
      .catch((err) => toast.success(err.response.data.msg || "Nimadir xato"))
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
      <div className="flex items-center gap-[10px] justify-end text-primary">
        <button
          className="p-sm rounded bg-secondary w-fit flex items-center gap-[10px] px-lg"
          onClick={() =>
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
            })
          }
        >
          <FaPlus /> Qo'shish
        </button>{" "}
        <button className="p-sm rounded bg-secondary w-fit flex items-center gap-[10px] px-lg">
          <LuShare /> Export
        </button>
      </div>

      <div className="flex flex-col max-w-full w-full overflow-x-auto">
        <div className="grid grid-cols-[150px_150px_200px_150px_minmax(200px,1fr)_150px_50px] w-full gap-[10px] p-lg bg-secondary text-primary rounded-t-[8px] border-b border-primary min-w-fit w-full">
          <p>Passport No.</p>
          <p>Sana</p>
          <p>Mato nomi</p>
          <p>Miqdori</p>
          <p>Operator</p>
          <p>Smena</p>
          <p></p>
        </div>{" "}
        {adding && (
          <div className="grid grid-cols-[150px_150px_200px_150px_minmax(200px,1fr)_150px_50px] w-full gap-[10px] p-lg text-primary border-b border-primary items-center min-w-fit w-full">
            <input
              type="text"
              className="border-primary border-solid border-[1px] w-[80%] rounded bg-[transparent] outline-none p-sm"
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
              className="border-primary border-solid border-[1px] w-[80%] rounded bg-[transparent] outline-none p-sm"
              value={adding.cloth.id}
              onChange={(e) =>
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
              className="border-primary border-solid border-[1px] w-[80%] rounded bg-[transparent] outline-none p-sm"
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
              className="border-primary border-solid border-[1px] w-[80%] rounded bg-[transparent] outline-none p-sm"
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
                              name: user.name,
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
                          name: user.name,
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
        )}
        {gazapal.map((item) =>
          editing?._id != item._id ? (
            <div className="grid grid-cols-[150px_150px_200px_150px_minmax(200px,1fr)_150px_50px] w-full gap-[10px] p-lg text-primary border-b border-primary items-center min-w-fit w-full">
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
                            Authorization: `Bearer ${localStorage.getItem(
                              "token"
                            )}`,
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
          ) : (
            <div className="grid grid-cols-[150px_150px_200px_150px_minmax(200px,1fr)_150px_50px] w-full gap-[10px] p-lg text-primary border-b border-primary items-center min-w-fit w-full">
              <input
                type="text"
                className="border-primary border-solid border-[1px] w-[80%] rounded bg-[transparent] outline-none p-sm"
                value={editing?.passNo}
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
              <p>{editing?.date}</p>
              <select
                className="border-primary border-solid border-[1px] w-[80%] rounded bg-[transparent] outline-none p-sm"
                value={editing?.cloth.id}
                onChange={(e) =>
                  setEditing((prev) =>
                    prev
                      ? {
                          ...prev,
                          cloth: {
                            name:
                              clothes.find(
                                (cloth) => cloth._id == e.target.value
                              )?.name || "",
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
                className="border-primary border-solid border-[1px] w-[80%] rounded bg-[transparent] outline-none p-sm"
                value={editing?.length}
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
                className="border-primary border-solid border-[1px] w-[80%] rounded bg-[transparent] outline-none p-sm"
                value={editing?.user?.shift}
                onChange={(e) =>
                  setEditing((prev) =>
                    prev
                      ? {
                          ...prev,
                          user: prev.user
                            ? { ...prev.user, shift: e.target.value }
                            : {
                                id: user._id,
                                name: user.name,
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
                            name: user.name,
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
                <button
                  className="text-[20px]"
                  onClick={() => setEditing(null)}
                >
                  &times;
                </button>
                <button onClick={handleEdit}>
                  <FaCheck />
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};
