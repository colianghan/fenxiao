/*
 *@autor hgl 
 *@description 登陆
 */
var origin = (window.location.origin.indexOf('fenxiao8') != -1) ? window.location.origin + '/distributor-manager/html/' : '';
String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$|^\,+|\,+$/gi, '');
};
$(
    function () {

        //获取 cookie值
        var $nick = $.cookie('nike');
        var $password = $.cookie('password');
        if ($nick) {
            $('#nick').val($nick);
        }
        if ($password) {
            $('#password').val($password);
        }
        /***********************************************  valadite  *************************************************************/
        var valadite = { // 创建数组
            phone: function (str, msgElement) { // 获取手机号码框的信息
                if (str != null && /^1[3|4|5|8]\d{9}$/.test(str)) { // 判断手机号码没有非法字符
                    return true; // 返回正确
                }
                msgElement.show().text("请输入正确手机号"); // 手机信息错误，强出错误提醒
                return false;
            },
            loginPassWord: function (password, msgElement) { // 获取登入密码的信息
                if (/^[a-z|0-9]{6,16}$/.test(password)) { // 判断密码信息不会不会确
                    //$("#msg_loginPassWord").hide().text(""); // 清空文字
                    return true;
                }
                msgElement.show().text("密码不合符要求"); // 密码不符合要求
                return false;
            },
            nick: function (str, msgElement) { // 获取旺旺名称的事件
                var charLen = str.replace(/[\u4e00-\u9fa5]/g, 'xx').length; // 获取旺旺名称的除非法字符的长度
                if (charLen < 2 || charLen > 30) { // 判断旺旺名称长度是否符合
                    msgElement.show().text("您的淘宝账号长度不符合哦~_~"); // 显示提示信息
                    return false;
                }
                var illegal = '~!@#$%^&*()<>/;；-+|’,，?？=:：'; // 获取旺旺存在的非法字符
                var illegalArray = illegal.split(''); // 把旺旺存在的非法字符变成数组
                for (var i = 0; i < illegalArray.length; i++) { // 循环数组
                    if (str.indexOf(illegalArray[i]) != -1) { // 获取旺旺存在的每个非法字符
                        msgElement.show().text("您输入的淘宝账号名包含非法字符:" + illegalArray[i]);// 显示提示信息，加旺旺名称中存在的非法字符
                        return false;
                    }
                }
                return true;
            },
            repeatPassWord: function (password, password_repeat, msgpassword, msgpassword_re) {// 获取注册密码区的事件
                if (password.length < 6 || password.length > 15) { // 判断密码不能为空，且在6-16字符之间，不能存在非法字符
                    msgpassword.show().text("密码长度不够"); // 弹出密码不符合要求
                    return false;
                }
                if (/(^[a-z]{6,16}$)|(^\d{6,16}$)/gi.test(password)) {
                    msgpassword.show().text("密码不能为全英文或全数字不能有非法字符"); // 弹出密码不符合要求
                    return false;
                }
                ;
                if (password != password_repeat) { // 判断确认密码区与密码是否一样
                    msgpassword_re.show().text("密码和确认密码不一致"); // 弹出大次输入密码与先前密码不一致
                    return false;
                } else {
                    return true;
                }
                ;

            },
            code: function (str, msgElement) { // 获取验证码事件
                if (!/^\d{6}$/gi.test(str)) { // 判断是6位数字且不存在非法字符
                    msgElement.show().text("输入6位数字"); // 弹出提示信息
                    return false;
                }
                return true;
            },
            login_code: function (str, msgElement) {
                if (!str) {
                    msgElement.text('请输入验证码');
                    return false;
                }
                if (str.length > 4) {
                    msgElement.text('请正确输入验证码');
                    return false;
                }
                return true;
            }

        };

        /*****************************************  login  ***************************************************************/
            //登陆按钮实现
        $('.login').click(function (e) {
            //登陆
            e = e || event;
            e.preventDefault();//阻止页面表单提交
            var nick = checkInput($('#nick')) ? $('#nick').val().trim() : '';
            var password = checkInput($('#password')) ? $('#password').val().trim() : '';
            var isWriteCookie = $('#writeCookie').prop('checked');
            var code = checkInput($('#code')) ? $('#code').val().trim() : '';
            var $time;
            if (valadite.nick(nick, $('.nick-info')) && valadite.loginPassWord(password, $('.password-info')) && valadite.login_code(code, $('.code-info'))) {
                $.ajax({
                    url: origin + 'supplierLogon.htm',
                    data: {
                        nick: nick,
                        password: password,
                        code: code
                    },
                    type: 'GET',
                    dataType: 'json',
                    beforeSend: function () {
                        var $html = '正在登陆';
                        $('.login').prop('disabled', true).val($html);
                        var i = 0;
                        $time = setInterval(function () {
                            i++;
                            if (i > 3)
                                i = 0;
                            var _inerHtml = '正在登陆' + ('...'.substring(0, i));
                            $('.login').val(_inerHtml);
                        }, 1000);
                    },
                    error: function (re_data) {
                        //loginTime(".login_btn",flag);
                        alert('系统繁忙，请重新登录..');
                    },
                    success: function (re_data) {
                        //loginTime(".login_btn",flag);
                        var _obj = re_data;
                        if (_obj.success) {
                            if (isWriteCookie) {
                                $.cookie('nike', nick, { expires: 7 });
                                $.cookie('password', password, { expires: 7 });
                            }
                            window.location.href = origin + "index.html?" + 'nick=' + encodeURI(nick) + '&';// 跳转到网页
                            // window.location.href = window.location.href.replace("login.html", 'home.html?') + 'nick=' + encodeURI(nick) + '&';// 跳转到网页
                        } else {
                            if (_obj.message.indexOf('验证码') >= 0) {
                                $('.code-info').text(_obj.message);
                                $('.refrsh-code').trigger('click');
                                return;
                            }
                            $('.password-info').text(_obj.message);
                        }
                    },
                    complete: function () {
                        clearInterval($time);
                        $('.login').prop('disabled', false).val('立即登陆');
                    }
                });
            }
        });

        /*********************************************** forget password  **********************************************************************/

            //发送手机验证码
        function getSupplierCheckCode(mobilePhone) {
            $.ajax({
                url: origin + 'getSupplierCheckCode.htm?mobilePhone=' + mobilePhone,
                type: 'GET',
                dataType: 'json',
                success: function () {
                }
            });
        }

        //验证码
        $("#sendCheckCodeForResetPassword").click(
            function () { // 点击"发送验证码"的事件
                var mobile = $("#alterMoblie").val().trim();
                if (!valadite.phone(mobile, $(".alterMoblie-info"))) {// 判断手机号码是否正确
                    return;
                }
                var that = $(this); // 获取自己
                if (that.attr('title') == "正在向您发送验证码，并等待您的验证") { // 判断自己是否有相应的title值
                    return;
                }
                getSupplierCheckCode(mobile);
                countdown($('.count-down'), that); // 调用验证码倒计时方法
                that.attr("title", "正在向您发送验证码，并等待您的验证").text("等待校验..."); // 自己添加title属性和改变文本
            });
        function countdown(ele, sendCodeEle) { // 验证码获取倒计时的方法
            var count = 60; // 生成时间60的变量
            ele.show(); // 显示存放验证码提示信息的容器
            var si = setInterval(function () { // 时间方法
                ele.text("已向您的手机发送验证码，" + count + "秒后可重新发送"); // 放入提示文字
                count--; // 时间递减
                if (count == -1) { // 判断时间值是否为-2
                    sendCodeEle.attr("title", "").text("发送验证码"); // 清空“发送验证码”的title值，还原文字为“发送验证码”
                    clearInterval(si); // 停止si时间方法
                    ele.hide(); // 隐藏存放验证码提示信息的容器
                    ele.text("已向您的手机发送验证码，60秒后可重新发送"); // 还原文字
                    return false;
                }
            }, 1000); // 1000为1秒，一秒执行一次
        }

        //点击确定
        $('.alterPassWordOK').click(function (e) {
            e = e || event;
            e.preventDefault();//组织表单提交
            var nick = checkInput($('#alterNick')) ? $('#alterNick').val().trim() : ''; //昵称
            var mobile = checkInput($('#alterMoblie')) ? $('#alterMoblie').val().trim() : ''; //手机号码
            var checkCode = checkInput($('#alterCheckCode')) ? $('#alterCheckCode').val().trim() : ''; //验证码
            var password = checkInput($('#alterPassword')) ? $('#alterPassword').val().trim() : ''; //密码
            var checkPass = checkInput($('#alterCheckPass')) ? $('#alterCheckPass').val().trim() : ''; //确认密码
            var tag = valadite.nick(nick, $(".alterNick-info"))
                && valadite.phone(mobile, $(".alterMoblie-info"))
                && valadite.code(checkCode, $(".alterCheckCode-info"))
                && valadite.repeatPassWord(password, checkPass, $(".alterPassword-info"), $(".alterCheckPass-info"));
            if (tag) {
                $.ajax({
                    url: origin + 'resetPassword.htm',
                    data: {
                        nick: nick,
                        mobilePhone: mobile,
                        password: password,
                        supplierCode: checkCode
                    },
                    type: 'GET',
                    dataType: 'json',
                    beforSend: function () {
                        $('.alterPassWordOK').prop('disabled', true);
                    },
                    success: function (re_data) {
                        var r = re_data.message;
                        if (r == "") {
                            alert("重置密码成功");
                            /*$("#resetPassWord").addClass("none");
                             $("#checkCodeRemind_reset").hide();
                             $("#resetPassWord").find(".password_info").show().end().find("input").val("");*/
                        } else if (r == "验证码错误") {
                            $(".alterCheckCode-info").text("验证码错误");
                        } else if (r == "用户名与手机号码不一致") {
                            $(".alterNick-info").text("用户名与手机号码不一致");
                        } else {
                            $(".alterNick-info").text("此账号已过期");

                        }
                    },
                    complete: function () {
                        $('.alterPassWordOK').prop('disabled', false);
                    }
                });
            }
        });

        /************************************************* main struct  **************************************************************************/


            //点击忘记密码 显示修改密码模块
        $('.forgetPassword').click(function (e) {
            e = e || event;
            e.preventDefault();
            $('#login-main').hide();
            $('#forget-main').show();
        });


        //点击 取消 显示 登陆模块
        $('.alterPassWordCansle').click(function (e) {
            e = e || event;
            e.preventDefault();
            $('#login-main').show();
            $('#forget-main').hide();
        });
        //给所有的input添加placeholder属性
        $('input').focus(function () {
            var that = $(this);
            var value = that.val().trim();
            var _content = that.data('placeholder');
            if (value == _content) {
                that.val('');
            }
        }).blur(function () {
            var that = $(this);
            var value = that.val().trim();
            var _content = that.data('placeholder');
            if (value == '') {
                that.is(':password') && that.attr('type', 'text').focus(function () {
                    $(this).attr('type', 'password');
                });
                that.val(_content);
            }
        }).trigger('focus').focus(function () {
            //隐藏提示消息
            var _id = $(this).attr('id');
            $('.' + _id + '-info').text('');
        });

        $('#forget-main').hide();

        //回车触发表单提交
        $('#login-main-ul input').keyup(function (e) {
            e = e || event;
            var key = e.which;
            if (key == 13) {
                $('.login').trigger('click');
            }
        });
        $('#forget-main input').keyup(function (e) {
            e = e || event;
            var key = e.which;
            if (key == 13) {
                $('.alterPassWordOK').trigger('click');
            }
        });

        //图片滚动播放
        (function () {
            var width = $(window).width();
            setInterval(function () {
                var $contain = $('.bg > div:first');
                $contain.animate({marginLeft: -width}, 1200, function () {
                    $contain.next().insertBefore($contain);
                    $contain.css({marginLeft: 0});
                });
            }, 10000);
        })();

        //验证是否输入
        function checkInput(ele) {
            //var sourceData=ele.data('placeholder');
            var sourceData = ele.val();
            if (sourceData) {
                return true;
            }
            return false;
        }

        //js实现@media的功能 兼容ie8/7
        $(window).resize(_resize);
        function _resize() {
            var width = $(window).width();
            if (width < 1024) {
                $('.bg').css({
                    'background-position': '-783px 0px',
                    'width': '990px'
                });
            }
            else {
                $('.bg').css({
                    'background-position': 'center',
                    'width': '100%'
                });
            }
        };
        _resize();

        //忘记密码
        $('.forgetPassword').click(function (e) {
            e.preventDefault();
            alert('亲，请联系客服进行密码重置O(∩_∩)O~');
        });

        //刷新验证码
        $('.refrsh-code').click(function (e) {
            e.preventDefault();
            var img = $(this).prev();
            img.attr('src', origin + 'getValidateCode.htm?=' + (new Date().toTimeString()));
        }).trigger('click');
    });

