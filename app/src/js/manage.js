dm.controller('manage',['$rootScope','$scope','$routeParams','$animate',function($rootScope,$scope,$routeParams,$animate){
	var bannerIndex = $routeParams.banner||0,
		tagIndex = $scope.tagIndex = $routeParams.tag||0;
		if (tagIndex==0 && bannerIndex!=0){
			tagIndex = $scope.tagIndex = 1;
		}
	$rootScope.$broadcast('onTagChange',tagIndex);
	$scope.showHighSearch=false;
	$scope.highSearch=function(){
		$scope.showHighSearch=!$scope.showHighSearch;
	};
	$scope.a=[1,2,3,4,5,6,7,8,9,10];
	var tbody =  $('.table').find('tbody');
	$scope.add=function(e){
		$scope.a.push(12);
		//console.log($this);
		//var $element1 =$(e.target);
		//if (true) {};
		/*$animate.addClass(tbody,'animate-show-hide ng-hide-add').then(function(){
			console.log('success');
		})*/
	} 
}]);




dm.directive('settings',['$compile','$parse',function($compile,$parse){
	var compile = function(element){

	};
	var controller = ['$scope',function($scope){

	}];
	return {
		restrict:'A',
		scope:true,
		controller:controller,
		compile:compile
	}
}]);


dm.controller('hasParams',['$scope','tools',function($scope,tools){
	var parms = $scope.parms = config.settingManage;
	var hasChecked = $scope.hasChecked =[];
	$scope.$on('mange-checked',function(e,v){
		debugger;
		if( typeof v == 'undefined'){
			return;
		}
		item = parms[v];
		item.index=v;
		/*bug 事件更新没有放到angular上下文中*/
		$scope.$apply(function(){
			$scope.hasChecked.push(item);
		});
	});
}]);

dm.directive('paramsHasChecked',['$compile','$parse',function($compile,$parse){
	return {
		restrict:'A',
		compile:function($element,$attrs,$transclude){
			/*$transclude 是为了使其中的各指令间互相通信*/
			var Index = $attrs.dataIndex;
			var item  =  config.settingManage[Index]||{};
			item.low  =  $attrs.dataLow||'';
			item.high =  $attrs.dataHigh||'';
			var  html = '';
			html+='<th>'+item.name+'</th>'+
					'<td>指标</td>'+
					'<td>范围</td>'+
					'<td class="text-center">'+
						'<div class="input-append">'+
							'<input type="text" class="input-small low-input" value="'+item.low+'">'+
							'<span class="add-on">'+item.unit+'</span>'+
						'</div>'+	
						'<span class="ml10 mr10">—</span>'+
						'<div class="input-append">'+
							'<input type="text" class="input-small high-input" value="'+item.high+'">'+
							'<span class="add-on">'+item.unit+'</span>'+
						'</div>'+	
					'</td>'+
					'<td>'+
						'<a href="javascript:;">'+
							'<i class="icon-ok"></i>'+
						'</a>'+
						'<a href="javascript:;">'+
							'<i class="icon-remove"></i>'+
						'</a>'+ 
					'</td>'+
			$element.html(html);
			return function($scope,$element,$attrs){
				console.log('paramsHasChecked');
			}
		},
		controller:function($scope,$element,$attrs){
			var low = $('.low-input').val();
			var high= $('.high-input').val();
			$element.on('click','icon-ok',function(){

			});
			$element.on('blur','input[type="text"]',function(e){

			});

		},
	}
}]);






dm.directive('parmsToChecked',['$compile','$parse',function($compile,$parse){
	return{
		restrict:'A',
		compile:function($element){
			var html='';
			var parms = config.settingManage;
			for(var i=0,j=parms.length;i<j-1;i+=2){
				html+='<div class="row-fluid">';
				html+='<div class="span6"><label class="checkbox"><input type="checkbox" data-index="'+i+'" value="'+parms[i].name+'" />'+parms[i].des+'</label></div>';
				html+='<div class="span6"><label class="checkbox"><input type="checkbox" data-index="'+(i+1)+'" value="'+parms[i+1].name+'" />'+parms[i+1].des+'</label></div>';
				html+='</div>';
			}
			$element.html(html);		
			return function($scope,$element,$attrs){
				debugger;
				console.log('parmsToChecked');
			}
		},
		controller:['$rootScope','$scope','$element',function($rootScope,$scope,$element){
			debugger;
			$element.on('click','input[type="checkbox"]',function(e){
				var $ele = $(this);
				var isChecked = $ele.prop('checked');
				var index = $ele.data('index');
				if(isChecked){
					$rootScope.$broadcast('mange-checked',index);
				}else{
					$rootScope.$broadcast('manege-remove',index);
				}
			});
			$element.on('remove-checked',function(v){
				$element.find('input[type="checkbox"]').eq(v).prop('checked',false);
			});
		}]
	}
}]);