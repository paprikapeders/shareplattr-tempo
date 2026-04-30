<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\File;
use Inertia\Inertia;

class BusinessProfileController extends Controller
{
    public function edit(Request $request)
    {
        $profile = $request->user()->businessProfile;

        return Inertia::render('Business/Profile/Edit', [
            'profile' => $profile ? [
                'company_name' => $profile->company_name,
                'contact_person_name' => $profile->contact_person_name,
                'website_url' => $profile->website_url,
                'phone' => $profile->phone,
                'industry' => $profile->industry,
                'description' => $profile->description,
                'logo_url' => $profile->logo_path ? Storage::disk('public')->url($profile->logo_path) : null,
            ] : [
                'company_name' => '',
                'contact_person_name' => $request->user()->name,
                'website_url' => '',
                'phone' => '',
                'industry' => '',
                'description' => '',
                'logo_url' => null,
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'company_name' => ['required', 'string', 'max:255'],
            'contact_person_name' => ['required', 'string', 'max:255'],
            'website_url' => ['nullable', 'url', 'max:2048'],
            'phone' => ['nullable', 'string', 'max:50'],
            'industry' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'logo' => ['nullable', File::image()->max(2048)],
        ]);

        $profileData = collect($validated)->except('logo')->all();
        $user = $request->user();
        $profile = $user->businessProfile;
        $logoPath = $profile?->logo_path;

        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('business-logos', 'public');

            if ($profile?->logo_path) {
                Storage::disk('public')->delete($profile->logo_path);
            }
        }

        $brand = $this->brandForProfile($profile?->brand_id, $user->id, $profileData, $logoPath);

        $user->businessProfile()->updateOrCreate(
            ['user_id' => $user->id],
            [
                ...$profileData,
                'brand_id' => $brand->id,
                'logo_path' => $logoPath,
                'status' => 'active',
            ],
        );

        return redirect()->route('business.dashboard')->with('success', 'Business profile saved.');
    }

    private function brandForProfile(?int $brandId, int $userId, array $profile, ?string $logoPath): Brand
    {
        $brand = $brandId ? Brand::query()->find($brandId) : null;
        $brandName = $this->availableBrandName($profile['company_name'], $brand?->id, $userId);

        if (! $brand) {
            return Brand::create([
                'name' => $brandName,
                'logo' => $logoPath,
                'description' => $profile['description'] ?? null,
                'business_type' => $profile['industry'] ?? null,
                'website_url' => $profile['website_url'] ?? null,
                'status' => 'active',
            ]);
        }

        $brand->update([
            'name' => $brandName,
            'logo' => $logoPath,
            'description' => $profile['description'] ?? null,
            'business_type' => $profile['industry'] ?? null,
            'website_url' => $profile['website_url'] ?? null,
            'status' => 'active',
        ]);

        return $brand;
    }

    private function availableBrandName(string $companyName, ?int $ignoreBrandId, int $userId): string
    {
        $exists = Brand::query()
            ->where('name', $companyName)
            ->when($ignoreBrandId, fn ($query) => $query->where('id', '!=', $ignoreBrandId))
            ->exists();

        return $exists ? $companyName.' Owner '.$userId : $companyName;
    }
}
