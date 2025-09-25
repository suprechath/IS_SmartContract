// src/features/admin/components/UserManagementTable.tsx
import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getStatusBadge, getRoleBadge } from "@/components/StatusBadge";

import { Eye, FileSpreadsheet, Search, User as UserIcon, CheckCircle, XCircle } from "lucide-react";
import { useAdminActions } from "../hooks/useAdminActions";
import type { User } from "../types";

interface UserTableProps {
  users: User[];
  onDataUpdate: () => void;
}

type ReviewAction = 'Verified' | 'Rejected';

export const UserManagementTable = ({ users, onDataUpdate }: UserTableProps) => {
  const { userSearch, setUserSearch, exportData, reviewUser } = useAdminActions();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [reviewAction, setReviewAction] = useState<ReviewAction>("Rejected");
  const [isReviewOpen, setReviewOpen] = useState(false);

  const filteredUsers = useMemo(() =>
    users.filter(user =>
      user.full_name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.wallet_address.toLowerCase().includes(userSearch.toLowerCase())
    ),
    [users, userSearch]);

  const handleReviewClick = (user: User, action: ReviewAction) => {
    setSelectedUser(user);
    setReviewAction(action);
    setReviewOpen(true);
  };

  const handleConfirmReview = async () => {
    if (!selectedUser) return;
    console.log("Reviewing user:", selectedUser.id, "Action:", reviewAction);
    await reviewUser(selectedUser.id, reviewAction, onDataUpdate);
    setSelectedUser(null);
    setReviewOpen(false);
  };

  // const handleViewDetailsClick = async (user: Project) => {

  // };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="mb-2 text-xl text-emerald-950 texl-bold">User Management</CardTitle>
              <CardDescription className="text-emerald-950">Manage and monitor all users</CardDescription>
            </div>
            <Button variant="outline" onClick={() => exportData('users')}>
              <FileSpreadsheet className="h-4 w-4 mr-2" /> Export
            </Button>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, or wallet address..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table className="text-center">
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">#ID</TableHead>
                <TableHead className="text-center w-[100px]">User</TableHead>
                <TableHead className="text-center w-[200px]">Wallet Address</TableHead>
                <TableHead className="text-center">Role</TableHead>
                <TableHead className="text-center">Sanction Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id.slice(0, 6)}...{user.id.slice(-6)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="ml-4 text-left">
                        <div className="font-medium">{user.full_name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-md">{user.wallet_address}</TableCell>
                  <TableCell>{getRoleBadge(user.role.toLowerCase().replace(/ /g, "_"))}</TableCell>
                  <TableCell>{getStatusBadge(user.sanction_status.toLowerCase())}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon"
                      // onClick={() => handleViewDetailsClick(project)}
                      ><Eye className="h-4 w-4" /></Button>
                      {user.sanction_status === 'Pending' && (
                        <>
                          <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700" onClick={() => handleReviewClick(user, 'Verified')}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => handleReviewClick(user, 'Rejected')}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isReviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="text-emerald-950">
          <DialogHeader>
            <DialogTitle>Confirm User "{reviewAction}"</DialogTitle>
            <DialogDescription>
              Are you sure you want to {reviewAction.toLowerCase()} the user "{selectedUser?.full_name}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOpen(false)}>Cancel</Button>
            <Button
              onClick={handleConfirmReview}
              className={reviewAction === 'Rejected' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
            >
              Confirm {reviewAction}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>


  );
};