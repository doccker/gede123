$(function () {
    $("body").fadeIn();

    //tab 切换
    $("#login-tab").tab();

    //hover提示
    $(".form-control-feedback").popover({
        container: 'body',
        trigger : 'hover'
    });

    //hover提示，在弹出框上
    $(".form-control-modal-tip").popover({
        container: '.modal',
        trigger : 'hover'
    });

    //点击找回密码
    $("#btn-forget").click(function () {
        $("#model-forget").modal('toggle');
    });

    //登录
    $("#gd_rukou_tab_login_submit").click(function(){
        login();
    });

    //key登录
    $("#login-username,#login-passwd").keydown(function(event){
        var key = event.keyCode;
        if(key == 13){
            login();
        }
    });

    //注册
    $("#gd_rukou_tab_register_submit").click(function(){
        register();
    });

    //重置密码
    $("#gd_rukou_tab_reset_submit").click(function(){
        reset();
    });
});

//登录-------------------------------------------------------------start

var login = function () {
    $('#form-login').bootstrapValidator('validate');
};


$('#form-login').bootstrapValidator(checkLoginForm()).on('success.form.bv', function(e) {
    //清空基础数据
    gdkey.remove("gd_user");
    gdkey.remove("gd_env");

    gdkey.removeAll();

    var url = "controller/do.php?type=rukou&action=login";
    var param = {
        username:$("#login-username").val(),
        passwd:$("#login-passwd").val()
    };

    $("#gd_rukou_tab_login_submit").addClass('disabled').text("登录中...");
    $.get(url,param,function(result){
        if(result){
            gdkey.set("gd_user",result);

            //设置样式
            gdStyle.change(result.split(',')[4]);

            location.href = "/";
        }else{
            $.alert({
                title: false,
                animation: 'scalex',
                content: '<div class="gede-small-content"><span class="text-danger">用户名或者密码错误!<span></div>',
                cancelButton: false,
                confirmButton: false
            });
            $("#gd_rukou_tab_login_submit").removeClass('disabled').text("登 录");
        };
    });
});

function checkLoginForm(){
    return {
        message: 'This value is not valid',
        fields: {
            username: {
                validators: {
                    notEmpty: {
                        message: '[用户名] 不能为空！'
                    }
                }
            },
            passwd: {
                validators: {
                    notEmpty: {
                        message: '[密码] 不能为空！'
                    }
                }
            }
        }
    }
};

//注册-------------------------------------------------------------start

var register = function () {
    $('#form-register').bootstrapValidator('validate');
};

$('#form-register').bootstrapValidator(checkRegisterForm()).on('success.form.bv', function(e) {

    $("#gd_rukou_tab_register_submit").addClass("disabled").val("处理中...");

    //注册
    var url = "controller/do.php?type=rukou&action=register";
    var param = {
        username:$("#reg-username").val(),
        passwd:$("#reg-passwd").val(),
        name:$("#reg-name").val(),
        email:$("#reg-email").val()
    };
    $.post(url,param,function(result){
        result = util.json(result);
        util.alert(result);
        $("#gd_rukou_tab_register_submit").removeClass("disabled").val("注 册");

        //成功后跳转到登录tab
        if(result.success){
            $('#login-tab a:first').tab('show') // Select first tab
        };
    });
});

function checkRegisterForm(){
    return {
        message: 'This value is not valid',
        fields: {
            username: {
                validators: {
                    notEmpty: {
                        message: '[用户名] 不能为空！'
                    },
                    stringLength: {
                        min : 3,
                        max : 30,
                        message: '[用户名] 3-30个字符！'
                    },
                    regexp: {
                        regexp: /^[a-zA-Z0-9_.-]{1,}$/,
                        message: '[用户名] 只允许为数字、字母、下划线、中划线和点'
                    }
                }
            },
            passwd: {
                validators: {
                    stringLength: {
                        min : 3,
                        max : 30,
                        message: '[密码] 3-30个字符！'
                    },
                    notEmpty: {
                        message: '[密码] 不能为空！'
                    }
                }
            },
            repasswd: {
                validators: {
                    notEmpty: {
                        message: '[确认密码] 不能为空！'
                    },
                    callback : {
                        message: '两次密码不一致！',
                        callback: function (fieldValue, validator, $field) {
                            if(fieldValue != '' && $("#reg-passwd").val() != fieldValue){
                                return false;
                            };
                            return true;
                        }
                    }
                }
            },
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

//重置密码-------------------------------------------------------------start

var reset = function () {
    $('#form-reset').bootstrapValidator('validate');
};

$('#form-reset').bootstrapValidator(checkResetForm()).on('success.form.bv', function(e) {
    $("#model-forget").modal('toggle');

    var url = "controller/do.php?type=forget&action=passwd";
    var param = {
        username : $("#forget-passwd-name").val(),
        email : $("#forget-passwd-email").val(),
        passwd : $("#forget-passwd-passwd").val()
    };

    $.post(url,param,function(result){
        result = util.json(result);
        util.alert(result);
    });
});

function checkResetForm(){
    return {
        message: 'This value is not valid',
        fields: {
            username: {
                validators: {
                    notEmpty: {
                        message: '[用户名] 不能为空！'
                    }
                }
            },
            email: {
                validators: {
                    notEmpty: {
                        message: '[邮箱] 不能为空！'
                    },
                    emailAddress: {
                        message: '[邮箱] 格式不正确！'
                    }
                }
            },
            passwd: {
                validators: {
                    notEmpty: {
                        message: '[密码] 不能为空！'
                    },
                    stringLength: {
                        min : 3,
                        max : 30,
                        message: '[密码] 3-30个字符！'
                    }
                }
            },
            repasswd: {
                validators: {
                    notEmpty: {
                        message: '[确认密码] 不能为空！'
                    },
                    callback : {
                        message: '两次密码不一致！',
                        callback: function (fieldValue, validator, $field) {
                            if(fieldValue != '' && $("#forget-passwd-passwd").val() != fieldValue){
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
