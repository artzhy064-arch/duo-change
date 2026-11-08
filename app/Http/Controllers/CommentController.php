<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Doc;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use App\Models\ActivityLog;

class CommentController extends Controller
{
    // все ветки документа с ответами
    public function index(Doc $doc)
    {
        Gate::authorize('view', $doc);

        return Comment::where('document_id', $doc->id)
            ->whereNull('parent_id')
            ->with(['author:id,name', 'replies.author:id,name'])
            ->orderBy('id')
            ->get();
    }

    // новый комментарий к фрагменту или ответ в ветке
    public function store(Request $request, Doc $doc)
    {
        Gate::authorize('comment', $doc);

        $data = $request->validate([
            'body' => 'required|string|max:2000',
            'parent_id' => 'nullable|integer|exists:comments,id',
            'anchor_start' => 'nullable|integer|min:0',
            'anchor_end' => 'nullable|integer|min:0',
            'quote' => 'nullable|string|max:500',
        ]);

        // ответ можно дать только на корневой комментарий этого же документа
        if (! empty($data['parent_id'])) {
            $parent = Comment::where('document_id', $doc->id)
                ->whereNull('parent_id')
                ->findOrFail($data['parent_id']);
            $data['parent_id'] = $parent->id;
        }

        $comment = Comment::create($data + [
            'document_id' => $doc->id,
            'author_id' => $request->user()->id,
            'anchor_version' => $doc->version,
        ]);
        ActivityLog::add('comment.add', $doc);

        return $comment->load('author:id,name');
    }

    // Open/Reopened -> Resolved
    public function resolve(Doc $doc, Comment $comment)
    {
        Gate::authorize('resolve', $doc);
        abort_if($comment->document_id !== $doc->id || $comment->parent_id, 404);
        abort_if($comment->status === 'resolved', 422, 'Уже закрыт.');

        $comment->update(['status' => 'resolved', 'resolved_at' => now()]);
        ActivityLog::add('comment.resolve', $doc);
        return $comment;
    }

    // Resolved -> Reopened
    public function reopen(Doc $doc, Comment $comment)
    {
        Gate::authorize('resolve', $doc);
        abort_if($comment->document_id !== $doc->id || $comment->parent_id, 404);
        abort_if($comment->status !== 'resolved', 422, 'Сначала его нужно закрыть.');

        $comment->update(['status' => 'reopened', 'resolved_at' => null]);
        return $comment;
    }
}