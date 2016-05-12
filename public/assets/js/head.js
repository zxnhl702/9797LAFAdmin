$(function(){
	//sign out
	$('.sign-out').on('click',function(){
		layer.confirm('是否退出后台?',{
			btn:['确定','取消']
		},function(){
			layer.msg('成功退出');
			logout();
		})
	});
	
	var logout = function() {
		_del_cookie("nick");
		location.href = "login.html";
	}
	
	// goods admin
	$('#goToGoods').on('click', function() {
		location.href = "http://" + window.location.hostname + ":11004";
	})
	
	// change password
	$('#changePwd').on('click', function() {
		layer.open({
			type:1,
//			skin:'layer-ext-moon',
			area:['260px','320px'],
			title:'修改密码',
			btn:['修改','取消'],
			content:'<div class="form-group"></div>' + 
					'<div class="col-xs-10">' +
						'<label>当前密码</label>' + 
						'<input id="pwd" type="password" maxlength="20" class="form-control" />' + 
					'</div>' + 
					'<div class="form-group"></div>' + 
					'<div class="col-xs-10">' +
						'<label>新密码</label>' + 
						'<input id="newpwd" type="password" maxlength="20" class="form-control" />' + 
					'</div>' + 
					'<div class="form-group"></div>' + 
					'<div class="col-xs-10">' +
						'<label>确认密码</label>' + 
						'<input id="pwdconfirm" type="password" maxlength="20" class="form-control" />' + 
					'</div>',
			yes:function(index, layero){
				var password = layero.find('#pwd').val();
				var newpwd = layero.find('#newpwd').val();
				var confirm = layero.find('#pwdconfirm').val();
				var username = _get_cookie("admin");
				// 数据检测
				if(_isStringNull(password)) return layer.msg("请输入当前密码！");
				if(_isStringNull(newpwd)) return layer.msg("请输入新密码！");
				if(_isStringNull(confirm)) return layer.msg("请再次输入密码！");
				if(newpwd != confirm) return layer.msg("确认密码输入不一致！");
				// 后台修改密码
				_callAjax({
					"cmd": "changepassword",
					"username": username,
					"password": password,
					"newpwd": newpwd
				}, function(d) {
					if(d.success) {
						layer.msg("修改密码成功，请重新登陆");
						setTimeout(logout, 1500);
					} else {
						layer.msg("修改密码失败");
					}
				})
			}
		});
	})
})