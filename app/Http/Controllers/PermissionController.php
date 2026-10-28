<?php

namespace App\Http\Controllers;
use App\Models\Doc;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    public function store(Request $request, Doc $doc) {
        Gate::authorize('share', $doc);
        $data = $request->validate([
            'email' => 'required|email|exists:users,email',
            'role' => 'required|in:viewer,editor,commenter',
        ]);
        $user = User::where('email', $data['email'])->firstOrFail();
        if ($user->id === $doc->owner_id) {
            return back()->withErrors(['email' => 'Cannot share with the owner.']);
        }
        $doc->sharedUsers()->syncWithoutDetaching([$user->id => ['role' => $data['role']]]);
        return back();
    }
    public function update(Request $request, Doc $doc, User $user) {
        Gate::authorize('share', $doc);
        $data = $request->validate([
            'role' => 'required|in:viewer,editor,commenter',
        ]);
        $doc->sharedUsers()->updateExistingPivot($user->id, ['role' => $data['role']]);
        return back();
    }
    public function destroy(Request $request, Doc $doc, User $user) {
        Gate::authorize('share', $doc);
        $doc->sharedUsers()->detach($user->id);
        return back();
    }
}
