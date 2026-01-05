import { LuTrash2 } from "react-icons/lu";
import React, { useEffect, useRef, useState } from "react";
import type { Item } from "../../../data";
import axios from "axios";
import { toast } from "react-toastify";
import imageCompression from "browser-image-compression";

export const Catalogue = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [openedModal, setOpenedModal] = useState<Item | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const baseUrl = import.meta.env.VITE_APP_API_URL;
  const token = localStorage.getItem("token");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const articleInputRef = useRef<HTMLInputElement>(null);
  const firstOpenRef = useRef(false);

  const refresh = () => {
    axios(`${baseUrl}/designs`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        setItems(res.data.innerData || []);
      })
      .catch((err) => {
        console.error("Error fetching items:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => refresh(), []);

  useEffect(() => {
    if (openedModal && !firstOpenRef.current) {
      firstOpenRef.current = true;
      fileInputRef.current?.click();
    }
  }, [openedModal]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "+") {
        setTimeout(() => {
          setOpenedModal({
            id: items.length + 1,
            article: "",
            image: "",
            cloth: "Poplin",
          });
        }, 100);
      }
      if (e.key === "Escape") closeModal();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [items.length]);

  // Когда файл выбран, ставим фокус на текстовый input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setOpenedModal((prev) => {
      if (!prev) return prev;
      return { ...prev, image: file };
    });

    setTimeout(() => {
      articleInputRef.current?.focus();
    }, 50);
  };

  const closeModal = () => {
    setOpenedModal(null);
    firstOpenRef.current = false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!openedModal) return;

    setLoading(true);

    try {
      const formData = new FormData();

      // Сжимаем изображение если есть
      if (openedModal.image) {
        const options = {
          maxSizeMB: 1, // максимум 3 МБ
          maxWidthOrHeight: 1000, // опционально ограничиваем размер по ширине/высоте
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(
          openedModal.image,
          options
        );
        formData.append("image", compressedFile);
      }

      formData.append("article", openedModal.article);
      formData.append("cloth", openedModal.cloth);

      const res = await axios(`${baseUrl}/designs`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: formData,
      });

      const newItems = [...items, res.data.created];
      setItems(newItems);
      localStorage.setItem("items", JSON.stringify(newItems));
      closeModal();
    } catch (err: any) {
      console.error("Error adding item:", err);
      toast.error(err?.response?.data?.msg || "Xato yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (deletingId === null) return;

    setLoading(true);
    axios(`${baseUrl}/designs/${deletingId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(() => {
        refresh();
        setDeletingId(null);
      })
      .catch((err) => {
        toast.error(err.response.data.msg);
        console.log(err);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="flex flex-col gap-[20px] p-[50px] bg-primary h-fit">
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full bg-[#00000070] flex items-center justify-center z-50">
          <div className="bg-secondary p-5xl rounded-xl text-primary text-2xl">
            Yuklanmoqda...
          </div>
        </div>
      )}
      <button
        className="p-sm rounded bg-secondary w-fit ml-auto text-primary px-xl"
        onClick={() =>
          setOpenedModal({
            id: items.length + 1,
            article: "",
            image: "",
            cloth: "Poplin",
          })
        }
      >
        Mahsulot qo'shish
      </button>
      <div className="grid grid-cols-[repeat(auto-fill,300px)] gap-[20px]">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-[10px] items-center justify-center"
          >
            <img
              src={`${baseUrl}${item.image}`}
              alt={item.article}
              loading="lazy"
              className="rounded-[8px] aspect-square object-cover"
            />
            <div className="flex items-center justify-between w-full">
              <p className="text-primary text-[18px]">
                Artikul: {item.article}{" "}
              </p>
              <button
                className="text-[20px] text-primary cursor-pinter bg-[transparent] border-none"
                onClick={() => setDeletingId(item.id)}
              >
                <LuTrash2 />
              </button>
            </div>{" "}
            <p className="text-primary text-[18px]">{item.cloth} </p>
          </div>
        ))}
      </div>
      {openedModal && (
        <div className="flex fixed left-[0] top-[0] w-full h-screen bg-[#00000080] items-center justify-center">
          <form
            onSubmit={(e) => handleSubmit(e)}
            className="flex flex-col gap-[20px] w-[500px] bg-primary p-[10px] rounded-[8px]"
          >
            <button
              className="ml-auto text-primary text-[18px]"
              onClick={closeModal}
              type="button"
            >
              &times;
            </button>
            <label className="bg-secondary p-[10px] rounded-[8px] w-fit text-primary cursor-pointer">
              {!openedModal.image ? (
                "Rasm tanlash"
              ) : (
                <img
                  src={
                    openedModal.image
                      ? URL.createObjectURL(openedModal.image)
                      : ""
                  }
                  alt=""
                  className="w-[300px] h-[300px] object-contain"
                />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </label>
            <input
              type="text"
              placeholder="Artikul"
              ref={articleInputRef}
              onChange={(e) => {
                setOpenedModal({ ...openedModal, article: e.target.value });
              }}
              className="p-[5px_10px] rounded bg-secondary text-primary border-none"
            />
            <select
              onChange={(e) => {
                setOpenedModal({
                  ...openedModal,
                  cloth: e.target.value as Item["cloth"],
                });
              }}
              className="p-[5px_10px] rounded bg-secondary text-primary border-none"
            >
              <option value="Poplin">Poplin</option>
              <option value="Byaz">Byaz</option>
              <option value="Satin">Satin</option>
              <option value="Stripe-satin">Stripe-satin</option>
              <option value="Ranforce">Ranforce</option>
            </select>
            <button
              className="bg-secondary w-full p-[10px] text-primary rounded-[8px]"
              type="submit"
            >
              Saqlash
            </button>
          </form>
        </div>
      )}
      {deletingId !== null && (
        <div className="w-full h-full fixed top-0 left-0 bg-[#00000070] flex items-center justify-center">
          <div className="bg-secondary p-5xl rounded-xl text-primary text-2xl flex flex-col gap-2xl">
            <p>Mahsulot o'chirilsinmi?</p>
            <div className="flex items-center gap-lg justify-end">
              <button
                className="bg-tertiary p-sm px-lg rounded"
                onClick={() => setDeletingId(null)}
              >
                Bekor qilish
              </button>
              <button
                className="bg-red-600 p-sm px-lg rounded text-primary"
                onClick={() => handleDelete()}
              >
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
