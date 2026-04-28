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
        <AuthLayout title="Shareplattr" align="top" backHref="/login">
            <form onSubmit={submit} className="mx-auto mt-8 w-full max-w-[280px] sm:mt-10 sm:max-w-[320px] lg:mt-12">
                <input
                    type="text"
                    placeholder="First Name"
                    value={data.first_name}
                    onChange={(event) => setData('first_name', event.target.value)}
                    className="h-[46px] w-full rounded-[20px] border-0 bg-white px-5 text-[15px] text-[#111111] outline-none placeholder:text-[#6f7280]"
                />
                {errors.first_name && <p className="mt-1.5 text-sm text-red-600">{errors.first_name}</p>}

                <input
                    type="text"
                    placeholder="Last Name"
                    value={data.last_name}
                    onChange={(event) => setData('last_name', event.target.value)}
                    className="mt-4 h-[46px] w-full rounded-[20px] border-0 bg-white px-5 text-[15px] text-[#111111] outline-none placeholder:text-[#6f7280]"
                />
                {errors.last_name && <p className="mt-1.5 text-sm text-red-600">{errors.last_name}</p>}

                <input
                    type="email"
                    placeholder="E-mail"
                    value={data.email}
                    onChange={(event) => setData('email', event.target.value)}
                    className="mt-4 h-[46px] w-full rounded-[20px] border-0 bg-white px-5 text-[15px] text-[#111111] outline-none placeholder:text-[#6f7280]"
                />
                {errors.email && <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>}

                <input
                    type="password"
                    placeholder="Enter Your Password"
                    value={data.password}
                    onChange={(event) => setData('password', event.target.value)}
                    className="mt-4 h-[46px] w-full rounded-[20px] border-0 bg-white px-5 text-[15px] text-[#111111] outline-none placeholder:text-[#6f7280]"
                />
                {errors.password && <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>}

                <input
                    type="password"
                    placeholder="Confirm Your Password"
                    value={data.password_confirmation}
                    onChange={(event) => setData('password_confirmation', event.target.value)}
                    className="mt-4 h-[46px] w-full rounded-[20px] border-0 bg-white px-5 text-[15px] text-[#111111] outline-none placeholder:text-[#6f7280]"
                />

                <button
                    type="submit"
                    disabled={processing}
                    className="mt-16 h-[49px] w-full rounded-[18px] bg-[linear-gradient(90deg,#9284e4_0%,#564e86_100%)] text-[16px] font-bold text-white disabled:opacity-50"
                >
                    {processing ? 'Creating...' : 'Create Account'}
                </button>

                <p className="mt-5 text-center text-[15px] text-[#101010]">
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium">
                        Login
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}
