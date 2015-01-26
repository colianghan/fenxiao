dm.directive('leftBar',function(){
	var controller = ['$scope','$rootScope','$element','$compile','grades','setShortCurts',function($scope,$rootScope,$element,$compile,grades,setShortCurts){
		var configer,layers;
		$scope.quickLinks = {};
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
				//$scope.quickLinks =['商品录入','创建活动','订单管理'];
				if(_.keys($scope.quickLinks).length){
					return;
				}
				setShortCurts.get(function(v){
					$scope.quickLinks = v;
				});
			};
			if (controller==='compete') {
				/*ajax 请求 获取 竞争对手列表*/
			};

			/*分销管理 处理自定义分层*/
			if(controller==='manage'){
				layers = new grades();
				i=6;
				layers.get(function(value){
					//debugger;
					var _arr= {};
					_arr['自定义分层']=[];
					_.each(value,function(item,key){
						item.id=key;
						item.parent='自定义分层';
						item.href=i+'&gradeId='+item.id;
						_arr['自定义分层'].push(item);
						i++;
					});
					$scope.child = $.extend($scope.child,_arr);
					/*debugger;
					$rootScope.$broadcast('c',value);*/
				});
			}
		});

		$scope.$on('onTagChange',function(e,v){
			//debugger
			$scope.activeItem=null;
			$scope.currentParent=null;
			//debugger;
			_.each($scope.child,function(i,index){
				//item.id 是为了hack自定义分层的情况
				_.each(i,function(item){
					if(item.href==v||item.id===v){
						$scope.activeItem=item.name;
						$scope.currentParent = item.parent;
						return;
					}
				});
			});
			//debugger
		});
		$scope.animateShow=function(item){
			$scope.currentParent=item;
		};
		$scope.$on('add-layers',function(e,v){
			v.id = v.gradeId;
			v.parent = '自定义分层';
			v.href=i+'&gradeId='+v.id;
			$scope.child['自定义分层'].push(v);
		});

		//当系统设置更新快捷设置后  进行更新
		$scope.$on('update-sortCut',function(e,v){
			$scope.quickLinks = v;
		});

	}];
	return {
		restrict:'E',
		replace:true,
		scope:true,
		controller:controller,
		templateUrl:'../html/template/leftBar.html'
	}
});