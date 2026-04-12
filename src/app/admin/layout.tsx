import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LogoutButton } from '@/components/auth-buttons';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect('/');

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') redirect('/dashboard');

    const navItems = [
        { href: '/admin', label: 'Overview', icon: '📊' },
        { href: '/admin/users', label: 'Users', icon: '👥' },
        { href: '/admin/customers', label: 'Customers', icon: '📱' },
        { href: '/admin/orders', label: 'Orders', icon: '🧾' },
        { href: '/admin/payouts', label: 'Payouts', icon: '💸' },
    ];

    return (
        <div className="min-h-screen bg-[hsl(var(--background))]">
            <header className="sticky top-0 z-40 border-b border-[hsl(var(--border))] glass">
                <div className="flex h-16 items-center justify-between px-6">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="text-xl font-bold tracking-tight">
                            BUY67
                        </Link>
                        <span className="text-xs font-medium text-red-400 px-2 py-0.5 rounded-full border border-red-400/30 bg-red-400/5">
                            Admin
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                        >
                            Creator Dashboard
                        </Link>
                        <LogoutButton />
                    </div>
                </div>
            </header>

            <div className="flex">
                <aside className="hidden lg:flex w-60 flex-col border-r border-[hsl(var(--border))] min-h-[calc(100vh-4rem)] p-4">
                    <nav className="flex flex-col gap-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-all duration-200"
                            >
                                <span>{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </aside>

                <main className="flex-1 p-6 lg:p-8 animate-fade-in">
                    {children}
                </main>
            </div>
        </div>
    );
}
