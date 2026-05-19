export default function LegalAgreementText({ className = '' }) {
    return (
        <p className={`text-sm leading-6 text-slate-700 ${className}`}>
            By creating an account, you agree to our{' '}
            <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-teal-700 underline underline-offset-2 hover:text-teal-900"
            >
                Terms of Service
            </a>{' '}
            and{' '}
            <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-teal-700 underline underline-offset-2 hover:text-teal-900"
            >
                Privacy Policy
            </a>
            .
        </p>
    );
}
