import { useEffect, useState } from "react";
import { organizations, type Item } from "../../../data";
import { LuPen } from "react-icons/lu";
import { NumericFormat } from "react-number-format";
import axios from "axios";
import { toast } from "react-toastify";
import { FaArrowRight } from "react-icons/fa";

export const Stock = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [archiveOpened, setArchiveOpened] = useState<number | false>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [orgId, setOrgId] = useState<number>(1);
  const [stockHistory, setStockHistory] = useState<any | false>(false);
  const [list, setList] = useState<Item[]>();

  const baseUrl = import.meta.env.VITE_APP_API_URL;

  const update = () => {
    axios(`${baseUrl}/designs`)
      .then((res) => {
        setItems(res.data.innerData || []);
        setList(res.data.innerData || []);
      })
      .catch((err) => {
        toast.error(err.response.data.msg || "Nimadir xato");
        console.log(err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => update(), []);

  useEffect(() => {
    if (searchTerm == "") {
      const i = items.filter(
        (m) => m.stock?.length && m.stock.some((s) => s.orgId == orgId)
      );

      setList(i);
    } else {
      const filteredItems = items?.filter((item) =>
        item?.article?.toLowerCase()?.includes(searchTerm.toLowerCase())
      );

      setList(filteredItems);
    }
  }, [searchTerm, orgId, items]);

  useEffect(() => {
    if (archiveOpened === false) return;

    axios(`${baseUrl}/designs/stock?designId=${archiveOpened}&orgId=${orgId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => setStockHistory(res.data.history))
      .catch((err) => {
        toast.error(err.response.data.msg || "Nimadir xato");
        console.log(err);
      })
      .finally(() => setLoading(false));
  }, [archiveOpened]);

  useEffect(() => {
    if (!editingItem) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEditingItem(null);
      }

      if (e.key === "Enter") {
        handleEditItem(editingItem);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [editingItem]);

  const handleEditItem = (updatedItem: Item) => {
    // const updatedItems = items.map((item) =>
    //   item.id === updatedItem.id ? updatedItem : item
    // );
    // setItems(updatedItems);

    setLoading(true);

    axios(`${baseUrl}/designs/stock`, {
      method: "POST",
      headers: {
        Authorization: `Beare ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      data: {
        orgId,
        designId: updatedItem.id,
        newQty: updatedItem?.stock?.find((s) => s.orgId == orgId)?.stock || 0,
        description: "",
      },
    })
      .then((res) => console.log(res))
      .catch((err) => console.log(err))
      .finally(() => update());

    setEditingItem(null);
  };

  return (
    <div className="bg-primary text-primary p-[50px] h-fit">
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-[#00000070] flex items-center justify-center z-50">
          <div className="bg-secondary p-5xl rounded-xl text-primary text-2xl">
            Yuklanmoqda...
          </div>
        </div>
      )}

      <div className="flex flex-col">
        <div
          className="grid gap-[10px] mb-[20px] items-center min-h-fit"
          style={{
            gridTemplateColumns: "250px 150px 250px 150px 200px 200px 1fr",
          }}
        >
          <input
            type="search"
            placeholder="Artikul"
            className="p-sm rounded border border-primary bg-primary text-primary w-full box-border outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <p className="font-bold">Omborda</p>
          <p className="font-bold">Taxrirlangan</p>
          <p className="font-bold">Jami</p>
          <p className="font-bold"></p>
          <div className="flex justify-end items-center gap-[10px]">
            Ombor:
            <select
              className="bg-[transparent] p-[5px_10px] outline-none"
              value={orgId}
              onChange={(e) => setOrgId(Number(e.target.value || 0))}
            >
              {organizations
                .filter((o) => o.sender)
                .map((org) => (
                  <option value={org.id} key={org.id}>
                    {org.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
        {list?.map((item) => {
          const totalStock = item.stock?.reduce(
            (acc, curr) => acc + (curr.stock || 0),
            0
          );

          return (
            <div
              key={item.id}
              className="grid gap-[10px] items-center mb-[10px]"
              style={{
                gridTemplateColumns: "250px 150px 250px 150px 200px 200px",
              }}
            >
              <div className="flex items-center gap-[10px]">
                <img
                  src={`${baseUrl}${item.image}`}
                  className="aspect-square w-[120px] object-cover rounded-[8px]"
                  alt=""
                />{" "}
                <p className="flex flex-col">
                  <span>{item.article}</span>
                  <span>{item.cloth}</span>
                </p>
              </div>
              {editingItem && editingItem.id === item.id ? (
                <NumericFormat
                  autoFocus
                  thousandSeparator=" "
                  suffix=" Metr"
                  value={
                    editingItem?.stock?.find((s) => s?.orgId === orgId)
                      ?.stock || 0
                  }
                  onValueChange={(values) => {
                    const updatedStock = values.floatValue || 0;
                    const date = new Date().getDate();
                    const month = new Date().getMonth() + 1;
                    const year = new Date().getFullYear();
                    setEditingItem({
                      ...editingItem,
                      stock: (() => {
                        const exists = editingItem.stock?.some(
                          (s) => s.orgId === orgId
                        );

                        const formattedDate = `${
                          date < 10 ? "0" + date : date
                        }-${month < 10 ? "0" + month : month}-${year}`;

                        // Если существует — обновляем
                        if (exists && editingItem !== undefined) {
                          return (editingItem?.stock ?? []).map((s) =>
                            s.orgId === orgId
                              ? {
                                  ...s,
                                  stock: updatedStock,
                                  updated: formattedDate,
                                }
                              : s
                          );
                        }

                        // Если не существует — добавляем новое значение
                        return [
                          ...(editingItem.stock || []),
                          {
                            orgId,
                            stock: updatedStock,
                            updated: formattedDate,
                          },
                        ];
                      })(),
                    });
                  }}
                  className="p-sm rounded border border-active bg-primary text-primary w-full box-border"
                />
              ) : (
                <NumericFormat
                  value={
                    item?.stock?.find((s) => s.orgId === orgId)?.stock || 0
                  }
                  suffix=" Metr"
                  displayType="text"
                  thousandSeparator=" "
                />
              )}
              <p>
                {item.stock
                  ?.find((s) => s.orgId === orgId)
                  ?.updated?.replace("T", " ")
                  .split(".")[0] || "-"}
              </p>
              <p>{totalStock || 0} Metr</p>
              {editingItem && editingItem.id === item.id ? (
                <button
                  className="p-sm rounded bg-secondary text-primary px-xl"
                  onClick={() => handleEditItem(editingItem)}
                >
                  Saqlash
                </button>
              ) : (
                <button
                  className="p-sm rounded bg-secondary text-primary px-xl flex items-center text-center justify-center gap-[5px]"
                  onClick={() => {
                    if (editingItem) handleEditItem(editingItem);
                    setEditingItem(item);
                  }}
                >
                  <LuPen /> Taxrirlash
                </button>
              )}
              <button
                className="p-sm rounded bg-secondary text-primary px-xl"
                onClick={() => {
                  setArchiveOpened(item.id);
                  setLoading(true);
                }}
              >
                Yangilanish tarixi
              </button>
            </div>
          );
        })}
      </div>

      {archiveOpened !== false && stockHistory && (
        <div className="fixed top-0 left-0 w-full h-full bg-[#00000070] flex items-center justify-center z-50">
          <div className="bg-secondary p-5xl rounded-xl text-primary text-2xl w-[600px] flex flex-col gap-[30px]">
            <div className="flex items-center justify-between">
              <p className="text-primary text-[24px]">Tarix</p>{" "}
              <button
                className="bg-none border-none"
                onClick={() => {
                  setArchiveOpened(false);
                  setStockHistory(false);
                }}
              >
                &times;
              </button>
            </div>
            <div className="flex flex-col gap-[1px] text-[20px]">
              <div className="grid grid-cols-2">
                <p>Sana</p>
                <p>Qoldiq</p>
              </div>
              {stockHistory
                .filter((s: any) => s.designId == archiveOpened)
                .map((s: any) => (
                  <div className="grid grid-cols-2" key={s._id}>
                    <p>{s.createdAt.replace("T", " ").split(".")[0]}</p>
                    <div className="flex items-center gap-[5px]">
                      <p
                        style={{
                          color:
                            s.newQty == s.oldQty
                              ? ""
                              : s.newQty < s.oldQty
                              ? "#00b900"
                              : "red",
                        }}
                      >
                        {s.oldQty}
                      </p>
                      <FaArrowRight />
                      <p
                        style={{
                          color:
                            s.newQty == s.oldQty
                              ? ""
                              : s.newQty > s.oldQty
                              ? "#00b900"
                              : "red",
                        }}
                      >
                        {s.newQty}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
