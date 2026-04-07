import { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { adminApi } from "@/services/adminApi";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/LoadingSpinner";

type UserRow = {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
};

export function AdminUsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await adminApi.getUsers();
      setUsers(data as UserRow[]);
    } catch (e) {
      const msg = isAxiosError(e) ? e.response?.data?.message : "Failed to load users";
      toast.error(String(msg));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function remove(u: UserRow) {
    if (!window.confirm(`Remove ${u.name} (${u.email})?`)) return;
    try {
      await adminApi.deleteUser(u._id);
      setUsers((prev) => prev.filter((x) => x._id !== u._id));
      toast.success("User removed");
    } catch (e) {
      const msg = isAxiosError(e) ? e.response?.data?.message : "Delete failed";
      toast.error(String(msg));
    }
  }

  if (loading) return <PageLoader />;

  return (
    <Card className="overflow-hidden border-[#e5e7eb] shadow-md">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e5e7eb] bg-[#f8fafc] text-left text-[#6b7280]">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-[#e5e7eb] last:border-0 hover:bg-[#fafafa]">
                  <td className="px-4 py-3 font-medium text-[#111827]">{u.name}</td>
                  <td className="px-4 py-3 text-[#6b7280]">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={u.role === "admin" ? "default" : "outline"}>{u.role}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={String(me?.id) === String(u._id)}
                      className="text-red-600 hover:bg-red-50 disabled:opacity-40"
                      onClick={() => void remove(u)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 ? (
          <p className="py-10 text-center text-[#6b7280]">No users found.</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
