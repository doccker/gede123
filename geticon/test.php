<?php
    require 'FaviconDownloader.php';
    use Vincepare\FaviconDownloader\FaviconDownloader;

    // Find & download favicon
    $favicon = new FaviconDownloader('https://www.aliyun.com/');

    if (!$favicon->icoExists) {
        echo "No favicon for ".$favicon->url;
        die(1);
    }

    echo "Favicon found : ".$favicon->icoUrl."\n";
?>