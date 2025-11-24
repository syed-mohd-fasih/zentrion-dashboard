"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Plus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { AddUserDialog } from "./add-user-dialog"

const users = [
  {
    id: 1,
    username: "admin_user",
    email: "admin@zentrion.io",
    role: "Admin",
    status: "Active",
    lastLogin: "2025-01-24 08:15:22",
  },
  {
    id: 2,
    username: "dev_lead",
    email: "dev.lead@zentrion.io",
    role: "Developer",
    status: "Active",
    lastLogin: "2025-01-24 14:32:11",
  },
  {
    id: 3,
    username: "security_audit",
    email: "audit@zentrion.io",
    role: "Auditor",
    status: "Active",
    lastLogin: "2025-01-23 16:45:33",
  },
  {
    id: 4,
    username: "john_dev",
    email: "john@zentrion.io",
    role: "Developer",
    status: "Inactive",
    lastLogin: "2025-01-18 10:22:15",
  },
  {
    id: 5,
    username: "ops_engineer",
    email: "ops@zentrion.io",
    role: "Developer",
    status: "Active",
    lastLogin: "2025-01-24 12:05:44",
  },
]

const roleColor = {
  Admin: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  Developer: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Auditor: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
}

const statusColor = {
  Active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
}

export function UsersTable() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <Card className="rounded-2xl border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Users</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Manage user accounts and roles</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="rounded-lg gap-2">
            <Plus className="w-4 h-4" />
            Add User
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Username</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Last Login</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-4 px-4 text-foreground font-medium">{user.username}</td>
                    <td className="py-4 px-4 text-muted-foreground">{user.email}</td>
                    <td className="py-4 px-4">
                      <Badge className={`rounded-lg ${roleColor[user.role as keyof typeof roleColor]}`}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={`rounded-lg ${statusColor[user.status as keyof typeof statusColor]}`}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground text-xs">{user.lastLogin}</td>
                    <td className="py-4 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-lg">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Reset Password</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Revoke Access</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AddUserDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  )
}
