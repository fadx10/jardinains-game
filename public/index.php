<?php
/**
 * Jardinains! 1000 Level Arcade - Direct PHP Entry
 */
header('Content-Type: text/html; charset=UTF-8');
header('Cache-Control: no-cache, no-store, must-revalidate');

$indexPath = __DIR__ . '/index.html';
if (file_exists($indexPath)) {
    readfile($indexPath);
    exit;
}
?>
