import { Link } from '@inertiajs/react';

const variants = {
    primary: 'border-slate-950 bg-slate-950 text-white hover:bg-slate-800 focus:ring-slate-900 disabled:border-slate-300 disabled:bg-slate-300',
    secondary: 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50 focus:ring-slate-500 disabled:text-slate-400',
    subtle: 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 focus:ring-slate-500 disabled:text-slate-400',
};

export default function Button({
    as = 'button',
    variant = 'primary',
    className = '',
    children,
    ...props
}) {
    const classes = [
        'inline-flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-semibold shadow-sm shadow-slate-950/5 transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70',
        variants[variant] ?? variants.primary,
        className,
    ].join(' ');

    if (as === Link) {
        return (
            <Link className={classes} {...props}>
                {children}
            </Link>
        );
    }

    const Component = as;

    return (
        <Component className={classes} {...props}>
            {children}
        </Component>
    );
}
