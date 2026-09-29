<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /** @var list<string> */
    private array $roles = ['coo', 'project-manager', 'cmo', 'marketing-manager', 'digital-marketer'];

    public function up(): void
    {
        DB::table('role_permissions')
            ->whereIn('role', $this->roles)
            ->get(['role', 'tabs'])
            ->each(function (object $permission): void {
                $tabs = json_decode($permission->tabs, true, flags: JSON_THROW_ON_ERROR);

                if (! in_array('ads', $tabs, true)) {
                    $kpiPosition = array_search('kpi', $tabs, true);
                    $insertAt = $kpiPosition === false ? 1 : $kpiPosition + 1;
                    array_splice($tabs, $insertAt, 0, ['ads']);

                    DB::table('role_permissions')
                        ->where('role', $permission->role)
                        ->update(['tabs' => json_encode($tabs, JSON_THROW_ON_ERROR)]);
                }
            });
    }

    public function down(): void
    {
        DB::table('role_permissions')
            ->get(['role', 'tabs'])
            ->each(function (object $permission): void {
                $tabs = array_values(array_filter(
                    json_decode($permission->tabs, true, flags: JSON_THROW_ON_ERROR),
                    fn (string $tab): bool => $tab !== 'ads',
                ));

                DB::table('role_permissions')
                    ->where('role', $permission->role)
                    ->update(['tabs' => json_encode($tabs, JSON_THROW_ON_ERROR)]);
            });
    }
};
