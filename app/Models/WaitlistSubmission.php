<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['email', 'type', 'ip_address', 'source_page'])]
class WaitlistSubmission extends Model
{
}
