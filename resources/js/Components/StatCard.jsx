import Card from './Card';
import ConversionLabel from './ConversionLabel';

export default function StatCard({ label, value, tone = 'slate' }) {
    const tones = {
        slate: 'from-slate-900 to-slate-700',
        cyan: 'from-cyan-500 to-blue-500',
        emerald: 'from-emerald-500 to-teal-500',
    };

    return (
        <Card className="relative overflow-hidden">
            <div className={`absolute right-5 top-5 h-9 w-9 rounded-full bg-gradient-to-br opacity-15 ${tones[tone] ?? tones.slate}`} />
            <div className={`absolute right-8 top-8 h-2.5 w-2.5 rounded-full bg-gradient-to-br ${tones[tone] ?? tones.slate}`} />
            <p className="text-sm font-medium text-slate-500">
                {label === 'Conversions' || label === 'Total Conversions' ? <ConversionLabel>{label}</ConversionLabel> : label}
            </p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
        </Card>
    );
}
