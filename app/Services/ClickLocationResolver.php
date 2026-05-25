<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Throwable;

class ClickLocationResolver
{
    public function resolve(?string $ipAddress): array
    {
        if (! $this->canLookup($ipAddress)) {
            return $this->unknown();
        }

        $endpoint = config('services.geoip.endpoint');

        if (blank($endpoint)) {
            return $this->unknown();
        }

        try {
            $response = Http::timeout((float) config('services.geoip.timeout', 0.5))
                ->acceptJson()
                ->get(str_replace('{ip}', urlencode($ipAddress), $endpoint));

            if (! $response->ok()) {
                return $this->unknown();
            }

            return $this->fromProviderData($response->json() ?? []);
        } catch (Throwable) {
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
}
