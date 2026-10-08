import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import "./index.css"
import { RootLayout } from "@/components/layouts/root-layout.tsx"
import { MainProvider } from "@/components/providers/mainProvider.tsx"
import {
  AuthProvider,
  ForgotPasswordPage,
  LoginPage,
  RequireAuth,
} from "@/modules/auth/index.ts"

import { DashboardPage } from "@/modules/vendor/index.ts"
import { VendorGstPage } from "@/modules/vendor-gst/index.ts"
import { VendorGstDetailsPage } from "@/modules/vendor-gst-details/index.ts"
import {
  SyncDetailsPage,
  SyncDetailProfilePage,
} from "@/modules/sync-details/index.ts"
import { NotFoundPage } from "@/pages/not-found.tsx"

const router = createBrowserRouter([
  // Public — login first, then the app.
  { path: "/login", element: <LoginPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  {
    path: "/",
    element: (
      <RequireAuth>
        <RootLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "vendor-gst", element: <VendorGstPage /> },
      { path: "vendor-gst-details", element: <VendorGstDetailsPage /> },
      { path: "sync-details", element: <SyncDetailsPage /> },
      { path: "sync-details/:gstin", element: <SyncDetailProfilePage /> },
      // Backward compatibility aliases
      { path: "vendors", element: <VendorGstPage /> },
      { path: "vendors/:gstin", element: <SyncDetailProfilePage /> },
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
