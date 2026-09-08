<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Cycle;
use App\Models\Feedback;
use App\Models\Task;
use Illuminate\Database\Seeder;

class OperationalDataSeeder extends Seeder
{
    public function run(): void
    {
        $clients = [
            ['id' => 'fullbright', 'name' => 'Fullbright', 'contract' => '3-Month Retainer', 'bottleneck' => 'Menunggu approval client untuk routing domain baru'],
            ['id' => 'shaundju', 'name' => 'Shaundju Academy', 'contract' => '2-Month Retainer', 'bottleneck' => 'Copy hero section masih revisi'],
            ['id' => 'gumpreneur', 'name' => 'Gumpreneur', 'contract' => '1-Month Retainer', 'bottleneck' => 'Menunggu keputusan pricing final'],
            ['id' => 'gorden', 'name' => 'Gorden Wallpaper Solo', 'contract' => 'Project-Based', 'bottleneck' => 'Setup domain dan tracking pixel'],
            ['id' => 'menjangan', 'name' => 'Menjangan Island Trip', 'contract' => '3-Month Retainer', 'bottleneck' => 'Compile laporan performa bulan ini'],
        ];
        foreach ($clients as $client) Client::updateOrCreate(['id' => $client['id']], $client);

        $tasks = [
            ['id' => 'task-1', 'client_id' => 'fullbright', 'name' => 'Fix Cloudflare routing', 'status' => 'qa', 'pic' => 'developer', 'due' => '2026-09-10', 'cycle' => 2, 'revision' => 0, 'priority' => 'normal', 'type' => 'feature', 'brief' => 'Perbaiki konfigurasi routing dan cache setelah deploy.', 'blocked' => false],
            ['id' => 'task-2', 'client_id' => 'shaundju', 'name' => 'Revisi hero copy round 2', 'status' => 'review', 'pic' => 'digital-marketer', 'due' => '2026-09-09', 'cycle' => 1, 'revision' => 2, 'priority' => 'urgent', 'type' => 'feature', 'brief' => 'Perkuat headline berbasis hasil.', 'blocked' => false],
            ['id' => 'task-3', 'client_id' => 'gumpreneur', 'name' => 'Approval pricing section', 'status' => 'review', 'pic' => 'coo', 'due' => '2026-09-08', 'cycle' => 3, 'revision' => 3, 'priority' => 'urgent', 'type' => 'feature', 'brief' => 'Menunggu sign-off struktur pricing.', 'blocked' => true],
            ['id' => 'task-4', 'client_id' => 'gorden', 'name' => 'Setup domain & tracking pixel', 'status' => 'intake', 'pic' => 'developer', 'due' => '2026-09-12', 'cycle' => 1, 'revision' => 0, 'priority' => 'normal', 'type' => 'feature', 'brief' => 'Pasang domain dan tracking pixel.', 'blocked' => false],
        ];
        foreach ($tasks as $task) Task::updateOrCreate(['id' => $task['id']], $task);

        $cycle = Cycle::updateOrCreate(['id' => 'cycle-fullbright-1'], ['client_id' => 'fullbright', 'cycle' => 1, 'periode' => '1–31 Agu 2026', 'update_date' => '2026-08-31', 'status' => 'Improving', 'layer' => 'Hero Section', 'bottleneck' => '', 'primary_metric' => 'Lead Rate', 'hypothesis' => 'Headline spesifik meningkatkan lead rate.', 'optimization' => 'Uji headline benefit-driven.']);
        if ($cycle->variants()->count() === 0) {
            $cycle->variants()->createMany([
                ['id' => 'variant-fullbright-control', 'label' => 'Control', 'is_control' => true, 'target_visit' => 2500, 'real_visit' => 2410, 'bounce_rate' => 52, 'lead_rate' => 3.2, 'intent_rate' => 8.1],
                ['id' => 'variant-fullbright-a', 'label' => 'Varian A', 'is_control' => false, 'target_visit' => 2500, 'real_visit' => 2510, 'bounce_rate' => 45, 'lead_rate' => 4.5, 'intent_rate' => 10.2],
            ]);
        }

        Feedback::updateOrCreate(['id' => 'feedback-fullbright-1'], ['client_id' => 'fullbright', 'date' => '2026-08-26', 'phase' => 90, 'from' => 'COO', 'from_type' => 'owner', 'topic' => 'Final review sebelum production', 'details' => 'Periksa kembali loading speed dan seluruh CTA sebelum production.', 'priority' => 1, 'action' => '']);
    }
}
