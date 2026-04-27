import { CgMoon, CgSun } from "react-icons/cg";

export const ThemeToggle = ({ theme, toggleTheme }: any) => {
  return (
    <button
      onClick={toggleTheme}
      className={`w-14 bg-secondary h-8 flex items-center rounded-full p-1 transition-colors duration-300
          ${theme === "dark" ? "bg-gray-700" : "bg-gray-300"}`}
    >
      <div
        className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center
            ${theme === "dark" ? "translate-x-6" : "translate-x-0"}`}
      >
        {theme === "dark" ? (
          <CgMoon className="text-gray-700" />
        ) : (
          <CgSun className="text-gray-300" />
        )}
      </div>
    </button>
  );
};
