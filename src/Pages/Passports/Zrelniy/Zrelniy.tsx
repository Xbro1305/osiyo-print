import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaCheck, FaPen, FaPlus } from "react-icons/fa";
import { LuShare, LuTrash2 } from "react-icons/lu";
import { NumericFormat } from "react-number-format";
import { toast } from "react-toastify";
import { MultipleSelect } from "../../../Components/MultipleSelect";

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
  printIds?: { id: number | string; value: string }[];
  prints?: {
    passNo: string;
    printed: number;
    orderName: string;
    orderCloth: string;
  }[];
  speed?: number;
  remperature?: number;
}

export const Zrelniy = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [zrelniy, setZrelniy] = useState<Data[]>([]);
  const [adding, setAdding] = useState<Data | null>(null);
  const [editing, setEditing] = useState<any>(null);
  const [print, setPrint] = useState<IPassData[] | null>(null);
  const [deleting, setDeleting] = useState<Data | null>(null);

  const baseUrl = import.meta.env.VITE_APP_API_URL;
  const user = JSON.parse(localStorage.getItem("user") || "");

  const refresh = () =>
    axios(`${baseUrl}/printing/zrelniy`)
      .then((res) => setZrelniy(res.data.zrelniy))
      .catch(() => toast.error("Nimadir xato"))
      .finally(() => setLoading(false));

  useEffect(() => {
    axios(`${baseUrl}/printing/prints`)
      .then((res) => setPrint(res.data.prints))
      .catch(() => toast.error("Nimadir xato"));

    refresh();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adding) return;

    setLoading(true);

    const data = {
      ...adding,
    };

    axios(`${baseUrl}/printing/zrelniy`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      data,
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

    axios(`${baseUrl}/printing/zrelniy/${editing?._id}`, {
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
        <div className="grid grid-cols-[150px_150px_250px_150px_150px_150px_150px_250px_minmax(200px,1fr)_150px_150px_50px] w-full gap-[10px] p-lg bg-secondary text-primary rounded-t-[8px] border-b border-primary min-w-fit w-full">
          <p>Passport No.</p>
          <p>Sana</p>
          <p>Pechat</p>
          <p>Zakaz nomi</p>
          <p>Mato nomi</p>
          <p>Pechat metri</p>
          <p>Tezlik</p>
          <p>Harorat</p>
          <p>Holat</p>
          <p>Operator</p>
          <p>Smena</p>
          <p></p>
        </div>{" "}
        {zrelniy.map((row: Data) =>
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
              readOnly={true}
              setEditing={setEditing}
              setDeleting={setDeleting}
            />
          )
        )}
        {adding && (
          <Row
            key={adding._id}
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
                  axios(`${baseUrl}/printing/zrelniy/${deleting._id}`, {
                    method: "DELETE",
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  })
                    .then((res) => {
                      toast.success(res.data.message);
                      setDeleting(null);
                    })
                    .catch((err) =>
                      toast.success(err.response.data.msg || "Nimadir xato")
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
}: RowProps) => {
  if (!value) return null;

  const update = (patch: any) =>
    onChange?.((prev: any) => (prev ? { ...prev, ...patch } : prev));

  return (
    <div className="grid grid-cols-[150px_150px_250px_150px_150px_150px_150px_250px_minmax(200px,1fr)_150px_150px_50px] w-full gap-[10px] p-lg text-primary border-b border-primary items-center min-w-fit">
      <input
        className={`rounded bg-transparent outline-none p-sm ${
          !readOnly && "border-primary border border-solid w-[80%]"
        }`}
        value={value.passNo}
        onChange={(e) => update({ passNo: e.target.value })}
        readOnly={readOnly}
      />
      <input
        className={`rounded bg-transparent outline-none p-sm ${
          !readOnly && "border-primary border border-solid w-[80%]"
        }`}
        value={value.date}
        onChange={(e) => update({ date: e.target.value })}
        readOnly={readOnly}
      />
      {readOnly ? (
        <p className="flex flex-wrap gap-[6px]">
          {value.prints.map((g: any) => (
            <span key={g._id}>{g.passNo},</span>
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
            update({ printIds: items });
          }}
        />
      )}
      <p className="flex flex-wrap gap-[6px]">
        {readOnly
          ? value.prints.map((g: any) => (
              <span key={g._id}>{g.orderName},</span>
            ))
          : print
              ?.filter((g) =>
                (value.printIds || []).some((i: any) => i.id === g._id)
              )
              .map((g) => <span key={g._id}>{g.order.name},</span>)}
      </p>{" "}
      <p className="flex flex-wrap gap-[6px]">
        {readOnly
          ? value.prints.map((g: any) => (
              <span key={g._id}>{g?.orderCloth},</span>
            ))
          : print
              ?.filter((g) =>
                (value.printIds || []).some((i: any) => i.id === g._id)
              )
              .map((g) => <span key={g._id}>{g?.order.cloth},</span>)}
      </p>
      <p className="flex flex-wrap gap-[6px]">
        {readOnly
          ? value?.prints?.map((g: any) => (
              <span key={g._id}>
                <NumericFormat
                  value={g?.printed}
                  displayType="text"
                  thousandSeparator=" "
                  suffix=" metr"
                />
                ,
              </span>
            ))
          : print
              ?.filter((g) =>
                (value?.printIds || [])?.some((i: any) => i.id === g._id)
              )
              .map((g) => (
                <span key={g._id}>
                  <NumericFormat
                    value={g.order.printed}
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
        value={value?.speed || ""}
        thousandSeparator=" "
        onValueChange={(v) => update({ speed: v.floatValue })}
      />{" "}
      <NumericFormat
        readOnly={readOnly}
        className={`rounded bg-transparent outline-none p-sm ${
          !readOnly && "border-primary border border-solid w-[80%]"
        }`}
        value={value?.temperature || ""}
        thousandSeparator=" "
        onValueChange={(v) => update({ temperature: v.floatValue })}
      />
      {readOnly ? (
        <p>{value.status == "completed" ? "Tugallangan" : "Jarayonda"}</p>
      ) : (
        <select
          className={`rounded bg-transparent outline-none p-sm ${
            !readOnly && "border-primary border border-solid w-[80%]"
          }`}
          value={value.status || ""}
          onChange={(e) =>
            update({
              status: e.target.value,
            })
          }
        >
          <option value="">Tanlang</option>
          <option value="completed">Tugallangan</option>
          <option value="progress">Jarayonda</option>
        </select>
      )}{" "}
      <p>
        {readOnly ? value.user?.name : `${user.firstname} ${user.lastname}`}
      </p>
      {readOnly ? (
        <p>{value.user?.shift || "Smena tanlanmagan"}</p>
      ) : (
        <select
          className={`rounded bg-transparent outline-none p-sm ${
            !readOnly && "border-primary border border-solid w-[80%]"
          }`}
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
