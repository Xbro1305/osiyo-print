import axios from "axios";
import { useState } from "react";
import { BiUser } from "react-icons/bi";
import { CgPassword } from "react-icons/cg";
import { HiOutlineEye } from "react-icons/hi";
import { HiOutlineEyeSlash } from "react-icons/hi2";
import { toast } from "react-toastify";

export const Login = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    axios(`${import.meta.env.VITE_APP_API_URL}/users/signin`, {
      method: "POST",
      data: {
        username,
        password,
      },
    })
      .then((res) => {
        localStorage.setItem("token", res.data.token);

        const user = res.data.user;

        localStorage.setItem("user", JSON.stringify(user));

        switch (user.role) {
          case "admin":
            window.location.href = "/actions";
            break;

          case "superadmin":
            window.location.href = "/actions";
            break;

          case "gazapal":
            window.location.href = "/gazapal";
            break;

          case "whitener":
            window.location.href = "/whitening";
            break;
        }
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
          <BiUser />
          <input
            type="text"
            placeholder="Username"
            className="bg-[transparent] border-none outline-none text-primary text-[18px] p-[5px_10px] border-b-[2px] border-b-primary"
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>

        <label className="text-[22px] flex items-center gap-[5px] border-[2px] border-primary px-[10px] rounded-[10px]">
          <CgPassword />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="bg-[transparent] border-none outline-none text-primary text-[18px] p-[5px_10px] border-b-[2px] border-b-primary"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="text-primary text-[18px] ml-auto"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <HiOutlineEye /> : <HiOutlineEyeSlash />}
          </button>
        </label>
        <button
          type="submit"
          className="bg-secondary text-primary text-[18px] p-[10px] rounded-[8px] mt-[10px] hover:opacity-80 transition-opacity"
          disabled={loading}
        >
          {loading ? "Loading..." : "Login"}
        </button>
      </form>
    </div>
  );
};
