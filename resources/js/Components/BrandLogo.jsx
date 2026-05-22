const assetVersion = '20260522';

export const brandLogo = {
    full: `/images/logos/full_logo_trans.png?v=${assetVersion}`,
    fullWhite: `/images/logos/full_logo_white.png?v=${assetVersion}`,
    mark: `/images/logos/favicon.png?v=${assetVersion}`,
    og: `/images/logos/full_logo_trans.png?v=${assetVersion}`,
};

export function BrandMark({ className = 'h-10 w-10', alt = 'SharePlattr' }) {
    return (
        <img
            src={brandLogo.mark}
            alt={alt}
            className={`${className} object-contain`}
            loading="eager"
            decoding="async"
        />
    );
}

export default function BrandLogo({ variant = 'full', className = 'h-9 w-auto max-w-full', alt = 'SharePlattr' }) {
    const src = variant === 'white' ? brandLogo.fullWhite : brandLogo.full;

    return (
        <img
            src={src}
            alt={alt}
            className={`${className} object-contain`}
            loading="eager"
            decoding="async"
        />
    );
}
