var initDataAll = function () {
    //初始化搜索引擎
    searchWords.init();

    //初始化登录、注册
    rukou.init();

    //初始化body的单击事件
    common.body.init();

    //初始化样式更换
    gdStyle.init();

    //初始化设置
    gdSettingMenu.init();

    //hover提示
    var hoverList = ["#model-modify-channel","#model-modify-cate","#model-modify-url","#model-userinfo","#model-change-passwd"];
    $.each(hoverList,function (i,d) {
        $(d + " .form-control-feedback").popover({
            container: d,
            trigger : 'hover'
        });
    });

    //---------------------------

    //用户信息
    $("#gd-set-info").click(function(){
        //查询个人信息
        $.get("controller/do.php?type=user&action=findUserById",{id:gdkey.user.getCurUserId()},function(result){
            result = util.json(result);
            $("#set-user-info-username").val(result.username);
            $("#set-user-info-name").val(result.name);
            $("#set-user-info-email").val(result.email);

            //记录旧值
            $("#set-user-info-name").attr("data-old",result.name);
            $("#set-user-info-email").attr("data-old",result.email);

            $("#model-userinfo").modal('toggle');
        });
    });

    //用户信息点击保存
    $("#gd_userinfo_submit").click(function(){
        userInfo();
    });

    //---------------------------

    //修改密码
    $("#gd-set-reset").click(function(){
        $("#model-change-passwd").modal('toggle');
    });

    //修改密码点击保存
    $("#gd_change_passwd_submit").click(function(){
        changePasswd();
    });

    //---------------------------

    //保存频道
    $("a[action='setting-menu-default-channel']").click(function(){
        if(!auth.isLogin()){
            return false;
        };
        $("#model-modify-channel").modal('toggle');
    });

    //保存频道点击确定
    $("#btn-modify-channel-submit").click(function(){
        modifyChannel();
    });

    $('#model-modify-channel').on('shown.bs.modal', function () {
        $('#set-env-contrl-add-name').focus()
    }).on('hidden.bs.modal', function () {
        //还原菜单
        $("#modify-channel-title").text("新增频道");
        $("#set-env-contrl-add-name").val("");
        rukou.set.control.env.todo = 'add';
    });

    //---------------------------

    //保存分类
    $("a[action='setting-menu-default-cate']").click(function(){
        if(!auth.isLogin()){
            return false;
        };

        initForm.cate();
    });

    //保存分类点击确定
    $("#btn-modify-cate-submit").click(function(){
        modifyCate();
    });

    $('#model-modify-cate').on('shown.bs.modal', function () {
        $("#set-cate-contrl-add-env").val(gdkey.getCurEnv().split('_')[2]);
        $('#set-cate-contrl-add-name').focus();
    }).on('hidden.bs.modal', function () {
        //还原菜单
        $("#modify-cate-title").text("新增分类");
        $("#set-cate-contrl-add-name").val("");
        rukou.set.control.cate.todo = 'add';
    });

    //---------------------------

    //保存网址
    $("a[action='setting-menu-default-url']").click(function(){
        if(!auth.isLogin()){
            return false;
        };

        initForm.url();
    });

    //保存网址点击确定
    $("#btn-modify-url-submit").click(function(){
        modifyUrl();
    });

    $('#model-modify-url').on('shown.bs.modal', function () {
        //初始化数据
        $("#set-url-contrl-add-env").val(gdkey.getCurEnv().split('_')[2]);
        $("#set-url-contrl-add-cate").val(gdkey.getCurTab().split('_')[2]);
        $('#set-url-contrl-add-name').focus();
    }).on('hidden.bs.modal', function () {
        //还原菜单
        $("#modify-url-title").text("新增网址");
        $("#set-url-contrl-add-name").val("");
        $("#set-url-contrl-add-url").val("");
        $("#set-url-contrl-add-url").attr("disabled",false);
        $("#set-url-contrl-add-comment").val("");
        rukou.set.control.url.todo = 'add';
    });

    //---------------------------

    //删除频道
    $("a[action='setting-menu-channel-delete']").click(function(){
        rukou.set.control.env.delEnv(checkbox.checkedChannel());
    });

    //删除分类
    $("a[action='setting-menu-cate-delete']").click(function(){
        rukou.set.control.cate.delCate(checkbox.checkedCate());
    });

    //删除URL
    $("a[action='setting-menu-url-delete']").click(function(){
        rukou.set.control.url.delUrl(checkbox.checkedUrl());
    });

    //---------------------------

    //移动分类
    $("a[action='setting-menu-cate-move']").click(function(){
        initForm.move.cate();
    });

    $('#model-move-cate').on('show.bs.modal', function () {
        $("#select-move-cate-channel").val(gdkey.getCurEnv().split('_')[2]);
    });

    $('#btn-move-cate-submit').click(function () {
        $('#form-move-cate').bootstrapValidator('validate');
    });

    //移动网址
    $("a[action='setting-menu-url-move']").click(function(){
        initForm.move.url();
    });

    $('#model-move-url').on('show.bs.modal', function () {
        $("#select-move-url-channel").val(gdkey.getCurEnv().split('_')[2]);
    });

    $('#btn-move-url-submit').click(function () {
        $('#form-move-url').bootstrapValidator('validate');
    });

    var gd_url = gdkey.get("gd_url");
    if(gd_url != null && gd_url == 'list'){
        urlDisplayList();
    }else{
        urlDisplayTh();
    };

    $("#btn-display-url-list").click(function () {
        urlDisplayList();
    });

    $("#btn-display-url-th").click(function () {
        urlDisplayTh();
    });

    //新消息提醒

    var msgTime = "2016/01/28";

    (function(){
        var curDay = new Date().getTime();
        var noticeDay = new Date(msgTime).getTime();

        if(curDay-noticeDay < 3*1000*60*60*24){//3天内一直显示
            $("#gd-msg").fadeIn();
        };
    })();

    $("#gd-msg").click(function () {
        var content = "" +
            "<div class='gd-msg'>" +
                "打开本地目录Local插件有更新，增加了浏览器兼容性和稳定性。<br/>" +
                "=== 点击 <a href='download.html' class='text-blue' target='_blank'>这里</a> 下载 ===<br/>" +
                msgTime +
            "</div>";

        $.alert({
            icon : 'gede-small-title',
            title: '歌德书签',
            animation: 'zoom',
            confirmButton: '知道了',
            content: content
        });
    });
};

