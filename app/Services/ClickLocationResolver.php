<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class ClickLocationResolver
{
    public function resolve(?string $ipAddress): array
    {
        if (! $this->canLookup($ipAddress)) {
            $this->debug('Referral GeoIP skipped for non-public IP', [
                'ip_address' => $ipAddress,
            ]);

            return $this->unknown();
        }

        $endpoint = config('services.geoip.endpoint');

        if (blank($endpoint)) {
            $this->debug('Referral GeoIP endpoint is not configured');

            return $this->unknown();
        }

        try {
            $response = Http::timeout((float) config('services.geoip.timeout', 0.5))
                ->acceptJson()
                ->get(str_replace('{ip}', urlencode($ipAddress), $endpoint));

            if (! $response->ok()) {
                $this->debug('Referral GeoIP lookup returned a non-success response', [
                    'ip_address' => $ipAddress,
                    'status' => $response->status(),
                ]);

                return $this->unknown();
            }

            return $this->fromProviderData($response->json() ?? []);
        } catch (Throwable $exception) {
            $this->debug('Referral GeoIP lookup failed', [
                'ip_address' => $ipAddress,
                'error' => $exception->getMessage(),
            ]);

            return $this->unknown();
        }
    }

    private function canLookup(?string $ipAddress): bool
    {
        if (blank($ipAddress)) {
            return false;
        }

        return filter_var(
            $ipAddress,
            FILTER_VALIDATE_IP,
            FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE,
        ) !== false;
    }

    private function fromProviderData(array $data): array
    {
        $country = $data['country'] ?? $data['country_name'] ?? null;
        $countryCode = $data['country_code'] ?? $data['countryCode'] ?? null;
        $region = $data['region'] ?? $data['regionName'] ?? $data['state'] ?? null;
        $city = $data['city'] ?? null;

        if (blank($country) && blank($countryCode) && blank($region) && blank($city)) {
            $this->debug('Referral GeoIP provider returned no location fields');

            return $this->unknown();
        }

        return [
            'country' => filled($country) ? str($country)->limit(255)->toString() : null,
            'country_code' => filled($countryCode) ? str($countryCode)->upper()->limit(2, '')->toString() : null,
            'region' => filled($region) ? str($region)->limit(255)->toString() : null,
            'city' => filled($city) ? str($city)->limit(255)->toString() : null,
        ];
    }

    private function unknown(): array
    {
        return [
            'country' => null,
            'country_code' => null,
            'region' => null,
            'city' => null,
        ];
    }

    private function debug(string $message, array $context = []): void
    {
        if (! config('services.geoip.debug_log')) {
            return;
        }

        Log::warning($message, $context);
    }
}
