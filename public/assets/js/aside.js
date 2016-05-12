$(function(){
	//加载页面
	$('.sidebar-menu li').on('click',function(){
		var page = $(this).attr('data-page');
		$(this).addClass('active').siblings().removeClass('active');
		
		if(page){
			_loadPage(page);
		}else{
			return false;
		}
	})
})
