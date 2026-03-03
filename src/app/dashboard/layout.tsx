import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LogoutButton } from '@/components/auth-buttons';

export default async function DashboardLayout({
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
        .select('*')
        .eq('id', user.id)
        .single();

    const navItems = [
        { href: '/dashboard', label: 'Overview', icon: '📊' },
        { href: '/dashboard/products', label: 'Products', icon: '📦' },
        { href: '/dashboard/orders', label: 'Orders', icon: '🧾' },
        { href: '/dashboard/payouts', label: 'Payouts', icon: '💸' },
    ];

    return (
        <div className="min-h-screen bg-[hsl(var(--background))]">
            {/* Top Bar */}
            <header className="sticky top-0 z-40 border-b border-[hsl(var(--border))] glass">
                <div className="flex h-16 items-center justify-between px-6">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="text-xl font-bold tracking-tight">
                            BUY67
                        </Link>
                        <span className="text-xs text-[hsl(var(--muted-foreground))] px-2 py-0.5 rounded-full border border-[hsl(var(--border))]">
                            Creator
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/cart"
                            className="relative p-2 rounded-lg hover:bg-[hsl(var(--accent))] transition-colors"
                        >
                            🛒
                        </Link>
                        {profile?.role === 'admin' && (
                            <Link
                                href="/admin"
                                className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                            >
                                Admin
                            </Link>
                        )}
                        <div className="flex items-center gap-3">
                            {profile?.avatar_url && (
                                <img
                                    src={profile.avatar_url}
                                    alt={profile.full_name}
                                    className="h-8 w-8 rounded-full border border-[hsl(var(--border))]"
                                />
                            )}
                            <span className="text-sm font-medium hidden sm:inline">
                                {profile?.full_name || user.email}
                            </span>
                        </div>
                        <LogoutButton />
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
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
                    <div className="mt-auto pt-4 border-t border-[hsl(var(--border))]">
                        <Link
                            href="/dashboard/products/new"
                            className="flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-opacity"
                        >
                            + New Product
                        </Link>
                    </div>
                </aside>

                {/* Mobile Nav */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[hsl(var(--border))] glass">
                    <nav className="flex items-center justify-around h-16">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex flex-col items-center gap-1 p-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                            >
                                <span className="text-lg">{item.icon}</span>
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Main Content */}
                <main className="flex-1 p-6 lg:p-8 pb-24 lg:pb-8 animate-fade-in">
                    {children}
                </main>
            </div>
        </div>
    );
}
