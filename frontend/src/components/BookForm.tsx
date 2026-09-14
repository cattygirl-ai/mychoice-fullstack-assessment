import { useEffect, useState } from "react";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  Field,
  Input,
  NativeSelect,
  Stack,
} from "@chakra-ui/react";

import type {
  CreateBookData,
  Book,
  BookCategory,
  UpdateBookData,
} from "../types/books";

import {
  createBook,
  updateBook,
} from "../services/api";


// This form is used for both creating and editing books. 
// If a book is provided, the form edits it. Otherwise, it creates a new one.
interface BookFormProps {
  book?: Book;
  onSuccess: (book: Book) => void;
  onCancel?: () => void;
}

// Defines the validation errors that may be returned by the backend.
interface APIErrorData {
  non_field_errors?: string[];
  name?: string[];
}

export default function BookForm({
  book,
  onSuccess,
  onCancel,
}: BookFormProps) {

  // A provided book means the form is being used in edit mode.
  const isEditing = Boolean(book);

  // Stores the current values entered in the form. 
  const [name, setName] = useState(book?.name ?? "");
  const [category, setCategory] = useState<BookCategory>(book?.category ?? "Fiction");

  // Stores validation errors and whether a request is currently being sent.
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Checks whether the user has changed the original book values. 
  // Extra spaces around the title are ignored.
  const hasChanges = book
    ? name.trim() !== book.name.trim() || category !== book.category
    : true;

  // Reset the form whenever a different book is selected for editing.
  /* eslint-disable react-hooks/set-state-in-effect -- Synchronize the local form draft when the selected book changes. */
  useEffect(() => {
    setName(book?.name ?? "");
    setCategory(book?.category ?? "Fiction");
    setError("");
    setFieldError("");
  }, [book]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Handles both creating a new book and updating an existing one.
  const handleSubmit = async (
    event: React.SubmitEvent<HTMLFormElement>
  ) => {
    // Prevent the browser from reloading the page when the form is submitted.
    event.preventDefault();

    // Do not send an update if nothing has changed.
    if (isEditing && !hasChanges) {
      return;
    }

    // Clear previous errors before validating/submitting again.
    setError("");
    setFieldError("");

    // Remove extra spaces from the beginning and end of the title.
    const trimmedName = name.trim();

    // Check that the user entered a title before sending a request.
    if (!trimmedName) {
      setFieldError("Title is required.");
      return;
    }

    // Disable submission while the API request is running.
    setSubmitting(true);

    try {
      let savedBook: Book;

      if (isEditing && book) {
        // Edit mode: send the updated fields to the existing book's ID.
        const data: UpdateBookData = {
          name: trimmedName,
          category,
        };
    
        savedBook = await updateBook(book.id, data);
      } else {
        // Create mode: send the new book's fields to the API.
        const data: CreateBookData = {
          name: trimmedName,
          category,
        };

        savedBook = await createBook(data);
      }
      // Let the parent component know the book was saved successfully.
      onSuccess(savedBook);
    } catch (err: unknown) {
      // Check whether the error came from Axios and contains backend validation data.
      const responseData = axios.isAxiosError<APIErrorData>(err)
        ? err.response?.data
        : undefined;

      // Show validation messages returned by the backend when available.
      if (responseData?.non_field_errors?.length) {
        setError(responseData.non_field_errors[0]);
      } else if (responseData?.name?.length) {
        setError(responseData.name[0]);
      } else {
        // Fallback error for unexpected API/network failures
        setError(
          isEditing
            ? "Unable to update the book."
            : "Unable to create the book."
        );
      }
    } finally {
      // Allow the form to be submitted again after the request finishes.
      setSubmitting(false);
    }
  };

  // Form surface: validation messages, inputs, and action buttons live here.
  return (
    <form onSubmit={handleSubmit}>
      <Box
        bg="white"
        borderWidth="1px"
        borderRadius="xl"
        p={{ base: "5", md: "6" }}
        shadow="sm"
      >
        <Stack gap="5">
          {/* API error banner appears above the inputs after a failed request. */}
          {error && (
            <Alert.Root status="error">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>
                  Unable to {isEditing ? "update" : "create"} book
                </Alert.Title>
                <Alert.Description>{error}</Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}

          {/* Book title input. */}
          <Field.Root invalid={Boolean(fieldError)}>
            <Field.Label>
              Book title
              <Field.RequiredIndicator />
            </Field.Label>

            <Input
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                // Clear the previous title error when the user starts typing again.
                setFieldError("");
              }}
              placeholder="e.g. The Hobbit"
              maxLength={180}
            />

            {/* Show title validation errors below the input. */}
            {fieldError && (
              <Field.ErrorText>{fieldError}</Field.ErrorText>
            )}
          </Field.Root>

          {/* Book category dropdown. */}
          <Field.Root>
            <Field.Label>
              Category
              <Field.RequiredIndicator />
            </Field.Label>

            <NativeSelect.Root>
              <NativeSelect.Field
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as BookCategory)
                }
              >
                <option value="Fiction">Fiction</option>
                <option value="Non-Fiction">Non-Fiction</option>
              </NativeSelect.Field>

              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Field.Root>

          {/* Form action buttons. */}
          <Stack
            direction={{ base: "column-reverse", sm: "row" }}
            justify="flex-end"
            gap="3"
          >
            {/* Show Cancel only when the parent provides an onCancel function. */}
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={submitting}
              >
                Cancel
              </Button>
            )}

            {/* Disable saving while a request is running or when no edits were made. */}
            <Button
              type="submit"
              colorPalette="blue"
              loading={submitting}
              disabled={submitting || (isEditing && !hasChanges)}
            >
              {isEditing ? "Save changes" : "Create book"}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </form>
  );
}
