<?php

return [
    'ops_board_secret' => env('OPS_BOARD_SECRET'),
    'feed_urls' => [
        'project-pbm' => env('FEED_URL_PROJECT_PBM', 'https://pbmagency.id/api/analytics/feed'),
        'lp-gorden' => env('FEED_URL_LP_GORDEN', 'https://toko.gordenwallpapersolo.com/api/analytics/feed'),
        'lp-menjangan' => env('FEED_URL_LP_MENJANGAN', 'https://menjangansnorkelingtripanddiving.com/api/analytics/feed'),
        'ecourse-ka-tsan' => env('FEED_URL_ECOURSE_KA_TSAN', 'https://gumpreneur.id/api/analytics/feed'),
        'project-fullbright' => env('FEED_URL_PROJECT_FULLBRIGHT', 'https://toefl.fullbrightindonesia.org/ops-analytics/feed'),
    ],
    'feed_origin_ips' => [
        'project-fullbright' => env('FEED_ORIGIN_IP_PROJECT_FULLBRIGHT', '127.0.0.1'),
    ],
];
