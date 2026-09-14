import {
  Box,
  Button,
  Heading,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";

import BookForm from "../components/BookForm";
import type { Book } from "../types/books";

export default function CreateBookPage() {
  // Used to navigate to the new book after it is created.
  const navigate = useNavigate();

  const handleSuccess = (book: Book) => {
    // Go to the new book's detail page.
    navigate(`/books/${book.id}`);
  };

  // Header and back link stay visible even when the form displays an API error.
  return (
    <Stack gap="6" maxW="700px" mx="auto">
      {/* Page title and link back to the library. */}
      <Box>
        <Button asChild variant="ghost" size="sm" mb="4">
          <Link to="/books">← Back to library</Link>
        </Button>

        <Heading size="lg">
          Create book
        </Heading>

        <Text color="gray.500" mt="1">
          Add a new book to your collection.
        </Text>
      </Box>

      {/* Form for creating a new book. */}
      <BookForm onSuccess={handleSuccess} />
    </Stack>
  );
}
