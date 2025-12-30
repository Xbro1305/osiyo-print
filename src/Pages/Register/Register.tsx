import { useState } from "react";
import { BiUser } from "react-icons/bi";
import { CgPassword } from "react-icons/cg";
import { HiOutlineEye } from "react-icons/hi";
import { HiOutlineEyeSlash } from "react-icons/hi2";
import { toast } from "react-toastify";
import axios from "axios";
import { LiaIdCard } from "react-icons/lia";
import { RiListCheck } from "react-icons/ri";

export const Register = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const values = Object.fromEntries(formData.entries());

    axios(`${import.meta.env.VITE_APP_API_URL}/users/create_admin`, {
      method: "POST",
      data: values,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then(() => {
        toast.success("Yaratildi!");
      })
      .catch((err) => {
        toast.error(err.response?.data?.msg || "Login failed");
        console.error("Login error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="flex bg-primary h-screen w-full items-center justify-center text-primary">
      <form
        className="flex flex-col gap-[12px]"
        onSubmit={(e) => handleSubmit(e)}
      >
        <label className="text-[22px] flex items-center gap-[5px] border-[2px] border-primary px-[10px] rounded-[10px]">
          <LiaIdCard />
          <input
            type="text"
            placeholder="Ism"
            name="firstname"
            className="bg-[transparent] border-none outline-none text-primary text-[18px] p-[5px_10px] border-b-[2px] border-b-primary"
          />
        </label>{" "}
        <label className="text-[22px] flex items-center gap-[5px] border-[2px] border-primary px-[10px] rounded-[10px]">
          <LiaIdCard />
          <input
            type="text"
            placeholder="Familiya"
            name="lastname"
            className="bg-[transparent] border-none outline-none text-primary text-[18px] p-[5px_10px] border-b-[2px] border-b-primary"
          />
        </label>{" "}
        <label className="text-[22px] flex items-center gap-[5px] border-[2px] border-primary px-[10px] rounded-[10px]">
          <BiUser />
          <input
            type="text"
            placeholder="Username"
            name="username"
            className="bg-[transparent] border-none outline-none text-primary text-[18px] p-[5px_10px] border-b-[2px] border-b-primary"
          />
        </label>
        <label className="text-[22px] flex items-center gap-[5px] border-[2px] border-primary px-[10px] rounded-[10px]">
          <CgPassword />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            className="bg-[transparent] border-none outline-none text-primary text-[18px] p-[5px_10px] border-b-[2px] border-b-primary"
          />
          <button
            type="button"
            className="text-primary text-[18px] ml-auto"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <HiOutlineEye /> : <HiOutlineEyeSlash />}
          </button>
        </label>{" "}
        <label className="text-[22px] flex items-center gap-[5px] border-[2px] border-primary px-[10px] rounded-[10px]">
          <RiListCheck />
          <select
            name="role"
            className="bg-[transparent] w-full border-none outline-none text-primary text-[18px] p-[5px_10px] border-b-[2px] border-b-primary"
          >
            <option value="admin">Admin</option>
            <option value="gazapal">Gazapal</option>
            <option value="whitener">Oqartiruvchi</option>
            <option value="painter">Bo'yovchi</option>
            <option value="ram">Ram</option>
            <option value="printer">Pechat stanok</option>
            <option value="stretch">Cho'zilish stanok</option>
          </select>
        </label>
        <button
          type="submit"
          className="bg-secondary text-primary text-[18px] p-[10px] rounded-[8px] mt-[10px] hover:opacity-80 transition-opacity"
          disabled={loading}
        >
          {loading ? "Loading..." : "Yaratish"}
        </button>
      </form>
    </div>
  );
};