//用户信息-------------------------------------------------------------start
var userInfo = function () {
    $('#form-userinfo').bootstrapValidator('validate');
};

$('#form-userinfo').bootstrapValidator(checkUserInfoForm()).on('success.form.bv', function(e) {
    //关闭窗口
    $("#model-userinfo").modal('toggle');

    //原始数据
    var oldName = $("#set-user-info-name").attr('data-old');
    var oldEmail = $("#set-user-info-email").attr('data-old');

    //新数据
    var name = $("#set-user-info-name").val();
    var email = $("#set-user-info-email").val();

    //判断原始值和新值是否有变动
    if(oldName == name && oldEmail == email){
        return false;
    };

    //开始更新数据
    var url = "controller/do.php?type=user&action=edit";
    var param = {
        id:gdkey.user.getCurUserId(),
        name : name,
        email : email
    };

    $.get(url,param,function(result){
        result = util.json(result);
        util.alert(result);
    });
});

function checkUserInfoForm(){
    return {
        message: 'This value is not valid',
        fields: {
            name: {
                validators: {
                    stringLength: {
                        max : 30,
                        message: '[昵称] 不能超过30个字符！'
                    }
                }
            },
            email: {
                validators: {
                    emailAddress: {
                        message: '[邮箱] 格式不正确！'
                    },
                    stringLength: {
                        max : 30,
                        message: '[邮箱] 不能超过30个字符！'
                    }
                }
            }
        }
    }
};

//修改密码-------------------------------------------------------------start
var changePasswd = function () {
    $('#form-change-passwd').bootstrapValidator('validate');
};

$('#form-change-passwd').bootstrapValidator(checkChangePasswdForm()).on('success.form.bv', function(e) {
    //关闭窗口
    $("#model-change-passwd").modal('toggle');

    var url = "controller/do.php?type=user&action=reset";
    var param = {
        id : gdkey.user.getCurUserId(),
        passwd : $("#change-passwd-old").val(),
        newPasswd : $("#change-passwd-new").val()
    };
    $.post(url,param,function(result){
        result = util.json(result);
        util.alert(result);
    });
});

function checkChangePasswdForm(){
    return {
        message: 'This value is not valid',
        fields: {
            'passwd-old': {
                validators: {
                    notEmpty: {
                        message: '[旧密码] 不能为空！'
                    },
                    stringLength: {
                        min : 3,
                        max : 30,
                        message: '[旧密码] 3-30个字符！'
                    }
                }
            },
            'passwd-new': {
                validators: {
                    notEmpty: {
                        message: '[新密码] 不能为空！'
                    },
                    stringLength: {
                        min : 3,
                        max : 30,
                        message: '[新密码] 3-30个字符！'
                    }
                }
            },
            'passwd-new-ensure': {
                validators: {
                    notEmpty: {
                        message: '[确认密码] 不能为空！'
                    },
                    callback : {
                        message: '两次密码不一致！',
                        callback: function (fieldValue, validator, $field) {
                            if(fieldValue != '' && $("#change-passwd-new").val() != fieldValue){
                                return false;
                            };
                            return true;
                        }
                    }
                }
            }
        }
    }
};

