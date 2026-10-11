<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', fn () => $this->comment('PBM Ops'));

Schedule::command('analytics:fetch-feeds')->everyFiveMinutes();
