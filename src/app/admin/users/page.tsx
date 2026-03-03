import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminUsersPage() {
    const supabase = createAdminClient();

    const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                <p className="text-[hsl(var(--muted-foreground))] mt-1">
                    All registered users on the platform
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Users ({users?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[hsl(var(--border))]">
                                    <th className="text-left py-3 px-2 font-medium text-[hsl(var(--muted-foreground))]">
                                        User
                                    </th>
                                    <th className="text-left py-3 px-2 font-medium text-[hsl(var(--muted-foreground))]">
                                        Username
                                    </th>
                                    <th className="text-left py-3 px-2 font-medium text-[hsl(var(--muted-foreground))]">
                                        Role
                                    </th>
                                    <th className="text-left py-3 px-2 font-medium text-[hsl(var(--muted-foreground))]">
                                        Joined
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {users?.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--accent))]/50 transition-colors"
                                    >
                                        <td className="py-3 px-2">
                                            <div className="flex items-center gap-3">
                                                {user.avatar_url && (
                                                    <img
                                                        src={user.avatar_url}
                                                        alt={user.full_name}
                                                        className="h-8 w-8 rounded-full border border-[hsl(var(--border))]"
                                                    />
                                                )}
                                                <span className="font-medium">{user.full_name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-2 text-[hsl(var(--muted-foreground))]">
                                            @{user.username}
                                        </td>
                                        <td className="py-3 px-2">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${user.role === 'admin'
                                                        ? 'bg-red-500/10 text-red-400'
                                                        : 'bg-blue-500/10 text-blue-400'
                                                    }`}
                                            >
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-3 px-2 text-[hsl(var(--muted-foreground))]">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
