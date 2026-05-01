import { useEffect, type ComponentType, type ReactNode } from "react";
import {
  BrowserRouter,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

import { Header } from "../Components/Header";
import { Login } from "../Pages/Warehouse/Login/Login";
import { Actions } from "../Pages/Warehouse/Actions/Actions";
import { Catalogue } from "../Pages/Warehouse/Catalogue/Catalogue";
import { Stock } from "../Pages/Warehouse/Stock/Stock";
import { Register } from "../Pages/Register/Register";
import { Gazapal } from "../Pages/Passports/Gazapal/Gazapal";
import { Whitening } from "../Pages/Passports/Whitening/Whitening";
import { Painting } from "../Pages/Passports/Painting/Painting";
import { Ram } from "../Pages/Passports/Ram/Ram";
import { Print } from "../Pages/Passports/Print/Print";
import { Stretch } from "../Pages/Passports/Stretch/Stretch";
import { Zrelniy } from "../Pages/Passports/Zrelniy/Zrelniy";
import { Finish } from "../Pages/Passports/Finish/Finish";
import { Finish_stretching } from "../Pages/Passports/Finish_stretching/Finish_stretching";
import { Calander } from "../Pages/Passports/Calander/Calander";
import { Calander_stretching } from "../Pages/Passports/Calander_stretching/Calander_stretching";
import { Users } from "../Pages/Users/Users";

type User = {
  role?: string;
};

type AppRoute = {
  path: string;
  element: ComponentType;
  roles: string[];
};

type LinkItem = {
  title: string;
  url: string;
  allowed: string[];
};

const getUser = (): User => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `${isActive ? "text-active font-medium" : "text-primary"} hover:underline`;

const printingLinks: LinkItem[] = [
  {
    title: "Gazapal",
    url: "/printing/gazapal",
    allowed: ["gazapal", "admin", "superadmin"],
  },
  {
    title: "Oqartirish",
    url: "/printing/whitening",
    allowed: ["whitener", "admin", "superadmin"],
  },
  {
    title: "Bo'yash",
    url: "/printing/painting",
    allowed: ["painter", "admin", "superadmin"],
  },
  {
    title: "Ram",
    url: "/printing/ram",
    allowed: ["ram", "admin", "superadmin"],
  },
  {
    title: "Pechat",
    url: "/printing/print",
    allowed: ["printer", "admin", "superadmin"],
  },
  {
    title: "Cho'zilish",
    url: "/printing/stretch",
    allowed: ["stretch", "admin", "superadmin"],
  },
  {
    title: "Zrelniy",
    url: "/printing/zrelniy",
    allowed: ["zrelniy", "admin", "superadmin"],
  },
  {
    title: "Finish",
    url: "/printing/finish",
    allowed: ["finish", "admin", "superadmin"],
  },
  {
    title: "Finish cho'zilish",
    url: "/printing/finish_stretching",
    allowed: ["finish_stretch", "admin", "superadmin"],
  },
  {
    title: "Calander",
    url: "/printing/calander",
    allowed: ["calander", "admin", "superadmin"],
  },
  {
    title: "Calander cho'zilish",
    url: "/printing/calander_stretching",
    allowed: ["calander_stretch", "admin", "superadmin"],
  },
];

const PrivateRoute = ({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles: string[];
}) => {
  const token = localStorage.getItem("token");
  const user = getUser();

  if (!token) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(user.role || "")) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
};

const AdminLayout = () => {
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    axios(`${import.meta.env.VITE_APP_API_URL}/users/getme`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        localStorage.setItem("user", JSON.stringify(res.data.data || {}));
      })
      .catch((err) => {
        toast.error(err.response?.data?.msg || "Login failed");
        localStorage.removeItem("token");
        window.location.href = "/login";
      });
  }, [token]);

  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="flex flex-col min-h-screen h-fit bg-primary">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

const PrintLayout = () => {
  const user = getUser();
  const filteredLinks = printingLinks.filter((link) =>
    link.allowed.includes(user.role || "")
  );

  return (
    <>
      <div className="p-[10px_50px] flex items-center gap-[20px] overflow-x-auto whitespace-nowrap">
        {filteredLinks.map((link) => (
          <NavLink to={link.url} key={link.url} className={linkClass}>
            {link.title}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </>
  );
};

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AdminLayout />}>
          {routesList.map(({ path, element: Component, roles }) => (
            <Route
              key={path}
              path={path}
              element={
                <PrivateRoute allowedRoles={roles}>
                  <Component />
                </PrivateRoute>
              }
            />
          ))}

          <Route element={<PrintLayout />}>
            {printingRoutes.map(({ path, element: Component, roles }) => (
              <Route
                key={path}
                path={path}
                element={
                  <PrivateRoute allowedRoles={roles}>
                    <Component />
                  </PrivateRoute>
                }
              />
            ))}
          </Route>
        </Route>

        <Route path="/login" element={<Login />} />
        <Route
          path="/forbidden"
          element={<div>Siz bu yerga kira olmaysiz!</div>}
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

const routesList: AppRoute[] = [
  {
    path: "/actions",
    element: Actions,
    roles: ["admin", "superadmin"],
  },
  {
    path: "/catalogue",
    element: Catalogue,
    roles: ["admin", "superadmin", "stockman"],
  },
  {
    path: "/stock",
    element: Stock,
    roles: ["admin", "superadmin", "stockman"],
  },
  {
    path: "/register",
    element: Register,
    roles: ["superadmin"],
  },
];

const printingRoutes: AppRoute[] = [
  {
    path: "/printing/painting",
    element: Painting,
    roles: ["painter", "superadmin", "admin"],
  },
  {
    path: "/users",
    element: Users,
    roles: ["superadmin"],
  },
  {
    path: "/printing/gazapal",
    element: Gazapal,
    roles: ["gazapal", "superadmin", "admin"],
  },
  {
    path: "/printing/whitening",
    element: Whitening,
    roles: ["whitener", "superadmin", "admin"],
  },
  {
    path: "/printing/ram",
    element: Ram,
    roles: ["ram", "superadmin", "admin"],
  },
  {
    path: "/printing/print",
    element: Print,
    roles: ["printer", "superadmin", "admin"],
  },
  {
    path: "/printing/stretch",
    element: Stretch,
    roles: ["stretch", "superadmin", "admin"],
  },
  {
    path: "/printing/zrelniy",
    element: Zrelniy,
    roles: ["zrelniy", "superadmin", "admin"],
  },
  {
    path: "/printing/finish",
    element: Finish,
    roles: ["finish", "superadmin", "admin"],
  },
  {
    path: "/printing/finish_stretching",
    element: Finish_stretching,
    roles: ["finish_stretch", "superadmin", "admin"],
  },
  {
    path: "/printing/calander",
    element: Calander,
    roles: ["calander", "superadmin", "admin"],
  },
  {
    path: "/printing/calander_stretching",
    element: Calander_stretching,
    roles: ["calander_stretch", "superadmin", "admin"],
  },
];
