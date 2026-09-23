import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import "./index.css"
import { RootLayout } from "@/components/layouts/root-layout.tsx"
import { MainProvider } from "@/components/providers/mainProvider.tsx"
import {
  AuthProvider,
  LoginPage,
  RequireAuth,
} from "@/modules/auth/index.ts"
import {
  DashboardPage,
  VendorDetailsPage,
  VendorsPage,
} from "@/modules/vendor/index.ts"
import { NotFoundPage } from "@/pages/not-found.tsx"

const router = createBrowserRouter([
  // Public — login first, then the app.
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: (
      <RequireAuth>
        <RootLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "vendors", element: <VendorsPage /> },
      { path: "vendors/:gstin", element: <VendorDetailsPage /> },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
])

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MainProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </MainProvider>
  </StrictMode>,
)
