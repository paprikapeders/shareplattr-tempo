<?php

namespace App\Http\Controllers;

use App\Exports\BrandCampaignsExport;
use App\Exports\BrandCampaignTemplateExport;
use App\Exports\BrandsExport;
use App\Exports\CampaignsExport;
use App\Imports\BrandCampaignImport;
use App\Models\ImportBatch;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class AdminImportController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Imports/Index', [
            'summary' => session('import_summary'),
            'duplicateImport' => session('duplicate_import'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,csv,txt', 'max:10240'],
            'continue_duplicate' => ['nullable', 'boolean'],
        ]);

        $file = $validated['file'];
        $fileHash = hash_file('sha256', $file->getRealPath());
        $existingBatch = ImportBatch::query()
            ->where('file_hash', $fileHash)
            ->latest('created_at')
            ->first();

        if ($existingBatch && ! $request->boolean('continue_duplicate')) {
            return redirect()
                ->route('admin.imports.index')
                ->with('error', 'This exact file was already imported on '.$existingBatch->created_at?->toDateTimeString().'. Continue anyway?')
                ->with('duplicate_import', [
                    'filename' => $existingBatch->filename,
                    'imported_at' => $existingBatch->created_at?->toDateTimeString(),
                ]);
        }

        $batch = ImportBatch::create([
            'filename' => $file->getClientOriginalName(),
            'file_hash' => $fileHash,
            'uploaded_by' => $request->user()->id,
            'created_at' => now(),
        ]);

        $import = new BrandCampaignImport($batch, $request->user()->id);

        Excel::import($import, $file);

        $message = 'Import finished: '
            .$import->summary['brands_created'].' brands created, '
            .$import->summary['brands_updated'].' brands updated, '
            .$import->summary['campaigns_created'].' campaigns created, '
            .$import->summary['campaigns_updated'].' campaigns updated, '
            .$import->summary['skipped'].' rows skipped.';

        if (count($import->summary['failed_rows']) > 0) {
            $message .= ' '.count($import->summary['failed_rows']).' rows failed.';
        }

        return redirect()
            ->route('admin.imports.index')
            ->with('success', $message)
            ->with('import_summary', $import->summary);
    }

    public function template()
    {
        return Excel::download(new BrandCampaignTemplateExport(), 'shareplattr-brand-campaign-template.xlsx');
    }

    public function exportBrands()
    {
        return Excel::download(new BrandsExport(), 'shareplattr-brands.xlsx');
    }

    public function exportCampaigns()
    {
        return Excel::download(new CampaignsExport(), 'shareplattr-campaigns.xlsx');
    }

    public function exportAll()
    {
        return Excel::download(new BrandCampaignsExport(), 'shareplattr-brands-campaigns.xlsx');
    }
}
