<?php
    ini_set("error_reporting","E_ALL & ~E_NOTICE"); 
    require_once('../controller/connect.php');

    $id = $_GET['id'];
    $url = $_GET['url'];
    $action = $_GET['action'];

    if($action == 'local'){
        require_once('class.geticon.php');
        $icon = new geticon($url,"","icons/");
        //$icon_url = $icon->getIco();
        $icon_url = $icon->getIcoUrl();

        echo $icon_url;
    }else{
        if($url == ''){
            $url = 'icons/default.ico';
        };
        mysql_query("UPDATE gd_link set is_catch='1',icon='$url',catch_time=now() where id='$id'");
        $callback=$_GET['callback'];
        echo $callback."({'result':'".$url."'})";
    }

    mysql_close($con);
?>