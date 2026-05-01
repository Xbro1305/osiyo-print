import { MdLogout } from "react-icons/md";
import { NavLink } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "../hooks/darkTheme";

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
};

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
    title: "Foydalanuvchilar",
    url: "/users",
    allowed: ["superadmin"],
  },
  {
    title: "Pechat sexi",
    url: "/printing/gazapal",
    allowed: ["superadmin"],
  },
];

export const Header = () => {
  const { theme, toggleTheme } = useTheme();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const displayRole = roleLabels[user?.role] || "Mehmon";

  const logout = () => {
    if (!window.confirm("Chiqib ketilsinmi?")) return;

    localStorage.clear();
    window.location.reload();
  };

  return (
    <nav>
      <header className="p-[20px_50px] border-b border-active bg-primary flex items-center justify-between gap-[20px]">
        <div className="flex items-center gap-[20px] max-w-[calc(100%_-_350px)] overflow-x-auto whitespace-nowrap">
          {links
            .filter(({ allowed }) => allowed.includes(user?.role))
            .map(({ title, url }) => (
              <NavLink
                key={url}
                to={url}
                className={({ isActive }) =>
                  `${
                    isActive ? "text-active font-medium" : "text-primary"
                  } hover:underline`
                }
              >
                {title}
              </NavLink>
            ))}
        </div>

        <button
          className="flex items-center gap-[5px] text-primary cursor-pointer whitespace-nowrap ml-auto"
          onClick={logout}
        >
          {user?.firstname} {user?.lastname}, {displayRole}
          <MdLogout />
        </button>

        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </header>
    </nav>
  );
};
