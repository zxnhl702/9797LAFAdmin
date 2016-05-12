$(function() {
	var isSavedPasw = _get_cookie("isSavedPasw");
	if (1 == isSavedPasw) {
		$("#remember").attr("checked","checked");
		$("#name").val(_get_cookie("admin"));
		$("#password").val(_get_cookie("password"));
	} else {
		$("#remember").removeAttr("checked");
	}
	
	var doLogin = function() {
		var name = $("#name").val().replace(/\s/g, '');
		var pasw = $("#password").val().replace(/\s/g, '');
		if (name == '' || pasw == '') return layer.msg("请输入完整信息");

		if ($("#remember").get(0).checked) {
			_set_cookie("isSavedPasw", 1, 5*365);
			_set_cookie("password", pasw, 5*365);
		} else {
			_set_cookie("isSavedPasw", 0, 5*365);
		}

		// 登陆
		_callAjax({
			"cmd": "login",
			"name": name,
			"password": pasw
		}, function(d) {
			if(d.success) {
				_set_cookie("admin", d.data.name, 5*365);
				_set_cookie("nick", d.data.nick);
				location.href = "index.html";
			} else {
				layer.msg(d.errMsg);
			}
		})
	}
	
	$("#login").on('click', doLogin);
	$(".login-form").on('keypress', function(event) {
		if(event.keyCode == 13) {
			doLogin();
		}
	});
});
