<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class UserController
{
    public function store(Request $request): JsonResponse
    {
        $this->ensureCoo($request);
        $data = $this->validateUser($request);
        $user = User::create([
            ...$data,
            'name' => $this->nameFromEmail($data['email']),
            'email_verified_at' => now(),
        ]);

        return response()->json(['user' => $this->serialize($user)], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $this->ensureCoo($request);
        $data = $this->validateUser($request, $user);
        $willRemoveActiveCoo = $user->role === UserRole::COO
            && $user->active
            && ($data['role'] !== UserRole::COO->value || ! $data['active']);

        if ($willRemoveActiveCoo && ! $this->hasAnotherActiveCoo($user)) {
            throw ValidationException::withMessages(['role' => 'COO aktif terakhir tidak dapat dinonaktifkan atau diganti role.']);
        }

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $user->update([...$data, 'name' => $this->nameFromEmail($data['email'])]);

        return response()->json(['user' => $this->serialize($user->fresh())]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        $this->ensureCoo($request);

        if ($request->user()->is($user)) {
            throw ValidationException::withMessages(['user' => 'Akun yang sedang digunakan tidak dapat dihapus.']);
        }

        if ($user->role === UserRole::COO && $user->active && ! $this->hasAnotherActiveCoo($user)) {
            throw ValidationException::withMessages(['user' => 'COO aktif terakhir tidak dapat dihapus.']);
        }

        $user->delete();

        return response()->json(['deleted' => true]);
    }

    private function validateUser(Request $request, ?User $user = null): array
    {
        return $request->validate([
            'email' => [
                'required',
                'email',
                'regex:/^[a-z0-9][a-z0-9._%+\-]*@gmail\.com$/i',
                Rule::unique('users', 'email')->ignore($user?->id),
            ],
            'password' => [$user ? 'nullable' : 'required', 'string', 'min:8'],
            'role' => ['required', Rule::enum(UserRole::class)],
            'active' => ['required', 'boolean'],
        ]);
    }

    private function ensureCoo(Request $request): void
    {
        abort_unless($request->user()?->role === UserRole::COO, 403);
    }

    private function hasAnotherActiveCoo(User $user): bool
    {
        return User::query()->whereKeyNot($user->id)->where('role', UserRole::COO->value)->where('active', true)->exists();
    }

    private function nameFromEmail(string $email): string
    {
        return str($email)->before('@')->replace(['.', '_', '-'], ' ')->title()->toString();
    }

    private function serialize(User $user): array
    {
        return [
            'id' => $user->id,
            'email' => $user->email,
            'role' => $user->role->value,
            'active' => $user->active,
        ];
    }
}
