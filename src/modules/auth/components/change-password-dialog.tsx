import * as React from "react"
import toast from "react-hot-toast"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button.tsx"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog.tsx"
import { Input } from "@/components/ui/input.tsx"
import { getApiErrorMessage } from "@/lib/axios.ts"
import { changePasswordRequest } from "@/modules/auth/api/auth.api.ts"
import { useAuth } from "@/modules/auth/hooks/use-auth.tsx"

type ChangePasswordDialogProps = {
  open: boolean
  setOpen: (open: boolean) => void
}

/** Controlled change-password dialog — opened from the sidebar user block. */
export function ChangePasswordDialog({ open, setOpen }: ChangePasswordDialogProps) {
  const { user } = useAuth()
  const [oldPassword, setOldPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [isSaving, setIsSaving] = React.useState(false)

  function resetForm() {
    setOldPassword("")
    setNewPassword("")
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetForm()
    setOpen(next)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const username = user?.name?.trim() ?? ""
    const missing: string[] = []
    if (!username) missing.push("username")
    if (!oldPassword) missing.push("old password")
    if (!newPassword) missing.push("new password")
    if (missing.length > 0) {
      toast.error(`Please enter: ${missing.join(", ")}.`)
      return
    }
    setIsSaving(true)
    try {
      const res = await changePasswordRequest({
        username,
        old_password: oldPassword,
        password: newPassword,
      })
      if (res.code === 200) {
        toast.success(res.msg || "Password changed successfully.")
        resetForm()
        setOpen(false)
      } else {
        toast.error(res.msg || "Failed to change password. Try again.")
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new one.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="change-username"
              className="text-sm leading-5 font-medium"
            >
              Username
            </label>
            <Input
              id="change-username"
              value={user?.name ?? ""}
              disabled
              readOnly
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="change-old-password"
              className="text-sm leading-5 font-medium"
            >
              Current password
            </label>
            <Input
              id="change-old-password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter current password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="change-new-password"
              className="text-sm leading-5 font-medium"
            >
              New password
            </label>
            <Input
              id="change-new-password"
              type="password"
              autoComplete="new-password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="size-4 animate-spin" />}
              {isSaving ? "Updating…" : "Update password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
