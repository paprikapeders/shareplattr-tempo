<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AdminBrandController extends Controller
{
    /**
     * Show all brands for admin management.
     */
    public function index(Request $request)
    {
        $search = trim((string) $request->query('search', ''));

        $brands = Brand::query()
            ->withCount('campaigns')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('business_type', 'like', "%{$search}%")
                        ->orWhere('website_url', 'like', "%{$search}%")
                        ->orWhere('status', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->get()
            ->map(fn (Brand $brand) => $this->brandPayload($brand));

        return Inertia::render('Admin/Brands/Index', [
            'brands' => $brands,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Show the brand creation form.
     */
    public function create()
    {
        return Inertia::render('Admin/Brands/Create', [
            'statuses' => $this->statuses(),
        ]);
    }

    /**
     * Store a newly created brand.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validatedBrand($request);
        $logoPath = $request->file('logo')?->store('brands/logos', 'public');

        Brand::create([
            ...$validated,
            'logo' => $logoPath,
        ]);

        return redirect()->route('admin.brands.index')->with('success', 'Brand created.');
    }

    /**
     * Show a single brand.
     */
    public function show(Brand $brand)
    {
        $brand->load(['campaigns' => fn ($query) => $query->latest()]);

        return Inertia::render('Admin/Brands/Show', [
            'brand' => $this->brandPayload($brand, includeCampaigns: true),
        ]);
    }

    /**
     * Show the brand edit form.
     */
    public function edit(Brand $brand)
    {
        return Inertia::render('Admin/Brands/Edit', [
            'brand' => $this->brandPayload($brand),
            'statuses' => $this->statuses(),
        ]);
    }

    /**
     * Update the given brand.
     */
    public function update(Request $request, Brand $brand): RedirectResponse
    {
        $validated = $this->validatedBrand($request, $brand);
        $logoPath = $brand->logo;

        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('brands/logos', 'public');

            if ($brand->logo) {
                Storage::disk('public')->delete($brand->logo);
            }
        }

        $brand->update([
            ...$validated,
            'logo' => $logoPath,
        ]);

        return redirect()->route('admin.brands.show', $brand)->with('success', 'Brand updated.');
    }

    /**
     * Delete or archive a brand.
     */
    public function destroy(Brand $brand): RedirectResponse
    {
        if ($brand->campaigns()->exists()) {
            $brand->update(['status' => 'inactive']);

            return redirect()->route('admin.brands.index')->with('success', 'Brand archived because it is linked to campaigns.');
        }

        if ($brand->logo) {
            Storage::disk('public')->delete($brand->logo);
        }

        $brand->delete();

        return redirect()->route('admin.brands.index')->with('success', 'Brand deleted.');
    }

    private function validatedBrand(Request $request, ?Brand $brand = null): array
    {
        return $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('brands', 'name')->ignore($brand?->id),
            ],
            'description' => ['nullable', 'string', 'max:2000'],
            'business_type' => ['nullable', 'string', 'max:255'],
            'country_region' => ['nullable', 'string', 'max:255'],
            'website_url' => ['nullable', 'url', 'max:2048'],
            'domain' => ['nullable', 'string', 'max:255'],
            'affiliate_url' => ['nullable', 'url', 'max:2048'],
            'logo_url' => ['nullable', 'url', 'max:2048'],
            'contact_info' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:4000'],
            'status' => ['required', Rule::in($this->statuses())],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
        ]);
    }

    private function statuses(): array
    {
        return ['active', 'inactive'];
    }

    private function brandPayload(Brand $brand, bool $includeCampaigns = false): array
    {
        $payload = [
            'id' => $brand->id,
            'name' => $brand->name,
            'logo_url' => $brand->logo ? Storage::disk('public')->url($brand->logo) : $brand->logo_url,
            'external_logo_url' => $brand->logo_url,
            'description' => $brand->description,
            'business_type' => $brand->business_type,
            'country_region' => $brand->country_region,
            'website_url' => $brand->website_url,
            'domain' => $brand->domain,
            'affiliate_url' => $brand->affiliate_url,
            'contact_info' => $brand->contact_info,
            'notes' => $brand->notes,
            'status' => $brand->status,
            'campaigns_count' => $brand->campaigns_count ?? $brand->campaigns()->count(),
            'created_at' => $brand->created_at->toDateTimeString(),
        ];

        if ($includeCampaigns) {
            $payload['campaigns'] = $brand->campaigns->map(fn ($campaign) => [
                'id' => $campaign->id,
                'title' => $campaign->title,
                'status' => $campaign->status,
                'reward_amount' => $campaign->reward_amount,
            ])->values();
        }

        return $payload;
    }
}
