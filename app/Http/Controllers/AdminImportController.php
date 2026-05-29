<?php

namespace App\Http\Controllers;

use App\Exports\BrandCampaignsExport;
use App\Exports\BrandCampaignTemplateExport;
use App\Exports\BrandsExport;
use App\Exports\CampaignsExport;
use App\Imports\BrandCampaignImport;
use App\Models\ImportBatch;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\File as LocalFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use RuntimeException;
use ZipArchive;

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
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv,txt,zip', 'max:51200'],
            'continue_duplicate' => ['nullable', 'boolean'],
        ]);

        $file = $validated['file'];
        $tempDirectory = null;

        try {
            $importSource = $this->prepareImportSource($file);
            $tempDirectory = $importSource['temp_directory'];
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

            $import = new BrandCampaignImport($batch, $request->user()->id, $importSource['banner_resolver']);

            Excel::import($import, $importSource['spreadsheet']);

            $message = $this->summaryMessage($import->summary);

            return redirect()
                ->route('admin.imports.index')
                ->with('success', $message)
                ->with('import_summary', $import->summary);
        } finally {
            if ($tempDirectory && File::isDirectory($tempDirectory)) {
                File::deleteDirectory($tempDirectory);
            }
        }
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

    private function prepareImportSource($file): array
    {
        if (strtolower($file->getClientOriginalExtension()) !== 'zip') {
            return [
                'spreadsheet' => $file,
                'banner_resolver' => null,
                'temp_directory' => null,
            ];
        }

        $tempDirectory = storage_path('app/temp/imports/'.Str::uuid());
        File::ensureDirectoryExists($tempDirectory);

        try {
            $zip = new ZipArchive();

            if ($zip->open($file->getRealPath()) !== true) {
                throw ValidationException::withMessages([
                    'file' => 'The uploaded ZIP file could not be opened.',
                ]);
            }

            try {
                $spreadsheetEntry = $this->selectSpreadsheetEntry($zip);

                for ($index = 0; $index < $zip->numFiles; $index++) {
                    $entryName = $zip->getNameIndex($index);
                    $safePath = $this->safeZipPath($entryName);

                    if (! $safePath || str_ends_with($safePath, '/')) {
                        continue;
                    }

                    if ($safePath !== $spreadsheetEntry && ! Str::startsWith($safePath, 'images/')) {
                        continue;
                    }

                    $target = $tempDirectory.DIRECTORY_SEPARATOR.str_replace('/', DIRECTORY_SEPARATOR, $safePath);
                    File::ensureDirectoryExists(dirname($target));

                    $stream = $zip->getStream($entryName);

                    if (! $stream) {
                        throw ValidationException::withMessages([
                            'file' => 'A file inside the ZIP could not be read: '.$safePath,
                        ]);
                    }

                    file_put_contents($target, stream_get_contents($stream));
                    fclose($stream);
                }
            } finally {
                $zip->close();
            }

            return [
                'spreadsheet' => $tempDirectory.DIRECTORY_SEPARATOR.str_replace('/', DIRECTORY_SEPARATOR, $spreadsheetEntry),
                'banner_resolver' => fn (?string $filename): array => $this->storeZipBanner($tempDirectory, $filename),
                'temp_directory' => $tempDirectory,
            ];
        } catch (\Throwable $exception) {
            File::deleteDirectory($tempDirectory);

            throw $exception;
        }
    }

    private function selectSpreadsheetEntry(ZipArchive $zip): string
    {
        $spreadsheets = [];

        for ($index = 0; $index < $zip->numFiles; $index++) {
            $safePath = $this->safeZipPath($zip->getNameIndex($index));

            if (! $safePath || str_ends_with($safePath, '/')) {
                continue;
            }

            if (in_array(strtolower(pathinfo($safePath, PATHINFO_EXTENSION)), ['xlsx', 'xls', 'csv'], true)) {
                $spreadsheets[] = $safePath;
            }
        }

        if (count($spreadsheets) === 0) {
            throw ValidationException::withMessages([
                'file' => 'The ZIP file must contain one Excel or CSV spreadsheet.',
            ]);
        }

        $rootSpreadsheets = array_values(array_filter(
            $spreadsheets,
            fn (string $path) => ! str_contains($path, '/'),
        ));

        if (count($rootSpreadsheets) === 1) {
            return $rootSpreadsheets[0];
        }

        if (count($spreadsheets) === 1) {
            return $spreadsheets[0];
        }

        throw ValidationException::withMessages([
            'file' => 'The ZIP file contains multiple spreadsheets. Place exactly one spreadsheet in the ZIP root.',
        ]);
    }

    private function safeZipPath(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        $path = ltrim(str_replace('\\', '/', $path), '/');
        $parts = array_filter(explode('/', $path), fn (string $part) => $part !== '');

        foreach ($parts as $part) {
            if ($part === '..' || str_contains($part, ':')) {
                return null;
            }
        }

        return implode('/', $parts);
    }

    private function storeZipBanner(string $tempDirectory, ?string $filename): array
    {
        $safePath = $this->safeZipPath($filename);

        if (! $safePath || ! Str::startsWith($safePath, 'images/')) {
            return [
                'status' => 'invalid',
                'message' => 'Banner images must be referenced from the images/ folder.',
            ];
        }

        $fullPath = $tempDirectory.DIRECTORY_SEPARATOR.str_replace('/', DIRECTORY_SEPARATOR, $safePath);

        if (! File::isFile($fullPath)) {
            return [
                'status' => 'missing',
                'message' => 'Banner image was not found in the ZIP.',
            ];
        }

        $extension = strtolower(pathinfo($safePath, PATHINFO_EXTENSION));
        $allowedMimeTypes = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'webp' => 'image/webp',
        ];
        $mimeType = File::mimeType($fullPath);

        if (! isset($allowedMimeTypes[$extension])
            || $mimeType !== $allowedMimeTypes[$extension]
            || @getimagesize($fullPath) === false
        ) {
            return [
                'status' => 'invalid',
                'message' => 'Banner image must be a real JPG, PNG, or WEBP file.',
            ];
        }

        if (File::size($fullPath) > 5 * 1024 * 1024) {
            return [
                'status' => 'invalid',
                'message' => 'Banner image exceeds the 5MB limit.',
            ];
        }

        $storedPath = Storage::disk('public')->putFileAs(
            'campaign-banners',
            new LocalFile($fullPath),
            Str::uuid().'.'.$extension,
        );

        if (! $storedPath) {
            throw new RuntimeException('Campaign banner upload failed.');
        }

        return [
            'status' => 'stored',
            'path' => $storedPath,
        ];
    }

    private function summaryMessage(array $summary): string
    {
        $message = 'Import finished: '
            .$summary['brands_created'].' brands created, '
            .$summary['brands_updated'].' brands updated, '
            .$summary['campaigns_created'].' campaigns created, '
            .$summary['campaigns_updated'].' campaigns updated, '
            .$summary['skipped'].' rows skipped.';

        if (count($summary['failed_rows']) > 0) {
            $message .= ' '.count($summary['failed_rows']).' rows failed.';
        }

        if (($summary['banners_stored'] ?? 0) > 0
            || ($summary['missing_banner_images'] ?? 0) > 0
            || ($summary['invalid_banner_images'] ?? 0) > 0
            || ($summary['skipped_banner_replacements'] ?? 0) > 0) {
            $message .= ' '
                .($summary['banners_stored'] ?? 0).' banners stored, '
                .($summary['missing_banner_images'] ?? 0).' banner images missing, '
                .($summary['invalid_banner_images'] ?? 0).' invalid banner images.';
        }

        return $message;
    }
}