//保存频道-------------------------------------------------------------start
var modifyChannel = function () {
    $('#form-modify-channel').bootstrapValidator('validate');
};

$('#form-modify-channel').bootstrapValidator(modifyChannelForm()).on('success.form.bv', function(e) {
    rukou.set.control.env.ok();
});

function modifyChannelForm(){
    return {
        message: 'This value is not valid',
        fields: {
            channelName: {
                validators: {
                    notEmpty: {
                        message: '[频道名称] 不能为空！'
                    },
                    stringLength: {
                        min : 1,
                        max : 100,
                        message: '[频道名称] 1-100个字符！'
                    }
                }
            }
        }
    }
};

//保存分类-------------------------------------------------------------start
var modifyCate = function () {
    $('#form-modify-cate').bootstrapValidator('validate');
};

$('#form-modify-cate').bootstrapValidator(modifyCateForm()).on('success.form.bv', function(e) {
    rukou.set.control.cate.ok();
});

function modifyCateForm(){
    return {
        message: 'This value is not valid',
        fields: {
            cateName: {
                validators: {
                    notEmpty: {
                        message: '[分类名称] 不能为空！'
                    },
                    stringLength: {
                        min : 1,
                        max : 100,
                        message: '[分类名称] 1-100个字符！'
                    }
                }
            },
            channelName: {
                validators: {
                    regexp: {
                        regexp: /^(?!-1$)/,
                        message: '[频道] 请先添加'
                    }
                }
            }
        }
    }
};

//保存URL-------------------------------------------------------------start
var modifyUrl = function () {
    $('#form-modify-url').bootstrapValidator('validate');
};

$('#form-modify-url').bootstrapValidator(modifyUrlForm()).on('success.form.bv', function(e) {
    rukou.set.control.url.ok();
});

function modifyUrlForm(){
    return {
        message: 'This value is not valid',
        fields: {
            urlName: {
                validators: {
                    notEmpty: {
                        message: '[名称] 不能为空！'
                    },
                    stringLength: {
                        min : 1,
                        max : 100,
                        message: '[名称] 1-100个字符！'
                    }
                }
            },
            urlUrl: {
                validators: {
                    notEmpty: {
                        message: '[网址] 不能为空！'
                    },
                    stringLength: {
                        min : 1,
                        max : 300,
                        message: '[网址] 1-300个字符！'
                    }
                }
            },
            urlComment: {
                validators: {
                    stringLength: {
                        min : 1,
                        max : 300,
                        message: '[备注] 1-300个字符！'
                    }
                }
            },
            channelName: {
                validators: {
                    regexp: {
                        regexp: /^(?!-1$)/,
                        message: '[频道] 请先添加'
                    }
                }
            },
            cateName: {
                validators: {
                    regexp: {
                        regexp: /^(?!-1$)/,
                        message: '[分类] 请先添加'
                    }
                }
            }
        }
    }
};

//移动CATE-------------------------------------------------------------start
$('#form-move-cate').bootstrapValidator(moveCateForm()).on('success.form.bv', function(e) {
    rukou.set.control.cate.moveCate(checkbox.checkedCate());
});

function moveCateForm(){
    return {
        message: 'This value is not valid',
        fields: {
            channelName: {
                validators: {
                    regexp: {
                        regexp: /^(?!-1$)/,
                        message: '[频道] 请先添加'
                    }
                }
            }
        }
    }
};

//移动URL-------------------------------------------------------------start
$('#form-move-url').bootstrapValidator(moveUrlForm()).on('success.form.bv', function(e) {
    rukou.set.control.url.moveUrl(checkbox.checkedUrl());
});

function moveUrlForm(){
    return {
        message: 'This value is not valid',
        fields: {
            channelName: {
                validators: {
                    regexp: {
                        regexp: /^(?!-1$)/,
                        message: '[频道] 请先添加'
                    }
                }
            },
            cateName: {
                validators: {
                    regexp: {
                        regexp: /^(?!-1$)/,
                        message: '[分类] 请先添加'
                    }
                }
            }
        }
    }
};


//url平铺或者list显示
var urlDisplayTh = function () {
    $("#gd_nav").removeClass("display-url-list");
    $("#btn-display-url-th").addClass("active").siblings().removeClass("active");
    gdkey.set("gd_url","th");
};

var urlDisplayList = function () {
    $("#gd_nav").addClass("display-url-list");
    $("#btn-display-url-list").addClass("active").siblings().removeClass("active");
    gdkey.set("gd_url","list");
};