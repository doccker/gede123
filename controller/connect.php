<?php
$timezone = "Asia/Shanghai";

error_reporting(E_ALL ^ E_DEPRECATED);

$con=mysql_connect("xxx","xx","xxxx");
mysql_select_db("gede123",$con);

//$con=mysql_connect(SAE_MYSQL_HOST_M.':'.SAE_MYSQL_PORT,SAE_MYSQL_USER,SAE_MYSQL_PASS);
//mysql_select_db(SAE_MYSQL_DB,$con);

mysql_query("SET names UTF8");

header("Content-Type: text/html; charset=utf-8");
date_default_timezone_set($timezone); //北京时间
?>
