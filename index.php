<?php
/**
 * Jardinains! 1000 Level Arcade
 * Universal Production Gateway for Shared Web Hosting (cPanel / Apache / LiteSpeed / Nginx)
 */

// Disable caching for the HTML document to ensure instant updates
header('Content-Type: text/html; charset=UTF-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
header('X-Content-Type-Options: nosniff');

$distPath = __DIR__ . '/dist/index.html';

if (file_exists($distPath)) {
    // Directly stream the single-file compiled production game
    readfile($distPath);
    exit;
}

// Fallback if dist hasn't been generated
if (file_exists(__DIR__ . '/index.html')) {
    readfile(__DIR__ . '/index.html');
    exit;
}

echo '<!DOCTYPE html><html><body style="background:#020617;color:#4ade80;font-family:sans-serif;text-align:center;padding:50px;"><h2>Loading Jardinains...</h2><p>Please ensure dist/index.html is compiled.</p></body></html>';
