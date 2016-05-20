$(function() {
	var sex = ['', '男', '女'];
	var op = '<div class="btn-group">' + 
			'<button type="button" class="btn btn-primary btn-sm" data-toggle="modal">添加</button>' + 
			'<button type="button" class="btn btn-warning btn-sm">删除</button>' + 
			'<button type="button" class="btn btn-info dropdown-toggle btn-sm" data-toggle="dropdown">查看' + 
			'<span class="fa fa-caret-down"></span>' + 
			'</button>' + 
			'<ul class="dropdown-menu">' + 
			'<li><a href="#" onclick="showRecord(this)">文明记录</a></li>' + 
			'<li><a href="#" onclick="showExchangeRecord(this)">兑换记录</a></li>' + 
			'</ul>' + 
			'</div>';
	// 加分/减分
	var isPlus = true;
	// 选中列
	var chosenRow;
	
	// 页面表格的公共定义部分
	$.extend( $.fn.dataTable.defaults, {
		
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
	
	// 页面的士列表的表格定义
	var t = $("#driver-table").DataTable({
		order: [],
		columns : [
			{"data": "id", "width": "60"},
			{"data": "name"},
			{
				"data": null,
				"width": "70",
				"render": function(data, type, row) {
					return sex[row.sex];
				}
			},
			{"data": "phone", "width": "100"},
			{"data": "company"},
			{"data": "carno", "width": "100"},
			{"data": "qcno"},
			{"data": "score", "width": "60"},
			{
				"data": null,
				"render": function(data, type, row) {
					return op;
				}
			},
		]
	});
	
	// 文明记录列表的表格定义
	var tt = $("#score-table").DataTable({
		columns : [
			{"data": "id", "width": "40"},
			{"data": "name"},
			{"data": "htime"},
			{
				"data": null, 
				"width": "10",
				"render": function(data, type, row) {
					if(isPlus) {
						return '<span class="badge bg-red">+' + row.score + '</span>';
					} else {
						return '<span class="badge bg-light-blue">-' + row.score + '</span>';
					}
				}
			},
		]
	});
	
	// 添加记录popup页面日期时间选择器定义
	$("#datetimepicker").datetimepicker({
		format: 'yyyy-mm-dd hh:ii',
		autoclose: true,
	});
	
	// 添加的士Vue.js的实例
	var newDriverForm = new Vue({
		el: "#new-driver-modal",
		data: {
			driverName: "",
			driverSex: "1",
			driverPhone: "",
			company: "",
			qcno: "",
			carno: "",
		},
		methods: {
			// 添加的士
			newDriver: function(event) {
				var carno = this.carno.toUpperCase();
				// 表单数据检查
				if(_isStringNull($.trim(this.driverName))) return layer.msg("请填写姓名");
				if(_isStringNull(this.driverSex)) return layer.msg("请选择性别");
				if(_isStringNull($.trim(this.driverPhone))) return layer.msg("请填写电话");
				if(_isStringNull($.trim(this.company))) return layer.msg("请填写所在公司");
				if(_isStringNull($.trim(this.qcno))) return layer.msg("请填写从业资格证号");
				if(_isStringNull($.trim(this.carno))) return layer.msg("请填写车牌");
				if(!_isCellPhoneNumber(this.driverPhone) && !_isTelephoneNumber(this.driverPhone)) return layer.msg("电话号码格式错误");
				if(carno.indexOf("浙L") < 0) return layer.msg("车牌号格式错误");
				
				// 文明的士登记
				_callAjax({
					"cmd": "newDriver",
					"openid": "pcwebpage",
					"name": $.trim(this.driverName),
					"sex": this.driverSex,
					"phone": $.trim(this.driverPhone),
					"qcno": $.trim(this.qcno),
					"company": $.trim(this.company),
					"carno": carno,
					"remark": "无"
				}, function(d) {
					layer.msg(d.errMsg);
					if(d.success) {
						// 新增数据写入页面表格
						var obj = new Object();
						obj.id = d.data;
						obj.name = newDriverForm.$get("driverName");
						obj.sex = newDriverForm.$get("driverSex") - "0";
						obj.phone = newDriverForm.$get("driverPhone");
						obj.company = newDriverForm.$get("company");
						obj.carno = carno;
						obj.qcno = newDriverForm.$get("qcno");
						obj.score = 0;
						t.row.add(obj).draw();
						// 关闭popup页面
						$('#new-driver-modal').modal('toggle');
					}
				})
			}
		}
	});
	
	// 添加文明记录Vue.js的实例
	var addRecordForm = new Vue({
		el: "#new-record-modal",
		data: {
			content: "",
			time: "",
			score: ""
		},
		methods: {
			// 添加文明记录
			addRecord: function(event) {
				var s = $.trim(this.score) - "0";
				console.log(this.content, this.time, this.score - "0");
				// 表单数据检查
				if(_isStringNull($.trim(this.content))) return layer.msg("请填写内容");
				if(_isStringNull($.trim(this.time))) return layer.msg("请选择时间");
				if(_isStringNull($.trim(this.score))) return layer.msg("请填写积分");
				if(!_isNumber($.trim(this.score))) return layer.msg("请填写一个1~50之间的整数积分");
				if(s < 0 || s > 50) return layer.msg("请填写一个1~50之间的整数积分");
				
				// 添加文明记录
				_callAjax({
					"cmd": "newGoodRecord",
					"name": $.trim(this.content),
					"hTime": $.trim(this.time),
					"score": $.trim(this.score),
					"rType": 1,
					"texiId": t.row(chosenRow).data().id,
					"lafId": "null"
				}, function(d) {
					layer.msg(d.errMsg);
					if(d.success) {
						var obj = t.row(chosenRow).data();
						obj.score = obj.score + (addRecordForm.$get("score") - "0");
						// 更新页面商家列表中对应行
						t.row(chosenRow).data(obj).draw();
						// 关闭添加文明记录popup页面
						$('#new-record-modal').modal('toggle');
					}
				})
			}
		}
	})
	
	// 查看兑换记录、文明记录popup页面隐藏时
	$('#record-modal').on('hidden.bs.modal', function () {
		// 清除页面数据
		tt.clear().draw();;
	});
	
	// 添加的士popup页面隐藏时
	$('#new-driver-modal').on('hidden.bs.modal', function () {
		// 清除页面数据
		newDriverForm.$set("driverName", "")
		newDriverForm.$set("driverSex", "1")
		newDriverForm.$set("driverPhone", "")
		newDriverForm.$set("company", "")
		newDriverForm.$set("carno", "")
		newDriverForm.$set("qcno", "")
	});
	
	// 添加文明记录popup页面隐藏时
	$('#new-record-modal').on('hidden.bs.modal', function () {
		// 清除页面数据
		addRecordForm.$set("content", "");
		addRecordForm.$set("time", "");
		addRecordForm.$set("score", "");
		// 清空选中列
		chosenRow = null;
	});
	
	// 显示当前司机文明记录
	showRecord = function(d) {
		var curRow = $(d).parents('tr');
		// 获取当前行的数据
		var rowData = t.row(curRow).data();
		isPlus = true;
		// 取当前司机文明记录
		_callAjax({
			"cmd": "getGoodRecords",
			"texiId": rowData.id
		}, function(d) {
			if(d.success) {
				// 后台有数据的情况下绘制表格
				if(null != d.data && d.data.length > 0) {
					// 每一条数据添加行到表格
					d.data.forEach(function(r) {
						tt.row.add(r);
					});
					tt.draw();
				}
			} else {
				layer.msg(d.errMsg);
			}
		})
		// 打开记录popup页面
		$('#record-modal').modal('toggle');
	}
	
	// 显示当前司机兑换记录
	showExchangeRecord = function(d) {
		var curRow = $(d).parents('tr');
		// 获取当前行的数据
		var rowData = t.row(curRow).data();
		isPlus = false;
		// 取当前司机兑换记录
		_callShopAjax({
			"cmd": "getOrders",
			"open_id": rowData.qcno
		}, function(d) {
			if(d.success) {
				// 后台有数据的情况下绘制表格
				if(null != d.data && d.data.length > 0) {
					// 每一条数据添加行到表格
					d.data.forEach(function(r) {
						tt.row.add(r);
					});
					tt.draw();
				}
			} else {
				layer.msg(d.errMsg);
			}
		})
		// 打开记录popup页面
		$('#record-modal').modal('toggle');
	}
	
	// 添加文明记录
	doAddRecord = function() {
		// 获取当前行
		chosenRow = $(this).parents().parents().parents('tr');
		// 打开添加文明记录popup页面
		$('#new-record-modal').modal('toggle');
	}
	
	// 删除当前文明的士信息
	doDelete = function() {
		var curRow = $(this).parents().parents().parents('tr');
		// 获取当前行的数据
		var rowData = t.row(curRow).data();
		// 删除操作提示框
		layer.confirm(
			"的士信息删除后将无法恢复，是否确认删除？", 
			{icon: 3, title:"删除操作确认"}, 
			function(index) {
				// 删除本条失物信息
				_callAjax({
					"cmd": "removeTexiDriver",
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
			// 后台有数据的情况下绘制表格并绑定click事件
			if(null != d.data && d.data.length > 0) {
				// 每一条数据添加行到表格
				d.data.forEach(function(r) {
					t.row.add(r);
				});
				t.draw();
//				// 绑定列表中每一条数据文明记录按钮点击的事件
//				$('#driver-table tbody').on('click', '.bg-aqua', showRecord);
//				// 绑定列表中每一条数据兑换记录按钮点击的事件
//				$('#driver-table tbody').on('click', '.bg-teal', showExchangeRecord);
				// 绑定列表中每一条数据添加按钮点击的事件
				$('#driver-table tbody').on('click', '.btn-primary', doAddRecord);
				// 绑定列表中每一条删除添加按钮点击的事件
				$('#driver-table tbody').on('click', '.btn-warning', doDelete);
			}
		} else {
			layer.msg(d.errMsg);
		}
	}
	
	// 初始化页面数据
	init = function() {
		_callAjax({
			"cmd": "getAllDrivers"
		}, fillPageTable)
	}
	init();
});