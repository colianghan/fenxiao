dm.controller('manage',['$rootScope','$scope','$routeParams','$animate','tools',function($rootScope,$scope,$routeParams,$animate,tools){
	var bannerIndex = $routeParams.banner||0,
		tagIndex = $scope.tagIndex = $routeParams.tag||0;
		if (tagIndex==0 && bannerIndex!=0){
			tagIndex = $scope.tagIndex = 1;
		}
	$rootScope.$broadcast('onTagChange',tagIndex);
	/*----------------------路由设置 end----------------------------------------*/
	
	/*----------------------自定义分层设置--------------------------------------*/
	$scope.showHighSearch=false;
	$scope.highSearch=function(){
		$scope.showHighSearch=!$scope.showHighSearch;
	};
	$scope.a=[1,2,3,4,5,6,7,8,9,10];
	var tbody =  $('.table').find('tbody');


	/*—-----------------系统分层设置-----------------------*/
	$scope.showSetting = false;
	$scope.Settings=function(){
		$scope.showSetting = true;
	};
	var models = config.model,
		model  = $scope.model = models[tagIndex];
	$scope.curModeName = $scope.curModeName || model[0];

	var getDimensions = function(){
		tools.http({
			url:'getDimensions.htm',
			data:{
				modeName:$scope.curModeName
			},
			succ:function(resp){
				if(resp.success){
					$scope.dimensions=resp.value;
					$rootScope.$broadcast('setDimensions',resp.value);
				}
			}
		});
	}
	getDimensions();
	$scope.setCur = function(item){
		if($scope.curModeName===item){
			return;
		}
		debugger;
		$scope.curModeName = item;
		getDimensions();
	};
}]);


dm.controller('hasParams',['$scope','$rootScope','tools',function($scope,$rootScope,tools){
	var parms = $scope.parms = config.settingManage;
	var hasChecked = $scope.hasChecked =[];
	$scope.$on('mange-checked',function(e,v){
		//debugger;
		if( typeof v == 'undefined'){
			return;
		}else if (typeof v == 'object'){
			$scope.hasChecked= v;
			$scope.modelName=v[0].modelName;
			return;
		}else{
			item = parms[v];
			item.index=v;
			item.modeName=$scope.modeName;
		}
		/*bug 事件更新没有放到angular上下文中*/
		/*$scope.$apply(function(){
			$scope.hasChecked.push(item);
		});*/
		$scope.hasChecked.push(item);
	});
	$scope.$on('manege-remove',function(e,v){
		if(!v){
			return;
		}
		_.each($scope.hasChecked,function(item,index){
			if(item.index==v){
				//$scope.hasChecked.splice(index,1);
				tools.http({
					url:'deleteDimension.htm',
					data:{
						id:item.key
					},
					succ:function(resp){
						if(resp.success){
							$scope.hasChecked.splice(index,1);
						}
					}
				});
				return;
			};
		});
	});
	$scope.addDim=function(index,e){
		debugger;
		var  parentTr = $(e.currentTarget).parents('tr'),
			 low = $('.low-input',parentTr).val(),
			 high= $('.high-input',parentTr).val(),
			 id=parentTr.data('key');
		if(low==''&&high==''){
			$scope.$broadcast('erro-alert','范围不能同时为空');
			return;
		}
		if(!id){
			//添加
			tools.http({
				url:'addDimension.htm',
				data:{
					modeName:$scope.modeName,
					dimension:$scope.hasChecked[index].name,
					high:low,
					low:high
				},
				succ:function(resp){
					if(resp.success){
						//parentTr.data('key',resp.value);
						$scope.hasChecked[index].key=resp.value;
					}else{
						alert(resp.message);
					}
				}
			});
		}else{
			//修改唯独
			tools.http({
				url:'updateDimension.htm',
				data:{
					id:id,
					dimension:$scope.hasChecked[index].name,
					high:high,
					low:low
				},
				succ:function(resp){
					if(resp.success){
						alert('修改成功..');
					}else{
						alert('resp.success');
					}
				}
			});
		}
	};
	$scope.reMov =function(sort,e){
		if(!confirm('是否删除该指标')){
			return;
		}
		var  parentTr = $(e.currentTarget).parents('tr'),
			 id = parentTr.data('key'),
			 index =  $scope.hasChecked[sort].index;
		if(!id){
			debugger;
			$rootScope.$broadcast('remove-checked',index);
			$scope.hasChecked.splice(sort,1);
			return;
		}
		tools.http({
			url:'deleteDimension.htm',
			data:{
				id:id
			},
			succ:function(resp){
				if(resp.success){
					$scope.hasChecked.splice(sort,1);
					$rootScope.$broadcast('remove-checked',index);
				}
			}
		});
	};
}]);

dm.directive('paramsHasChecked',['$compile','$parse','tools',function($compile,$parse,tools){
	return {
		restrict:'A',
		compile:function($element,$attrs,$transclude){
			/*$transclude 是为了使其中的各指令间互相通信*/
			debugger;
			var Index = $attrs.index;
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
		controller:function($scope,$element,$attrs,tools){
			debugger;
			console.log(tools);
			var low = $('.low-input',$element).val();
			var high= $('.high-input',$element).val();
			$element.on('click','.icon-ok',function(e){
				
			});
			$element.on('blur','input[type="text"]',function(e){

			});
			$element.on('click','.icon-remove',function(e){

			});
		},
		replace:true
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
				//debugger;
				console.log('parmsToChecked');
			}
		},
		controller:['$rootScope','$scope','$element',function($rootScope,$scope,$element){
			debugger;
			//var modelName = '';
			$element.on('click','input[type="checkbox"]',function(e){
				var $ele = $(this);
				$scope.$apply(function(){
					var isChecked = $ele.prop('checked');
					var index = $ele.data('index');
					if(isChecked){
						$rootScope.$broadcast('mange-checked',index);
					}else{
						if(!confirm('是否删除该指标')){
							$ele.prop('checked',true);
							return false;
						}
						$rootScope.$broadcast('manege-remove',index);
					}
				});
			});
			$scope.$on('remove-checked',function(e,v){
				$element.find('input[type="checkbox"]').eq(v).prop('checked',false);
			});
			$scope.$on('setDimensions',function(e,v){
				debugger;
				var models = [];
				$scope.modelName = v.modeName;
				_.each(v.dimensions,function(item){
					var $input = $('input[value="'+item.dimension+'"]',$element),
						index = $('input:checkbox',$element).index($input);
					console.log(index);
					var model = $.extend({},config.settingManage[index]);
					model.low=item.low;
					model.high= item.high;
					model.key = item.id;
					model.index=index;
					model.modelName=$scope.modeName;
					$('input[value="'+item.dimension+'"]',$element).prop('checked',true);
					//$rootScope.$broadcast('mange-checked',model);
					models.push(model);
				});
				if(models.length){
					$rootScope.$broadcast('mange-checked',models);
				}
			});
		}]
	}
}]);