import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import "./index.css"
import { RootLayout } from "@/components/layouts/root-layout.tsx"
import { MainProvider } from "@/components/providers/mainProvider.tsx"
import { ClientsPage } from "@/pages/clients.tsx"
import { DashboardPage } from "@/pages/dashboard.tsx"
import { InvoicesPage } from "@/pages/invoices.tsx"
import { NotFoundPage } from "@/pages/not-found.tsx"

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "clients", element: <ClientsPage /> },
      { path: "invoices", element: <InvoicesPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
])

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MainProvider>
      <RouterProvider router={router} />
    </MainProvider>
  </StrictMode>,
)
