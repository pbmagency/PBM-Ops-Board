<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Http\Requests\UserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class UserController
{
    public function store(UserRequest $request): RedirectResponse
    {
        Gate::authorize('manage-users');
        User::create([...$request->validated(), 'email_verified_at' => now()]);

        return back()->with('success', 'User berhasil ditambahkan.');
    }

    public function update(UserRequest $request, User $user): RedirectResponse
    {
        Gate::authorize('manage-users');
        $data = $request->validated();
        $removesLastCoo = $user->role === UserRole::COO
            && $user->active
            && ($data['role'] !== UserRole::COO->value || ! $data['active']);
        if ($removesLastCoo && ! $this->hasAnotherActiveCoo($user)) {
            throw ValidationException::withMessages(['role' => 'COO aktif terakhir tidak dapat dinonaktifkan atau diganti role.']);
        }
        if (empty($data['password'])) {
            unset($data['password']);
        }
        $user->update($data);

        return back()->with('success', 'User dan role berhasil diperbarui.');
    }

    public function destroy(User $user): RedirectResponse
    {
        Gate::authorize('manage-users');
        if (request()->user()->is($user)) {
            throw ValidationException::withMessages(['user' => 'Akun yang sedang digunakan tidak dapat dihapus.']);
        }
        if ($user->role === UserRole::COO && $user->active && ! $this->hasAnotherActiveCoo($user)) {
            throw ValidationException::withMessages(['user' => 'COO aktif terakhir tidak dapat dihapus.']);
        }
        $user->delete();

        return back()->with('success', 'User berhasil dihapus.');
    }

    private function hasAnotherActiveCoo(User $user): bool
    {
        return User::query()->whereKeyNot($user->id)->where('role', UserRole::COO->value)->where('active', true)->exists();
    }
}
