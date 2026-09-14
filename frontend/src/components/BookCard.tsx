import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  Text,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

import type { Book } from "../types/books";

// One card is rendered for each book in BookListPage's grid.
interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  // Main card container with styling and hover effect.
  return (
    <Box
      minW="0"
      bg="white"
      borderWidth="1px"
      borderRadius="xl"
      p="6"
      shadow="sm"
      transition="all 0.2s"
      _hover={{
        shadow: "md",
        transform: "translateY(-2px)",
      }}
    >
      {/* Displays the book title and category badge side by side. */}
      <HStack
        w="full"
        minW="0"
        justify="space-between"
        align="start"
        mb="4"
      >
        {/* Clip long titles. Title shows the full
            name as a browser tooltip when the text is truncated. */}
        <Heading
          size="md"
          flex="1"
          minW="0"
          maxW="full"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          title={book.name}
        >
          {book.name}
        </Heading>

        {/* Visual distinction between Fiction and Non-Fiction. */}
        <Badge
          flexShrink="0"
          colorPalette={
            book.category === "Fiction"
              ? "blue"
              : "purple"
          }
        >
          {book.category}
        </Badge>
      </HStack>
      {/* Turn the API timestamp into a readable date. */}
      <Text
        fontSize="sm"
        color="gray.500"
        mb="5"
      >
        Updated{" "}
        {new Date(
          book.updated_at
        ).toLocaleDateString()}
      </Text>

      {/* View Book: the route includes book's ID to open its details page. */}
      <Link to={`/books/${book.id}`}>
        <Button
          variant="outline"
          size="sm"
          width="full"
        >
          View Book
        </Button>
      </Link>
    </Box>
  );
}
