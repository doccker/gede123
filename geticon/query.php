<?php
    require_once('../controller/connect.php');

    $query = mysql_query("SELECT * FROM gd_link WHERE STATUS = 0 AND id >( SELECT MAX(id) FROM gd_link WHERE is_catch = 1) ORDER BY id;");
    $array =  array();
    while($row = mysql_fetch_array($query,MYSQL_ASSOC)){
        $array[] =  $row;
    }

    $callback=$_GET['callback'];
    echo $callback."(".json_encode($array).")";
?>