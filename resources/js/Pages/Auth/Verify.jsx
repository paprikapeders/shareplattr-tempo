import { useEffect, useState } from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';
import OTPInput from '../../Components/OTPInput';
import AuthLayout from '../../Layouts/AuthLayout';

function formatCountdown(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function VerificationIcon() {
    return (
        <svg viewBox="0 0 80 80" className="h-[74px] w-[74px] text-[#7263cf]">
            <path fill="currentColor" d="M34.8 10.6c3.2-6.3 12.2-6.3 15.4 0l3.2 6.2a7.8 7.8 0 0 0 4.8 3.9l6.8 1.9c6.8 1.9 9.6 10.1 5 15.6l-4.6 5.6a7.8 7.8 0 0 0-1.7 5.9l.8 7.1c.8 7.1-6.4 12.5-12.9 9.3l-6.5-3.2a7.8 7.8 0 0 0-6.9 0l-6.5 3.2c-6.5 3.2-13.7-2.2-12.9-9.3l.8-7.1a7.8 7.8 0 0 0-1.7-5.9L10 38.2c-4.6-5.5-1.8-13.7 5-15.6l6.8-1.9a7.8 7.8 0 0 0 4.8-3.9l3.2-6.2Z" opacity=".18" />
            <path fill="currentColor" d="M38.5 13.6c1.4-2.8 5.5-2.8 6.9 0l3.5 6.8a10.3 10.3 0 0 0 6.4 5.2l7.5 2.1c3 .9 4.2 4.4 2.2 6.8l-5 6a10.3 10.3 0 0 0-2.3 7.8l.9 7.8c.3 3.1-2.9 5.4-5.8 4l-7.2-3.6a10.3 10.3 0 0 0-9.1 0L30.3 60c-2.9 1.4-6.1-.9-5.8-4l.9-7.8a10.3 10.3 0 0 0-2.3-7.8l-5-6c-2-2.4-.8-5.9 2.2-6.8l7.5-2.1a10.3 10.3 0 0 0 6.4-5.2l3.5-6.8Z" />
            <path fill="#B3E1E7" d="M40 28c3.5 0 6.3 2.8 6.3 6.3 0 2-.9 3.6-2.4 4.8-1.1.9-1.6 1.8-1.6 3v1.2h-4.6v-1.7c0-2.1.8-4 2.6-5.3 1-.8 1.5-1.4 1.5-2.5 0-1-.8-1.8-1.8-1.8S38.2 32 38.2 33.1h-4.5A6.4 6.4 0 0 1 40 28Zm-2.8 19.5h5.6v5.3h-5.6v-5.3Z" />
        </svg>
    );
}

export default function Verify({ email, editRegistrationUrl, expiresInSeconds }) {
    const { flash = {} } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        code: '',
    });
    const resendForm = useForm({});
    const [secondsLeft, setSecondsLeft] = useState(expiresInSeconds ?? 0);

    useEffect(() => {
        setSecondsLeft(expiresInSeconds ?? 0);
    }, [expiresInSeconds]);

    useEffect(() => {
        if (secondsLeft <= 0) {
            return undefined;
        }

        const timer = window.setInterval(() => {
            setSecondsLeft((current) => Math.max(0, current - 1));
        }, 1000);

        return () => window.clearInterval(timer);
    }, [secondsLeft]);

    const submit = (event) => {
        event.preventDefault();
        post('/verify');
    };

    const resend = () => {
        resendForm.post('/verify/resend', {
            preserveScroll: true,
        });
    };

    return (
        <AuthLayout title="Shareplattr" backHref="/login" showMobileHero={false} contentClassName="pt-24 lg:py-10">
            <form onSubmit={submit} className="mx-auto mt-8 flex w-full max-w-[340px] flex-col items-center sm:mt-10">
                <div className="mb-4 hidden lg:block">
                    <VerificationIcon />
                </div>

                <h2 className="text-center text-[20px] font-bold text-[#111111] sm:text-[22px]">
                    Verify Your Account
                </h2>
                <p className="mt-2 max-w-[330px] text-center text-[14px] leading-6 text-[#101010] sm:text-[15px]">
                    We sent a 6-digit code to:
                </p>
                <p className="mt-1 max-w-[330px] break-all text-center text-[15px] font-semibold text-[#111111]">
                    {email}
                </p>
                <Link
                    href={editRegistrationUrl ?? '/register'}
                    className="mt-2 text-center text-[14px] font-medium text-[#7a6cf2] underline underline-offset-4"
                >
                    Wrong email? Go back and edit
                </Link>

                <div className="mt-7">
                    <OTPInput
                        value={data.code}
                        onChange={(value) => setData('code', value)}
                        disabled={processing}
                    />
                </div>

                {(errors.code || flash.error) && (
                    <p className="mt-4 text-center text-sm text-red-600">
                        {errors.code ?? flash.error}
                    </p>
                )}

                {flash.success && (
                    <p className="mt-4 text-center text-sm text-emerald-700">
                        {flash.success}
                    </p>
                )}

                <div className="mt-6 text-center">
                    <p className="text-[14px] text-[#101010]">Didn&apos;t receive a code</p>
                    <button
                        type="button"
                        onClick={resend}
                        disabled={resendForm.processing}
                        className="mt-1 whitespace-nowrap text-[15px] font-medium text-[#7a6cf2] disabled:opacity-60"
                    >
                        {resendForm.processing ? 'Sending...' : 'Resend code'}
                    </button>
                    <p className="mt-2 text-sm text-slate-600">
                        {secondsLeft > 0 ? `Code expires in ${formatCountdown(secondsLeft)}` : 'Code expired. Resend to get a new one.'}
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={processing || data.code.length !== 6}
                    className="mt-8 h-12 w-full whitespace-nowrap rounded-full bg-gradient-to-r from-purple-400 to-indigo-700 text-[16px] font-bold text-white shadow-[0_14px_26px_rgba(88,80,151,0.22)] transition hover:scale-[1.01] hover:opacity-95 disabled:opacity-50"
                >
                    {processing ? 'Verifying...' : 'Verify'}
                </button>
            </form>
        </AuthLayout>
    );
}
