import Tooltip from './Tooltip';

export const CONVERSION_HELP_TEXT = 'A conversion is a verified action from referred traffic, such as a purchase, signup, booking, or manually approved result.';

export default function ConversionLabel({ children = 'Conversions', className = '' }) {
    return (
        <span className={`inline-flex items-center gap-1.5 ${className}`}>
            <span>{children}</span>
            <Tooltip label={`${children} definition`}>
                {CONVERSION_HELP_TEXT}
            </Tooltip>
        </span>
    );
}
