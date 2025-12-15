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
  length?: number;
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

export const Painting = () => {
  const [loading, setLoading] = useState<boolean>(true);

  const [painting, setPainting] = useState<Data[]>([]);
  const [adding, setAdding] = useState<Data | null>(null);
  const [editing, setEditing] = useState<Data | null>(null);
  const [gazapal, setGazapal] = useState<IPassData[] | null>(null);
  const baseUrl = import.meta.env.VITE_APP_API_URL;
  const user = JSON.parse(localStorage.getItem("user") || "");

  const refresh = () =>
    axios(`${baseUrl}/printing/painting`)
      .then((res) => setPainting(res.data.painting))
      .catch(() => toast.error("Nimadir xato"))
      .finally(() => setLoading(false));

  useEffect(() => {
    axios(`${baseUrl}/printing/gazapal`)
      .then((res) => setGazapal(res.data.gazapal))
      .catch(() => toast.error("Nimadir xato"));

    refresh();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    setLoading(true);

    e.preventDefault();

    axios(`${baseUrl}/printing/painting`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      data: {
        ...adding,
      },
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

    axios(`${baseUrl}/printing/painting/${editing?._id}`, {
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
              user: {
                id: user._id,
                name: `${user.firstname} ${user.lastname}`,
                role: user.role,
                shift: "",
              },
              gazapalId: "",
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
        <div className="grid grid-cols-[150px_150px_150px_200px_150px_minmax(200px,1fr)_150px_50px] w-full gap-[10px] p-lg bg-secondary text-primary rounded-t-[8px] border-b border-primary min-w-fit w-full">
          <p>Passport No.</p>
          <p>Sana</p>
          <p>Gazapal</p>
          <p>Mato nomi</p>
          <p>Miqdori</p>
          <p>Operator</p>
          <p>Smena</p>
          <p></p>
        </div>{" "}
        {adding && (
          <div className="grid grid-cols-[150px_150px_150px_200px_150px_minmax(200px,1fr)_150px_50px] w-full gap-[10px] p-lg text-primary border-b border-primary items-center min-w-fit w-full">
            <input
              type="text"
              className="border-primary border-solid border-[1px] w-[80%] rounded bg-[transparent] outline-none p-sm"
              value={adding.passNo}
              onChange={(e) =>
                setAdding((prev) =>
                  prev
                    ? {
                        ...prev,
                        passNo: e.target.value,
                        gazapalId: prev.gazapalId ?? "",
                      }
                    : {
                        passNo: e.target.value,
                        date: new Date().toISOString().slice(0, 10),
                        user: {
                          id: user._id,
                          name: `${user.firstname} ${user.lastname}`,
                          role: user.role,
                          shift: "",
                        },
                        gazapalId: "",
                        cloth: { id: "", name: "" },
                        length: 0,
                      }
                )
              }
            />
            <input
              type="text"
              className="border-primary border-solid border-[1px] w-[80%] rounded bg-[transparent] outline-none p-sm"
              value={adding.date}
              onChange={(e) =>
                setAdding((prev) =>
                  prev
                    ? {
                        ...prev,
                        date: e.target.value,
                        gazapalId: prev.gazapalId ?? "",
                      }
                    : {
                        date: e.target.value,
                        passNo: "",
                        user: {
                          id: user._id,
                          name: `${user.firstname} ${user.lastname}`,
                          role: user.role,
                          shift: "",
                        },
                        gazapalId: "",
                        cloth: { id: "", name: "" },
                        length: 0,
                      }
                )
              }
            />
            <select
              className="border-primary border-solid border-[1px] w-[80%] rounded bg-[transparent] outline-none p-sm"
              value={adding.gazapalId}
              onChange={(e) =>
                setAdding((prev) =>
                  prev
                    ? {
                        ...prev,
                        gazapalId: e.target.value ?? "",
                      }
                    : {
                        gazapalId: e.target.value,
                        passNo: "",
                        user: {
                          id: user._id,
                          name: `${user.firstname} ${user.lastname}`,
                          role: user.role,
                          shift: "",
                        },
                        date: "",
                        cloth: { id: "", name: "" },
                        length: 0,
                      }
                )
              }
            >
              <option value={""}>Tanlang</option>
              {gazapal?.map((g) => (
                <option value={g._id} key={g._id}>
                  {g.passNo}
                </option>
              ))}
            </select>
            <p>
              {gazapal?.find((g) => g._id == adding.gazapalId)?.cloth?.name ||
                ""}
            </p>{" "}
            <p>
              <NumericFormat
                value={gazapal?.find((g) => g._id == adding.gazapalId)?.length}
                thousandSeparator=" "
                displayType="text"
                suffix=" metr"
              />
            </p>
            <p>
              {user.firstname} {user.lastname}
            </p>
            <select
              className="border-primary border-solid border-[1px] w-[80%] rounded bg-[transparent] outline-none p-sm"
              value={adding.user?.shift}
              onChange={(e) =>
                setAdding((prev) =>
                  prev?.user
                    ? {
                        ...prev,
                        user: {
                          ...prev.user,
                          shift: e.target.value,
                        },
                      }
                    : {
                        passNo: e.target.value,
                        date: new Date().toISOString().slice(0, 10),
                        user: {
                          id: user._id,
                          name: `${user.firstname} ${user.lastname}`,
                          role: user.role,
                          shift: "",
                        },
                        gazapalId: "",
                        cloth: { id: "", name: "" },
                        length: 0,
                      }
                )
              }
            >
              <option value="">Smenani tanlang</option>
              <option value="B">B</option>
              <option value="night">A</option>
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
        {painting.map((item) =>
          editing?._id != item._id ? (
            <div className="grid grid-cols-[150px_150px_150px_200px_150px_minmax(200px,1fr)_150px_50px] w-full gap-[10px] p-lg text-primary border-b border-primary items-center min-w-fit w-full">
              <p>{item.passNo}</p>
              <p>{item.date}</p>
              <p>{item.gazapal?.passNo}</p>
              <p>{item.gazapal?.cloth?.name}</p>
              <NumericFormat
                value={item?.gazapal?.length}
                thousandSeparator=" "
                displayType="text"
                suffix=" metr"
              />
              <p>{item?.user?.name}</p>
              <p>{item.user?.shift == "B" ? "B" : "A"}</p>
              <div className="flex items-center gap-[10px] justify-end">
                {user.role == "superadmin" && (
                  <button
                    onClick={() => {
                      const confirm = window.confirm("O'chirilsinmi?");

                      if (confirm) {
                        setLoading(true);
                        axios(`${baseUrl}/printing/painting/${item._id}`, {
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
            <div className="grid grid-cols-[150px_150px_150px_200px_150px_minmax(200px,1fr)_150px_50px] w-full gap-[10px] p-lg text-primary border-b border-primary items-center min-w-fit w-full">
              <input
                type="text"
                className="border-primary border-solid border-[1px] w-[80%] rounded bg-[transparent] outline-none p-sm"
                value={editing?.passNo}
                onChange={(e) =>
                  setEditing((prev) =>
                    prev
                      ? {
                          ...prev,
                          passNo: e.target.value,
                          gazapalId: prev.gazapalId ?? "",
                        }
                      : {
                          passNo: e.target.value,
                          date: new Date().toISOString().slice(0, 10),
                          user: {
                            id: user._id,
                            name: `${user.firstname} ${user.lastname}`,
                            role: user.role,
                            shift: "",
                          },
                          gazapalId: "",
                          cloth: { id: "", name: "" },
                          length: 0,
                        }
                  )
                }
              />
              <input
                type="text"
                className="border-primary border-solid border-[1px] w-[80%] rounded bg-[transparent] outline-none p-sm"
                value={editing?.date}
                onChange={(e) =>
                  setEditing((prev) =>
                    prev
                      ? {
                          ...prev,
                          date: e.target.value,
                          gazapalId: prev.gazapalId ?? "",
                        }
                      : {
                          date: e.target.value,
                          passNo: "",
                          user: {
                            id: user._id,
                            name: `${user.firstname} ${user.lastname}`,
                            role: user.role,
                            shift: "",
                          },
                          gazapalId: "",
                          cloth: { id: "", name: "" },
                          length: 0,
                        }
                  )
                }
              />
              <select
                className="border-primary border-solid border-[1px] w-[80%] rounded bg-[transparent] outline-none p-sm"
                value={editing?.gazapalId}
                onChange={(e) =>
                  setEditing((prev) =>
                    prev
                      ? {
                          ...prev,
                          gazapalId: e.target.value ?? "",
                        }
                      : {
                          gazapalId: e.target.value,
                          passNo: "",
                          user: {
                            id: user._id,
                            name: `${user.firstname} ${user.lastname}`,
                            role: user.role,
                            shift: "",
                          },
                          date: "",
                          cloth: { id: "", name: "" },
                          length: 0,
                        }
                  )
                }
              >
                <option value={""}>Tanlang</option>
                {gazapal?.map((g) => (
                  <option value={g._id} key={g._id}>
                    {g.passNo}
                  </option>
                ))}
              </select>
              <p>
                {gazapal?.find((g) => g._id == editing?.gazapalId)?.cloth
                  ?.name || ""}
              </p>{" "}
              <NumericFormat
                value={
                  gazapal?.find((g) => g._id == editing?.gazapalId)?.length
                }
                thousandSeparator=" "
                displayType="text"
                suffix=" metr"
              />
              <p>
                {user.firstname} {user.lastname}
              </p>
              <select
                className="border-primary border-solid border-[1px] w-[80%] rounded bg-[transparent] outline-none p-sm"
                value={editing?.user?.shift}
                onChange={(e) =>
                  setEditing((prev) =>
                    prev?.user
                      ? {
                          ...prev,
                          user: {
                            ...prev.user,
                            shift: e.target.value,
                          },
                        }
                      : {
                          passNo: e.target.value,
                          date: new Date().toISOString().slice(0, 10),
                          user: {
                            id: user._id,
                            name: `${user.firstname} ${user.lastname}`,
                            role: user.role,
                            shift: "",
                          },
                          gazapalId: "",
                          cloth: { id: "", name: "" },
                          length: 0,
                        }
                  )
                }
              >
                <option value="">Smenani tanlang</option>
                <option value="B">B</option>
                <option value="night">A</option>
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
