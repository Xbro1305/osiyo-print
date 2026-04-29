import { useEffect, useState } from "react";
import { MdLogout } from "react-icons/md";
import { NavLink } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "../hooks/darkTheme";

export const Header = () => {
  const [displayRole, setDisplayRole] = useState<string>("");
  const { theme, toggleTheme } = useTheme();

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
      case "printer":
        setDisplayRole("Pechat");
        break;
      case "stretch":
        setDisplayRole("Cho'zilish stanogi");
        break;
      case "zrelniy":
        setDisplayRole("Zrelniy");
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
      title: "Qoldiqlar",
      url: "/stock",
      allowed: ["admin", "superadmin", "stockman"],
    },

    {
      title: "Ishchi hisob qo'shish",
      url: "/register",
      allowed: ["superadmin"],
    },

    {
      title: "Pechat sexi",
      url: "/printing/gazapal",
      allowed: ["superadmin"],
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
    <nav>
      <header className="p-[20px_50px] border-b border-active bg-primary flex items-center justify-between gap-[20px]">
        <div className="flex items-center gap-[20px] max-w-[calc(100%_-_350px)] overflow-x-auto whitespace-nowrap">
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
          className="flex items-center gap-[5px] text-primary cursor-pointer whitespace-nowrap ml-auto"
          onClick={logout}
        >
          {user.firstname} {"  "}
          {user.lastname}, {"  "}
          {displayRole}
          <MdLogout />
        </button>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </header>
    </nav>
  );
};
