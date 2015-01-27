/*var dm = angular.module('distributManager',['ngTable','ngRoute','ngAnimate','ngSanitize','distributManagerTemplate']);*/
dm.config(['$routeProvider','$sceDelegateProvider',function($routeProvider,$sceDelegateProvider){
	$routeProvider
		.when('/index',{
			templateUrl:'../html/home.html',
			controller:'index'
		})
		.when('/recruit',{
			templateUrl:'../html/recruit.html',
			controller:'recruit'
		})
		.when('/manage',{
			templateUrl:'../html/manage.html',
			controller:'manage'
		})
		.when('/improve',{
			templateUrl:'../html/improve.html',
			controller:'improve'
		})
		.when('/behavior',{
			templateUrl:'../html/behavior.html',
			controller:'behavior'
		})
		.when('/settings',{
			templateUrl:'../html/settings.html',
			controller:'settings'
		})
		.otherwise({
			redirectTo:'/index'
		});
	$sceDelegateProvider.resourceUrlWhitelist([
	    // Allow same origin resource loads.
	    'self',
	    // Allow loading from our assets domain.  Notice the difference between * and **.
	    'http://*.taobao.com/**'
	]);
}]);

dm.controller('layout',['$rootScope','$scope','$route','$location',function($rootScope,$scope,$route,$location){
	/*用于监听事件 进行controller间的数据交互*/
	$rootScope.$on('$routeChangeStart',function(event,next,current){
		var controller,params;
		if(next.$$route){
			controller=next.$$route.controller;
			params= next.params;
			$rootScope.$broadcast('onChangeBanner',{
				controller:controller,
				params:params
			});
		}
	});
	/**/
}]);

dm.controller('head',['$scope','tools',function($scope,tools){
	$userLi = $('.dropdown');
	$userA=$userLi.find('.hover-toggle');
	$userDIV =$userLi.find('.userInfo');
	/*绑定用户信息*/
	$userLi
		.unbind('click')
		.on('mouseover',function(e){
			$userDIV.stop();
			$userA.addClass('active mouse-hover');
			$userDIV.removeClass('hide');
			return false;
		})
		.on('mouseout',function(e){
			$userDIV.stop();
			$userA.removeClass('active mouse-hover');
			$userDIV.addClass('hide');
			return false;
		});
	/*标题点击*/
	$('.urlWrapper').on('click','li',function(e){
		//e.preventDefault();
		$(this)
			.addClass('active')
			.siblings('.active').removeClass('active');
	});
	/*监听路由的改变 进行样式设置*/
	$scope.$on('onChangeBanner',function(e,v){
		var controller,params,configer;
		controller=v.controller;
		$('a[href="#/'+controller+'"]','.urlWrapper').parent('li')
			.addClass('active')
			.siblings('.active').removeClass('active');
	});
	$scope.$on('userInfo',function(e,v){
		if(v!=undefined){
			$scope.user = v;
		}
	});
	//退出系统
	$scope.quitSys = function(){
		tools.http({
			url:'clearSession.htm',
			succ:function(resp){
				if(resp.success){
					window.location.href = '/distributor-manager/html/login.html';
				}
			}
		});
	};
}]);
dm.controller('banner',['$scope','$element',function($scope,$element){
	$scope.$on('onChangeBanner',function(e,v){
		var controller,params,configer;
		controller=v.controller;
		params=v.params;
		configer = config.route[controller];
		$scope.linkList = configer.banner||[];
		bannerIndex=params.banner||0;
		$scope.active=configer.banner[bannerIndex]
		$scope.prehref='#/'+controller+'?banner=';
	});
	//$scope.$on()
}]);

dm.directive('bar',['$rootScope',function($rootScope){
	var func = function(element,attrs,link){
		return function (scope,element,attrs,transclude){
			var node = link(scope);
			element.append(node);
		}
	};
	return {
		compile:func,
		restricit:'EA',
		transclude:true,
		scope:false
	}
}]);



/*自定义分层 添加分层*/
dm.directive('graders',['$rootScope','$compile','grades',function($rootScope,$compile,grades){
	var compile = function(element,attrs,link){
		var html='<li class="addGrades"><span>名称:</span><input type="text" class="gradName input-small mb0 ml10 mr5" placeholder="五字内" /><input type="button" value="确定" class="btn addGrades btn-mini" /></li>';
	    return function($scope,$element){
	    	$element.click(function(){
	    		$scope.$apply(function(){
	    			var $ul = $element.parent().next();
	    			var $li = $ul.find('li:first'),
	    				isClicked=$li.hasClass('addGrades');
	    			if(isClicked){
	    				$li.remove();
	    				return;
	    			}
	    			$ul.prepend($(html));
	    			$ul.off('click','.btn');
	    			$ul.on('click','.btn',function(){
						var name = $('.gradName',$ul).val();
						var length = $.trim(name).replace(/[\u4e00-\u9fa5]/g, 'xx').length;
						if(!length){
							alert('请输入要定义分层的名字');
							return;
						}
						if(length>10){
							alert('只能添加5个字以内');
							return;
						}
					    var grade = new  grades();
					    grade.add(name,function(v){
					    	//console.log(v);
					    });
					});
	    		});
	    	});
	    	
	    }
	}
	return{
		compile:compile,
		restricit:'A',
		scope:true
	}
}]);