import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";

import { Link } from "react-router-dom";

import { getBooks } from "../services/api";
import type { Book } from "../types/books";
import BookCard from "../components/BookCard";

export default function BookListPage() {
  // Store the books and the current loading/error state.
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch the books from the API.
  const loadBooks = async () => {
    try {
      setError("");
      setLoading(true);

      const data = await getBooks();
      setBooks(data);
    } catch {
      setError(
        "We couldn't load your books. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Load the books when the page first opens.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Fetching begins after the page mounts.
    loadBooks();
  }, []);

  // Only one of loading, error, empty, or populated-list sections appears.
  return (
    <Stack gap="8">
      {/* Page title and button for adding a new book. */}
      <Flex
        direction={{
          base: "column",
          md: "row",
        }}
        justify="space-between"
        align={{
          base: "stretch",
          md: "center",
        }}
        gap="4"
      >
        <Box>
          <Heading size="lg">Your Books</Heading>

          <Text color="gray.500" mt="1">
            Edit your library.
          </Text>
        </Box>

        <Link to="/books/new">
          <Button colorPalette="blue">
            + Add book
          </Button>
        </Link>
      </Flex>

      {/* Show a loading message while the books are being fetched. */}
      {loading && (
        <Flex
          justify="center"
          align="center"
          minH="300px"
        >
          <Stack align="center" gap="3">
            <Spinner size="lg" />

            <Text color="gray.500">
              Loading books...
            </Text>
          </Stack>
        </Flex>
      )}

       {/* Show an error message and allow the user to try again. */}
      {!loading && error && (
        <Alert.Root status="error">
          <Alert.Indicator />

          <Alert.Content>
            <Alert.Title>Unable to load books</Alert.Title>

            <Alert.Description>
              {error}
            </Alert.Description>

            <Button
              mt="4"
              size="sm"
              onClick={loadBooks}
            >
              Try again
            </Button>
          </Alert.Content>
        </Alert.Root>
      )}

      {/* Empty state only after a successful fetch returns no books. */}
      {!loading &&
        !error &&
        books.length === 0 && (
          <Box
            bg="white"
            borderWidth="1px"
            borderRadius="xl"
            textAlign="center"
            py={{
              base: "12",
              md: "16",
            }}
            px="6"
            shadow="sm"
          >
            <Heading size="md">No books yet</Heading>

            <Text
              color="gray.500"
              mt="2"
              mb="6"
            >
              Add your first Book to get started.
            </Text>

            <Link to="/books/new">
              <Button
                colorPalette="blue"
              >
                Add your first Book
              </Button>
            </Link>
          </Box>
        )}

      {/* Populated state: responsive grid of individual BookCard components.
          minmax(0, 1fr) lets long card titles shrink and truncate correctly. */}
      {!loading &&
        !error &&
        books.length > 0 && (
          <Grid
            templateColumns={{
              base: "minmax(0, 1fr)",
              md: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            }}
            gap="5"
          >
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </Grid>
        )}
    </Stack>
  );
}
