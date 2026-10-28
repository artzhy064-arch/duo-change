<?php

namespace App\Policies;

use App\Models\Doc;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class DocPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Doc $doc): bool
    {
        return $doc->roleFor($user) !== null;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Doc $doc): bool
    {
        return in_array($doc->roleFor($user), ['owner', 'editor']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Doc $doc): bool
    {
        return $doc->roleFor($user) === 'owner';
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Doc $doc): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Doc $doc): bool
    {
        return false;
    }
    public function share(User $user, Doc $doc): bool
    {
        return $doc->roleFor($user) === 'owner';
    }
}
