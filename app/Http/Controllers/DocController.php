<?php
namespace App\Http\Controllers;
use App\Models\Doc;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;
use App\Events\DocEdited;

class DocController extends Controller {
    public function index(Request $request) {
        $user = $request->user();
        $documents = Doc::where('owner_id', $user->id)->orWhereHas('sharedUsers', fn ($q) => $q->where('user_id', $user->id))->latest()->get();
        return Inertia::render('myDoc', ['documents' => $documents]);
    }
    public function store(Request $request) {
        $request->validate(['title' => 'required|string|max:255']);
        $request->user()->docs()->create(['title' => $request->title]);
        return redirect()->route('Doc.index');
    }
    public function destroy(Request $request, Doc $doc) {
        Gate::authorize('delete', $doc);
        $doc->delete();
        return redirect()->route('Doc.index');
    }
    public function show(Request $request, Doc $doc) {
        Gate::authorize('view', $doc);
        $role = $doc->roleFor($request->user());
        return Inertia::render('doc', [
            'document' => $doc,
            'role' => $role,
            'shared' => $role === 'owner' ? $doc->sharedUsers->map(fn ($u) => [
                'id' => $u->id,
                'email' => $u->email,
                'role' => $u->pivot->role,
            ]) : [],
        ]);
    }
    public function update(Request $request, Doc $doc) {
        Gate::authorize('update', $doc);
        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|nullable|string'
        ]);
        $doc->update($data);
        return back();
    }
    public function edit(Request $request, Doc $doc) {
        Gate::authorize('update', $doc);
        $data = $request->validate([
            'content' => 'nullable|string',
            'clientId' => 'required|string',
        ]);
        event(new DocEdited($doc->id, $data['content'] ?? '', $data['clientId']));
        return response()->noContent();
    }
}