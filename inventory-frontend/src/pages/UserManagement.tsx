import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { users } from '@/api/api';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pencil, Trash2, Loader2, Eye } from 'lucide-react';

interface User {
  id: string;
  email: string;
  role: string;
  is_verified: boolean;
}

export default function UserManagement() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [userList, setUserList] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    role: '',
    is_verified: false,
  });

  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAdmin) return;
      try {
        setIsLoading(true);
        const response = await users.getAll();
        setUserList(response.data || []);
      } catch (error) {
        toast.error('Failed to load users');
        setUserList([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && isAdmin) {
      fetchUsers();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  const handleVerifiedChange = (value: string) => {
    setFormData((prev) => ({ ...prev, is_verified: value === 'true' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error('Only admins can manage users');
      return;
    }
    try {
      const data = {
        email: formData.email,
        role: formData.role,
        is_verified: formData.is_verified,
      };

      await users.update(selectedUser!.id, data);
      toast.success('User updated successfully');

      setIsDialogOpen(false);
      setSelectedUser(null);
      setFormData({ email: '', role: '', is_verified: false });
      const response = await users.getAll();
      setUserList(response.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update user');
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) {
      toast.error('Only admins can delete users');
      return;
    }
    try {
      await users.delete(id);
      toast.success('User deleted successfully');
      const response = await users.getAll();
      setUserList(response.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete user');
    }
  };

  const handleEdit = (user: User) => {
    if (!isAdmin) {
      toast.error('Only admins can edit users');
      return;
    }
    setSelectedUser(user);
    setFormData({
      email: user.email,
      role: user.role,
      is_verified: user.is_verified,
    });
    setIsDialogOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4 text-foreground">Please login to manage users</h1>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4 text-foreground">Admin access required</h1>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
      </div>

      {userList.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No users found.
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-background">
                <TableHead className="text-foreground">Email</TableHead>
                <TableHead className="text-foreground">Role</TableHead>
                <TableHead className="text-foreground">Verified</TableHead>
                <TableHead className="text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userList.map((user) => (
                <TableRow key={user.id} className="bg-background">
                  <TableCell className="font-medium text-foreground">{user.email}</TableCell>
                  <TableCell className="text-foreground">{user.role}</TableCell>
                  <TableCell className="text-foreground">{user.is_verified ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="icon" asChild>
                        <Link to={`/user-management/${user.id}`}>
                          <Eye className="h-4 w-4 text-foreground" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(user)}
                      >
                        <Pencil className="h-4 w-4 text-foreground" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Trash2 className="h-4 w-4 text-foreground" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-background border-border">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-foreground">Delete User</AlertDialogTitle>
                            <AlertDialogDescription className="text-muted-foreground">
                              Are you sure you want to delete this user? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-background text-foreground border-border">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-500 hover:bg-red-600 text-white"
                              onClick={() => handleDelete(user.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="bg-background text-foreground border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-foreground">Role</Label>
              <Select value={formData.role} onValueChange={handleSelectChange} required>
                <SelectTrigger className="bg-background text-foreground border-border">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  <SelectItem value="admin" className="text-foreground">Admin</SelectItem>
                  <SelectItem value="user" className="text-foreground">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="verified" className="text-foreground">Verified</Label>
              <Select value={String(formData.is_verified)} onValueChange={handleVerifiedChange} required>
                <SelectTrigger className="bg-background text-foreground border-border">
                  <SelectValue placeholder="Select verification status" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  <SelectItem value="true" className="text-foreground">Yes</SelectItem>
                  <SelectItem value="false" className="text-foreground">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white">
              Update User
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}