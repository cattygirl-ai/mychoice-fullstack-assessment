import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import App from './App.tsx'

// Find the <div id="root"> in index.html and use it as the
// starting point where React will render the application.
createRoot(
  document.getElementById("root")!
).render(

  // StrictMode helps catch common React problems during development.
  <StrictMode>

    {/* Gives the entire app access to Chakra UI components and styling. */}
    <ChakraProvider value={defaultSystem}>

       {/* App is the main component containing the application's routes and pages. */}
      <App />
      
    </ChakraProvider>
  </StrictMode>

);

