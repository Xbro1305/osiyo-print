import { useEffect, type ReactNode } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Outlet, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

// Pages
import { Home } from "../Pages/Warehouse/Home/Home";
import { Catalogue } from "../Pages/Warehouse/Catalogue/Catalogue";
import { Stock } from "../Pages/Warehouse/Stock/Stock";
import { Login } from "../Pages/Warehouse/Login/Login";
import { Header } from "../Components/Header";
import { Register } from "../Pages/Register/Register";
import { Whitening } from "../Pages/Passports/Whitening/Whitening";
import { Gazapal } from "../Pages/Passports/Gazapal/Gazapal";
import { Painting } from "../Pages/Passports/Painting/Painting";
import { Ram } from "../Pages/Passports/Ram/Ram";
import { Print } from "../Pages/Passports/Print/Print";
import { Stretch } from "../Pages/Passports/Stretch/Stretch";
import { Zrelniy } from "../Pages/Passports/Zrelniy/Zrelniy";
import { Finish } from "../Pages/Passports/Finish/Finish";
import { Finish_stretching } from "../Pages/Passports/Finish_stretching/Finish_stretching";
import { Calander } from "../Pages/Passports/Calander/Calander";
import { Calander_stretching } from "../Pages/Passports/Calander_stretching/Calander_stretching";

/* ---------------------------------------------------
   PRIVATE ROUTE — проверка роли и токена
----------------------------------------------------- */

const PrivateRoute = ({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles: string[];
}) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
};

/* ---------------------------------------------------
   ADMIN LAYOUT — каркас + загрузка пользователя
----------------------------------------------------- */

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
        localStorage.setItem("user", JSON.stringify(res.data.data || "{}"));
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
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

/* ---------------------------------------------------
   MAIN ROUTER — маршруты по ролям
----------------------------------------------------- */

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
        </Route>

        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* 403 */}
        <Route
          path="/forbidden"
          element={<div>Siz bu yerga kira olmaysiz!</div>}
        />

        {/* any links */}
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
};

const routesList = [
  {
    path: "/actions",
    element: Home,
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
  {
    path: "/painting",
    element: Painting,
    roles: ["superadmin"],
  },
  {
    path: "/gazapal",
    element: Gazapal,
    roles: ["gazapal", "superadmin", "admin"],
  },
  {
    path: "/whitening",
    element: Whitening,
    roles: ["whitener", "superadmin", "admin"],
  },
  {
    path: "/ram",
    element: Ram,
    roles: ["ram", "superadmin", "admin"],
  },
  {
    path: "/print",
    element: Print,
    roles: ["printer", "superadmin", "admin"],
  },
  {
    path: "/stretch",
    element: Stretch,
    roles: ["stretch", "superadmin", "admin"],
  },
  {
    path: "/zrelniy",
    element: Zrelniy,
    roles: ["zrelniy", "superadmin", "admin"],
  },
  {
    path: "/finish",
    element: Finish,
    roles: ["finish", "superadmin", "admin"],
  },
  {
    path: "/finish_stretching",
    element: Finish_stretching,
    roles: ["finish_stretch", "superadmin", "admin"],
  },
  {
    path: "/calander",
    element: Calander,
    roles: ["calander", "superadmin", "admin"],
  },
  {
    path: "/calander_stretching",
    element: Calander_stretching,
    roles: ["calander_stretch", "superadmin", "admin"],
  },
];
