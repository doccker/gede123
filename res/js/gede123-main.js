/**
 * Created by night on 2015/06/10.
 */

//全局配置
var config = {
    maxEnvCount : 20,
    maxCateCount : 100,
    maxUrlCount : 100,
    maxNameLen : 100,
    maxDescLen : 100,
    maxUrlLen : 500,
    isSet : false,
    isGoogleWarn : false
};

//系统注册/登录
var rukou = {
    logout:{
        init : function(){
            $("#gd-logout").click(function(){
                $.confirm({
                    icon : 'gede-small-title',
                    title: '歌德书签',
                    animation: 'zoom',
                    content: '确认退出？',
                    confirm : function(){
                        rukou.change.logout();
                    },
                    closeIcon: true
                });
            });
        }
    },
    set : {
        display : {
            common : {
                show : function(){
                    util.hide("gd-set-list");
                    util.show("gd-set-off");
                },
                hide : function(){
                    util.show("gd-set-share");
                    util.hide("gd-share-find");

                    util.show("gd-set-list");
                    util.hide("gd-set-off");
                }
            }

        },
        control : {
            cate : {
                todo : 'add',
                delCate:function(ids){
                    if(ids == ''){
                        util.alert({
                            success : false,
                            msg : "请先勾选分类!"
                        });
                        return false;
                    };

                    util.confirm("确定删除选中分类吗？",function(){
                        var url = "controller/do.php?type=del&action=cate";
                        $.get(url,{
                            id : ids.join(",")
                        },function(result){
                            result = util.json(result);
                            if(result.success){
                                var includeCur = false;
                                var curEnv = gdkey.get("gd_env");
                                var curTab = gdkey.get("gd_tab_"+curEnv).split("_")[2];

                                if(typeof(ids) == 'string'){
                                    $("a[data-tab='gd_tab_"+ids+"']").parent().remove();
                                    $("div[data-tab='gd_tab_"+ids+"']").remove();

                                    if(ids == curTab){
                                        includeCur = true
                                    }
                                }else{
                                    $.each(ids, function (i,d) {
                                        $("a[data-tab='gd_tab_"+d+"']").parent().remove();
                                        $("div[data-tab='gd_tab_"+d+"']").remove();

                                        if(d == curTab){
                                            includeCur = true
                                        }
                                    });
                                };

                                if(includeCur){//如果删除的tab包含当前tab
                                    var tabList = $("#"+curEnv+"_tabs a");
                                    if(tabList.length == 0){
                                        return false;
                                    };

                                    var newActiveTab = tabList.eq(0);
                                    if(newActiveTab){
                                        gdtab.change(newActiveTab.attr("data-tab"),curEnv);
                                    };
                                }
                            }else{
                                util.alert({
                                    success : false,
                                    msg : result.msg
                                });
                            }
                        });
                    })
                },
                moveCate:function(ids){
                    $("#model-move-cate").modal('toggle');

                    //切换到选择的环境
                    var selectEnv = $("#select-move-cate-channel").val();
                    if(selectEnv == gdkey.getCurEnv().split("_")[2]){
                        return false;
                    };

                    util.confirm("确定移动选中分类吗？",function(){
                        var url = "controller/do.php?type=move";
                        $.post(url,{
                            id:ids.join(","),
                            pid:$("#select-move-cate-channel").val()
                        },function(result){
                            result = util.json(result);
                            if(result.success){
                                if(typeof(ids) == 'string'){
                                    $("a[data-tab='gd_tab_"+ids+"']").parent().remove();
                                    $("div[data-tab='gd_tab_"+ids+"']").remove();
                                }else{
                                    $.each(ids, function (i,d) {
                                        $("a[data-tab='gd_tab_"+d+"']").parent().remove();
                                        $("div[data-tab='gd_tab_"+d+"']").remove();
                                    });
                                };

                                //切换到选择的环境
                                gdkey.add('gd_env',"gd_env_"+selectEnv);
                                gdenv.reload("gd_env_"+selectEnv);
                            }else{
                                util.alert({
                                    success : false,
                                    msg : result.msg
                                });
                            }
                        });
                    })
                },
                ok : function(){
                    var type = "cate";
                    var todo = rukou.set.control.cate.todo;
                    var selectEnv = $("#set-"+type+"-contrl-add-env").val();

                    //确定要给哪个env添加cate
                    var curEnv = gdenv.curEnv;//当前活动的env
                    var thisEnv = curEnv.split("_")[2];//活动env id
                    if( selectEnv != thisEnv){//如果修改的目标env不是当前的env
                        curEnv = "gd_env_" + selectEnv;//则让当前的env变为目标env
                    };

                    //最大数量
                    if(todo == 'add'){
                        if($('#'+curEnv+'_tabs a').length >= config.maxCateCount){
                            $("#model-modify-cate").modal('toggle');
                            util.alert({
                                success : false,
                                msg : "Ooops！您选择的环境最多能添加 " + config.maxCateCount + " 个分类！"
                            });
                            return false;
                        }
                    }

                    //提交数据
                    var url = "controller/do.php?type="+todo+"&action="+type;
                    var param = {
                        uid : gdkey.get("gd_user").split(",")[0],
                        pid : selectEnv,
                        name : $("#set-"+type+"-contrl-add-name").val()
                    };

                    if(todo == 'edit'){
                        param.id = rukou.set.control.cate.editId;
                    }

                    $.post(url,param,function(result){
                        result = util.json(result);
                        var status = result.success;
                        var msg = result.msg;
                        var data = msg.split(",");

                        if(!status){
                            util.alert({
                                success : false,
                                msg : msg
                            });
                            return false;
                        }

                        if(selectEnv != thisEnv){
                            //切换到当前env其它tab
                            var activeTab = gdkey.get("gd_tab_"+gdenv.curEnv).split("_")[2];

                            //删除当前tab(修改时使用)
                            if(todo == 'edit') {
                                $("a[data-tab='gd_tab_" + data[3] + "']").remove();
                                $("div[data-tab='gd_tab_" + data[3] + "']").remove();

                                if (activeTab == data[3]) {
                                    var thisEnvAys = $("#" + gdenv.curEnv + "_tabs a");
                                    if (thisEnvAys.length > 0) {
                                        var changeTab = thisEnvAys[0];
                                        $(changeTab).addClass("active");
                                        util.showObj($("div[data-tab='" + $(changeTab).attr("data-tab") + "']"));
                                        gdkey.set("gd_tab_" + gdenv.curEnv, $(changeTab).attr("data-tab"));
                                    }
                                }
                            };

                            //修改默认分类为当前修改的
                            gdkey.set("gd_tab_"+curEnv,"gd_tab_"+data[3]);

                            //切换环境
                            gdenv.change(curEnv);
                        }else{
                            if(todo == 'add'){
                                $('#'+curEnv+'_tabs').append("<li class='pos-rel'><a cateId='"+data[0]+"' data-tab='gd_tab_"+data[0]+"' href='#' sort='"+data[2]+"'>"+data[1]+"</a><input type='checkbox' class='editor editor-cate-checkbox'><span class='editor editor-cate-edit' action='setting-menu-default-cate'><i class='fa fa-pencil'></i></span></li>");

                                //当前url高度
                                var height = $(".url").eq(0).css("height");

                                //添加环境的内容
                                var content = "" +
                                    "<div data-tab='gd_tab_"+data[0]+"' class='url gd-hide' style='height:"+height+"'><ul class='list-inline margin-0'>" +
                                    "</ul></div>";
                                $("#"+curEnv+"_tabpanels").append(content);

                                //初始化分类
                                gdtab.change('gd_tab_'+data[0],curEnv);
                                gdtab.click(curEnv);

                                //编辑click
                                $("a[cateId='"+data[0]+"']").parent().find('.editor-cate-edit').click(function () {
                                    rukou.set.control.cate.todo = 'edit';
                                    rukou.set.control.cate.editId = data[0];

                                    $("#modify-cate-title").text("编辑分类");
                                    $("#set-cate-contrl-add-name").val(data[1]);
                                    initForm.cate();
                                });

                                //重新排序
                                $('#'+curEnv+'_tabs a').tsort({attr:'sort'});
                            };
                        };

                        if(todo == 'edit'){
                            //初始化环境
                            gdenv.reload(curEnv);
                        };

                        $("#model-modify-cate").modal('toggle');
                    });
                }
            },
            env : {
                todo : 'add',
                delEnv:function(ids){
                    if(ids == ''){
                        util.alert({
                            success : false,
                            msg : "请先勾选频道!"
                        });
                        return false;
                    };

                    util.confirm("确认删除选中频道吗？",function(){
                        var url = "controller/do.php?type=del&action=env";
                        $.get(url,{
                            id : ids.join(",")
                        },function(result){
                            result = util.json(result);
                            if(result.success){
                                var includeCur = false;
                                var curChannel = gdkey.get("gd_env").split('_')[2];

                                if(typeof(ids) == 'string'){
                                    $("a[data-env='gd_env_"+ids+"']").parent().remove();
                                    $("div[data-env='gd_env_"+ids+"']").remove();

                                    if(ids == curChannel){
                                        includeCur = true
                                    }
                                }else{
                                    $.each(ids, function (i,d) {
                                        $("a[data-env='gd_env_"+d+"']").parent().remove();
                                        $("div[data-env='gd_env_"+d+"']").remove();

                                        if(d == curChannel){
                                            includeCur = true
                                        }
                                    });
                                };

                                if(includeCur){
                                    var envList = $("#gd_env a");
                                    if(envList.length == 0){
                                        return false;
                                    };

                                    var changeEnv = envList.eq(0);
                                    if(changeEnv){
                                        gdenv.change($(changeEnv).attr("data-env"));
                                    };
                                }
                            }else{
                                util.alert({
                                    success : false,
                                    msg : result.msg
                                });
                            }
                        });
                    })
                },
                ok:function(){
                    var type = "env";
                    var todo = rukou.set.control.env.todo;

                    //最大数量
                    if(todo == 'add'){
                        if($('#gd_env a').length >= config.maxEnvCount){
                            util.alert({
                                success : false,
                                msg : "Ooops！您最多能添加 " + config.maxEnvCount + " 个环境！"
                            });
                            $("#model-modify-channel").modal('toggle');
                            return false;
                        }
                    };

                    //提交数据
                    var url = "controller/do.php?type="+todo+"&action="+type;
                    var param = {
                        uid : gdkey.get("gd_user").split(",")[0],
                        pid : 0,
                        name : $("#set-"+type+"-contrl-add-name").val()
                    };

                    if(todo == 'edit'){
                        param.id = rukou.set.control.env.editId;
                    }

                    $.post(url,param,function(result){
                        result = util.json(result);
                        var status = result.success;
                        var msg = result.msg;
                        var data = msg.split(",");

                        if(!status){
                            util.alert({
                                success : false,
                                msg : msg
                            });
                            return false;
                        }

                        if(todo == 'add'){
                            $("#gd_env").append("<li class='pos-rel'><a channelId='"+data[0]+"' data-env='gd_env_"+data[0]+"' href='#' sort='"+data[2]+"'>"+data[1]+"</a><input type='checkbox' class='editor editor-channel-checkbox'><span class='editor editor-channel-edit' action='setting-menu-default-url'><i class='fa fa-pencil'></i> </span></li>");

                            //取得当前高度
                            var height = $(".cate").eq(0).css("height");

                            //添加环境的内容
                            var content = "" +
                                " <div data-env='gd_env_"+data[0]+"' class='gd-hide row'>" +
                                " <div class='col-md-2 padding-right-1 width-20p'>" +
                                " <div class='cate' style='height: "+height+";'>" +
                                "   <ul id='gd_env_"+data[0]+"_tabs' class='list-unstyled margin-0 gd_tabs'></ul>" +
                                " </div>" +
                                " </div>" +
                                " <div id='gd_env_"+data[0]+"_tabpanels' class='col-md-10 padding-left width-80p'></div>" +
                                " </div>";

                            $("#gd_nav").append(content);
                        }else{
                            var thisEnv = $("a[data-env='gd_env_"+data[3]+"']");
                            thisEnv.text(data[1]);
                            thisEnv.attr("sort",data[2]);
                        };

                        //重新排序
                        $('#gd_env a').tsort({attr:'sort'});

                        if(todo == 'add'){
                            //初始化环境
                            gdenv.change('gd_env_'+data[0]);

                            gdenv.initClick = false;
                            gdenv.click();

                            //编辑click
                            $("a[channelId='"+data[0]+"']").parent().find('.editor-channel-edit').click(function () {
                                rukou.set.control.env.todo = 'edit';
                                rukou.set.control.env.editId = data[0];
                                $("#modify-channel-title").text("编辑频道");
                                $("#set-env-contrl-add-name").val(data[1]);
                                $("#model-modify-channel").modal('toggle');
                            });
                        };

                        $("#model-modify-channel").modal('toggle');
                    });
                }
            },
            url : {
                todo : 'add',
                delUrl:function(ids){
                    if(ids == ''){
                        util.alert({
                            success : false,
                            msg : "请先勾选网址!"
                        });
                        return false;
                    };
                    util.confirm("确定删除选中网址吗？",function(){
                        var url = "controller/do.php?type=del&action=url";
                        $.get(url,{
                            id:ids.join(",")
                        },function(result){
                            result = util.json(result);
                            if(result.success){
                                if(typeof(ids) == 'string'){
                                    $("a[urlId='"+ids+"']").parent().remove();
                                }else{
                                    $.each(ids, function (i,d) {
                                        $("a[urlId='"+d+"']").parent().remove();
                                    });
                                };
                            }else{
                                util.alert({
                                    success : false,
                                    msg : result.msg
                                });
                            }
                        });
                    })
                },
                moveUrl:function(ids){
                    $("#model-move-url").modal('toggle');

                    //切换到选择的环境
                    var selectEnv = $("#select-move-url-channel").val();
                    var selectCate = $("#select-move-url-cate").val();

                    if(selectEnv == gdkey.getCurEnv().split("_")[2] && selectCate == gdkey.getCurTab().split("_")[2]){
                        return false;
                    };

                    util.confirm("确定移动选中网址吗？",function(){
                        var url = "controller/do.php?type=move";
                        $.post(url,{
                            id:ids.join(","),
                            pid:$("#select-move-url-cate").val()
                        },function(result){
                            result = util.json(result);
                            if(result.success){
                                if(typeof(ids) == 'string'){
                                    $("a[urlId='"+ids+"']").parent().remove();
                                }else{
                                    $.each(ids, function (i,d) {
                                        $("a[urlId='"+d+"']").parent().remove();
                                    });
                                };

                                if(selectEnv != gdkey.getCurEnv().split("_")[2]){
                                    gdenv.change("gd_env_"+selectEnv);
                                };

                                if(selectCate != gdkey.getCurTab().split("_")[2]){
                                    var hasLoad = gdtab.change("gd_tab_"+selectCate,"gd_env_"+selectEnv);
                                    if(hasLoad == 0){
                                        gdtab.reload(gdkey.getCurTab());
                                    };
                                };
                            }else{
                                util.alert({
                                    success : false,
                                    msg : result.msg
                                });
                            }
                        });
                    })
                },
                ok : function(){
                    var type = "url";
                    var todo = rukou.set.control.url.todo;

                    //当前环境
                    var selectEnv = $("#set-"+type+"-contrl-add-env").val();

                    //当前分类
                    var selectCate = $("#set-"+type+"-contrl-add-cate").val();

                    //最大数量
                    if(todo == 'add'){
                        if($("div[data-tab='gd_tab_"+selectCate+"'] li").length >= config.maxUrlCount){
                            $("#model-modify-url").modal('toggle');
                            util.alert({
                                success : false,
                                msg : "Ooops！您选择的分类最多能添加 " + config.maxUrlCount + " 个网址！"
                            });
                            return false;
                        }
                    };

                    //特殊处理以：www开头的url，前面必须添加：http://
                    var urlVal = $("#set-"+type+"-contrl-add-url").val();

                    // www开头
                    var reg3wUrl = /^www.+$/;
                    if(urlVal.match(reg3wUrl)){
                        urlVal = "http://" + urlVal;
                    };

                    //处理本地Local
                    var regLocalUrl = /^[a-zA-Z]:/i;
                    if(urlVal.match(regLocalUrl)){
                        urlVal = "localexplorer:" + urlVal;
                    };

                    //将所有的\替换为/
                    urlVal = urlVal.replace(/\\\\|\\/g,'/');

                    //删除最后一个/，因为打开本地目录有问题
                    var temSize = urlVal.length;
                    if(urlVal.substring(temSize-1,temSize) == '/'){
                        urlVal = urlVal.substring(0,temSize-1);
                    };

                    //提交数据
                    var url = "controller/do.php?type="+todo+"&action="+type;
                    var param = {
                        uid : gdkey.get("gd_user").split(",")[0],
                        pid : selectCate,
                        name : $("#set-"+type+"-contrl-add-name").val(),
                        url : urlVal,
                        comment : $("#set-"+type+"-contrl-add-comment").val(),
                        source : ''
                    };

                    if(todo == 'edit'){
                        param.id = rukou.set.control.url.editId;
                    }

                    $.post(url,param,function(result){
                        result = util.json(result);
                        var status = result.success;
                        var msg = result.msg;
                        var data = msg.split(",");

                        if(!status){
                            util.alert({
                                success : false,
                                msg : msg
                            });
                            return false;
                        };

                        //切换到选择的环境
                        if(selectEnv != gdkey.getCurEnv().split("_")[2]){
                            gdenv.change("gd_env_"+selectEnv);
                        };

                        //切换到选择的分类
                        if(selectCate != gdkey.getCurTab().split("_")[2]){
                            gdtab.change("gd_tab_"+selectCate,"gd_env_"+selectEnv);
                        };

                        if(todo == 'edit'){
                            //初始化环境
                            gdenv.reload("gd_env_"+selectEnv);
                        }else{
                            //添加环境的内容
                            var content = "" +
                                " <li class='pos-rel' sort='"+data[4]+"'>" +
                                "    <a urlId='"+data[0]+"' title='"+data[1]
                                +(data[2] == null || data[2] == '' ? "" : "「"+decodeURIComponent(data[2])+"」")
                                +"'";
                            if(data[3].indexOf("localexplorer")==-1){
                                content += " target='_blank' ";
                            }else{
                                data[3] = data[3].replace(/\\\\/g,'\\');
                            };

                            content += " href='"+data[3]+"'>" +
                                "        <img src='icons/default.png' /><span class='margin-left-5'>"+data[1]+"</span>" +
                                "    </a>" +
                                "    <input type='checkbox' class='editor editor-url-checkbox' /><span class='editor editor-url-edit' action='setting-menu-default-url'><i class='fa fa-pencil'></i> </span>" +
                                " </li>";
                            $("div[data-tab='gd_tab_"+selectCate+"'] ul").append(content);
                        };

                        if(todo == 'add'){
                            //菜单click
                            gdtab.click("gd_env_"+selectEnv);

                            //编辑click
                            $("a[urlId='"+data[0]+"']").parent().find('.editor-url-edit').click(function () {
                                rukou.set.control.url.todo = 'edit';
                                rukou.set.control.url.editId = data[0];

                                $("#modify-url-title").text("编辑网址");
                                $("#set-url-contrl-add-name").val(data[1]);
                                $("#set-url-contrl-add-url").val(data[3].replace("localexplorer:","").replace("LocalExplorer:","").replace(/\//g,'\\'));

                                if(data[2] != null && data[2] != ''){
                                    $("#set-url-contrl-add-comment").val(data[2]);
                                };

                                initForm.url();
                            });

                            //重新排序
                            $("div[data-tab='gd_tab_"+selectCate+"'] li").tsort({attr:'sort'});
                        };

                        $("#model-modify-url").modal('toggle');
                    });
                }
            }
        }
    },
    init:function(){
        gdshow.init();
        this.logout.init();
        //log.console();
    },
    change:{
        logout : function(){
            //清空基础数据
            gdkey.remove("gd_user");
            gdkey.remove("gd_env");
            gdkey.remove("gd_bind");

            //清空旧的所有cookie
            gdkey.removeAll();

            location.reload();
        }
    }
};

//搜索输入框事件
var busy = false;//是否正在执行查询
var searchWords = {
    init:function(){
        $('#query-engine-list').on('show.bs.dropdown', function () {
            $(".query").addClass("list-group-query-list");
        });
        $('#query-engine-list').on('hide.bs.dropdown', function () {
            $(".query").addClass("list-group-query-list");
        });

        //如果body任何一个地方单击，则隐藏搜索表单
        $(document).click(function(){
            engine.suggest.hide();

            //隐藏换肤窗口
            if($('#container-style').hasClass('in')){
                $('#container-style').collapse('toggle');
                $('#change-style').toggleClass('collapsed');
            };

            //隐藏搜索引擎窗口
            if($('#query-engine-list').hasClass('open')){
                $('#query-engine').dropdown('hide');
            };
        });

        $("#query-engine").click(function () {
            engine.suggest.hide();
        });

        //初始化search引擎
        if($.cookie("gd_engine") == "google"){
            engine.google();
        }else{
            engine.baidu();
        };

        //引擎选择
        $("#engine-list li").click(function(){
            var $this = this;
            $("#query-engine").html($($this).html() + "<span class='gd-caret margin-left-5'></span>");
            $("#query-input").attr("placeholder",$($this).attr("holder"));

            busy = false;
            var en = $(this).attr("action");
            if(en == "engine-baidu"){
                engine.baidu();
            }else if(en == "engine-local"){
                engine.local();
            }else{
                engine.google();
            }
        });

        //初始化搜索框焦点事件
        searchWords.focus();

        //初始化hot
        /*$("#gd-hot").click(function(){
         searchWords.hot();
         });*/
    },
    focus:function(){
        $("#query-input").click(function(){
            searchWords.query(this.value);
            //return false;//防治冒泡，出现和document的click事件冲突
        }).keyup(function(event){
            var key = event.keyCode;
            if((key >= 48 && key<=105)||key==8||key==32){
                searchWords.query(this.value);
            }
        }).keydown(function(event){
            var key = event.keyCode;
            var sugList = $("#gd-sug-list");

            if(key ==38 || key==40){
                if (key == 38) { /*向上按钮*/
                    if (index == -1){
                        index = sugList.find("a").length - 1; //到顶了
                    }else{
                        index--;
                    }
                } else if (key == 40) {/*向下按钮*/
                    if (index == sugList.find("a").length - 1){
                        index = 0; //到底了
                    }else{
                        index++;
                    }
                }
                var a = sugList.find("a:eq(" + index + ")");
                a.addClass("item-chosen").siblings().removeClass("item-chosen");

                var engine = gdkey.get('gd_engine');
                if(engine == 'local'){
                    $("#gd-frm").attr("action", a.attr("href"));
                }else{
                    $("#query-input").val($(a).text());
                };
            }
        });
    },
    query : function(q){
        if(busy || q==""){
            engine.suggest.hide();
            return false;
        }

        var en = gdkey.get("gd_engine");
        if(en == "baidu"){
            //var sugBaiduUrl = "http://suggestion.baidu.com/su";
            var sugBaiduUrl = "https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su";
            $.ajax({
                url: sugBaiduUrl,
                type: 'GET',
                dataType: 'jsonp',
                data: {
                    json:1,
                    cb:'engine.suggest.callback.baidu',
                    wd:q
                },
                beforeSend: function () {
                    busy = true;
                },
                complete : function (result) {
                    busy = false;
                }
            });
        }else if(en == "local"){
            var uid = 1;
            var stype = 2;
            var scode = 123456;

            var user = gdkey.get("gd_user");
            if(user != null){
                var userinfo = user.split(",");
                uid = userinfo[0];
                stype = userinfo[2];
                scode = userinfo[3];
            }

            var url = "controller/do.php?type=find";
            var param = {
                uid:uid,
                stype:stype,
                scode:scode,
                q:q
            };
            $.get(url,param,function(result){
                result = util.json(result);
                if(result.length > 0){
                    engine.suggest.callback.local(result);
                };
            });
        }else{
            var sugGoogleUrl = "https://www.google.com/complete/search?client=hp";

            $.ajax({
                url: sugGoogleUrl,
                type: 'GET',
                dataType: 'jsonp',
                data: {
                    callback:'engine.suggest.callback.google',
                    q:q
                },
                beforeSend: function () {
                    busy = true;
                },
                complete : function (result) {
                    busy = false;
                }
            });
        }
    }
};

//搜索引擎
//初始化条件输入框样式效果
var index = -1;//当前a
var engine = {
    init : function(type){

    },
    baidu : function(){
        $("#gd-frm").attr("action","http://www.baidu.com/s");
        $("#query-input").attr("name","wd");

        var $this = $("#engine-list li").eq(0);
        $("#query-engine").html($($this).html() + "<span class='gd-caret margin-left-5'></span>");
        $("#query-input").attr("placeholder",$($this).attr("holder"));

        gdkey.set("gd_engine","baidu");
    },
    google : function(){
        $("#gd-frm").attr("action","http://www.google.com/search");
        $("#query-input").attr("name","q");

        var $this = $("#engine-list li").eq(1);
        $("#query-engine").html($($this).html() + "<span class='gd-caret margin-left-5'></span>");
        $("#query-input").attr("placeholder",$($this).attr("holder"));

        gdkey.set("gd_engine","google");
    },
    local : function(){
        $("#gd-frm").attr("action","");
        $("#query-input").attr("name","q");

        var $this = $("#engine-list li").eq(2);
        $("#query-engine").html($($this).html() + "<span class='gd-caret margin-left-5'></span>");
        $("#query-input").attr("placeholder",$($this).attr("holder"));

        gdkey.set("gd_engine","local");
    },
    suggest : {
        getEngineSug:function(){
            return $("#gd-sug-list");
        },
        hide:function(){
            var sug = this.getEngineSug();
            util.hideObjNoFade(sug);
            sug.html("");
            $(".query,#query-engine,#query-enter").removeClass("list-group-query-list");
        },
        show:function(){
            var sug = this.getEngineSug();
            util.showObjNoFade(sug);
            sug.html("");
            $(".query,#query-engine,#query-enter").addClass("list-group-query-list");
        },
        callback : {
            baidu : function(result){
                index = -1;
                var sugResult = result.s;

                if(sugResult.length == 0){
                    engine.suggest.hide();
                    return false;
                };

                engine.suggest.show();

                for(var i=0;i<sugResult.length;i++){
                    var baiduHref = "http://www.baidu.com/s?wd=" + sugResult[i];
                    var googleHref = "http://www.google.com/search?q=" + sugResult[i];
                    var href = gdkey.get("gd_engine") == "google" ? googleHref : baiduHref;
                    engine.suggest.getEngineSug().append("" +
                        "<a href='"+href+"' target='_blank' class='list-group-item'>"+
                            //util.highlight(sugResult[i],$("#query-input").val())
                        sugResult[i]
                        +"</a>");
                };

                $("a[class='list-group-item']").click(function(){
                    engine.suggest.hide();
                });
            },
            local : function(result){
                index = -1;
                var sugResult = result;

                if(sugResult.length == 0){
                    engine.suggest.hide();
                    return false;
                };

                engine.suggest.show();

                $.each(sugResult,function(i,d){
                    engine.suggest.getEngineSug().append("" +
                        "<a href='"+d.url+"' target='_blank' class='list-group-item'>"
                        + "<img src='"+(d.icon == null ? "icons/default.png" : d.icon)+"' />"
                        + d.name
                        + "</a>");
                });

                $("a[class='list-group-item']").click(function(){
                    engine.suggest.hide();
                });
            },
            google : function(result){
                index = -1;

                var sugResult =result[1];

                if(sugResult.length == 0){
                    engine.suggest.hide();
                    return false;
                }
                engine.suggest.show();

                for(var i=0;i<sugResult.length;i++){
                    var googleHref = "http://www.google.com/search?q=" + sugResult[i][0];
                    engine.suggest.getEngineSug().append("" +
                        "<a href='"+googleHref+"' target='_blank' class='list-group-item'>"+
                            //util.highlight(sugResult[i][0],$("#query-input").val())
                        sugResult[i][0]
                        +"</a>");
                }

                $("a[class='list-group-item']").click(function(){
                    engine.suggest.hide();
                });
            }
        }
    }
};

//中间分类显示、收起顶部和显示全部
var gdshow = {
    getShowType : function(){
        var show = gdkey.get("gd_show");
        if(show == null){
            return "cate";
        };
        return show;
    },
    init : function(){
        //加载数据
        this.data();
    },
    cate : function(){
        gdkey.set("gd_show","cate");

        //控制切换分类
        util.hide("gd-list-all");
        util.show("gd_nav");
    },
    all : function(){
        //控制图标显示
        $("#gd-show-all").removeClass("btn-default").addClass("btn-primary");
        $("#gd-show-cate").removeClass("btn-primary").addClass("btn-default");
        gdkey.set("gd_show","all");

        //控制切换分类
        util.hide("gd_nav");
        util.show("gd-list-all");
    },
    data : function(){
        //初始化数据，并且初始化Tab等
        var gd_user = gdkey.get("gd_user");
        if(gd_user != null){
            var uinfo = gd_user.split(',');
            var uid = uinfo[0];
            var name = uinfo[1];
            var stype = uinfo[2];
            var scode = uinfo[3];
            action.get.env(uid,stype,scode);

            var bind = gdkey.get("gd_bind");
            if(bind){
                var bindData = bind.split(",");
                $("#gd-menu-user").append(bindData[0]);
                $("#gd-menu-user span").append("<img src='"+bindData[1]+"' />");
                $("#gd-menu-setting li[action='bind']").hide();
            }else{
                $("#gd-menu-user").append(name);
                $("#gd-menu-user span").append(name.substr(0,1).toUpperCase());
            };

            //显示菜单
            util.hide("gd-menu-login");
            $("#gd-menu-setting").css('display','block');

        }else{
            action.get.env(1,1,123456);
            $("#gd-menu-login").css('display','block');
        };
    },
    reload : function(idStr){
        var env = gdkey.getCurEnv();
        if($(idStr+"='"+env+"'] li").length == 0){
            gdenv.reload(gdkey.getCurEnv());
        }else{
            util.hideObj($(idStr+"='"+env+"']").siblings());
            util.showObj($(idStr+"='"+env+"']"));
        };
    }
};

//动态加载环境、分类和网址
var action = {
    busyCate : false,
    busyUrl : false,
    param : {
        uid:null,
        stype:null,
        scode:null,
        pid:null
    },
    get : {
        env : function(uid,stype,scode){
            //初始化变量
            action.param.uid = uid;
            action.param.stype = stype;
            action.param.scode = scode;

            //查询环境
            var url = "controller/do.php?type=query&action=env";
            var param = {
                uid:uid,
                stype:stype,
                scode:scode,
                pid:0
            };

            //添加遮罩
            $.get(url,param,action.callback.envCallBack).done(function(result){
                //如果环境为空则不加载任何资源
                result = util.json(result);
                if(result.length == 0){
                    return false;
                };

                //加载分类
                var env =gdkey.get("gd_env");
                var pid = env == null ? result[0].id : env.split("_")[2];
                action.get.cate(action.param.uid,action.param.stype,action.param.scode,pid);
            });
        },
        cate : function(uid,stype,scode,pid){
            //初始化变量
            action.param.pid = pid;

            //查询分类
            var url = "controller/do.php?type=query&action=cate";
            var param = {
                uid:uid,
                stype:stype,
                scode:scode,
                pid:pid
            };

            if(action.busyCate){
                return false;
            }else{
                action.busyCate = true;
            };

            //添加遮罩
            $.get(url,param,action.callback.cateCallBack).done(function(result){
                action.busyCate = false;
                gdenv.initCss("gd_env_"+action.param.pid);

                //加载rul
                result = util.json(result);

                if(result.length == 0){
                    return false;
                }

                var env =gdkey.get("gd_env");
                var tab =gdkey.get("gd_tab_"+env);
                var pid = tab == null ? result[0].id : tab.split("_")[2];
                action.get.url(action.param.uid,action.param.stype,action.param.scode,pid);
            });
        },
        url : function(uid,stype,scode,pid){
            action.param.pid = pid;

            //查询url
            var url = "controller/do.php?type=query&action=url";
            var param = {
                uid:uid,
                stype:stype,
                scode:scode,
                pid:pid
            };

            if(action.busyUrl){
                return false;
            }else{
                action.busyUrl = true;
            };

            //添加遮罩
            $.get(url,param,action.callback.urlCallBack).done(function(){
                action.busyUrl = false;
                gdtab.initCss(gdkey.getCurEnv(),gdkey.getCurTab());
            });
        }
    },
    callback : {
        envCallBack : function(result){
            $("body").fadeIn();

            //转换数据
            result = util.json(result);

            if(result.length == 0){
                //如果之前共享别人的账户，但是现在别人不共享了，需要警告用户
                var uinfo = gdkey.get("gd_user").split(',');
                if(uinfo[2] == 2 && uinfo[4] == '-no'){
                    log.note("噢！非常遗憾的告诉您，您共享的用户已经取消了分享。<br>请您到【共享管理】中取消当前共享，或者更换共享。");
                }else{
                    if(util.checkPri(true)){
                        rukou.set.display.url.show();
                    }
                };

                //添加nodata提醒
                util.noDataWarn($("#gd_nav"),"当前账号");
                util.noDataWarn($("#gd-list-all"),"当前账号");

                return false;
            };

            //清空历史
            util.empty("gd_env");
            util.empty("gd_nav");
            util.empty("gd-list-all");

            for(var i=0;i<result.length;i++){
                //添加环境超链接
                var alink = "<li class='pos-rel'><a channelId='"+result[i].id+"' href='#' data-env='gd_env_"+result[i].id+"' sort='"+result[i].sort+"' title="+result[i].name+">"+result[i].name+"</a><input type='checkbox' class='editor editor-channel-checkbox'/><span class='editor editor-channel-edit' action='setting-menu-default-url'><i class='fa fa-pencil'></i> </span></li>";
                $("#gd_env").append(alink);

                //添加环境的内容
                var content = "" +
                    " <div data-env='gd_env_"+result[i].id+"' class='gd-hide row'>" +
                    "   <div class='col-md-2 padding-right-1 width-20p'> " +
                    "       <div class='cate'> " +
                    "           <ul id='gd_env_"+result[i].id+"_tabs' class='list-unstyled margin-0 gd_tabs'></ul>" +
                    "       </div>" +
                    "    </div>" +
                    "    <div id='gd_env_"+result[i].id+"_tabpanels' class='col-md-10 padding-left width-80p'></div>" +
                    " </div>";
                $("#gd_nav").append(content);

                //编辑click
                $("a[channelId='"+result[i].id+"']").parent().find('.editor-channel-edit').click(function () {
                    var pa = $(this).parent().find('a');

                    rukou.set.control.env.todo = 'edit';
                    rukou.set.control.env.editId = pa.attr('channelId');

                    $("#modify-channel-title").text("编辑频道");
                    $("#set-env-contrl-add-name").val(pa.text());
                    $("#model-modify-channel").modal('toggle');
                });
            };

            //调整高度
            autoHeight();

            //滚动条
            $(".channel").mCustomScrollbar({
                axis : "x",
                autoHideScrollbar : true,
                scrollbarPosition : "outside",
                theme : "light-thin"
            });

            //控制拖动
            $("#gd_env").dragsort({
                dragSelector : "a",
                dragEnd: function() {
                    var data = $("#gd_env a").map(function(){
                        return $(this).attr("channelId");
                    }).get();

                    //查询个人信息
                    $.post("controller/do.php?type=sort",{
                        ids : data.join(",")
                    },function(result){
                        result = util.json(result);
                        if(!result.success){
                            util.alert(result);
                        }
                    });
                }
            });
        },
        cateCallBack : function(result){
            result = util.json(result);

            if(result.length == 0){
                if($("#"+gdkey.getCurEnv()+"_tabs").parent().find("p").length == 0){
                    util.noDataWarn($("#"+gdkey.getCurEnv()+"_tabs").parent(),"当前环境");
                };
                gdenv.emptyInit();
                return false;
            }

            //清空历史
            util.empty("gd_env_"+action.param.pid+"_tabs");
            util.empty("gd_env_"+action.param.pid+"_tabpanels");


            for(var i=0;i<result.length;i++){
                //添加环境超链接
                var alink = "<li class='pos-rel'><a cateId='"+result[i].id+"' href='#' data-tab='gd_tab_"+result[i].id+"' sort='"+result[i].sort+"' title="+result[i].name+">"+result[i].name+"</a><input type='checkbox' class='editor editor-cate-checkbox'/><span class='editor editor-cate-edit' action='setting-menu-default-cate'><i class='fa fa-pencil'></i> </span></li>";
                $("#gd_env_"+action.param.pid+"_tabs").append(alink);

                //添加环境的内容
                var content = "" +
                    "<div data-tab='gd_tab_"+result[i].id+"' class='url gd-hide'><ul class='list-inline margin-0'>" +
                    "</ul></div>";
                $("#gd_env_"+action.param.pid+"_tabpanels").append(content);

                //编辑click
                $("a[cateId='"+result[i].id+"']").parent().find('.editor-cate-edit').click(function () {
                    var pa = $(this).parent().find('a');
                    rukou.set.control.cate.todo = 'edit';
                    rukou.set.control.cate.editId = pa.attr('cateId');

                    $("#modify-cate-title").text("编辑分类");
                    $("#set-cate-contrl-add-name").val(pa.text());

                    initForm.cate();
                });
            };

            //滚动条
            $("div[data-env='gd_env_"+action.param.pid+"'] .cate").mCustomScrollbar({
                axis : "y",
                autoHideScrollbar : true,
                theme : "dark-thin"
            });

            //调整高度
            autoHeight();

            //初始化环境
            gdenv.init();

            //控制拖动
            $("#gd_env_"+action.param.pid+"_tabs").dragsort({
                dragSelector : "a",
                dragEnd: function() {
                    var data = $("#"+gdkey.getCurEnv()+"_tabs a").map(function(){
                        return $(this).attr("cateId");
                    }).get();

                    //查询个人信息
                    $.post("controller/do.php?type=sort",{
                        ids : data.join(",")
                    },function(result){
                        result = util.json(result);
                        if(!result.success){
                            util.alert(result);
                        }
                    });
                }
            });
        },
        urlCallBack : function(result){
            result = util.json(result);
            if(result.length == 0){
                util.noDataWarn($("div[data-tab='"+gdkey.getCurTab()+"']"),"当前分类");
                gdtab.emptyInit(gdenv.curEnv);
                return false;
            }

            //清空历史
            util.emptyTab("gd_tab_"+action.param.pid);

            for(var i=0;i<result.length;i++){
                //添加url的内容
                var content = "" +
                    " <li class='pos-rel' sort='"+result[i].sort+"'>" +
                    "    <a urlId='"+result[i].id+"' title='"+result[i].name
                    +(result[i].comment == null || result[i].comment == '' ? "" : "「"+result[i].comment+"」")
                    +"' comment='"+result[i].comment+"'";

                if(result[i].url != null && result[i].url.indexOf("localexplorer") == -1){
                    content += " target='_blank' ";
                };
                content += "href='"+result[i].url+"'>" +
                    "<img src='"+(result[i].icon == null || result[i].icon == '' || result[i].icon == 'icons/default.ico' ? 'icons/default.png' : result[i].icon)+"'/>" +
                    "<span class='margin-left-5'>" + result[i].name + "</span>" +
                    "    </a>" +
                    "    <input type='checkbox' class='editor editor-url-checkbox'/><span class='editor editor-url-edit' action='setting-menu-default-url'><i class='fa fa-pencil'></i> </span>" +
                    " </li>";
                $("div[data-tab='gd_tab_"+action.param.pid+"'] ul").append(content);

                //编辑click
                $("a[urlId='"+result[i].id+"']").parent().find('.editor-url-edit').click(function () {
                    var pa = $(this).parent().find('a');

                    rukou.set.control.url.todo = 'edit';
                    rukou.set.control.url.editId = pa.attr('urlId');

                    $("#modify-url-title").text("编辑网址");
                    $("#set-url-contrl-add-name").val(pa.find('span').text());
                    $("#set-url-contrl-add-url").val(pa.attr('href').replace("localexplorer:","").replace("LocalExplorer:","").replace(/\//g,'\\'));

                    var comment = pa.attr('comment');
                    if(comment != null && comment != ''){
                        $("#set-url-contrl-add-comment").val(comment);
                    };

                    initForm.url();
                });
            };

            //初始化url tab
            gdtab.init(gdenv.curEnv);

            //滚动条
            $("div[data-tab='gd_tab_"+action.param.pid+"']").mCustomScrollbar({
                axis : "y",
                autoHideScrollbar : true,
                theme : "dark-thin"
            });

            //控制拖动
            $("div[data-tab='gd_tab_"+action.param.pid+"'] ul").dragsort({
                dragSelector : "a",
                dragEnd: function() {
                    var data = $("div[data-tab='"+gdkey.getCurTab()+"']").find('a').map(function(){
                        return $(this).attr("urlId");
                    }).get();

                    //查询个人信息
                    $.post("controller/do.php?type=sort",{
                        ids : data.join(",")
                    },function(result){
                        result = util.json(result);
                        if(!result.success){
                            util.alert(result);
                        }
                    });
                }
            });
        }
    }
};

//切换env
var gdenv = {
    busy : false,
    initClick : false,
    curEnv : null,
    init : function(){
        var env = gdkey.get("gd_env");
        env = this.change(env);
        this.click();
    },
    emptyInit : function(){
        var env = gdkey.get("gd_env");
        this.initCss(env);
        this.click();
        gdenv.curEnv = env;
    },
    initCss : function(env){
        $("#gd_env a[data-env='"+env+"']").parents('li').addClass("focus").siblings().removeClass("focus");

        //这里这个开关很重要，不然快速点击env的时候，页面就有可能会乱。
        if(!gdenv.busy){
            gdenv.busy = true;
            util.hideObj($("#gd_nav > div[data-env='"+env+"']").siblings());
            util.showObj($("#gd_nav > div[data-env='"+env+"']"),function(){
                gdenv.busy = false;
            });
        }
    },
    reload : function(env){
        if(env){
            action.get.cate(action.param.uid,action.param.stype,action.param.scode,env.split("_")[2]);
        };
    },
    change : function(env){
        if(env == null){
            env = $("#gd_env a").eq(0).attr("data-env");
        };
        gdkey.add("gd_env",env);

        var len = $("#gd_nav > div[data-env='"+env+"'] a").length;
        var hasData = $("#gd_nav > div[data-env='"+env+"'] > p").length == 0;

        if(len == 0 && hasData){
            gdenv.reload(env);
        }else{
            this.initCss(env);
        };

        this.curEnv = env;

        return env;
    },
    click : function(){
        if(gdenv.initClick){
            return false;
        };

        $("#gd_env a").unbind("click").on('click',function(){
            var thisEnv = $(this).attr("data-env");
            gdenv.change(thisEnv);
        });

        gdenv.initClick = true;
    }
};

//切换tab
var gdtab = {
    init : function(env){
        var tab = gdkey.get("gd_tab_"+env);
        this.change(tab,env);
        this.click(env);
    },
    emptyInit : function(env){
        var tab = gdkey.get("gd_tab_"+env);
        this.initCss(tab,env);
        this.click(env);
    },
    initCss : function(tab,env){
        $("#"+env+"_tabs a[data-tab='"+tab+"']").parents('li').addClass("focus").siblings().removeClass("focus");
        util.hideObj($("#"+env+"_tabpanels > div[data-tab='"+tab+"']").siblings());
        util.showObj($("#"+env+"_tabpanels > div[data-tab='"+tab+"']"));
    },
    reload : function(tab){
        if(tab){
            action.get.url(action.param.uid,action.param.stype,action.param.scode,tab.split("_")[2]);
        }
    },
    change : function(tab,env){
        if(tab == null){
            $("#"+env+"_tabs li").eq(0).addClass("focus");
            util.showObj($("#"+env+"_tabpanels div").eq(0));
            tab = $("#"+env+"_tabs a").eq(0).attr("data-tab");
        };
        gdkey.add("gd_tab_"+env,tab);

        var len = $("#"+env+"_tabpanels > div[data-tab='"+tab+"'] li").length;
        var hasData = $("#"+env+"_tabpanels > div[data-tab='"+tab+"'] > p").length == 0;
        if(len == 0 && hasData){
            this.reload(tab);
            return 1;//有重新加载
        }else{
            this.initCss(tab,env);
        };
        return 0;//没有重新加载只是切换
    },
    click : function(env){
        $("#"+env+"_tabs a").unbind("click").on('click',function(){
            var thisTab = $(this).attr("data-tab");
            gdtab.change(thisTab,env);
            $(this).parents('li').addClass("focus").siblings().removeClass("focus");
        });
    }
};

//公共事件
var common = {
    body:{
        init:function(){
            this.click();
            this.search();
        },
        click:function(){
            //绑定回车事件
            $(document).keydown(function(e){
                if (e.keyCode == 27) {//ESC时选中搜索栏
                    $("#query-input").focus();
                }
            });
        },
        isShow:false,
        search:function(){
            $(document).bind("keydown", function (e) {
                if (e.keyCode == 113) {//f2
                    //切换为搜索本地
                    var curEngine = gdkey.get('gd_engine');
                    var $this;

                    if(curEngine != 'local'){
                        $this = $("#engine-list li").eq(2);
                        engine.local();
                    }else{
                        $this = $("#engine-list li").eq(0);
                        engine.baidu();
                    };

                    $("#query-engine").html($($this).html() + "<span class='gd-caret margin-left-5'></span>");
                    $("#query-input").attr("placeholder",$($this).attr("holder"));

                    $("#query-input").focus();
                };
            });

            $("#gd-find-cancel").click(function(){
                common.body.isShow = false;
                common.body.hide();
            });

            $("#gd-find-word").keydown(function(e){
                if(e.keyCode == 13){
                    if(this.value != ""){
                        common.body.find(this.value);
                    }else{
                        common.body.hide();
                    }
                }
            });
        },
        find:function(q){
            var uid = 1;
            var stype = 2;
            var scode = 123456;

            var user = gdkey.get("gd_user");
            if(user != null){
                var userinfo = user.split(",");
                uid = userinfo[0];
                stype = userinfo[2];
                scode = userinfo[3];
            }

            var url = "controller/do.php?type=find";
            var param = {
                uid:uid,
                stype:stype,
                scode:scode,
                q:q
            };
            $.get(url,param,function(result){
                result = util.json(result);
                if(result.length == 0){
                    $("#gd-find-result").html("未找到匹配结果");
                    common.body.show();
                    return false;
                };

                $("#gd-find-result").html("<ul style='padding-left: 20px;padding-top: 20px;'></ul>");
                $.each(result,function(i,d){
                    //添加环境的内容
                    var content = "" +
                        " <li sort='"+d.sort+"'>" +
                        "    <a urlId='"+d.id+"' ";

                    if(result[i].url.indexOf("localexplorer") == -1){
                        content += " target='_blank' ";
                    };

                    content += "href='"+d.url+"' title='"+d.name+"'>" +
                        "        <div class='pull-left'>" +
                        "            <img src='"+d.icon+"' class='media-object' imgId='"+d.icon_id+"'>" +
                        "        </div>" +
                        "        <div class='media-body'>" +
                        "            <h2 class='media-heading'>"+d.name+"</h2>" +
                        "        </div>" +
                        "    </a>" +
                        " </li>";
                    $("#gd-find-result ul").append(content);
                });

                common.body.show();
            });
        },
        show:function(){
            util.show("gd-find");
            if($("#gd-find-result").html() != ""){
                util.show("gd-find-result");
                util.hide("gd_main");
            }
            $("#gd-find-word").focus();
            common.body.isShow = true;
        },
        hide:function(){
            util.hide("gd-find");
            util.hide("gd-find-result");
            util.show("gd_main");
            common.body.isShow = false;
        },
        clear:function(){
            this.hide();
            $("#gd-find-result").html("");
        }
    }
};


var gdStyle = {
    init : function () {
        //加载当前样式
        $.each(gdStyleList, function (i,d) {
            $("#container-style .style-box").append("<div class='box-content'><a href='#'><img src='"+ d.img+"' /></a><p><input type='radio' name='gd-style' value='"+ d.value+"'><span class='margin-left-5'>"+d.name+"</span></p></div>");
        });

        //当前样式
        $("input[value='"+$.cookie('gd_style')+"']").prop("checked",true).parent().prev("a").addClass("focus");

        //click事件
        $("input[name='gd-style']").click(function () {
            $(".box-content a").removeClass("focus");
            $(this).parent().prev('a').addClass("focus");

            //删除当前样式
            $("#gd-style-" + $.cookie('gd_style')).remove();

            //修改样式
            var style = document.createElement("link");
            style.setAttribute("id", "gd-style-"+this.value);
            style.setAttribute("href", "res/theme/gede123-"+this.value+".css?t=" + new Date());
            style.setAttribute("rel", "stylesheet");

            document.head.appendChild(style);

            //添加到cookie中
            gdkey.add('gd_style',this.value);

            //保存到系统中
            var url = "controller/do.php?type=style";
            $.post(url,{
                id : gdkey.user.getCurUserId(),
                style_code : this.value
            },function(result){
                //result = util.json(result);
                //do nothing
            });
        });

        //click事件：图片
        $(".box-content a").click(function () {
            $(".box-content a").removeClass("focus");
            $(this).addClass("focus");

            //删除当前样式
            $("#gd-style-" + $.cookie('gd_style')).remove();

            var $radio = $(this).parent().find("input");
            $radio.prop("checked",true);

            //修改样式
            var style = document.createElement("link");
            style.setAttribute("id", "gd-style-"+$radio.val());
            style.setAttribute("href", "res/theme/gede123-"+$radio.val()+".css?t=" + new Date());
            style.setAttribute("rel", "stylesheet");

            document.head.appendChild(style);

            //添加到cookie中
            gdkey.add('gd_style',$radio.val());

            //保存到系统中
            var url = "controller/do.php?type=style";
            $.post(url,{
                id : gdkey.user.getCurUserId(),
                style_code : $radio.val()
            },function(result){
                //result = util.json(result);
                //do nothing
            });
        });
    },
    change : function(code){
        $(".box-content a").removeClass("focus");
        $("input[value='"+code+"']").parent().prev('a').addClass("focus");

        //删除当前样式
        $("#gd-style-" + $.cookie('gd_style')).remove();

        //修改样式
        var style = document.createElement("link");
        style.setAttribute("id", "gd-style-"+code);
        style.setAttribute("href", "res/theme/gede123-"+code+".css?t=" + new Date());
        style.setAttribute("rel", "stylesheet");

        document.head.appendChild(style);

        //添加到cookie中
        gdkey.add('gd_style',code);
    }
};

//设置-菜单
var gdSettingMenu = {
    init : function () {
        $("#gd-setting").click(function () {
            if(!auth.isLogin()){
                return false;
            };
        });

        $("#setting-menu a").click(function(){
            var $this  = this;
            var target = $(this).attr("data-target");
            var value  = $(this).attr("data-value");

            $("div.setting-menu").not('.gd-hide').hide(function(){
                $(this).addClass('gd-hide');
                $(target).show(function(){
                    $(this).removeClass('gd-hide');
                });

                $("#gd-setting span").first().text($($this).attr("data-display"));

                if(value == 'logout'){
                    config.isSet = false;

                    $('#main').removeClass('set-channel').removeClass('set-cate').removeClass('set-url');
                }else{
                    config.isSet = true;

                    $('#main').removeClass('set-channel').removeClass('set-cate').removeClass('set-url');
                    $('.main').addClass('set-'+value);
                };
            });
        });

        //每个设置上的退出
        $("#setting-menu-pannel a[data-value='logout']").click(function () {
            var $this  = this;
            var target = $(this).attr("data-target");
            var value  = $(this).attr("data-value");

            $("div.setting-menu").not('.gd-hide').hide(function(){
                $("#gd-setting span").first().text($($this).attr("data-display"));

                $(this).addClass('gd-hide');
                $(target).show(function(){
                    $(this).removeClass('gd-hide');
                });

                config.isSet = false;
                $('#main').removeClass('set-channel').removeClass('set-cate').removeClass('set-url');
            });
        });
    }
};

//处理选中
var checkbox = {
    checkedChannel : function () {
        var result = new Array();
        var checkedObj = $("#gd_env input[type='checkbox']:checked");
        $.each(checkedObj, function (i,d) {
            result.push($(d).parent().find('a').attr("channelId"));
        });
        return result;
    },
    checkedCate : function () {
        var result = new Array();
        var checkedObj = $("#"+gdkey.getCurEnv()+"_tabs input[type='checkbox']:checked");
        $.each(checkedObj, function (i,d) {
            result.push($(d).parent().find('a').attr("cateId"));
        });
        return result;
    },
    checkedUrl : function () {
        var result = new Array();
        var checkedObj = $("div[data-tab='"+gdkey.get("gd_tab_"+gdkey.getCurEnv())+"'] input[type='checkbox']:checked");
        $.each(checkedObj, function (i,d) {
            result.push($(d).parent().find('a').attr("urlId"));
        });
        return result;
    }
};

//工具类
var timer;
var util = {
    empty : function(id){
        $("#"+id).html("");
    },
    emptyTab : function(tab){
        $("div[data-tab='"+tab+"'] ul").html("");
    },
    json : function(str){
        return eval('(' + str + ')');
    },
    msg : function(id,msg){
        $("#"+id).html("<span class='color-red'><i class='glyphicon glyphicon-info-sign'></i> " + msg + "</span>");
        util.show(id);

        if(timer != null){
            clearTimeout(timer);
        }
        timer = setTimeout(function(){
            util.hide(id);
            clearTimeout(timer);
        },3000);
    },
    loadingMsg : function(id,msg){
        $("#"+id).html("<span class='color-blue'><i class='glyphicon glyphicon-transfer'></i> " + msg + "</span>");
        util.show(id);
    },
    showNoFade : function(id){
        $("#"+id).removeClass("gd-hide");
    },
    hideNoFade : function(id){
        $("#"+id).addClass("gd-hide");
    },
    showObjNoFade : function(obj){
        $(obj).removeClass("gd-hide");
    },
    hideObjNoFade : function(obj){
        $(obj).addClass("gd-hide");
    },
    show : function(id){
        $("#"+id).fadeIn();
    },
    showObj : function(obj,callback){
        $(obj).fadeIn(callback);
    },
    hide : function(id){
        $("#"+id).hide();
    },
    fadeIn : function(id,fun){
        $("#"+id).fadeIn("slow",fun);
    },
    fadeOut : function(id,fun){
        $("#"+id).fadeOut("slow",fun);
    },
    hideObj : function(obj){
        $(obj).hide();
    },
    checkPri: function(isAlert){
        var userType = gdkey.get("gd_user").split(",")[2];
        if(userType == 2){
            if(isAlert){
                log.note("您现在共享他人的账号，不允许操作！");
            }
            return false;
        }
        return true;
    },
    getLen : function(str){//判断字符串长度，汉字算2个
        var len = 0;
        for (var i = 0; i < str.length; i++) {
            var a = str.charAt(i);
            if (a.match(/[^\x00-\xff]/ig) != null){
                len += 2;
            }else{
                len += 1;
            }
        }
        return len;
    },
    getMax : function(id){
        var maxSort = 0;

        $("#"+id+" a").each(function(i,d){
            var sort = $(d).attr('sort');
            if(sort > maxSort){
                maxSort = sort;
            }
        });

        return parseInt(maxSort)+1;
    },
    highlight : function(str,key){
        var reg = eval("/"+key+"/g");
        return str.replace(reg,"<span style='border-bottom: 1px dotted #AF3C17;padding-bottom: 2px;'>"+key+"</span>");
    },
    noDataWarn : function(obj,title){

    },
    alert : function(result){
        var content = "";
        if(result.success){
            content = '<div class="gede-small-content"><span class="text-success">'+result.msg+'<span></div>';
        }else{
            content = '<div class="gede-small-content"><span class="text-danger">'+result.msg+'<span></div>';
        };

        $.alert({
            title: false,
            animation: 'scalex',
            content: content,
            cancelButton: false,
            confirmButton: false
        });
    },
    confirm : function(content,confirmCallback){
        $.confirm({
            title: '<i class="gede-small-title"></i> 歌德书签',
            animation: 'scale',
            content: content,
            confirmButton : "确定",
            confirm : confirmCallback
        });
    }
};

//扩展cookie
var gdkey = {
    keys : null,
    add : function(key,data){//通过add方法添加的cookie执行removeAll的时候会被删除
        if(new RegExp("^gd_tab_gd_env").test(key) && gdkey.get("gd_keys").indexOf(key) == -1){
            if(this.keys == null){
                this.keys = key;
            }else{
                this.keys += ',' + key;
            }
        };
        $.cookie(key,data,{expires:30,path:'/'});//30天过期
        $.cookie('gd_keys',this.keys,{expires:30,path:'/'});//30天过期
    },
    set : function(key,data){
        $.cookie(key,data,{expires:30,path:'/'});//30天过期
    },
    get : function (key){
        return $.cookie(key);
    },
    remove : function(key){
        $.removeCookie(key);
    },
    removeAll:function(){
        this.keys = $.cookie('gd_keys');
        if(this.keys != null){
            $.each(this.keys.split(","),function(i,d){
                $.removeCookie(d);
            });
        };
    },
    getCurEnv : function(){//当前env
        return gdkey.get("gd_env");
    },
    getCurTab : function(){//当前tab
        return gdkey.get("gd_tab_" + this.getCurEnv());
    },
    user : {
        getCurUserId : function(){
            return this.get(0);
        },
        getCurUserName : function(){
            return this.get(1);
        },
        getCurUserType : function(){
            return this.get(2);
        },
        getCurUserSCode : function(){
            return this.get(3);
        },
        getCurShareUserName : function(){
            return this.get(4);
        },
        get : function(index){
            var user = gdkey.get("gd_user");
            if(!user){
                return -1;
            }
            return user.split(",")[index]
        }
    }
};

//alert窗口
var log = {
    console : function(){
        var me = "我叫孙茂斌，英文名Night，1987年，男 ，感谢您对我的关注； \n"
            + "我2010年毕业于湖北宜昌三峡大学数学系信息与计算科学专业，本科； \n"
            + "在这么多年的职业生涯中，从事过电力行业、政府行业和现在的互联网行业；\n"
            + "我对前端、后台（Java方向）和项目管理都有一定的个人理解和感悟；\n"
            + "目前我在深圳人荐人爱 (http://www.5igdd.com) 任职全栈工程师。";
        console.log('%c', '');
        console.log('%c[ 关于我 ]', 'color:#AF3C17; font-size:14px;font-family:微软雅黑;');
        console.log('%c'+me,'font-family:微软雅黑;');
        console.log('%c', '');
        console.log('%c[ 联系我 ]', 'color:blue; font-size:14px;font-family:微软雅黑;');
        console.log('%c'+'扣扣：375208445 \n微信：gdidea-night','font-family:微软雅黑;');
        console.log('%c', '');
    }
};

//权限检查
var auth = {
    isLogin : function () {
        var user = gdkey.get('gd_user');
        if (!user) {
            util.confirm('您还未登录歌德书签，现在登录？', function () {
                window.location.href = "../../login.html";
            });
            return false;
        };
        return true;
    }
};

var initData = {
    getChannelData : function (callback) {
        //加载环境
        var url = "controller/do.php?type=query&action=env";
        var param = {
            uid : gdkey.user.getCurUserId(),
            stype : gdkey.user.getCurUserType(),
            scode : gdkey.user.getCurUserSCode(),
            pid : 0
        };
        $.get(url,param, function (data) {
            data = util.json(data);
            callback(data);
        });
    },
    getCateData : function (envId,callback) {
        //加载环境
        var url = "controller/do.php?type=query&action=cate";
        var param = {
            uid : gdkey.user.getCurUserId(),
            stype : gdkey.user.getCurUserType(),
            scode : gdkey.user.getCurUserSCode(),
            pid : envId
        };
        $.get(url,param, function (data) {
            data = util.json(data);
            callback(data);
        });
    }
};


var initForm = {
    cate : function(){
        $("#set-cate-contrl-add-env").html("");
        initData.getChannelData(function (data) {
            if(data.length == 0){
                $("#set-cate-contrl-add-env").append("<option value='-1'> = 请添加 = </option>");
                return false;
            };

            $.each(data, function (i,d) {
                $("#set-cate-contrl-add-env").append("<option value='"+ d.id +"'>"+ d.name +"</option>");
            });
            $("#model-modify-cate").modal('toggle');
        });
    },
    url : function () {
        $("#set-url-contrl-add-env").html("");
        initData.getChannelData(function (data) {
            if(data.length == 0){
                $("#set-cate-contrl-add-env").append("<option value='-1'> = 请添加 = </option>");
                return false;
            };

            $.each(data, function (i,d) {
                $("#set-url-contrl-add-env").append("<option value='"+ d.id +"'>"+ d.name +"</option>");
            });

            //加载当前分类
            var curEnv = gdkey.getCurEnv().split('_')[2];
            $("#set-url-contrl-add-cate").html("");
            initData.getCateData(curEnv, function (data2) {
                if(data2.length == 0){
                    $("#set-url-contrl-add-cate").append("<option value='-1'> = 请添加 = </option>");
                    return false;
                };

                $.each(data2, function (i2,d2) {
                    $("#set-url-contrl-add-cate").append("<option value='" + d2.id + "'>" + d2.name + "</option>");
                });

                setTimeout(function(){
                    $('#form-move-url').bootstrapValidator('updateStatus','cateName','VALID');
                },200);
            });

            //change
            $("#set-url-contrl-add-env").unbind('change').change(function (i3,d3) {
                //clear old data
                $("#set-url-contrl-add-cate").html("");
                initData.getCateData(this.value, function (data3) {
                    if(data3.length == 0){
                        $("#set-url-contrl-add-cate").append("<option value='-1'> = 请添加 = </option>");
                        $('#form-move-url').bootstrapValidator('updateStatus','cateName','INVALID');
                        return false;
                    };

                    $.each(data3, function (i3,d3) {
                        $("#set-url-contrl-add-cate").append("<option value='" + d3.id + "'>" + d3.name + "</option>");
                    });
                    $('#form-move-url').bootstrapValidator('updateStatus','cateName','VALID');
                });
            });

            $("#model-modify-url").modal('toggle');
        });
    },
    move : {
        cate : function(){
            if(checkbox.checkedCate() == ''){
                util.alert({
                    success : false,
                    msg : "请先勾选分类!"
                });
                return false;
            };

            $("#select-move-cate-channel").html("");
            initData.getChannelData(function (data) {
                if(data.length == 0){
                    $("#select-move-cate-channel").append("<option value='-1'> = 请添加 = </option>");
                    return false;
                };

                $.each(data, function (i,d) {
                    $("#select-move-cate-channel").append("<option value='"+ d.id +"'>"+ d.name +"</option>");
                });
                $("#model-move-cate").modal('toggle');
            });
        },
        url : function () {
            if(checkbox.checkedUrl() == ''){
                util.alert({
                    success : false,
                    msg : "请先勾选网址!"
                });
                return false;
            };

            $("#select-move-url-channel").html("");
            initData.getChannelData(function (data) {
                if(data.length == 0){
                    $("#select-move-url-channel").append("<option value='-1'> = 请添加 = </option>");
                    return false;
                };

                $.each(data, function (i,d) {
                    $("#select-move-url-channel").append("<option value='"+ d.id +"'>"+ d.name +"</option>");
                });

                //加载当前分类
                var curEnv = gdkey.getCurEnv().split('_')[2];
                $("#select-move-url-cate").html("");
                initData.getCateData(curEnv, function (data2) {
                    if(data2.length == 0){
                        $("#select-move-url-cate").append("<option value='-1'> = 请添加 = </option>");
                        $('#form-move-url').bootstrapValidator('updateStatus','cateName','INVALID');
                        return false;
                    };

                    $.each(data2, function (i2,d2) {
                        $("#select-move-url-cate").append("<option value='" + d2.id + "'>" + d2.name + "</option>");
                    });

                    //选中当前项
                    $("#select-move-url-cate").val(gdkey.getCurTab().split('_')[2]);

                    setTimeout(function(){
                        $('#form-move-url').bootstrapValidator('updateStatus','cateName','VALID');
                    },200);
                });

                //change
                $("#select-move-url-channel").unbind('change').change(function (i3,d3) {
                    //clear old data
                    $("#select-move-url-cate").html("");
                    initData.getCateData(this.value, function (data3) {
                        if(data3.length == 0){
                            $("#select-move-url-cate").append("<option value='-1'> = 请添加 = </option>");
                            $('#form-move-url').bootstrapValidator('updateStatus','cateName','INVALID');
                            return false;
                        };

                        $.each(data3, function (i3,d3) {
                            $("#select-move-url-cate").append("<option value='" + d3.id + "'>" + d3.name + "</option>");
                        });
                        $('#form-move-url').bootstrapValidator('updateStatus','cateName','VALID');
                    });
                });

                $("#model-move-url").modal('toggle');
            });
        }
    }
};

$(window).resize(function(){
    autoHeight();
});

function autoHeight(){
    var h = $(window).height()-$(".navbar").height()-$("header").height()-50*2-($(window).height() < 768 ? 140 : 176);
    if( h<60 ){
        h = 60;
    };
    $(".url,.cate").height(h);
};
