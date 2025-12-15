export interface Item {
  id: number;
  name?: string;
  image: any;
  article: string;
  cloth: "Poplin" | "Satin" | "Stripe-satin" | "Ranforce" | "Byaz";
  stock?: { stock: number; orgId: number; updated?: string }[];
}

export interface ActionItem {
  cloth: string;
  article: string;
  amount: number;
  id: number;
  image: any;
}

export interface Organization {
  id: number;
  name: string;
  address: string;
  sender: boolean;
}

export interface Action {
  type: "out" | "in" | "return";
  date: string;
  fromId: number;
  toId: number;
  itemIds: { article: string; amount: number }[];
  note?: string;
  id: number;
  edited?: boolean;
}

export const organizations: Organization[] = [
  {
    id: 1,
    name: "Boyoq sexi",
    address: "Osiyo Home Textile",
    sender: true,
  },
  {
    id: 2,
    name: "Fozilxon sklad",
    address: "Osiyo Home Textile",
    sender: true,
  },
  {
    id: 3,
    name: "Osiyo Home, chevarxona",
    address: "Osiyo Home Textile",
    sender: false,
  },
  {
    id: 4,
    name: "Axsi, chevarxona",
    address: "Axsi, Fergana, Uzbekistan",
    sender: false,
  },
  {
    id: 5,
    name: "Gozal, chevarxona",
    address: "Gozal, Namangan, Uzbekistan",
    sender: false,
  },
];
