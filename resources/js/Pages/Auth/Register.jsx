import { Link, useForm } from '@inertiajs/react';
import AuthLayout from '../../Layouts/AuthLayout';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (event) => {
        event.preventDefault();
        post('/register');
    };

    return (
        <AuthLayout title="Shareplattr" backHref="/login">
            <form onSubmit={submit} className="mx-auto mt-8 flex w-full max-w-[320px] flex-col gap-4 sm:mt-10">
                <input
                    type="text"
                    placeholder="First Name"
                    value={data.first_name}
                    onChange={(event) => setData('first_name', event.target.value)}
                    className="h-12 w-full rounded-full border-0 bg-white px-5 text-[15px] text-[#111111] shadow-sm outline-none placeholder:text-[#6f7280]"
                />
                {errors.first_name && <p className="-mt-2 text-sm text-red-600">{errors.first_name}</p>}

                <input
                    type="text"
                    placeholder="Last Name"
                    value={data.last_name}
                    onChange={(event) => setData('last_name', event.target.value)}
                    className="h-12 w-full rounded-full border-0 bg-white px-5 text-[15px] text-[#111111] shadow-sm outline-none placeholder:text-[#6f7280]"
                />
                {errors.last_name && <p className="-mt-2 text-sm text-red-600">{errors.last_name}</p>}

                <input
                    type="email"
                    placeholder="E-mail"
                    value={data.email}
                    onChange={(event) => setData('email', event.target.value)}
                    className="h-12 w-full rounded-full border-0 bg-white px-5 text-[15px] text-[#111111] shadow-sm outline-none placeholder:text-[#6f7280]"
                />
                {errors.email && <p className="-mt-2 text-sm text-red-600">{errors.email}</p>}

                <input
                    type="password"
                    placeholder="Enter Your Password"
                    value={data.password}
                    onChange={(event) => setData('password', event.target.value)}
                    className="h-12 w-full rounded-full border-0 bg-white px-5 text-[15px] text-[#111111] shadow-sm outline-none placeholder:text-[#6f7280]"
                />
                {errors.password && <p className="-mt-2 text-sm text-red-600">{errors.password}</p>}

                <input
                    type="password"
                    placeholder="Confirm Your Password"
                    value={data.password_confirmation}
                    onChange={(event) => setData('password_confirmation', event.target.value)}
                    className="h-12 w-full rounded-full border-0 bg-white px-5 text-[15px] text-[#111111] shadow-sm outline-none placeholder:text-[#6f7280]"
                />

                <button
                    type="submit"
                    disabled={processing}
                    className="mt-8 h-12 w-full rounded-full bg-gradient-to-r from-purple-400 to-indigo-700 text-[16px] font-bold text-white shadow-[0_14px_26px_rgba(88,80,151,0.22)] transition hover:scale-[1.01] hover:opacity-95 disabled:opacity-50"
                >
                    {processing ? 'Creating...' : 'Next'}
                </button>

                <p className="text-center text-[15px] text-[#101010]">
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium">
                        Login
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}
