<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Operation extends Model {
    protected $fillable = ['document_id', 'user_id', 'client_id', 'payload', 'version'];

    protected function casts(): array {
        return ['payload' => 'array'];
    }
}
