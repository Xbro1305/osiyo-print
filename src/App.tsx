import { ToastContainer } from "react-toastify";
import { Router } from "./Router/Router";

export const App = () => {
  return (
    <>
      <Router />
      <ToastContainer position="top-right" theme="dark" />
    </>
  );
};
