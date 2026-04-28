export default function TablePagination({
    page,
    totalPages,
    totalItems,
    pageSize,
    onChange,
}) {
    const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

    return (
        <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>Showing {totalItems === 0 ? 0 : ((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalItems)} of {totalItems} entries</p>

            <div className="flex flex-wrap items-center gap-1">
                <button
                    type="button"
                    onClick={() => onChange(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="rounded-[8px] bg-slate-100 px-3 py-2 text-slate-500 disabled:opacity-50"
                >
                    Previous
                </button>

                {pages.map((pageNumber) => (
                    <button
                        key={pageNumber}
                        type="button"
                        onClick={() => onChange(pageNumber)}
                        className={`h-9 min-w-9 rounded-[8px] px-3 ${pageNumber === page ? 'bg-[#7567ef] text-white' : 'bg-slate-100 text-slate-500'}`}
                    >
                        {pageNumber}
                    </button>
                ))}

                <button
                    type="button"
                    onClick={() => onChange(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages || totalPages === 0}
                    className="rounded-[8px] bg-slate-100 px-3 py-2 text-slate-500 disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
