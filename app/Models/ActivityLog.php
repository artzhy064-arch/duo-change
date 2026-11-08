<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    protected $fillable = ['user_id', 'document_id', 'action', 'details'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // короткий помощник: ActivityLog::add('doc.revert', $doc, 'v5')
    public static function add(string $action, ?Doc $doc = null, ?string $details = null): void
    {
        self::create([
            'user_id' => auth()->id(),
            'document_id' => $doc?->id,
            'action' => $action,
            'details' => $details,
        ]);
    }
}
