import axios from "axios";

import type {
  BookCategory,
  CreateBookData,
  Book,
  UpdateBookData,
} from "../types/books";

// Defines the Item data we receive from the backend.
// The backend uses generic Items, while the frontend displays them as Books.
interface ItemDTO {
  id: number;
  name: string;
  group: "Primary" | "Secondary";
  created_at: string;
  updated_at: string;
}

// Converts an Item from the backend into a Book for the frontend.
// Primary items are displayed as Fiction and Secondary items as Non-Fiction.
const toBook = (item: ItemDTO): Book => ({
  id: item.id,
  name: item.name,
  category: item.group === "Primary" ? "Fiction" : "Non-Fiction",
  created_at: item.created_at,
  updated_at: item.updated_at,
});

// Reverse the category mapping before sending create or update requests.
const toItemGroup = (category: BookCategory): ItemDTO["group"] =>
  category === "Fiction" ? "Primary" : "Secondary";

// Creates an Axios client used for all requests to the Django API.
// Uses VITE_API_URL if provided, otherwise defaults to the local Django server.
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ??
    "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Gets all Items from the backend and converts them into Books.
export const getBooks = async (): Promise<Book[]> => {
  const response =
    await api.get<ItemDTO[]>("/items/");

  return response.data.map(toBook);
};

// GET /items/<id>/ gets a specific Item by its ID and converts it into a Book.
export const getBook = async (
  id: number
): Promise<Book> => {
  const response =
    await api.get<ItemDTO>(`/items/${id}/`);

  return toBook(response.data);
};

// POST a new Item using the Book information entered on the frontend.
export const createBook = async (
  data: CreateBookData
): Promise<Book> => {
  const response = await api.post<ItemDTO>("/items/", {
    name: data.name,
    group: toItemGroup(data.category),
  });

  return toBook(response.data);
};

// PATCH an existing Item with any fields changed on the frontend.
export const updateBook = async (
  id: number,
  data: UpdateBookData
): Promise<Book> => {
  // Only includes fields that were provided so unchanged fields are left alone.
  const response = await api.patch<ItemDTO>(`/items/${id}/`, {
    ...(data.name !== undefined && { name: data.name }),
    ...(data.category !== undefined && {
      group: toItemGroup(data.category),
    }),
  });

  return toBook(response.data);
};
