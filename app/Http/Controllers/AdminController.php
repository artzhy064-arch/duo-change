<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Doc;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminController extends Controller
{
    // пускаем только администраторов
    private function guard(Request $request): void
    {
        abort_unless($request->user()->is_admin, 403);
    }

    public function index(Request $request)
    {
        $this->guard($request);

        $users = User::all()->map(fn (User $u) => [
            'id' => $u->id,
            'name' => $u->name,
            'email' => $u->email,
            'is_admin' => $u->is_admin,
            'storage_quota_kb' => $u->storage_quota_kb,
            // сколько занимают тексты документов этого владельца
            'used_kb' => (int) ceil(Doc::where('owner_id', $u->id)->sum(DB::raw('length(content)')) / 1024),
        ]);

        $logs = ActivityLog::with('user:id,name')->latest('id')->limit(100)->get();

        return Inertia::render('admin', ['users' => $users, 'logs' => $logs]);
    }

    public function quota(Request $request, User $user)
    {
        $this->guard($request);
        $data = $request->validate(['storage_quota_kb' => 'required|integer|min:0|max:1048576']);

        $user->forceFill($data)->save();
        ActivityLog::add('admin.quota', null, $user->email . ' -> ' . $data['storage_quota_kb'] . ' КБ');

        return back();
    }
}