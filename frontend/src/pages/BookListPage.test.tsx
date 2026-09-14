import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import BookListPage from "./BookListPage";
import { getBooks } from "../services/api";

// Mock getBooks so the tests do not make real API requests.
vi.mock("../services/api", () => ({
  getBooks: vi.fn(),
}));

// Render the page with Chakra UI and React Router.
function renderBookListPage() {
  return render(
    <ChakraProvider value={defaultSystem}>
      <MemoryRouter>
        <BookListPage />
      </MemoryRouter>
    </ChakraProvider>,
  );
}

describe("BookListPage", () => {
  // Reset the mock before each test.
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Check that books returned by the API are displayed.
  it("displays fetched books", async () => {
    vi.mocked(getBooks).mockResolvedValue([
      {
        id: 1,
        name: "Moby Dick",
        category: "Fiction",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
      {
        id: 2,
        name: "Atomic Habits",
        category: "Non-Fiction",
        created_at: "2026-01-02T00:00:00Z",
        updated_at: "2026-01-02T00:00:00Z",
      },
    ]);

    renderBookListPage();

    expect(await screen.findByRole("heading", { name: "Moby Dick" })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Atomic Habits" })).toBeInTheDocument();
    expect(getBooks).toHaveBeenCalledTimes(1);
  });

   // Check that an error message appears if the API request fails.
  it("shows an error when books cannot be loaded", async () => {
    vi.mocked(getBooks).mockRejectedValue(new Error("Request failed"));

    renderBookListPage();

    expect(
      await screen.findByText("We couldn't load your books. Please try again."),
    ).toBeInTheDocument();
  });
});
