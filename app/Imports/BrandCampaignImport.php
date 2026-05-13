<?php

namespace App\Imports;

use App\Models\Brand;
use App\Models\Campaign;
use App\Models\ImportBatch;
use App\Models\ImportBatchRow;
use App\Support\ImportKey;
use App\Support\Taxonomy;
use Illuminate\Database\QueryException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Concerns\ToCollection;

class BrandCampaignImport implements ToCollection
{
    public const COLUMNS = [
        '#',
        'Business Brand',
        'Domain',
        'Affiliate / Promo Page URL',
        'Logo / Favicon URL',
        'Country / Region',
        'Industry',
        'Commission',
        'Cookie Duration',
        'Network / Platform',
        'Contact Email / Phone',
        'Notes',
    ];

    public array $summary = [
        'brands_created' => 0,
        'brands_updated' => 0,
        'campaigns_created' => 0,
        'campaigns_updated' => 0,
        'created' => 0,
        'updated' => 0,
        'skipped' => 0,
        'failed' => 0,
        'failed_rows' => [],
    ];

    public function __construct(
        private readonly ImportBatch $batch,
        private readonly ?int $adminId = null,
    ) {
    }

    public function collection(Collection $rows): void
    {
        $header = null;

        foreach ($rows as $index => $row) {
            $values = $row->map(fn ($value) => is_string($value) ? trim($value) : $value)->values()->all();

            if ($this->isEmpty($values)) {
                if ($header !== null) {
                    $this->summary['skipped']++;
                }

                continue;
            }

            if ($header === null) {
                $header = $this->normalizeHeader($values);
                continue;
            }

            $rowNumber = $index + 1;
            $data = $this->rowData($header, $values);

            if ($this->isEmpty(array_values($data))) {
                $this->summary['skipped']++;
                $this->logRow($rowNumber, hash('sha256', 'empty-'.$rowNumber), 'skipped', 'Fully empty row.');
                continue;
            }

            $validator = Validator::make($data, [
                'Business Brand' => ['required', 'string', 'max:255'],
                'Domain' => ['nullable', 'string', 'max:255'],
                'Affiliate / Promo Page URL' => ['required', 'url', 'max:2048'],
                'Logo / Favicon URL' => ['nullable', 'url', 'max:2048'],
                'Country / Region' => ['nullable', 'string', 'max:255'],
                'Industry' => ['nullable', 'string', 'max:255'],
                'Commission' => ['nullable', 'string', 'max:255'],
                'Cookie Duration' => ['nullable', 'string', 'max:255'],
                'Network / Platform' => ['nullable', 'string', 'max:255'],
                'Contact Email / Phone' => ['nullable', 'string', 'max:255'],
                'Notes' => ['nullable', 'string', 'max:4000'],
            ]);

            if ($validator->fails()) {
                $this->failRow($rowNumber, hash('sha256', json_encode($data)), $validator->errors()->all());
                continue;
            }

            $this->upsertRow($rowNumber, $validator->validated());
        }
    }

    private function upsertRow(int $rowNumber, array $data): void
    {
        $brandName = $data['Business Brand'];
        $normalizedBrandName = ImportKey::normalize($brandName);
        $title = $brandName.' Affiliate Program';
        $normalizedTitle = ImportKey::normalize($title);
        $rewardAmount = $this->rewardAmount($data['Commission'] ?? null);
        $rowHash = $this->rowHash($normalizedBrandName, $normalizedTitle, $data['Affiliate / Promo Page URL'], $rewardAmount);

        try {
            DB::transaction(function () use ($rowNumber, $data, $brandName, $normalizedBrandName, $title, $normalizedTitle, $rewardAmount, $rowHash) {
                $brand = Brand::query()->where('normalized_name', $normalizedBrandName)->first();
                $campaign = $brand
                    ? Campaign::query()
                        ->where('brand_id', $brand->id)
                        ->where('normalized_title', $normalizedTitle)
                        ->first()
                    : null;

                if ($this->isLoggedDuplicateWithoutChanges($rowHash, $brand, $campaign, $data)) {
                    $this->summary['skipped']++;
                    $this->logRow($rowNumber, $rowHash, 'skipped', 'Matching row was already imported and data is unchanged.');

                    return;
                }

                $brandPayload = $this->brandPayload($data, $normalizedBrandName);
                $brandWasExisting = (bool) $brand;
                $brand = $brand ?: Brand::firstOrNew(['normalized_name' => $normalizedBrandName]);
                $brand->fill($brandPayload);
                $brand = $this->saveWithUniqueRetry($brand, fn () => Brand::query()->where('normalized_name', $normalizedBrandName)->first());

                $campaignPayload = $this->campaignPayload($data, $brand, $title, $normalizedTitle, $rewardAmount);
                $campaignWasExisting = (bool) $campaign;
                $campaign = $campaign ?: Campaign::firstOrNew([
                    'brand_id' => $brand->id,
                    'normalized_title' => $normalizedTitle,
                ]);
                $campaign->fill($campaignPayload);
                $campaign = $this->saveWithUniqueRetry(
                    $campaign,
                    fn () => Campaign::query()
                        ->where('brand_id', $brand->id)
                        ->where('normalized_title', $normalizedTitle)
                        ->first(),
                );

                if ($brandWasExisting) {
                    $this->summary['brands_updated']++;
                } else {
                    $this->summary['brands_created']++;
                }

                if ($campaignWasExisting) {
                    $this->summary['campaigns_updated']++;
                } else {
                    $this->summary['campaigns_created']++;
                }

                $status = ($brandWasExisting || $campaignWasExisting) ? 'updated' : 'created';
                $this->summary[$status]++;
                $this->logRow($rowNumber, $rowHash, $status, ucfirst($status).' brand and campaign records.');
            });
        } catch (\Throwable $exception) {
            $this->failRow($rowNumber, $rowHash, [$exception->getMessage()]);
        }
    }

