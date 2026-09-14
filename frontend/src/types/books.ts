export type BookCategory = "Fiction" | "Non-Fiction";

export interface Book {
  id: number;
  name: string;
  category: BookCategory;
  created_at: string;
  updated_at: string;
}

export interface CreateBookData {
  name: string;
  category: BookCategory;
}

export interface UpdateBookData {
  name?: string;
  category?: BookCategory;
}
