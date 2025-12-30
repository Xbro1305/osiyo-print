import { useEffect, useState } from "react";
import type { ActionItem } from "../data";
import { FaChevronDown } from "react-icons/fa";

interface SelectProps {
  props: ActionItem[];
  onChange: (item: ActionItem | null) => void;
  selected?: ActionItem;
  changeQuery: (query: string) => void;
  query: string;
  creating?: boolean;
}

export const DesignSelect: React.FC<SelectProps> = ({
  props,
  onChange,
  selected: s,
  changeQuery,
  query,
  creating = true,
}) => {
  const [selected, setSelected] = useState<ActionItem | null>(
    s?.image ? s : null
  );
  const [opened, setOpened] = useState<boolean>(creating);

  const baseUrl = import.meta.env.VITE_APP_API_URL;

  useEffect(() => {
    onChange(selected);
  }, [selected]);

  return (
    <div className="relative w-[240px]">
      <div
        className="p-lg py-sm cursor-pointer rounded border-solid border-[1px] border-secondary"
        onClick={() => {
          setOpened(true);
          setSelected(null);
        }}
      >
        {selected == null ? (
          <div className="flex items-center justify-between">
            <input
              type="search"
              className="bg-[transparent] w-[150px] outline-none"
              placeholder="Tanlang"
              value={query}
              onChange={(e) => changeQuery(e.target.value)}
              autoFocus
            />{" "}
            <FaChevronDown />
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-lg">
              <img
                src={`${baseUrl}${selected.image}`}
                alt={selected.article}
                className="aspect-square object-cover w-[70px] md:w-[100px] rounded"
              />
              <p className="flex flex-col">
                <span>{selected.article}</span>
                <span>{selected.cloth}</span>
              </p>
            </div>{" "}
            <FaChevronDown />
          </div>
        )}
      </div>
      {opened && (
        <div className="flex flex-col rounded overflow-x-auto max-h-[400px] z-50 rounded gap-sm border-[1px] border-solid border-secondary">
          {props
            // .filter((p) => p.article.includes(query))
            .map((prop) => (
              <div
                className="flex items-center gap-lg p-sm border-b border-secondary cursor-pointer"
                onClick={() => {
                  setSelected(prop);
                  setOpened(false);
                }}
              >
                <img
                  src={`${baseUrl}${prop.image}`}
                  alt={prop.article}
                  className="aspect-square object-cover w-[70px] md:w-[100px] rounded"
                />
                <p className="flex flex-col">
                  <span>{prop.article}</span>
                  <span>{prop.cloth}</span>
                </p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
