import { useEffect, useState } from "react";
import { FaEye } from "react-icons/fa";
import { NumericFormat } from "react-number-format";
import { LuTrash2 } from "react-icons/lu";
import { organizations, type Action, type ActionItem } from "../../../data";
import axios from "axios";
import { toast } from "react-toastify";
import { DesignSelect } from "../../../Components/DesignSelect";

interface Modal {
  action: Action;
  items: ActionItem[];
}

export const Home = () => {
  const [addingModal, setAddingModal] = useState<Modal | false>(false);
  const [openedModal, setOpenedModal] = useState<Modal | false>(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [query, setQuery] = useState<string>("");
  const [items, setItems] = useState<ActionItem[]>([]);

  const token = localStorage.getItem("token") || "";
  const baseUrl = import.meta.env.VITE_APP_API_URL;

  useEffect(() => {
    // axios.get(`${baseUrl}/organizations`).then((res) => {
    //   console.log("Organizations:", res.data);
    // });
    axios(`${baseUrl}/designs`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        setItems(res.data.innerData || []);
      })
      .catch((err) => {
        console.error("Error fetching items:", err);
      })
      .finally(() => setLoading(false));

    axios(`${baseUrl}/actions`)
      .then((res) => setActions(res.data.innerData || []))
      .catch((err) => {
        toast.error(err.response?.data?.msg || "Error fetching actions");
        console.error("Error fetching actions:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "+") {
        setAddingModal((prev) => {
          if (!prev) {
            // если модалка закрыта — создаем новую
            setTimeout(() => {
              setAddingModal({
                action: {
                  type: "out",
                  date: "",
                  fromId: 1,
                  toId: 3,
                  itemIds: [],
                  id: actions.length + 1,
                },
                items: [],
              });
            }, 100);
            return prev; // пока не трогаем state сразу
          } else {
            // если модалка уже открыта — добавляем новый item
            setTimeout(() => {
              setAddingModal((prevInner) => {
                if (!prevInner) return prevInner;
                return {
                  ...prevInner,
                  items: [
                    ...prevInner.items,
                    {
                      id: 0,
                      image: "",
                      article: "",
                      amount: 0,
                      cloth: "Poplin" as const,
                      stock: [],
                    },
                  ],
                };
              });
            }, 100);
            return prev;
          }
        });
      }

      if (e.key === "Escape") setAddingModal(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [actions.length]); // зависимость по actions, чтобы id корректно генерировался

  useEffect(() => getByQuery(), [query]);

  const getByQuery = () => {
    axios(`${baseUrl}/designs?article=${query}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        setItems(res.data.innerData || []);
      })
      .catch((err) => {
        console.error("Error fetching items:", err);
      })
      .finally(() => setLoading(false));
  };

  const handleSubmit = () => {
    if (!addingModal) return;
    setLoading(true);

    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();

    const data: Action = {
      type: addingModal.action.type,
      date: `${day}-${month}-${year}`,
      fromId: addingModal.action.fromId,
      toId: addingModal.action.toId,
      itemIds: addingModal.items.map((i) => ({
        article: i.article,
        amount: i.amount || 0,
      })),
      note: addingModal.action.note,
      id: actions.length + 1,
    };

    const d = [...actions, data];

    axios(`${baseUrl}/actions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data,
    })
      .then(() => {
        setQuery("");
        setActions(d);
        setAddingModal(false);
        toast.success("Operatsiya muvaffaqiyatli qo'shildi");
      })
      .catch((err) => {
        toast.error(err.response?.data?.msg || "Error adding action");
        console.error("Error adding action:", err);
      })
      .finally(() => setLoading(false));
  };

  const handleEdit = () => {
    if (!openedModal) return;
    setLoading(true);
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();

    const data: Action = {
      type: openedModal.action.type,
      date: `${day}-${month}-${year}`,
      fromId: openedModal.action.fromId,
      toId: openedModal.action.toId,
      itemIds: openedModal.items.map((i) => ({
        article: i.article,
        amount: i.amount || 0,
      })),
      note: openedModal.action.note,
      id: openedModal.action.id,
      edited: true,
    };

    axios(`${baseUrl}/actions/${data.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data,
    })
      .then((res) => {
        const acts = actions?.map((a) =>
          a.id == openedModal.action.id ? data : a
        );

        setActions(acts);
        setQuery("");

        setOpenedModal(false);
        toast.success(res.data.msg || "Operatsiya muvaffaqiyatli tahrirlandi");
      })
      .catch((err) => {
        toast.error(err.response?.data?.msg || "Error editing action");
        console.error("Error editing action:", err);
      })
      .finally(() => setLoading(false));
  };

  const handleDelete = () => {
    if (deletingId === null) return;

    setLoading(true);
    axios(`${baseUrl}/actions/${deletingId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        const d = actions.filter((a) => a.id != deletingId) || [];
        setActions(d);
        toast.success(res.data.msg || "Operatsiya muvaffaqiyatli o'chirildi");
      })
      .catch((err) => {
        toast.error(err.response?.data?.msg || "Error deleting action");
        console.error("Error deleting action:", err);
      })
      .finally(() => {
        setLoading(false);
        setDeletingId(null);
      });
  };

  return (
    <div className="bg-primary text-primary w-full px-xl max-w-full lg:px-5xl py-5xl flex flex-col gap-2xl">
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-[#00000070] flex items-center justify-center z-50">
          <div className="bg-secondary p-5xl rounded-xl text-primary text-2xl">
            Yuklanmoqda...
          </div>
        </div>
      )}

      <button
        className="p-sm rounded bg-secondary w-fit ml-auto"
        onClick={() =>
          setAddingModal({
            action: {
              type: "out",
              date: "",
              fromId: 1,
              toId: 3,
              itemIds: [],
              id: actions.length + 1,
            },
            items: [],
          })
        }
      >
        Operatsiya qo'shish
      </button>
      <div className="flex flex-col overflow-x-auto">
        <div className="grid w-full min-w-fit actions-table p-md gap-sm bg-secondary rounded-t-xl">
          <p className="text-primary text-base text-center"></p>
          <p className="text-primary text-base text-center">Sana</p>
          <p className="text-primary text-base text-center">Mahsulot soni</p>
          <p className="text-primary text-base text-center">Mahsulot miqdori</p>
          <p className="text-primary text-base text-center">Kimdan</p>
          <p className="text-primary text-base text-center">Kimga</p>
          <p className="text-primary text-base text-left">Izoh</p>
          <p></p>
        </div>
        <div className="flex w-full min-w-fit flex-col max-h-[800px]">
          {actions.map((action) => {
            const actionItems = action.itemIds.map((id) => ({
              ...items.find((i: any) => i.article == id.article),
              amount: id.amount,
            }));

            const itemsAmount = action.itemIds.reduce(
              (pr, i) => pr + i.amount,
              0
            );

            return (
              <div className="grid actions-table p-md gap-sm border-b border-secondary">
                <p className="text-primary text-base text-left">
                  {action.type == "in"
                    ? "Kirim"
                    : action.type == "out"
                    ? "Chiqim"
                    : "Qaytib kelgan"}
                </p>
                <p className="text-primary text-base text-center">
                  {action.date}
                </p>
                <p className="text-primary text-base text-center">
                  {action.itemIds.length}
                </p>
                <p className="text-primary text-base text-center">
                  <NumericFormat
                    value={itemsAmount}
                    displayType="text"
                    thousandSeparator=" "
                  />{" "}
                  Metr
                </p>
                <p className="text-primary text-base text-center">
                  {organizations.find((org) => org.id == action.fromId)?.name}
                </p>
                <p className="text-primary text-base text-center">
                  {organizations.find((org) => org.id == action.toId)?.name}
                </p>
                <p className="text-primary text-base text-left flex items-center gap-[10px]">
                  {action.note}{" "}
                  {action.edited && (
                    <p className="text-[#ffc700_!important]">(Taxrirlangan)</p>
                  )}
                </p>
                <div className="flex items-center gap-xl">
                  <button
                    onClick={() =>
                      setOpenedModal({
                        action,
                        items: actionItems as ActionItem[],
                      })
                    }
                  >
                    <FaEye />
                  </button>{" "}
                  <button onClick={() => setDeletingId(action.id)}>
                    <LuTrash2 />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="rounded-b-xl h-[30px] bg-secondary grid w-full min-w-fit actions-table"></div>
      </div>

      {openedModal && (
        <div className="w-full h-full fixed top-0 left-0 bg-[#00000070] flex items-center justify-center">
          <div className="flex flex-col gap-2xl md:rounded-xl bg-secondary p-2xl w-[500px] max-h-[90%] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl text-primary">Operatsiya qo'shish</h1>
              <button
                className="text-xl ml-auto"
                onClick={() => {
                  setOpenedModal(false);
                  setQuery("");
                }}
              >
                &times;
              </button>
            </div>
            <label className="flex flex-col gap-sm">
              <p className="text-primary text-base">Operatsiya turi</p>
              <select
                className="bg-[transparent] border-solid border-[1px] border-secondary rounded p-sm text-lg"
                value={openedModal ? openedModal.action.type : "out"}
                onChange={(e) => {
                  setOpenedModal((prev) => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      action: {
                        ...prev.action,
                        type: e.target.value as "out" | "in" | "return",
                      },
                    };
                  });
                }}
              >
                <option value="in">Kirim</option>
                <option value="out">Chiqim</option>
                <option value="return">Qaytim</option>
              </select>
            </label>
            <label className="flex flex-col gap-sm">
              <p className="text-primary text-base">
                {openedModal.action.type == "return" ? "Kimga" : "Kimdan"}
              </p>
              <select
                className="bg-[transparent] border-solid border-[1px] border-secondary rounded p-sm text-lg"
                value={openedModal ? openedModal.action.fromId : 0}
                onChange={(e) => {
                  setOpenedModal((prev) => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      action: {
                        ...prev.action,
                        fromId: Number(e.target.value),
                      },
                    };
                  });
                }}
              >
                {organizations
                  .filter((org) => org.sender)
                  .map((org) => (
                    <option value={org.id}>{org.name}</option>
                  ))}
              </select>
            </label>{" "}
            <label className="flex flex-col gap-sm">
              <p className="text-primary text-base">
                {openedModal.action.type != "return" ? "Kimga" : "Kimdan"}
              </p>

              <select
                className="bg-[transparent] border-solid border-[1px] border-secondary rounded p-sm text-lg"
                value={openedModal ? openedModal.action.toId : 0}
                onChange={(e) => {
                  setOpenedModal((prev) => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      action: {
                        ...prev.action,
                        toId: Number(e.target.value),
                      },
                    };
                  });
                }}
              >
                {organizations
                  .filter((org) => org.id != openedModal.action.fromId)
                  .map((org) => (
                    <option value={org.id}>{org.name}</option>
                  ))}
              </select>
            </label>
            <label className="flex flex-col gap-sm">
              <p className="text-primary text-base">Izoh:</p>

              <input
                className="bg-[transparent] border-solid border-[1px] border-secondary rounded p-sm  text-lg"
                value={openedModal ? openedModal.action.note : ""}
                onChange={(e) => {
                  setOpenedModal((prev) => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      action: {
                        ...prev.action,
                        note: e.target.value,
                      },
                    };
                  });
                }}
              />
            </label>
            <div className="flex items-center justify-between">
              <p>{openedModal.items.length}ta mahsulot</p>
              <button
                className="rounded px-xl py-sm bg-tertiary text-primary"
                onClick={() =>
                  setOpenedModal((prev) => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      items: [
                        ...prev.items,
                        {
                          id: 0,
                          image: "",
                          article: "",
                          cloth: "Poplin" as const,
                          stock: organizations
                            .filter((o) => o.sender)
                            .map((org) => ({
                              stock: 0,
                              orgId: org.id,
                            })),
                        },
                      ] as ActionItem[],
                    };
                  })
                }
              >
                {" "}
                + mahsulot qo'shish
              </button>
            </div>
            {openedModal.items.length && (
              <div className="flex flex-col">
                <div className="grid grid-cols-[200px_100px] p-sm gap-2xl rounded-t-xl overflow-hidden bg-tertiary">
                  <p className="text-primary text-base">Rasm, artikul</p>
                  <p className="text-primary text-base">Miqdori</p>
                </div>
                {openedModal.items.map((item, index) => {
                  const availableItems = items.filter(
                    (i: any) =>
                      !openedModal.items
                        .filter((_, idx) => idx !== index) // исключаем текущую строку
                        .some((p) => p.article && p.article === i.article) // если где-то ещё есть такой id (и он не 0) — исключаем
                  );
                  return (
                    <div className="grid grid-cols-[200px_1fr_50px] items-center gap-2xl p-sm overflow-hidden border-b border-secondary">
                      <DesignSelect
                        creating={false}
                        props={availableItems as unknown as ActionItem[]}
                        selected={item}
                        query={query}
                        changeQuery={(q) => setQuery(q)}
                        onChange={(selectedItem) => {
                          setOpenedModal((prev) => {
                            if (!prev) return prev;
                            const newItems = [...prev.items];
                            if (selectedItem) {
                              newItems[index] = {
                                ...selectedItem,
                                amount: item.amount || 0,
                              };
                            }
                            return {
                              ...prev,
                              items: newItems,
                            };
                          });
                        }}
                      />
                      <NumericFormat
                        value={item.amount}
                        onValueChange={(value) => {
                          setOpenedModal((prev) => {
                            if (!prev) return prev;
                            const newItems = [...prev.items];

                            newItems[index] = {
                              ...newItems[index],
                              amount: Number(value.floatValue),
                            };

                            return {
                              ...prev,
                              items: newItems,
                            };
                          });
                        }}
                        thousandSeparator=" "
                        className="bg-[transparent] border-solid border-[1px] border-secondary rounded outline-none w-[100px] md:w-[150px] p-sm"
                        suffix=" metr"
                      />
                      <button
                        className="bg-[transparent] border-none text-primary text-lg"
                        onClick={() => {
                          setOpenedModal((prev) => {
                            if (!prev) return prev;

                            return {
                              ...prev,
                              items: prev.items.filter(
                                (_, idx) => idx !== index
                              ),
                            };
                          });
                        }}
                      >
                        <LuTrash2 />
                      </button>
                    </div>
                  );
                })}
                <div className="grid grid-cols-[150px_100px_100px] p-xl gap-lg rounded-b-xl overflow-hidden bg-tertiary"></div>
              </div>
            )}
            <div className="flex items-center justify-end gap-lg">
              <button
                className="bg-tertiary p-sm px-lg rounded "
                onClick={() => handleEdit()}
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
      {addingModal && (
        <div className="w-full h-full fixed top-0 left-0 bg-[#00000070] flex items-center justify-center">
          <div className="flex flex-col gap-2xl md:rounded-xl bg-secondary p-2xl w-[500px] max-h-[90%] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl text-primary">Operatsiya qo'shish</h1>
              <button
                className="text-xl ml-auto"
                onClick={() => {
                  setAddingModal(false);
                  setQuery("");
                }}
              >
                &times;
              </button>
            </div>
            <label className="flex flex-col gap-sm">
              <p className="text-primary text-base">Operatsiya turi</p>
              <select
                className="bg-[transparent] border-solid border-[1px] border-secondary rounded p-sm text-lg"
                value={addingModal ? addingModal.action.type : "out"}
                onChange={(e) => {
                  setAddingModal((prev) => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      action: {
                        ...prev.action,
                        type: e.target.value as "out" | "in" | "return",
                      },
                    };
                  });
                }}
              >
                <option value="in">Kirim</option>
                <option value="out">Chiqim</option>
                <option value="return">Qaytim</option>
              </select>
            </label>
            <label className="flex flex-col gap-sm">
              <p className="text-primary text-base">
                {addingModal.action.type == "return" ? "Kimga" : "Kimdan"}
              </p>
              <select
                className="bg-[transparent] border-solid border-[1px] border-secondary rounded p-sm text-lg"
                value={addingModal ? addingModal.action.fromId : 0}
                onChange={(e) => {
                  setAddingModal((prev) => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      action: {
                        ...prev.action,
                        fromId: Number(e.target.value),
                      },
                    };
                  });
                }}
              >
                {organizations
                  .filter((org) => org.sender)
                  .map((org) => (
                    <option value={org.id} key={org.id}>
                      {org.name}
                    </option>
                  ))}
              </select>
            </label>{" "}
            <label className="flex flex-col gap-sm">
              <p className="text-primary text-base">
                {addingModal.action.type != "return" ? "Kimga" : "Kimdan"}
              </p>

              <select
                className="bg-[transparent] border-solid border-[1px] border-secondary rounded p-sm text-lg"
                value={addingModal ? addingModal.action.toId : 0}
                onChange={(e) => {
                  setAddingModal((prev) => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      action: {
                        ...prev.action,
                        toId: Number(e.target.value),
                      },
                    };
                  });
                }}
              >
                {organizations
                  .filter((org) => org.id != addingModal.action.fromId)
                  .map((org) => (
                    <option value={org.id} key={org.id}>
                      {org.name}
                    </option>
                  ))}
              </select>
            </label>
            <label className="flex flex-col gap-sm">
              <p className="text-primary text-base">Izoh:</p>

              <input
                className="bg-[transparent] border-solid border-[1px] border-secondary rounded p-sm text-lg"
                value={addingModal.action.note || ""}
                onChange={(e) => {
                  setAddingModal((prev) => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      action: {
                        ...prev.action,
                        note: e.target.value,
                      },
                    };
                  });
                }}
              />
            </label>
            <div className="flex items-center justify-between">
              <p>{addingModal.items.length}ta mahsulot</p>
              <button
                className="rounded px-xl py-sm bg-tertiary text-primary"
                onClick={() =>
                  setAddingModal((prev) => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      items: [
                        ...prev.items,
                        {
                          id: 0,
                          image: "",
                          article: "",
                          cloth: "Poplin" as const,
                          stock: organizations
                            .filter((o) => o.sender)
                            .map((org) => ({
                              stock: 0,
                              orgId: org.id,
                            })),
                        },
                      ] as ActionItem[],
                    };
                  })
                }
              >
                {" "}
                + mahsulot qo'shish
              </button>
            </div>
            {addingModal.items.length && (
              <div className="flex flex-col">
                <div className="grid grid-cols-[200px_100px] p-sm gap-2xl rounded-t-xl overflow-hidden bg-tertiary">
                  <p className="text-primary text-base">Rasm, artikul</p>
                  <p className="text-primary text-base">Miqdori</p>
                </div>
                {addingModal.items.map((item, index) => {
                  const availableItems = items.filter(
                    (i: any) =>
                      !addingModal.items
                        .filter((i) => i.article !== item.article) // исключаем текущую строку
                        .some((p) => p.article && p.article === i.article) // если где-то ещё есть такой id (и он не 0) — исключаем
                  );
                  return (
                    <div className="grid grid-cols-[200px_1fr_50px] items-center gap-2xl p-sm overflow-hidden border-b border-secondary">
                      <DesignSelect
                        props={availableItems as unknown as ActionItem[]}
                        query={query}
                        changeQuery={(q) => setQuery(q)}
                        onChange={(selectedItem) => {
                          setAddingModal((prev) => {
                            if (!prev) return prev;
                            const newItems = [...prev.items];
                            if (selectedItem) {
                              newItems[index] = {
                                ...selectedItem,
                                amount: item.amount || 0,
                              };
                            }
                            return {
                              ...prev,
                              items: newItems,
                            };
                          });
                        }}
                      />
                      <NumericFormat
                        value={item.amount}
                        onValueChange={(value) => {
                          setAddingModal((prev) => {
                            if (!prev) return prev;
                            const newItems = [...prev.items];

                            newItems[index] = {
                              ...newItems[index],
                              amount: Number(value.floatValue),
                            };

                            return {
                              ...prev,
                              items: newItems,
                            };
                          });
                        }}
                        thousandSeparator=" "
                        className="bg-[transparent] border-solid border-[1px] border-secondary rounded outline-none w-[100px] md:w-[150px] p-sm"
                        suffix=" metr"
                      />
                      <button
                        className="bg-[transparent] border-none text-primary text-lg"
                        onClick={() => {
                          setAddingModal((prev) => {
                            if (!prev) return prev;

                            return {
                              ...prev,
                              items: prev.items.filter(
                                (_, idx) => idx !== index
                              ),
                            };
                          });
                        }}
                      >
                        <LuTrash2 />
                      </button>
                    </div>
                  );
                })}
                <div className="grid grid-cols-[120px_100px_100px] p-xl gap-lg rounded-b-xl overflow-hidden bg-tertiary"></div>
              </div>
            )}
            <div className="flex items-center justify-end gap-lg">
              <button
                className="bg-tertiary p-sm px-lg rounded "
                onClick={() => handleSubmit()}
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
      {deletingId !== null && (
        <div className="w-full h-full fixed top-0 left-0 bg-[#00000070] flex items-center justify-center">
          <div className="bg-secondary p-5xl rounded-xl text-primary text-2xl flex flex-col gap-2xl">
            <p>Operatsiya o'chirilsinmi?</p>
            <div className="flex items-center gap-lg justify-end">
              <button
                className="bg-tertiary p-sm px-lg rounded"
                onClick={() => setDeletingId(null)}
              >
                Bekor qilish
              </button>
              <button
                className="bg-red-600 p-sm px-lg rounded text-primary"
                onClick={() => handleDelete()}
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
