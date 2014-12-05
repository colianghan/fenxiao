var dm = angular.module('distributManager',['ngTable','ngRoute']);
dm.config(['$routeProvider',function($routeProvider){
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
		.when('/compete',{
			templateUrl:'../html/compete.html',
			controller:'compete'
		})
		.otherwise({
			redirectTo:'/index'
		});
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

dm.controller('leftBar',['$scope','$element','$compile',function($scope,$element,$compile){

	var configer;
	$scope.$on('onChangeBanner',function(e,v){
		var controller,params,child={},bannerIndex,tagIndex;
		$scope.contr = controller=v.controller;//controller
		params=v.params||{};//参数 {banner:1,tag:2}
		bannerIndex=params.banner||0;  //banner 是确定哪个子类
		tagIndex=params.tag; //tag　是确定那个具体的类目
		configer = config.route[controller];
		firstChildList = configer.firstChild[bannerIndex];
		$scope.linkList = firstChildList;
		$scope.prehref='#/'+controller+'?banner='+bannerIndex+'&&tag=';
		/*进行判断*/
		if(firstChildList){
			child = _.groupBy(configer.child,function(_obj){
				return _obj.parent;
			});
			$scope.child=child;
			//console.log(child);
		}



		/*首页*/
		if (controller==='index') {
			$scope.quickLinks =['商品录入','创建活动','订单管理'];
		};
		if (controller==='compete') {
			/*ajax 请求 获取 竞争对手列表*/
		};
	});

	$scope.$on('onTagChange',function(e,v){
		$scope.activeItem=null;
		$scope.currentParent=null;
		_.each(configer.child,function(item,index){
			if(item.href==v){
				$scope.activeItem=item.name;
				$scope.currentParent = item.parent;
				return;
			}
		})
		//debugger
	});
	
	$scope.animateShow=function(item){
		$scope.currentParent=item;
	}

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