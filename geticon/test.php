<?php
    require 'FaviconDownloader.php';
    $url = 'https://github.com/moment/moment/blob/develop/moment.js';

    //----------------
    //require_once('class.geticon.php');
    //$icon = new geticon($url,"","icons/");
    //$icon_url = $icon->getIcoUrl();
    //echo $icon_url."\n";
    //-----------------

    use Vincepare\FaviconDownloader\FaviconDownloader;

    // Find & download favicon
    $favicon = new FaviconDownloader($url);

    if (!$favicon->icoExists) {
        echo "No favicon for ".$favicon->url;
        die(1);
    };

    echo "Favicon found : ".$favicon->icoUrl."\n";
?>