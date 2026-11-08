<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    protected $fillable = [
        'document_id', 'author_id', 'parent_id',
        'anchor_start', 'anchor_end', 'anchor_version', 'quote',
        'body', 'status', 'resolved_at',
    ];

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function replies()
    {
        return $this->hasMany(Comment::class, 'parent_id');
    }
}
