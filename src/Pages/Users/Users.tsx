import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface User {
  id?: number;
  firstname: string;
  lastname: string;
  username: string;
  role: string;
}

const roleLabels: Record<string, string> = {
  superadmin: "Super Admin",
  admin: "Admin",
  gazapal: "Gazapal",
  whitener: "Oqartiruvchi",
  painter: "Bo'yoqchi",
  ram: "Ram",
  printer: "Pechat",
  stretch: "Cho'zilish stanogi",
  zrelniy: "Zrelniy",
  finish: "Finish",
  finish_stretch: "Finish Stretch",
  calander: "Calander",
  calander_stretch: "Calander Stretch",
  stockman: "Omborchi",
};

export const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const token = localStorage.getItem("token") || "";
  const baseUrl = import.meta.env.VITE_APP_API_URL;

  useEffect(() => {
    axios(`${baseUrl}/users`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        setUsers(res.data.users || []);
      })
      .catch((err) => {
        toast.error(err.response?.data?.msg || "Foydalanuvchilar yuklanmadi");
        console.error("Error fetching users:", err);
      })
      .finally(() => setLoading(false));
  }, [baseUrl, token]);

  return (
    <div className="bg-primary text-primary w-full px-xl max-w-full lg:px-5xl py-5xl flex flex-col gap-2xl">
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-[#00000070] flex items-center justify-center z-50">
          <div className="bg-secondary p-5xl rounded-xl text-primary text-2xl">
            Yuklanmoqda...
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-xl">
        <h1 className="text-3xl text-primary font-medium">Foydalanuvchilar</h1>

        <p className="text-primary text-base">Jami: {users.length}</p>
      </div>

      <div className="flex flex-col overflow-x-auto">
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr] w-full min-w-[700px] p-md gap-sm bg-secondary rounded-t-xl">
          <p className="text-primary text-base text-left">Ism</p>
          <p className="text-primary text-base text-left">Familiya</p>
          <p className="text-primary text-base text-left">Username</p>
          <p className="text-primary text-base text-left">Role</p>
        </div>

        <div className="flex w-full min-w-[700px] flex-col max-h-[800px]">
          {users.map((user, index) => (
            <div
              key={user.id || user.username || index}
              className="grid grid-cols-[1fr_1fr_1fr_1fr] p-md gap-sm border-b border-secondary"
            >
              <p className="text-primary text-base text-left">
                {user.firstname}
              </p>

              <p className="text-primary text-base text-left">
                {user.lastname}
              </p>

              <p className="text-primary text-base text-left">
                {user.username}
              </p>

              <p className="text-primary text-base text-left">
                {roleLabels[user.role] || user.role}
              </p>
            </div>
          ))}

          {!loading && !users.length && (
            <div className="p-2xl border-b border-secondary text-center text-primary">
              Foydalanuvchilar topilmadi
            </div>
          )}
        </div>

        <div className="rounded-b-xl h-[30px] bg-secondary grid w-full min-w-[700px] grid-cols-[1fr_1fr_1fr_1fr]" />
      </div>
    </div>
  );
};
