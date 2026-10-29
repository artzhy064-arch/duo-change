<?php
use App\Models\Doc;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('document.{id}', function ($user, $id) {
    $doc = Doc::find($id);
    return $doc && $doc->roleFor($user) !== null;
});
