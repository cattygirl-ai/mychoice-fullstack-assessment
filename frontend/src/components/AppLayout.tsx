import {
  Box,
  Container,
  Flex,
  Heading,
  Image,
} from "@chakra-ui/react";
import type { ReactNode } from "react";

// Every page is passed in as children and appears below the shared header.
interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({
  children,
}: AppLayoutProps) {
  // This wrapper gives every route the same background and header.
  return (
    <Box
      minH="100vh"
      bg="gray.50"
    >
      {/* Sticky site header*/}
      <Box
        bg="white"
        borderBottomWidth="1px"
        position="sticky"
        top="0"
        zIndex="10"
      >
        {/* The same maximum width is used for the header and page content. */}
        <Container
          maxW="1200px"
          py="4"
        >
          {/* Logo and application title sit side by side. */}
          <Flex
            align="center"
            gap="3"
          >
            <Image
              src="/stack-of-books.png"
              alt="stack of books"
              boxSize="10"
              objectFit="contain"
            />

            <Box>
              <Heading size="md">
                Library Manager
              </Heading>
            </Box>
          </Flex>
        </Container>
      </Box>
      
      {/* Route content goes here. Chakra's base/md values mean smaller padding
          on mobile and larger padding from the medium breakpoint upward. */}
      <Container
        maxW="1200px"
        py={{
          base: "6",
          md: "10",
        }}
      >
        {children}
      </Container>
    </Box>
  );
}
