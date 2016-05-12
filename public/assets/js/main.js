$(function() {
	var sex = ['', '男', '女'];
	// 页面表格定义
	var t = $("#item-table").DataTable({
		order: [],
		columns : [
			{"data": "id", "width": "80"},
			{"data": "name"},
			{
				"data": null,
				"width": "80",
				"render": function(data, type, row) {
					return sex[row.sex];
				}
			},
			{"data": "phone"},
			{"data": "losttime"},
			{"data": "dept", "width": "120"},
			{"data": "dest", "width": "120"},
			{"data": "num", "width": "120"},
			{"data": "pos"},
			{
				"data": null,
				"render": function(data, type, row) {
					var op = '<div class="btn-group">' + 
							'<button type="button" class="btn btn-info btn-sm"  data-container="body"  data-trigger="focus"  data-toggle="popover" ' + 
							'data-placement="top" data-content="' + row.description + '">失物描述</button>' + 
							'<button type="button" class="btn btn-warning btn-sm">删除</button></div>';
					return op;
				}
			},
		],
		language: {
			"sProcessing": "处理中...",
			"sLengthMenu": "显示 _MENU_ 项结果",
			"sZeroRecords": "没有匹配结果",
			"sInfo": "显示第 _START_ 至 _END_ 项结果，共 _TOTAL_ 项",
			"sInfoEmpty": "显示第 0 至 0 项结果，共 0 项",
			"sInfoFiltered": "(由 _MAX_ 项结果过滤)",
			"sInfoPostFix": "",
			"sSearch": "搜索:",
			"sUrl": "",
			"sEmptyTable": "表中数据为空",
			"sLoadingRecords": "载入中...",
			"sInfoThousands": ",",
			"oPaginate": {
				"sFirst": "首页",
				"sPrevious": "上一页",
				"sNext": "下一页",
				"sLast": "末页"
			},
			"oAria": {
				"sSortAscending": ": 以升序排列此列",
				"sSortDescending": ": 以降序排列此列"
			}
		}
	});
	
	// 删除失物信息
	doDelete = function() {
		curRow = $(this).parents().parents().parents('tr');
		// 获取当前行的数据
		var rowData = t.row(curRow).data();
		// 删除操作提示框
		layer.confirm(
			"失物信息删除后将无法恢复，是否确认删除？", 
			{icon: 3, title:"删除操作确认"}, 
			function(index) {
				// 删除本条失物信息
				_callAjax({
					"cmd": "deleteLostAndFount",
					"id": rowData.id
				}, function(d) {
					layer.msg(d.errMsg);
					if(d.success) {
						// 页面表格相应行删除
						t.row(curRow).remove().draw( false );
					}
				})
				layer.close(index);
			}
		);
	}
	
	// 填充页面表格
	fillPageTable = function(d) {
		if(d.success) {
			// 后台有数据的情况下绘制分类列表并绑定click事件
			if(null != d.data && d.data.length > 0) {
				// 每一条数据添加行到表格
				d.data.forEach(function(r) {
					t.row.add(r);
				});
				t.draw();
				// 弹出失物描述
				$('[data-toggle="popover"]').popover();
				// 绑定列表中每一条数据删除按钮点击的事件
				$('#item-table tbody').on('click', '.btn-warning', doDelete);
			}
		} else {
			layer.msg(d.errMsg);
		}
	}
	
	// 初始化页面数据
	init = function() {
		// 检查登陆信息
		if(undefined == _get_cookie("nick") && null == _get_cookie("nick")) {
			layer.msg("请重新登陆");
			location.href = "login.html";
		} else {
			// 用户名
			var username = _get_cookie("admin");
			var nickname = _get_cookie("nick");
			$("#headUser").text(nickname);
			$("#asideUser").text(nickname);
			
			// 初始化页面数据
			_callAjax({
				"cmd": "getAllLostAndFound"
			}, fillPageTable)
		}
	}
	init();
});