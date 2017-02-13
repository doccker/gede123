<?php
include_once('connect.php');

$type = $_GET['type']; //请求类型
$action = !empty($_GET['action']) ? $_GET['action'] : ''; //请求事件

$result = new stdClass();

if($type == 'rukou'){//注册/登录功能
    if($action == "register"){ //用户注册
        //获取参数
        $username = $_POST['username'];
        $passwd = md5($_POST['passwd']);
        $name = $_POST['name'];
        $email = $_POST['email'];
        $scode = "123456";//系统默认code码

        //校验用户名是否存在
        $query = mysql_query("SELECT * FROM gd_user where username='".$username."'");
        $obj = mysql_fetch_object($query);

        if($obj){
            $result -> success = FALSE;
            $result -> msg = "Ooops！用户名已经存在！";
        }else{
            if($name == ""){
                $name = $username;
            }
            mysql_query("INSERT INTO gd_user (username, passwd, name, email, scode) VALUES  ('$username','$passwd','$name','$email','$scode')");

            $uid = mysql_insert_id();
            if($uid>0){
                //返回创建成功用户信息
                $result -> success = TRUE;
                $result -> msg = "恭喜您，账号注册成功！";

                //用户创建成功后,初始化默认值
                mysql_query("INSERT INTO gd_link ( uid, pid, name, sort) VALUES ('$uid','0','默认频道','1')");

                $pid = mysql_insert_id();
                mysql_query("INSERT INTO gd_link ( uid, pid, name, sort) VALUES ('$uid','$pid','默认分类','1')");

                $pid = mysql_insert_id();
                mysql_query("INSERT INTO gd_link ( uid, pid, name, url, sort, icon, is_catch, source) VALUES ('$uid','$pid','歌德书签','http://www.gede123.com','1','icons/default.ico', 1, 'pc')");
            }else{
                $result -> success = FALSE;
                $result -> msg = "Ooops！系统出现异常啦，要不您过段时间再来注册吧！";
            }
        }
        echo json_encode($result);
    }else if($action == "login"){ //用户登录
        //获取参数
        $username = $_GET['username'];
        $passwd = md5($_GET['passwd']);

        //查询账号
        $sql = "SELECT * FROM gd_user WHERE username='".$username."' and passwd='".$passwd."'";
        $query = mysql_query($sql);
        $obj = mysql_fetch_object($query);

        //校验
        if($obj){
            echo $obj->id .",". $obj->name .",". $obj->stype .",". $obj->scode. ",".$obj->style_code;;
        }else{
            echo FALSE;
        }
    }else if($action == "update.stype"){ //更新stype
        //获取参数
        $id = $_GET['uid'];
        $stype = $_GET['stype'];

        //更新账号
        $sql = "update gd_user set stype='".$stype."' where id = '".$id."'";
        mysql_query($sql);

        //校验
        if(mysql_affected_rows()>0){
            echo TRUE;
        }else{
            echo FALSE;
        }
    }
}else if($type == 'query'){//查询菜单
    //获取参数
    $uid = $_GET['uid'];
    $stype = !empty($_GET['stype']) ? $_GET['stype'] : '0';
    $scode = !empty($_GET['scode']) ? $_GET['scode'] : '123456';
    $pid = $_GET['pid'];

    if($action == 'env'){//查询环境
        if($stype != 2){
            //查询账号
            $sql = "SELECT link.id,link.name,link.sort FROM gd_link link WHERE pid='".$pid."' AND uid='".$uid."' AND link.status='0' ORDER BY link.sort,link.create_time";
        }else{
            $sql = "SELECT link.id,link.name,link.sort FROM gd_link link WHERE pid='".$pid."' AND uid=(SELECT id FROM gd_user WHERE stype='1' AND scode='".$scode."')  AND link.status='0' ORDER BY link.sort,link.create_time";
        };
    }else if($action == 'cate'){//查询分类
        if($stype != 2){
            //查询账号
            $sql = "SELECT link.id,link.name,link.sort FROM gd_link link WHERE pid='".$pid."' AND uid='".$uid."' AND link.status='0' ORDER BY link.sort,link.create_time";
        }else{
            $sql = "SELECT link.id,link.name,link.sort FROM gd_link link WHERE pid='".$pid."' AND uid=(SELECT id FROM gd_user WHERE stype='1' AND scode='".$scode."') AND link.status='0' ORDER BY link.sort,link.create_time";
        }
    }else if($action == 'url'){//查询网址
        if($stype != 2){
            //查询账号
            $sql = "SELECT link.id,link.name,link.comment,link.icon,link.url,link.sort FROM gd_link link WHERE pid='".$pid."' AND uid='".$uid."' AND link.status='0' ORDER BY link.sort,link.create_time";
        }else{
            $sql = "SELECT link.id,link.name,link.comment,link.icon,link.url,link.sort FROM gd_link link WHERE pid='".$pid."' AND link.status='0' AND uid=(SELECT id FROM gd_user WHERE stype='1' AND scode='".$scode."') ORDER BY link.sort,link.create_time";
        };

        //统计活跃度
        active($uid);
    }else if($action == 'url.all'){//查询evn下的所有网址
        if($stype != 2){
            //查询账号
            $sql = "SELECT link.id,link.name,link.comment,link.icon,link.url,link.sort FROM (SELECT * FROM gd_link WHERE pid IN (SELECT id FROM gd_link WHERE pid = '".$pid."' AND uid = '".$uid."' AND STATUS = '0') AND STATUS = '0')link ORDER BY link.sort,link.pid,link.create_time";
        }else{
            $sql = "SELECT link.id,link.name,link.comment,link.icon,link.url,link.sort FROM (SELECT * FROM gd_link WHERE pid IN (SELECT id FROM gd_link WHERE pid = '".$pid."' AND uid = (SELECT id FROM gd_user WHERE stype='1' AND scode='".$scode."') AND STATUS = '0') AND STATUS = '0')link ORDER BY link.sort,link.pid,link.create_time";
        }
    }else if($action == 'icon'){//查询网址
            $sql = "SELECT id,name,url from gd_icon";
    }

    $query = mysql_query($sql);
    $array =  array();
    while($row = mysql_fetch_array($query,MYSQL_ASSOC)){
        $array[] =  $row;
    }
    echo json_encode($array);

}else if($type == 'add'){//添加
    //获取参数
    $uid = $_POST['uid'];
    $pid = $_POST['pid'];
    $name = $_POST['name'];
    $sort = getTimeSec();

    $name = preg_replace("/'/","&apos;",$name);

    if($action == 'env' || $action == 'cate'){
        mysql_query("INSERT INTO gd_link ( uid, pid, name, sort) VALUES ('$uid','$pid','$name','$sort')");
    }else if($action == 'url'){
        $comment = $_POST['comment'];
        $url = $_POST['url'];
        $source = $_POST['source'];

        mysql_query("INSERT INTO gd_link ( uid, pid, name, comment, url, sort, source) VALUES ('$uid','$pid','$name','$comment','$url','$sort','$source')");
    }

    $addId = mysql_insert_id();
    if($addId>0){
        $result -> success = TRUE;
        if($action == 'env' || $action == 'cate'){
            $result -> msg = $addId.','.$name.','.$sort;
        }else if($action == 'url'){
            $result -> msg = $addId.','.$name.','.urlencode($comment).','.$url.','.$sort;
        }
    }else{
        $result -> success = FALSE;
        $result -> msg = "Ooops！系统出现异常啦，请稍后重试！";
    }

    echo json_encode($result);
}else if($type == 'edit'){
    //获取参数
    $uid = $_POST['uid'];
    $id = $_POST['id'];
    $pid = $_POST['pid'];
    $name = $_POST['name'];
    $sort = getTimeSec();

    if($action == 'env' || $action == 'cate'){
        mysql_query("UPDATE gd_link set name='$name',pid='$pid',update_time=now() where uid='$uid' and id='$id'");
    }else if($action == 'url'){
        $comment = $_POST['comment'];
        $url = $_POST['url'];

        mysql_query("UPDATE gd_link set name='$name',comment='$comment',url='$url',pid='$pid',update_time=now() where uid='$uid' and id='$id'");
    }

    if(mysql_affected_rows()>0){
       $result -> success = TRUE;
       if($action == 'env' || $action == 'cate'){
            $result -> msg = $pid.','.$name.','.$sort.','.$id;
       }else if($action == 'url'){
            $result -> msg = $id.','.$name.','.''.','.$url.','.$sort;
       }
    }else{
       $result -> success = FALSE;
       $result -> msg = "Ooops！系统出现异常啦，请稍后重试！";
    }
    echo json_encode($result);
}else if($type == 'del'){
    //获取参数
    $id = $_GET['id'];

    if($action == 'env'){
        mysql_query("UPDATE gd_link set status = '1',update_time=now() where id in ($id) or pid in ($id) OR pid IN (SELECT id FROM (SELECT id FROM gd_link WHERE pid in ($id))t)");
    }else if($action == 'cate'){
        mysql_query("UPDATE gd_link set status = '1',update_time=now() where id in ($id) or pid in ($id)");
    }else if($action == 'url'){
        mysql_query("UPDATE gd_link set status = '1',update_time=now() where id in ($id)");
    }

    if(mysql_affected_rows()>0){
        $result -> success = TRUE;
    }else{
        $result -> success = FALSE;
        $result -> msg = "Ooops！系统出现异常啦，请稍后重试！";
    }

    echo json_encode($result);
}else if($type == 'share'){
    //获取参数
    $id = $_GET['id'];

    if($action == 'g.cancel' || $action == 'f.cancel'){
        mysql_query("update gd_user set stype='0',scode='123456',is_public='0',public_name=null,public_time=null,update_time=now() where id='$id'");
    }else if($action == 'g.create' || $action == 'g.change'){
        $scode = $_GET['scode'];

        //校验是否有此分享码
        $query = mysql_query("SELECT name FROM gd_user WHERE stype='1' and scode='$scode'");
        $obj = mysql_fetch_object($query);
        if(!$obj){
            $result -> msg = "连接共享失败，没有此共享码，或者对方已取消分享！";
        }else{
            mysql_query("update gd_user set stype='2',scode='$scode',update_time=now() where id='$id'");
            $result -> msg = $obj->name;
        }
    }else if($action == 'f.create'){
        $scode = $_GET['scode'];
        $public = $_GET['public'];
        $name = $_GET['name'];

        //校验是否有此分享码
        $query = mysql_query("SELECT name FROM gd_user WHERE stype='1' and scode='$scode' and id != '$id'");
        $obj = mysql_fetch_object($query);
        if($obj){
            $result -> error = TRUE;
            $result -> msg = "Ooops，分享码有冲突！";
        }else{
            $sql = "update gd_user set stype='1',scode='$scode',is_public='$public'";
            if($name != NULL){
                $sql = $sql.",public_name='$name'";
            };
            if($public == 1){
                $sql = $sql.",public_time=now()";
            };
            $sql = $sql.",update_time=now() where id='$id'";

            mysql_query($sql);
        }
    }

    if($action != 'f.change'){
        if(mysql_affected_rows()>0){
            $result -> success = TRUE;
        }else{
            $result -> success = FALSE;
            if(!($result -> msg)){
                $result -> msg = "Ooops！系统出现异常啦，请稍后重试！";
            }
        }
        echo json_encode($result);
    }else{
        $query = mysql_query("SELECT scode,is_public public,public_name name FROM gd_user WHERE id='$id'");
        $obj = mysql_fetch_object($query);
        echo json_encode($obj);
    }
}else if($type == 'feedback'){
    if($action == 'publish'){
        $uid = $_POST['uid'];
        $name = $_POST['name'];
        $content = $_POST['content'];
        $createTime = date("Y-m-d H:i:s",time());

        mysql_query("insert into gd_feedback(uid,name,content,create_time) values ('$uid','$name','$content','$createTime')");

        if(mysql_insert_id()>0){
            $result -> success = TRUE;
            $result -> floor = mysql_insert_id();
            $result -> createTime = $createTime;
        }else{
            $result -> success = FALSE;
            $result -> msg = "Ooops！系统出现异常啦，请稍后重试！";
        }

        echo json_encode($result);
    }else if($action == 'show' || $action == 'more'){
        $id = $_GET['id'];
        $maxRows = 15;

        $sql = "SELECT * FROM gd_feedback WHERE ".($action == 'show' ? "id > 0" : "id < ".$id)." ORDER BY id DESC LIMIT ".$maxRows.";";
        $query = mysql_query($sql);
        $array = array();
        while($row = mysql_fetch_array($query,MYSQL_ASSOC)){
            $array[] =  $row;
        }

        echo json_encode($array);
    }else if($action == 'face'){
        $sql = "SELECT * FROM gd_face;";
        $query = mysql_query($sql);
        $array = array();
        while($row = mysql_fetch_array($query,MYSQL_ASSOC)){
            $array[] =  $row;
        }

        echo json_encode($array);
    }
}else if($type == 'find'){//站内搜索
    $uid = $_GET['uid'];
    $stype = $_GET['stype'];
    $scode = $_GET['scode'];
    $q = $_GET['q'];

    if($stype != 2){
        //查询账号
        $sql = "select * from(SELECT link.id,link.name,link.comment,link.icon,link.url,link.sort FROM gd_link link WHERE uid='".$uid."' AND link.status='0' ) t where name like '%".$q."%' or comment like '%".$q."%' or url like '%".$q."%' limit 0,10";
    }else{
        $sql = "select * from(SELECT link.id,link.name,link.comment,link.icon,link.url,link.sort FROM gd_link link WHERE link.status='0' AND uid=(SELECT id FROM gd_user WHERE stype='1' AND scode='".$scode."')) t where name like '%".$q."%' or comment like '%".$q."%' or url like '%".$q."%' limit 0,10";
    }
    $query = mysql_query($sql);
    $array = array();
    while($row = mysql_fetch_array($query,MYSQL_ASSOC)){
        $array[] =  $row;
    }

    echo json_encode($array);
}else if($type == 'user'){//站内搜索
    if($action == 'envcate'){
        $uid = $_GET['uid'];

        $arrayEnv = array();
        $arrayCate = array();

        //查询env
        $queryEnv = mysql_query("select * from gd_link where pid='0' and status='0' and uid=".$uid);
        while($rowEnv = mysql_fetch_array($queryEnv,MYSQL_ASSOC)){
            $arrayEnv[] =  $rowEnv;

            //查询cate
            $queryCate = mysql_query("select * from gd_link where status='0' and pid=".$rowEnv[id]);
            while($rowCate = mysql_fetch_array($queryCate,MYSQL_ASSOC)){
                $arrayCate[] =  $rowCate;
            }
        };

        $array -> env = $arrayEnv;
        $array -> cate = $arrayCate;

        echo json_encode($array);
    }else if($action == 'reset'){
        $id = $_POST['id'];
        $passwd = md5($_POST['passwd']);
        $newPasswd = md5($_POST['newPasswd']);

        //查询账号
        $query = mysql_query("SELECT * FROM gd_user WHERE id='".$id."' and passwd='".$passwd."'");
        $obj = mysql_fetch_object($query);
        if(!$obj){
            $result -> error = TURE;
            $result -> msg = "Ooops！原始密码错误，请重试！";
        }else{
            mysql_query("UPDATE gd_user set passwd = '$newPasswd',update_time=now() where id='$id'");

            if(mysql_affected_rows()>0){
                $result -> success = TRUE;
                $result -> msg = "恭喜您，密码修改成功！下次登录时生效。";
            }else{
                $result -> success = FALSE;
                $result -> msg = "Ooops！系统出现异常啦，请稍后重试！";
            }
        };
        echo json_encode($result);
    }else if($action == 'edit'){
        $id = $_GET['id'];
        $name = $_GET['name'];
        $email = $_GET['email'];

        mysql_query("UPDATE gd_user set name = '$name',email='$email',update_time=now() where id='$id'");

        if(mysql_affected_rows()>0){
            $result -> success = TRUE;
            $result -> msg = "恭喜您，个人信息修改成功！";
        }else{
            $result -> success = FALSE;
            $result -> msg = "Ooops！系统出现异常啦，请稍后重试！";
        }

        echo json_encode($result);
    }else if($action == 'findUserById'){
        $id = $_GET['id'];

        $query = mysql_query("SELECT * FROM gd_user WHERE id='".$id."'");
        $obj = mysql_fetch_object($query);

        echo json_encode($obj);
    }else if($action == 'checkUserPasswd'){
        $id = $_GET['id'];
        $passwd = md5($_GET['passwd']);

        //查询账号
        $query = mysql_query("SELECT * FROM gd_user WHERE id='".$id."' and passwd='".$passwd."'");
        $obj = mysql_fetch_object($query);
        if(!$obj){
            $result -> success = FALSE;
            $result -> msg = "密码错误，请重试！";
        }else{
            $result -> success = TRUE;
        }

        echo json_encode($result);
    }else if($action == 'focus'){
        $id = $_GET['id'];
        $focusId = $_GET['focusId'];
        $focusUserName = $_GET['focusUserName'];

        //查询账号
        if($focusId == ""){
            $queryId = mysql_query("SELECT id FROM gd_user WHERE username='".$focusUserName."'");
            $focusId = mysql_fetch_object($queryId) -> id;
        }

        $query = mysql_query("SELECT id,focus_ids FROM gd_user WHERE id='".$id."'");
        $focusIds = mysql_fetch_object($query) -> focus_ids;

        if(count(explode($focusId.',',$focusIds)) > 1){
            $result -> success = FALSE;
            $result -> msg = "您已关注过此用户！";
        }else{
            $ids = $focusIds.$focusId.',';
            mysql_query("UPDATE gd_user set focus_ids = '$ids',update_time=now() where id='$id'");

            if(mysql_affected_rows()>0){
                $result -> success = TRUE;
                $result -> msg = "关注成功！";
            }else{
                $result -> success = FALSE;
                $result -> msg = "Ooops！系统出现异常啦，请稍后重试！";
            }
        }

        echo json_encode($result);
    }else if($action == 'focus.list'){
        $id = $_GET['id'];

        $queryIds = mysql_query("SELECT focus_ids FROM gd_user WHERE id='$id'");
        $focusIds = mysql_fetch_object($queryIds) -> focus_ids;

        if($focusIds ==  ""){
            $result -> success = FALSE;
            $result -> msg = "您未关注任何人！";

            echo json_encode($result);
        }else{
            $sql = "select id,name,scode,IF(public_name is null,'/',public_name)public_name,IF(is_public=0,'否','是')is_public from gd_user where id in (".$focusIds.substr($focusIds,0,strlen($focusIds)-1).");";
            $query = mysql_query($sql);

            $array = array();
            while($row = mysql_fetch_array($query,MYSQL_ASSOC)){
                $array[] =  $row;
            }

            $result -> success = TRUE;
            $result -> data = $array;
            echo json_encode($result);
        }
    }else if($action == 'focus.cancel'){
        $id = $_GET['id'];
        $focusId = $_GET['focusId'];

        mysql_query("UPDATE gd_user set focus_ids = REPLACE(focus_ids,'".($focusId.',')."',''),update_time=now() where id='$id'");

        if(mysql_affected_rows()>0){
            $result -> success = TRUE;
            $result -> msg = "取消关注成功！";
        }else{
            $result -> success = FALSE;
            $result -> msg = "Ooops！系统出现异常啦，请稍后重试！";
        }
        echo json_encode($result);
    }
}else if($type == 'public'){//查询公开共享
    $sql = "SELECT t1.id,t1.name,t1.pname,t1.scode,IFNULL(t2.count,0) count FROM "
          ."(SELECT IFNULL(public_name,'未命名的分享') pname,scode,id,name FROM gd_user WHERE stype='1' AND is_public = '1')t1 "
          ."LEFT JOIN "
          ."(SELECT COUNT(1) COUNT,scode FROM gd_user WHERE stype='2' GROUP BY scode)t2 "
          ."ON t1.scode = t2.scode "
          ."ORDER BY t2.count DESC ";

    $query = mysql_query($sql);
    $array = array();
    while($row = mysql_fetch_array($query,MYSQL_ASSOC)){
        $array[] =  $row;
    }

    echo json_encode($array);
}else if($type == 'redirect'){//通过公开共享连接
    $id = $_POST['id'];
    $scode = $_POST['scode'];

    mysql_query("UPDATE gd_user set stype='2',scode='$scode',update_time=now() where id='$id'");

    if(mysql_affected_rows()>0){
        $result -> success = TRUE;
    }else{
        $result -> success = FALSE;
        $result -> msg = "Ooops！系统出现异常啦，请稍后重试！";
    }

    echo json_encode($result);
}else if($type == 'plugin'){//给chrome plugin查询使用
    if($action == 'getNextSort'){
        $uid = $_GET['uid'];
        $pid = $_GET['pid'];

        $query = mysql_query("SELECT IFNULL(MAX(sort)+1,1) sort,IFNULL(COUNT(1),0) count FROM gd_link WHERE status='0' and pid='".$pid."' and uid='".$uid."'");
        $obj = mysql_fetch_object($query);

        echo json_encode($obj);
    }
}else if($type == 'forget'){
    if($action == 'passwd'){
        $username = $_POST['username'];
        $email = $_POST['email'];
        $passwd = md5($_POST['passwd']);

        $check = mysql_fetch_object(mysql_query("SELECT 1 FROM gd_user WHERE status = '0' and  username='$username' and passwd='$passwd'"));
        if($check){
            $result -> success = TRUE;
            $result -> msg = "恭喜您，密码重置成功！";
        }else{
            $query = mysql_query("SELECT 1 FROM gd_user WHERE status = '0' and  username='$username' and email='$email'");
            $obj = mysql_fetch_object($query);
            if($obj){
                $sql = "update gd_user set passwd='$passwd',update_time=now() WHERE username='$username' and email='$email'";
                mysql_query($sql);
                if(mysql_affected_rows()>0){
                    $result -> success = TRUE;
                    $result -> msg = "恭喜您，密码重置成功！";
                }else{
                    $result -> success = FALSE;
                    $result -> msg = "Ooops！系统出现异常啦，请稍后重试！";
                }
            }else{
                $result -> success = FALSE;
                $result -> msg = "Ooops，用户名和邮箱不符，请联系管理员找回密码！";
            };
        }
        echo json_encode($result);
    }
}else if($type == 'move'){
    $ids = $_POST['id'];
    $pid = $_POST['pid'];

    foreach (explode(',',$ids) as $key=>$id) {
        $sort = getTimeSec();
        $sql = "update gd_link set pid='$pid',update_time=now(),sort='$sort' WHERE id='$id'";
        mysql_query($sql);
        usleep(20000);
    }

    if(mysql_affected_rows()>0){
        $result -> success = TRUE;
        $result -> msg = "恭喜您，网址移动成功！";
    }else{
        $result -> success = FALSE;
        $result -> msg = "Ooops！系统出现异常啦，请稍后重试！";
    }

    echo json_encode($result);
}else if($type == 'sort'){
     $ids = $_POST['ids'];
     foreach (explode(',',$ids) as $key=>$id) {
         $sort = getTimeSec();
         $sql = "update gd_link set update_time=now(),sort='$sort' WHERE id='$id'";
         mysql_query($sql);
         usleep(20000);
     }

     if(mysql_affected_rows()>0){
         $result -> success = TRUE;
         $result -> msg = "恭喜您，排序成功！";
     }else{
         $result -> success = FALSE;
         $result -> msg = "Ooops！系统出现异常啦，请稍后重试！";
     }

     echo json_encode($result);
 }else if($type == 'style'){
       $style_code = $_POST['style_code'];
       $id = $_POST['id'];

       mysql_query("update gd_user set style_code='$style_code' where id = '$id'");

       if(mysql_affected_rows()>0){
           $result -> success = TRUE;
           $result -> msg = "恭喜您，样式切换成功！";
       }else{
           $result -> success = FALSE;
           $result -> msg = "Ooops！系统出现异常啦，请稍后重试！";
       }

       echo json_encode($result);
 }else if($type == 'import'){
       if($action == 'chrome'){
           $data = json_decode($_POST['data']);
           $uid = $_POST['uid'];
           if($data){
                //先新增一个频道
                $sort = getTimeSec();
                mysql_query("INSERT INTO gd_link ( uid, pid, name, sort, source) VALUES ('$uid','0','Chrome导入书签','$sort','Chrome导入')");
                usleep(20000);

                $addChannelId = mysql_insert_id();
                if($addChannelId > 0){
                    foreach ($data->channel as $key=>$value) {
                         //再新增分类
                         $sort = getTimeSec();
                         mysql_query("INSERT INTO gd_link ( uid, pid, name, sort, source) VALUES ('$uid','$addChannelId','$value->cate','$sort','Chrome导入')");
                         usleep(20000);

                         //最后现在URL地址
                         $addCateId = mysql_insert_id();
                         if($addCateId > 0){
                             foreach ($value->url as $key2=>$value2) {
                                $sort = getTimeSec();
                                $title = urldecode($value2->title);
                                mysql_query("INSERT INTO gd_link ( uid, pid, name, url, sort, source) VALUES ('$uid','$addCateId','$title','$value2->link','$sort','Chrome导入')");
                                usleep(20000);
                             }
                         }
                     }
                }

                $result -> success = TRUE;
                $result -> msg = '数据导入成功!';
                echo json_encode($result);
           }else{
                $result -> success = FALSE;
                $result -> msg = '数据导入失败,导入数据格式错误!';
                echo json_encode($result);
           }
       }
 }else if($type == 'gather'){
        $data = $_POST['data'];

        if($action == 'qq'){
            mysql_query("INSERT INTO gd_gather_qq ( qq_nickname, qq_gender, qq_figureurl, qq_province, qq_city, qq_vip, qq_year, create_time)
            VALUES ('$data[nickname]','$data[gender]','$data[figureurl]','$data[province]','$data[city]','$data[vip]','$data[year]',NOW())");
        }else{
            mysql_query("INSERT INTO gd_gather_weibo ( weibo_avatar_hd, weibo_avatar_large, weibo_created_at, weibo_description, weibo_domain,
            weibo_gender, weibo_id, weibo_location,weibo_name,weibo_profile_image_url,weibo_province,weibo_screen_name,weibo_remark,weibo_weihao,create_time)
            VALUES ('$data[avatar_hd]','$data[avatar_large]','$data[created_at]','$data[description]','$data[domain]','$data[gender]','$data[id]','$data[location]',
            '$data[name]','$data[profile_image_url]','$data[province]','$data[screen_name]','$data[remark]','$data[weihao]',NOW())");
        }

        $result -> success = TRUE;
        $result -> msg = '数据采集成功!';
        echo json_encode($result);
 }else if($type == 'bind'){
       $openId = $_GET['openId'];

       //用户是否已绑定
       $query = mysql_query("SELECT * FROM gd_bind_third_part where bind_open_id='$openId'");
       $queryObj = mysql_fetch_object($query);

       if($queryObj){//如果已经绑定，则直接返回结果
           $sql = "SELECT * FROM gd_user WHERE id='$queryObj->bind_uid'";
           $query = mysql_query($sql);
           $obj = mysql_fetch_object($query);

           echo $obj->id .",". $obj->name .",". $obj->stype .",". $obj->scode. ",".$obj->style_code;
       }else{
           $username = "bind_".getRandomCode();
           $name = $username;
           $passwd = md5($username);
           $scode = "123456";

           mysql_query("INSERT INTO gd_user (username, passwd, name, scode) VALUES  ('$username','$passwd','$name','$scode')");

           $uid = mysql_insert_id();
           if($uid>0){
               //用户创建成功后,初始化默认值
               mysql_query("INSERT INTO gd_link ( uid, pid, name, sort) VALUES ('$uid','0','默认频道','1')");

               $pid = mysql_insert_id();
               mysql_query("INSERT INTO gd_link ( uid, pid, name, sort) VALUES ('$uid','$pid','默认分类','1')");

               $pid = mysql_insert_id();
               mysql_query("INSERT INTO gd_link ( uid, pid, name, url, sort, icon, is_catch, source) VALUES ('$uid','$pid','歌德书签','http://www.gede123.com','1','icons/default.ico', 1, 'bind')");
           };

           //建立关联
           mysql_query("INSERT INTO gd_bind_third_part (bind_uid, bind_open_id, bind_type, bind_time) VALUES  ('$uid','$openId','$action',NOW())");

           echo $uid .",". $name .",". 0 .",". $scode. ","."white";
       }
  }

//关闭连接
mysql_close($con);

function active($uid){
   $query = mysql_query("SELECT * FROM gd_active where uid='$uid' and DATE_FORMAT(create_time,'%Y-%m-%d') = DATE_FORMAT(NOW(),'%Y-%m-%d')");
   $queryObj = mysql_fetch_object($query);

   if($queryObj){//更新活跃次数
        $cnt = $queryObj->cnt + 1;
        mysql_query("UPDATE gd_active SET cnt = '$cnt', update_time = NOW() WHERE id = '$queryObj->id'");
   }else{
        mysql_query("INSERT INTO gd_active (uid, cnt, create_time) VALUES ('$uid',1,NOW())");
   }
}

//获取当前时间序列，精确到微秒
function getTimeSec(){
     $micro = explode(' ',microtime());
     $msec = $micro[0]*1000000000;
     $len = strlen($msec);
     if($len < 9){
         for($x=0;$x<9-$len;$x++){
            $msec = "0".$msec;
         }
     };
     $cur = $micro[1].$msec;
     return $cur;
}

//生成随机字符串，8位
function getRandomCode(){
 mt_srand((double)microtime()*10000);//optional for php 4.2.0 and up.
 $charid = strtoupper(md5(uniqid(rand(), true)));
 $code = substr($charid, 0, 8);//10位长度
 return $code;
}

?>