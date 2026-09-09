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

$candidatePaths = [
    __DIR__ . '/dist/index.html',
    __DIR__ . '/jardinains/dist/index.html',
    __DIR__ . '/jardinains/index.html',
    __DIR__ . '/index.html',
    __DIR__ . '/../dist/index.html',
    __DIR__ . '/../index.html'
];

$distPath = null;
$searchedDetails = [];

foreach ($candidatePaths as $path) {
    $exists = file_exists($path) && is_readable($path);
    if ($exists) {
        $content = @file_get_contents($path);
        if ($content !== false) {
            // Verify it is not the raw uncompiled development index.html (which contains src/main.tsx)
            $isDevTemplate = (strpos($content, 'src/main.tsx') !== false || strpos($content, 'src/main.ts') !== false);
            if (!$isDevTemplate) {
                $distPath = $path;
                break;
            } else {
                $searchedDetails[$path] = 'Found, but skipped because it is the uncompiled development template (contains raw TSX script)';
            }
        } else {
            $searchedDetails[$path] = 'Found, but file is unreadable (permission issue)';
        }
    } else {
        $searchedDetails[$path] = 'Not found';
    }
}

/**
 * Streams the file content using multiple fallback methods
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

// System Warning with dynamic diagnostics if the production build is missing or cannot be read
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Jardinains! System Diagnostic</title>
    <style>
        body {
            background-color: #020617;
            color: #f8fafc;
            font-family: 'Fredoka', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
        .container {
            max-width: 650px;
            width: 100%;
            background-color: #052e16;
            border: 2px solid #ef4444;
            border-radius: 16px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            text-align: center;
        }
        h2 {
            color: #fca5a5;
            font-size: 1.8rem;
            margin-top: 0;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        p {
            color: #6ee7b7;
            line-height: 1.6;
            margin-bottom: 25px;
            font-size: 1rem;
        }
        .path-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            text-align: left;
            font-family: monospace;
            font-size: 0.85rem;
        }
        .path-table th {
            background-color: #064e3b;
            color: #a7f3d0;
            padding: 10px;
            border: 1px solid #10b981;
        }
        .path-table td {
            padding: 10px;
            border: 1px solid #10b981;
            color: #ecfdf5;
            word-break: break-all;
        }
        .status-badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 0.75rem;
        }
        .status-not-found {
            background-color: #7f1d1d;
            color: #fca5a5;
        }
        .status-found {
            background-color: #14532d;
            color: #86efac;
        }
        .status-skipped {
            background-color: #78350f;
            color: #fde047;
        }
        .instructions {
            background-color: #064e3b;
            border-left: 4px solid #34d399;
            padding: 15px;
            border-radius: 8px;
            text-align: left;
            margin-top: 25px;
            font-size: 0.9rem;
        }
        .instructions h3 {
            margin-top: 0;
            color: #34d399;
            font-size: 1.05rem;
        }
        .instructions ol {
            margin: 0;
            padding-left: 20px;
            color: #ecfdf5;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Production Gateway Warning</h2>
        <p>No compiled production build could be located or read on the hosting server. Below are the paths that were searched:</p>
        
        <table class="path-table">
            <thead>
                <tr>
                    <th>Checked Path Location</th>
                    <th>Result / Status</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($searchedDetails as $searchedPath => $status): ?>
                    <tr>
                        <td><?php echo htmlspecialchars($searchedPath); ?></td>
                        <td>
                            <?php 
                            $badgeClass = 'status-not-found';
                            if (strpos($status, 'skipped') !== false) {
                                $badgeClass = 'status-skipped';
                            } elseif (strpos($status, 'Found') !== false) {
                                $badgeClass = 'status-found';
                            }
                            ?>
                            <span class="status-badge <?php echo $badgeClass; ?>">
                                <?php echo htmlspecialchars($status); ?>
                            </span>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>

        <div class="instructions">
            <h3>How to resolve this:</h3>
            <ol>
                <li>Make sure you run <strong><code>npm run build</code></strong> locally or in the compiler before pushing.</li>
                <li>Verify the <strong><code>dist</code></strong> folder is checked into your git repository and pushed to GitHub.</li>
                <li>If you are using Hostinger automatic deployment, make sure the destination folder matches your web root correctly.</li>
            </ol>
        </div>
    </div>
</body>
</html>
<?php

