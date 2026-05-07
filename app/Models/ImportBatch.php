<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['filename', 'file_hash', 'uploaded_by', 'created_at'])]
class ImportBatch extends Model
{
    public const UPDATED_AT = null;

    public function rows()
    {
        return $this->hasMany(ImportBatchRow::class);
    }
}
