<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class AdminController extends Controller
{
    /**
     * Show the admin dashboard.
     */
    public function index()
    {
        return redirect()->route('admin.campaigns.index');
    }
}
