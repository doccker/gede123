<?php
    ini_set("error_reporting","E_ALL & ~E_NOTICE");
    require_once('../controller/connect.php');

    require_once('FaviconDownloader.php');
    use Vincepare\FaviconDownloader\FaviconDownloader;

    //获取待更新icon的数据
    $dataList = getDataList ();

    foreach ($dataList as $obj) {
        $favicon = new FaviconDownloader($obj["url"]);

        $iconUrl = 'icons/default.ico';
        if ($favicon->icoExists && !empty($favicon->icoUrl)) {
            $iconUrl = $favicon->icoUrl;
        };

        updateIcon($obj["id"],$iconUrl);
    };

    function getDataList (){
        $query = mysql_query("SELECT * FROM gd_link WHERE STATUS = 0 AND url IS NOT NULL AND id >( SELECT MAX(id) FROM gd_link WHERE is_catch = 1) ORDER BY id;");
        $array =  array();
        while($row = mysql_fetch_array($query,MYSQL_ASSOC)){
            $array[] =  $row;
        };

        return $array;
    };

    function updateIcon($id,$iconUrl){
        if($iconUrl == ''){
            $iconUrl = 'icons/default.ico';
        };
        mysql_query("UPDATE gd_link set is_catch='1',icon='$iconUrl',catch_time=now() where id='$id'");
    };
?>