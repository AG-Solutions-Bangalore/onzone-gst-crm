import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.tsx"
import { AppToaster } from "@/components/app-toaster.tsx"
import { QueryProvider } from "@/components/query-provider.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryProvider>
        <App />
        <AppToaster />
      </QueryProvider>
    </ThemeProvider>
  </StrictMode>,
)
