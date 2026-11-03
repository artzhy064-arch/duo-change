<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Doc extends Model
{
    protected $table = 'documents';

    protected $fillable =  [
        'title',
        'visibility'
    ];
    public function owner() {
        return $this->belongsTo(User::class, 'owner_id');
    }
    public function sharedUsers() {
        return $this->belongsToMany(User::class, 'document_permissions', 'document_id', 'user_id')->withPivot('role');
    }
    public function roleFor(User $user) {
        if ((int) $this->owner_id === (int) $user->id) {
            return 'owner';
        }
        $shared = $this->sharedUsers()->where('user_id', $user->id)->first();
        return $shared?->pivot->role;
    }
    public function operations() {
        return $this->hasMany(Operation::class, 'document_id');
    }
}
