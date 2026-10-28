<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Doc extends Model
{
    protected $table = 'documents';

    protected $fillable =  [
        'title',
        'content',
        'visibility'
    ];
    public function owner() {
        return $this->belongsTo(User::class, 'owner_id');
    }
    public function sharedUsers() {
        return $this->belongsToMany(User::class, 'document_permissions', 'document_id', 'user_id')->withPivot('role');
    }
}
