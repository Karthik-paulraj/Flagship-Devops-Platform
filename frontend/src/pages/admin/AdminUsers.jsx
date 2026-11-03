import { useState, useEffect } from 'react';
import { Shield, User, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user: currentUser } = useAuth();
  const { success, error } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleRole = async (targetUser) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    if (targetUser._id === currentUser._id) {
      error('You cannot change your own administrator role');
      return;
    }

    try {
      const res = await api.put(`/admin/users/${targetUser._id}/role`, { role: newRole });
      if (res.data.success) {
        success(`User role updated to "${newRole}"`);
        setUsers(
          users.map((u) => (u._id === targetUser._id ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      error(err.response?.data?.message || 'Could not update user role');
    }
  };

  const handleDeleteUser = async (targetUser) => {
    if (targetUser._id === currentUser._id) {
      error('You cannot delete your own active admin account');
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete "${targetUser.name}"?`)) {
      return;
    }

    try {
      const res = await api.delete(`/admin/users/${targetUser._id}`);
      if (res.data.success) {
        success('User deleted successfully');
        setUsers(users.filter((u) => u._id !== targetUser._id));
      }
    } catch (err) {
      error(err.response?.data?.message || 'Could not delete user');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Registered Users</h1>
          <p className="text-sm text-gray-500 mt-1">Manage user permissions and account directory</p>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading user directory..." />
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Registered</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-gray-900">{u.name}</span>
                    </td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          u.role === 'admin'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {u.role === 'admin' ? (
                          <Shield className="w-3.5 h-3.5 text-amber-600" />
                        ) : (
                          <User className="w-3.5 h-3.5 text-gray-400" />
                        )}
                        <span className="capitalize">{u.role}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleRole(u)}
                        disabled={u._id === currentUser._id}
                        className="px-2.5 py-1 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                        title="Toggle Admin / User"
                      >
                        Toggle Role
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u)}
                        disabled={u._id === currentUser._id}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