    private function saveWithUniqueRetry($model, callable $findExisting)
    {
        try {
            $model->save();

            return $model;
        } catch (QueryException $exception) {
            $existing = $findExisting();

            if (! $existing) {
                throw $exception;
            }

            $existing->fill($model->getAttributes());
            $existing->save();

            return $existing;
        }
    }

    private function isLoggedDuplicateWithoutChanges(string $rowHash, ?Brand $brand, ?Campaign $campaign, array $data): bool
    {
        if (! ImportBatchRow::query()->where('row_hash', $rowHash)->whereIn('status', ['created', 'updated', 'skipped'])->exists()) {
            return false;
        }

        return $brand
            && $campaign
            && ($brand->import_metadata ?? []) == $data
            && ($campaign->import_metadata ?? []) == $data;
    }

    private function brandPayload(array $data, string $normalizedBrandName): array
    {
        $domain = $data['Domain'] ?? null;

        return [
            'name' => $data['Business Brand'],
            'normalized_name' => $normalizedBrandName,
            'description' => $data['Notes'] ?? null,
            'business_type' => $data['Industry'] ?? null,
            'country_region' => $data['Country / Region'] ?? null,
            'website_url' => $this->domainUrl($domain),
            'domain' => $domain,
            'affiliate_url' => $data['Affiliate / Promo Page URL'],
            'logo_url' => $data['Logo / Favicon URL'] ?? null,
            'contact_info' => $data['Contact Email / Phone'] ?? null,
            'notes' => $data['Notes'] ?? null,
            'status' => 'active',
            'import_metadata' => $data,
        ];
    }

    private function campaignPayload(array $data, Brand $brand, string $title, string $normalizedTitle, int $rewardAmount): array
    {
        $industry = $data['Industry'] ?? null;
        $notes = $data['Notes'] ?? null;
        [$categoryKey, $categoryOther] = Taxonomy::campaignCategoryFromValue($industry ?: 'Affiliate');
        $category = Taxonomy::campaignCategoryLabel($categoryKey, $categoryOther) ?? ($industry ?: 'Affiliate');

        return [
            'created_by' => $this->adminId,
            'brand_id' => $brand->id,
            'brand_name' => $brand->name,
            'title' => $title,
            'normalized_title' => $normalizedTitle,
            'description' => $notes ?: $this->campaignDescription($brand->name, $data),
            'category' => $category,
            'category_key' => $categoryKey,
            'category_other' => $categoryOther,
            'reward_amount' => $rewardAmount,
            'commission_details' => $data['Commission'] ?? null,
            'cookie_duration' => $data['Cookie Duration'] ?? null,
            'network_platform' => $data['Network / Platform'] ?? null,
            'payout_details' => $data['Commission'] ?? null,
            'requirements' => $notes,
            'deliverables' => 'Share your referral link and drive qualified conversions.',
            'tags' => array_values(array_filter([$industry, $data['Country / Region'] ?? null, $data['Network / Platform'] ?? null])),
            'assets' => array_values(array_filter([$data['Logo / Favicon URL'] ?? null])),
            'participant_instructions' => $notes,
            'destination_url' => $data['Affiliate / Promo Page URL'],
            'status' => 'active',
            'import_metadata' => $data,
        ];
    }

    private function failRow(int $rowNumber, string $rowHash, array $errors): void
    {
        $this->summary['failed']++;
        $this->summary['failed_rows'][] = [
            'row' => $rowNumber,
            'errors' => $errors,
        ];

        $this->logRow($rowNumber, $rowHash, 'failed', implode(' ', $errors));
    }

    private function logRow(int $rowNumber, string $rowHash, string $status, ?string $message = null): void
    {
        ImportBatchRow::create([
            'import_batch_id' => $this->batch->id,
            'row_number' => $rowNumber,
            'row_hash' => $rowHash,
            'status' => $status,
            'message' => $message,
        ]);
    }

    private function normalizeHeader(array $values): array
    {
        return array_map(fn ($value) => trim((string) $value), $values);
    }

    private function rowData(array $header, array $values): array
    {
        $data = [];

        foreach ($header as $index => $column) {
            if (in_array($column, self::COLUMNS, true)) {
                $data[$column] = $values[$index] ?? null;
            }
        }

        foreach (self::COLUMNS as $column) {
            $data[$column] ??= null;
        }

        return $data;
    }

    private function isEmpty(array $values): bool
    {
        return collect($values)->every(fn ($value) => blank($value));
    }

    private function rowHash(string $normalizedBrandName, string $normalizedTitle, string $destinationUrl, int $rewardAmount): string
    {
        return hash('sha256', implode('|', [
            $normalizedBrandName,
            $normalizedTitle,
            trim($destinationUrl),
            (string) $rewardAmount,
        ]));
    }

    private function domainUrl(?string $domain): ?string
    {
        if (blank($domain)) {
            return null;
        }

        return Str::startsWith($domain, ['http://', 'https://']) ? $domain : 'https://'.$domain;
    }

    private function rewardAmount(?string $commission): int
    {
        if ($commission && preg_match('/(?:[$]|USD)\s?([0-9]+(?:\.[0-9]{1,2})?)/i', $commission, $matches)) {
            return (int) round(((float) $matches[1]) * 100);
        }

        return 100;
    }

    private function campaignDescription(string $brandName, array $data): string
    {
        $parts = array_filter([
            $brandName.' affiliate campaign.',
            $data['Commission'] ?? null,
            $data['Cookie Duration'] ? 'Cookie duration: '.$data['Cookie Duration'] : null,
        ]);

        return implode(' ', $parts);
    }
}
