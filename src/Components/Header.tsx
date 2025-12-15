import { useEffect, useState } from "react";
import { MdLogout } from "react-icons/md";
import { NavLink } from "react-router-dom";

export const Header = () => {
  const [displayRole, setDisplayRole] = useState<string>("");

  const user = JSON.parse(localStorage.getItem("user") || "");

  useEffect(() => {
    if (!user) return;

    switch (user.role) {
      case "superadmin":
        setDisplayRole("Super Admin");
        break;
      case "admin":
        setDisplayRole("Admin");
        break;
      case "gazapal":
        setDisplayRole("Gazapal");
        break;
      case "whitener":
        setDisplayRole("Oqartiruvchi");
        break;
      case "painter":
        setDisplayRole("Bo'yoqchi");
        break;
      case "ram":
        setDisplayRole("Ram");
        break;
      default:
        setDisplayRole("Mehmon");
        break;
    }
  }, [user]);

  const links = [
    {
      title: "Operatsiyalar",
      url: "/actions",
      allowed: ["admin", "superadmin"],
    },

    {
      title: "Dizaynlar",
      url: "/catalogue",
      allowed: ["admin", "superadmin", "stockman"],
    },

    {
      title: "Qoldiq",
      url: "/stock",
      allowed: ["admin", "superadmin", "stockman"],
    },

    {
      title: "Admin qo'shish",
      url: "/register",
      allowed: ["superadmin"],
    },

    {
      title: "Gazapal",
      url: "/gazapal",
      allowed: ["gazapal", "admin", "superadmin"],
    },
    {
      title: "Oqartirish",
      url: "/whitening",
      allowed: ["whitener", "admin", "superadmin"],
    },
    {
      title: "Bo'yash",
      url: "/painting",
      allowed: ["painter", "admin", "superadmin"],
    },
    {
      title: "Ram",
      url: "/ram",
      allowed: ["ram  ", "admin", "superadmin"],
    },
  ];

  const logout = () => {
    const confirm = window.confirm("Chiqib ketilsinmi?");

    if (confirm) {
      localStorage.clear();
      return window.location.reload();
    }
  };

  return (
    <header className="p-[20px_50px] border-b border-active bg-primary flex items-center justify-between">
      <div className="flex items-center gap-[20px]">
        {links
          .filter((l) => l.allowed.includes(user.role))
          .map((link) => (
            <NavLink
              to={link.url}
              key={link.url}
              className={({ isActive }) =>
                `${
                  isActive ? "text-active font-medium" : "text-primary"
                } hover:underline`
              }
            >
              {link.title}
            </NavLink>
          ))}
      </div>
      <button
        className="flex items-center gap-[5px] text-primary cursor-pointer"
        onClick={logout}
      >
        {user.firstname} {"  "}
        {user.lastname}, {"  "}
        {displayRole}
        <MdLogout />
      </button>
    </header>
  );
};
