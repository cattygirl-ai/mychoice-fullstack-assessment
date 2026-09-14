import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AppLayout from "./components/AppLayout";
import BookListPage from "./pages/BookListPage";
import BookDetailPage from "./pages/BookDetailPage";
import CreateBookPage from "./pages/CreateBookPage";

// Defines the frontend pages and their routes.
function App() {
  return (
    <BrowserRouter>
      {/* The header and page container stay the same while routes change. */}
      <AppLayout>
        <Routes>
          {/* Redirect the home page to the book list. */}
          <Route
            path="/"
            element={
              <Navigate
                to="/books"
                replace
              />
            }
          />

          {/* Show all books. */}
          <Route
            path="/books"
            element={<BookListPage />}
          />

          {/* Page for creating a new book. */}
          <Route
            path="/books/new"
            element={<CreateBookPage />}
          />

          {/* Show or edit a specific book using its ID. */}
          <Route
            path="/books/:id"
            element={<BookDetailPage />}
          />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
