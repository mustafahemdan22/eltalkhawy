'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { cn } from '@/lib/utils';
import { Shield, ShieldOff } from 'lucide-react';

export default function AdminUsersPage() {
  const users = useQuery(api.users.listAll);
  const setRole = useMutation(api.users.setRole);

  const handleToggleAdmin = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    await setRole({ userId: userId as any, role: newRole as any });
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-cream-100 mb-6">Users</h1>

      {!users ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <p className="text-sm text-charcoal-500">No users yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-charcoal-800">
          <table className="w-full text-sm">
            <thead className="bg-charcoal-900 text-charcoal-400 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-800">
              {users.map((u: any) => (
                <tr key={u._id} className="hover:bg-charcoal-900/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-charcoal-800 border border-charcoal-700 flex items-center justify-center text-xs font-bold text-gold-400">
                        {u.name ? u.name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <span className="text-cream-100 font-medium">{u.name || 'Unnamed'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-charcoal-300">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'text-xs px-2 py-1 rounded font-medium',
                      u.role === 'admin' ? 'bg-gold-500/10 text-gold-400' : 'bg-charcoal-800 text-charcoal-400',
                    )}>
                      {u.role === 'admin' ? 'Admin' : 'Customer'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-charcoal-400 text-xs">
                    {new Date(u._creationTime).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleAdmin(u._id, u.role)}
                      className={cn(
                        'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer',
                        u.role === 'admin'
                          ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                          : 'bg-gold-500/10 text-gold-400 hover:bg-gold-500/20',
                      )}
                    >
                      {u.role === 'admin' ? (
                        <><ShieldOff className="w-3 h-3" /> Revoke Admin</>
                      ) : (
                        <><Shield className="w-3 h-3" /> Make Admin</>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
