<?php

namespace App\Exports;

use App\Imports\BrandCampaignImport;
use App\Models\Campaign;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;

class CampaignsExport implements FromArray, WithHeadings
{
    public function headings(): array
    {
        return BrandCampaignImport::COLUMNS;
    }

    public function array(): array
    {
        return Campaign::query()
            ->with('brand')
            ->orderBy('title')
            ->get()
            ->map(fn (Campaign $campaign) => [
                $campaign->import_metadata['#'] ?? $campaign->id,
                $campaign->brand?->name ?? $campaign->brand_name,
                $campaign->brand?->domain,
                $campaign->destination_url,
                $campaign->brand?->logo_url,
                $campaign->brand?->country_region,
                $campaign->category,
                $campaign->commission_details,
                $campaign->cookie_duration,
                $campaign->network_platform,
                $campaign->brand?->contact_info,
                $campaign->participant_instructions ?? $campaign->description,
            ])
            ->all();
    }
}
