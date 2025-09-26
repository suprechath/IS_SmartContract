// src/features/admin/components/UserManagementTable.tsx
import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getStatusBadge, getRoleBadge } from "@/components/StatusBadge";

import { Eye, FileSpreadsheet, Search, User as UserIcon, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useAdminActions } from "../hooks/useAdminActions";
import type { User } from "../types";
import api from '@/lib/api';


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

  const [isDetailsOpen, setDetailsOpen] = useState(false);
  const [detailedUserData, setDetailedUserData] = useState<User | null>(null);
  const [isDetailsLoading, setDetailsLoading] = useState<boolean>(false);


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

  const handleViewDetailsClick = async (user: User) => {
    setSelectedUser(user);
    setDetailsOpen(true);
    setDetailsLoading(true);
    setDetailedUserData(null);
    try {
      const response = await api.get(`/users/id/${user.id}`);
      if (response.status !== 200) {
        throw new Error(`Failed to fetch user details: ${response.statusText}`);
      }
      console.log("Raw detailed user data:", response.data.data);
      setDetailedUserData(response.data.data);
    } catch (error) {
      console.error("Failed to fetch user details:", error);
    } finally {
      setDetailsLoading(false);
    }
  };

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
                      <Button variant="ghost" size="icon" onClick={() => handleViewDetailsClick(user)}>
                        <Eye className="h-4 w-4" /></Button>
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

      <Dialog open={isDetailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto text-emerald-950 font-bold">
          <DialogHeader>
            <DialogTitle className="text-xl gap-10 flex items-center sticky top-0">
              {detailedUserData?.full_name}
              {detailedUserData?.sanction_status == "Pending" &&
                <div>
                  <Button variant="ghost" size="icon" className="text-green-600 bg-gray-200 hover:text-green-700 w-28" onClick={() => handleReviewClick(selectedUser, 'Verified')}>
                    <CheckCircle className="h-16 w-16" /> Approve
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-600 bg-gray-200 hover:text-red-700 w-28 ml-5" onClick={() => handleReviewClick(selectedUser, 'Rejected')}>
                    <XCircle className="h-16 w-16" /> Reject
                  </Button>
                </div>
              }
            </DialogTitle>
            <DialogDescription>
              User ID: {detailedUserData?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-md min-h-[200px]">
            {isDetailsLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-40 w-40 animate-spin text-muted-foreground" />
              </div>
            ) : detailedUserData ? (
              <div className="space-y-2 text-sm">

                {/* {/* --- OVERVIEW SECTION --- */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-base">Role</h4>
                    {selectedUser && getRoleBadge(detailedUserData.role.toLowerCase().replace(/ /g, "_"))}
                    {/* <p className="text-muted-foreground">{detailedUserData.role}</p> */}
                  </div>
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-base">Wallet address</h4>
                    <p className="text-muted-foreground">{detailedUserData.wallet_address}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-base">Status</span>
                    {selectedUser && getStatusBadge(detailedUserData.sanction_status.toLowerCase())}
                  </div>
                  <hr />
                  <div className="flex justify-between items-center">
                    <h4 className="text-muted-foreground">Email</h4>
                    <p className="text-muted-foreground">{detailedUserData.email}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <h4 className="text-muted-foreground">Identification number</h4>
                    <p className="text-muted-foreground">{detailedUserData.identification_number}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <h4 className="text-muted-foreground">Date of Birth</h4>
                    <p className="text-muted-foreground">{new Date(detailedUserData.date_of_birth).toISOString().slice(0, 10)}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <h4 className="text-muted-foreground">Location address</h4>
                    <p className="text-muted-foreground">{detailedUserData.address}</p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Could not load project details.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog >
    </>


  );
};