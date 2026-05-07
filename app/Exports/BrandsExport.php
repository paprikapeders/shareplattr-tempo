<?php

namespace App\Exports;

use App\Imports\BrandCampaignImport;
use App\Models\Brand;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;

class BrandsExport implements FromArray, WithHeadings
{
    public function headings(): array
    {
        return BrandCampaignImport::COLUMNS;
    }

    public function array(): array
    {
        return Brand::query()
            ->orderBy('name')
            ->get()
            ->map(fn (Brand $brand) => [
                $brand->import_metadata['#'] ?? $brand->id,
                $brand->name,
                $brand->domain,
                $brand->affiliate_url,
                $brand->logo_url,
                $brand->country_region,
                $brand->business_type,
                $brand->import_metadata['Commission'] ?? null,
                $brand->import_metadata['Cookie Duration'] ?? null,
                $brand->import_metadata['Network / Platform'] ?? null,
                $brand->contact_info,
                $brand->notes,
            ])
            ->all();
    }
}
