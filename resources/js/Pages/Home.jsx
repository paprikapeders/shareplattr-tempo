import { Link } from '@inertiajs/react';
import Button from '../Components/Button';

export default function Home() {
    return (
        <main className="min-h-screen bg-slate-950 text-white">
            <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
                <header className="flex items-center justify-between">
                    <Link href="/" className="text-xl font-bold">
                        SharePlattr
                    </Link>
                    <nav className="flex items-center gap-2">
                        <Link href="/login" className="rounded-md px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/10">
                            Login
                        </Link>
                    </nav>
                </header>

                <section className="flex flex-1 items-center py-16">
                    <div className="max-w-3xl">
                        <p className="text-sm font-semibold uppercase text-cyan-300">
                            Referral campaigns made simple
                        </p>
                        <h1 className="mt-4 text-4xl font-semibold sm:text-6xl">
                            Share campaigns, track clicks, and reward real conversions.
                        </h1>
                        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                            SharePlattr gives brands and participants a clean way to generate referral links, measure engagement, and manage rewards from one lightweight dashboard.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Button as={Link} href="/login" className="border-white/20 bg-cyan-400 text-slate-950 hover:bg-cyan-300">
                                Login
                            </Button>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
