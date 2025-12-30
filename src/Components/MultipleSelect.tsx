import type React from "react";
import { useEffect, useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { createPortal } from "react-dom";

interface Item {
  id: string | number;
  value: string;
}

interface SelectProps {
  data?: Item[];
  values?: Item[];
  onChange?: (items: Item[]) => void;
}

export const MultipleSelect: React.FC<SelectProps> = ({
  values = [],
  data = [],
  onChange,
}) => {
  const [opened, setOpened] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (opened && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [opened]);

  const toggleItem = (item: Item) => {
    const exists = values.find((v) => v.id === item.id);
    if (exists) {
      onChange?.(values.filter((v) => v.id !== item.id));
    } else {
      onChange?.([...values, item]);
    }
  };

  return (
    <>
      <div
        ref={ref}
        className="w-full border border-primary rounded relative text-primary bg-primary"
      >
        <div
          className="flex items-center justify-between p-lg py-sm cursor-pointer"
          onClick={() => setOpened((p) => !p)}
        >
          <div className="flex gap-[8px] flex-wrap max-w-[90%]">
            {values.map((v) => (
              <span
                key={v.id}
                className="bg-secondary rounded px-md py-xs text-sm flex items-center gap-[6px]"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(v);
                }}
              >
                {v.value} <span>&times;</span>
              </span>
            ))}
          </div>
          <FaChevronDown />
        </div>
      </div>

      {opened &&
        createPortal(
          <div
            className="absolute z-[9999] bg-primary border border-primary rounded shadow-xl max-h-[250px] overflow-auto text-primary"
            style={{
              top: pos.top,
              left: pos.left,
              width: pos.width,
            }}
          >
            {data.map((d) => {
              const active = values.some((v) => v.id === d.id);
              return (
                <div
                  key={d.id}
                  className={`p-md cursor-pointer hover:bg-secondary ${
                    active ? "bg-secondary" : ""
                  }`}
                  onClick={() => toggleItem(d)}
                >
                  {d.value}
                </div>
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
};
