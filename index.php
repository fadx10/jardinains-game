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

/**
 * Streams the file content using multiple fallback methods
 * to bypass safe_mode/disable_functions restrictions in php.ini
 */
function stream_file_safely($path) {
    if (!file_exists($path)) {
        return false;
    }
    
    // Method 1: readfile (Standard & High Performance)
    if (function_exists('readfile')) {
        if (@readfile($path) !== false) {
            return true;
        }
    }
    
    // Method 2: file_get_contents (Common fallback)
    if (function_exists('file_get_contents')) {
        $content = @file_get_contents($path);
        if ($content !== false) {
            echo $content;
            return true;
        }
    }
    
    // Method 3: fopen / fpassthru
    if (function_exists('fopen')) {
        $handle = @fopen($path, 'r');
        if ($handle) {
            if (function_exists('fpassthru')) {
                $res = @fpassthru($handle);
                @fclose($handle);
                if ($res !== false) {
                    return true;
                }
            } else {
                while (!feof($handle)) {
                    echo @fread($handle, 8192);
                }
                @fclose($handle);
                return true;
            }
        }
    }
    
    // Method 4: include (Last resort)
    if (@include($path) !== false) {
        return true;
    }
    
    return false;
}

if (stream_file_safely($distPath)) {
    exit;
}

// System Warning if the production build is missing or cannot be read
echo '<!DOCTYPE html><html><body style="background:#020617;color:#4ade80;font-family:sans-serif;text-align:center;padding:50px;display:flex;flex-direction:column;align-items:center;justify-content:center;height:80vh;margin:0;">';
echo '<h2 style="color:#ef4444;font-size:2rem;margin-bottom:10px;font-family:sans-serif;">Jardinains! System Warning</h2>';
echo '<p style="color:#a7f3d0;font-size:1.1rem;max-width:500px;line-height:1.6;font-family:sans-serif;">The production build of the game (<code>dist/index.html</code>) is missing or cannot be read. Please build the application locally or on your hosting server.</p>';
echo '</body></html>';

