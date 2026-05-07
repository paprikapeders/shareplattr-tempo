<?php

namespace App\Exports;

use App\Imports\BrandCampaignImport;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithTitle;

class BrandCampaignTemplateExport implements WithMultipleSheets
{
    public function sheets(): array
    {
        return [
            new ArraySheet('Template', [
                BrandCampaignImport::COLUMNS,
                [
                    '1',
                    'Example Travel Co',
                    'example.com',
                    'https://example.com/affiliates',
                    'https://example.com/favicon.ico',
                    'Global',
                    'Travel - Hotels',
                    'Up to 5% per booking',
                    '30 days',
                    'Direct / Impact',
                    'affiliates@example.com',
                    'Add approval notes, payout details, requirements, or participant instructions here.',
                ],
            ]),
            new ArraySheet('Validation Notes', [
                ['Column', 'Requirement'],
                ['Business Brand', 'Required. Used to create or update the brand.'],
                ['Affiliate / Promo Page URL', 'Required URL. Used as the campaign destination URL.'],
                ['Domain', 'Optional brand domain.'],
                ['Logo / Favicon URL', 'Optional external logo URL. Stored safely as a URL.'],
                ['Commission', 'Optional text. First currency amount is used as MVP reward amount when available; otherwise $1.00 is used.'],
                ['Duplicate handling', 'Brand name updates a brand. Campaign title plus brand updates a campaign.'],
            ]),
        ];
    }
}

class ArraySheet implements FromArray, WithTitle
{
    public function __construct(private readonly string $title, private readonly array $rows)
    {
    }

    public function array(): array
    {
        return $this->rows;
    }

    public function title(): string
    {
        return $this->title;
    }
}
