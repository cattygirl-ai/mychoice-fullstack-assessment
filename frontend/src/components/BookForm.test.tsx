import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import BookForm from "./BookForm";
import { createBook, updateBook } from "../services/api";

// Mock the API functions so the tests do not make real backend requests.
vi.mock("../services/api", () => ({
  createBook: vi.fn(),
  updateBook: vi.fn(),
}));

describe("BookForm", () => {
  // Reset all mocked function calls before each test.
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Checks that creating a book sends the correct title and category.
  it("creates a book with the entered title and category", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();

    vi.mocked(createBook).mockResolvedValue({
      id: 1,
      name: "Moby Dick",
      category: "Fiction",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    });

    // Wrap the form in ChakraProvider so Chakra UI components work in the test.
    render(
      <ChakraProvider value={defaultSystem}>
        <BookForm onSuccess={onSuccess} />
      </ChakraProvider>,
    );

    await user.type(screen.getByLabelText(/book title/i), "Moby Dick");
    await user.selectOptions(screen.getByLabelText(/^category/i), "Fiction");
    await user.click(screen.getByRole("button", { name: "Create book" }));

    expect(createBook).toHaveBeenCalledWith({
      name: "Moby Dick",
      category: "Fiction",
    });
  });

  // Checks that editing a book sends the updated values to updateBook.
  it("updates an existing book", async () => {
    const user = userEvent.setup();
    const book = {
      id: 1,
      name: "Moby Dick",
      category: "Fiction" as const,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    };

    vi.mocked(updateBook).mockResolvedValue({
      ...book,
      name: "Jane Eyre",
      category: "Non-Fiction",
    });

    render(
      <ChakraProvider value={defaultSystem}>
        <BookForm book={book} onSuccess={vi.fn()} />
      </ChakraProvider>,
    );

    await user.clear(screen.getByLabelText(/book title/i));
    await user.type(screen.getByLabelText(/book title/i), "Jane Eyre");
    await user.selectOptions(screen.getByLabelText(/^category/i), "Non-Fiction");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(updateBook).toHaveBeenCalledWith(1, {
      name: "Jane Eyre",
      category: "Non-Fiction",
    });
  });

  // Checks that Save is disabled when no changes remain.
  // Also confirms an unchanged form cannot submit an update request.
  it("disables saving when edits are undone and skips unchanged submissions", async () => {
    const user = userEvent.setup();
    const book = {
      id: 1,
      name: "Moby Dick",
      category: "Fiction" as const,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    };

    render(
      <ChakraProvider value={defaultSystem}>
        <BookForm book={book} onSuccess={vi.fn()} />
      </ChakraProvider>,
    );

    const title = screen.getByLabelText(/book title/i);
    const category = screen.getByLabelText(/^category/i);
    const save = screen.getByRole("button", { name: "Save changes" });

    expect(title).toHaveAttribute("maxLength", "180");

    expect(save).toBeDisabled();

    await user.type(title, "!");
    expect(save).toBeEnabled();
    await user.keyboard("{Backspace}");
    expect(save).toBeDisabled();

    await user.selectOptions(category, "Non-Fiction");
    expect(save).toBeEnabled();
    await user.selectOptions(category, "Fiction");
    expect(save).toBeDisabled();

    fireEvent.submit(title.closest("form")!);
    expect(updateBook).not.toHaveBeenCalled();
  });
});
