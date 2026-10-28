<?php
namespace App\Http\Controllers;
use App\Models\Doc;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DocController extends Controller {
    public function index(Request $request) {
        $documents = $request->user()->docs()->latest()->get();
        return Inertia::render('myDoc', ['documents' => $documents]);
    }
    public function store(Request $request) {
        $request->validate(['title' => 'required|string|max:255']);
        $request->user()->docs()->create(['title' => $request->title]);
        return redirect()->route('Doc.index');
    }
    public function destroy(Request $request, $id) {
        $request->user()->findOrFail($id)->delete();
        return redirect()->route('Doc.index');
    }
}