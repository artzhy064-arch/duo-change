<?php
namespace App\Http\Controllers;
use App\Models\Doc;
use Illuminate\Http\Request;
use Inertia\Inertia;

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
        return Inertia::render('doc', ['document' => $doc]);
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
}