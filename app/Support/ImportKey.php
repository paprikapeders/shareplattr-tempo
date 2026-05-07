<?php

namespace App\Support;

class ImportKey
{
    public static function normalize(?string $value): string
    {
        return strtolower(preg_replace('/\s+/', ' ', trim((string) $value)));
    }
}
