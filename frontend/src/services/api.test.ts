import { beforeEach, describe, expect, it, vi } from "vitest";

const client = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
}));

vi.mock("axios", () => ({
  default: { create: () => client },
}));

import { createBook, getBook, getBooks, updateBook } from "./api";

const item = {
  id: 7,
  name: "The Hobbit",
  group: "Primary",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-02T00:00:00Z",
};

describe("book API adapter", () => {
  beforeEach(() => vi.clearAllMocks());

  it("lists generic items as books", async () => {
    client.get.mockResolvedValue({ data: [item, { ...item, id: 8, group: "Secondary" }] });

    const books = await getBooks();

    expect(client.get).toHaveBeenCalledWith("/items/");
    expect(books.map((book) => book.category)).toEqual([
      "Fiction",
      "Non-Fiction",
    ]);
  });

  it("gets one generic item as a book", async () => {
    client.get.mockResolvedValue({ data: item });

    expect(await getBook(7)).toMatchObject({
      id: 7,
      name: "The Hobbit",
      category: "Fiction",
    });
    expect(client.get).toHaveBeenCalledWith("/items/7/");
  });

  it("creates a generic item from a book", async () => {
    client.post.mockResolvedValue({ data: item });

    await createBook({ name: "The Hobbit", category: "Fiction" });

    expect(client.post).toHaveBeenCalledWith("/items/", {
      name: "The Hobbit",
      group: "Primary",
    });
  });

  it("updates a generic item from a book", async () => {
    client.patch.mockResolvedValue({ data: { ...item, group: "Secondary" } });

    const book = await updateBook(7, { category: "Non-Fiction" });

    expect(client.patch).toHaveBeenCalledWith("/items/7/", {
      group: "Secondary",
    });
    expect(book.category).toBe("Non-Fiction");
  });
});
