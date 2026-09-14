import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Link, useParams } from "react-router-dom";

import { getBook } from "../services/api";
import type { Book } from "../types/books";
import BookForm from "../components/BookForm";

export default function BookDetailPage() {
  // React Router takes :id from /books/:id; this page fetches that one book.
  const { id } = useParams();

  // Local page state decides which screen to render: loading, error, edit, or detail.
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  // Load the book whenever the ID in the URL changes.
  useEffect(() => {
    const loadBook = async () => {
      // Stop if there is no book ID in the URL.
      if (!id) {
        setError("Invalid book ID.");
        setLoading(false);
        return;
      }

      try {
        // Convert the URL ID to a number and fetch the book.
        const data = await getBook(Number(id));
        setBook(data);
      } catch {
        setError("Unable to find this book.");
      } finally {
        setLoading(false);
      }
    };

    loadBook();
  }, [id]);

  // Show a spinner while the book is loading.
  if (loading) {
    return (
      <Flex justify="center" py="16">
        <Spinner size="lg" />
      </Flex>
    );
  }

  // Show an error if the book could not be loaded.  
  // keep the Back link available even when lookup fails.
  if (error || !book) {
    return (
      <Stack gap="5">
        <Button asChild variant="ghost" width="fit-content">
          <Link to="/books">← Back to books</Link>
        </Button>

        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Book not found</Alert.Title>

            <Alert.Description>
              {error}
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      </Stack>
    );
  }

  // Show the edit form when the user clicks Edit Book.
  if (editing) {
    return (
      <Stack gap="6" maxW="700px" mx="auto">
        <Box>
          <Flex mb="4">
            <Button
              asChild
              variant="ghost"
              size="sm"
            >
              <Link to="/books">← Back to books</Link>
            </Button>
          </Flex>

          <Heading size="lg">Edit book</Heading>

          <Text color="gray.500" mt="1">
            Update the book details below.
          </Text>
        </Box>

        {/* Successful save refreshes the page's book state and exits edit mode.
            Cancel exits edit mode without calling the API. */}
        <BookForm
          book={book}
          onSuccess={(updatedBook) => {
            setBook(updatedBook);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </Stack>
    );
  }

  // Read only detail screen for the fetched book.
  return (
    <Stack gap="6" maxW="800px" mx="auto">
      {/* Top action row: return to the list or switch to edit mode. */}
      <Flex
        direction={{ base: "column", sm: "row" }}
        justify="space-between"
        align={{ base: "stretch", sm: "center" }}
        gap="4"
      >
        <Button asChild variant="ghost" width="fit-content">
          <Link to="/books">← Back to books</Link>
        </Button>

        <Button
          colorPalette="blue"
          onClick={() => setEditing(true)}
        >
          Edit Book
        </Button>
      </Flex>

      {/* Main card showing the book information. */}
      <Box
        bg="white"
        borderWidth="1px"
        borderRadius="xl"
        p={{ base: "6", md: "8" }}
        shadow="sm"
      >
        <Stack gap="6">
          <Box>
            {/* Display the book title and category. */}
            <Flex
              direction={{ base: "column", sm: "row" }}
              align={{ base: "flex-start", sm: "center" }}
              gap="3"
            >
              {/* Long titles wrap here instead of overflowing the detail card. */}
              <Heading size="xl" minW="0" overflowWrap="anywhere">
                {book.name}
              </Heading>

              <Badge
                colorPalette={
                  book.category === "Fiction"
                    ? "blue"
                    : "purple"
                }
              >
                {book.category}
              </Badge>
            </Flex>

            <Text color="gray.500" mt="2">
              Book details
            </Text>
          </Box>

          {/* Metadata section: browser local date and time from API timestamps. */}
          <Box borderTopWidth="1px" pt="6">
            <Stack gap="5">
              <Box>
                <Text fontSize="sm" color="gray.500">
                  Created
                </Text>

                <Text fontWeight="medium">
                  {new Date(book.created_at).toLocaleString()}
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="gray.500">
                  Last updated
                </Text>

                <Text fontWeight="medium">
                  {new Date(book.updated_at).toLocaleString()}
                </Text>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
}
