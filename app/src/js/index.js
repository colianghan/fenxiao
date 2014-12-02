/*存储配置的信息*/
config={
	route:{
		index:{
			banner:['概况预览','首页','分销管理'],
			firstChild:[
			   ['系统分层','自定义分层'],
			   ['已上架产品','下架中产品'],
			   ['首页']
			],
			child:[{
				href:1,
				name:'你好',
				parent:'系统分层'
			},{
				href:2,
				name:'在那里呢',
				parent:'系统分层'
			},{
				href:3,
				name:'在',
				parent:'自定义分层'
			}]
		},
		compete:{
			banner:['概况预览1','首页','分销管理'],
			firstChild:[
			   ['系统分层1','自定义分层'],
			   ['已上架产品1','下架中产品'],
			   ['首页1']
			],
			child:[{
				href:1,
				name:'你好',
				parent:'系统分层'
			},{
				href:2,
				name:'在那里呢',
				parent:'系统分层'
			},{
				href:3,
				name:'在',
				parent:'自定义分层'
			}]
		}
	}
};



var dm = angular.module('distributManager',['ngTable','ngRoute']);
dm.config(['$routeProvider',function($routeProvider){
	$routeProvider
		.when('/index',{
			template:'<h1>{{tag}}</h1>',
			controller:'index'
		})
		.when('/recruit',{
			template:'<h1>测试内容</h1>',
			controller:'index'
		})
		.when('/manage',{
			template:'<h1>测试内容</h1>',
			controller:'index'
		})
		.when('/improve',{
			template:'<h1>测试内容</h1>',
			controller:'index'
		})
		.when('/behavior',{
			template:'',
			controller:'index'
		})
		.when('/compete',{
			template:'',
			controller:'compete'
		})
		.otherwise({
			redirectTo:'/index'
		});
}]);

dm.controller('index',['$scope','$routeParams',function($scope,$routeParams){
	$scope.tag = $routeParams.tag||1;
	
}]);

dm.controller('compete',['$scope',function($scope){

}]);

dm.controller('layout',['$rootScope','$scope','$route','$location',function($rootScope,$scope,$route,$location){
	/*用于监听事件 进行controller间的数据交互*/
	$rootScope.$on('$routeChangeStart',function(event,next,current){
		var controller,params;
		controller=next.$$route.controller;
		params= next.params;
		$rootScope.$broadcast('onChangeBanner',{
			controller:controller,
			params:params
		});
	});
	/**/
}]);

dm.controller('head',['$scope',function($scope){
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
	})

	/*监听路由的改变 进行样式设置*/
	$scope.$on('onChangeBanner',function(e,v){
		var controller,params,configer;
		controller=v.controller;
		$('a[href="#/'+controller+'"]','.urlWrapper').parent('li')
			.addClass('active')
			.siblings('.active').removeClass('active');
	});
}]);
dm.controller('banner',['$scope',function($scope){
	$scope.$on('onChangeBanner',function(e,v){
		var controller,params,configer;
		controller=v.controller;
		params=v.params;
		configer = config.route[controller];
		$scope.linkList = configer.banner||[];
		$scope.active=params.active||configer.banner[0]
		console.log(1);
	});
	//$scope.$on()
}]);

dm.controller('leftBar',['$scope','$element','$compile',function($scope,$element,$compile){

	$scope.$on('onChangeBanner',function(e,v){
		var controller,params,configer;
		$scope.contr = controller=v.controller;
		params=v.params||{};
		index = params.banner||0;
		configer = config.route[controller];
		firstChildList = configer.firstChild[index];
		$scope.linkList = firstChildList;
		console.log(2);
		/*首页*/
		if (controller==='index') {
			$scope.quickLinks =['商品录入','创建活动','订单管理'];
		};
		if (controller==='compete') {
			/*ajax 请求 获取 竞争对手列表*/

		};
	});
	
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