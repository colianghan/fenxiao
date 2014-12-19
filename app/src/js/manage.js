dm.controller('manage',['$rootScope','$scope','$routeParams','$animate','$filter','tools','ngTableParams',function($rootScope,$scope,$routeParams,$animate,$filter,tools,ngTableParams){
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
	$scope.dimensions = [];//维度列表
	$scope.getDis=[];//分销商列表
	var getDis = function(dimensions){
		var modelName = $scope.curModeName;
		var getDistr = tools.promise('getModeOfDistributors.htm',true);
		getDistr({
			data:{
				modeName:$scope.curModeName
			},
			succ:function(resp){
				if(resp.succ){
					debugger;
					/*if(!dimensions){
						$scope.getDis = resp.value;	
					}else{
						_.each(resp.value,function(item){

						});
					}*/
					$scope.getDis = resp.value;
				}
			}
		});
	}
	var getDimensions = function(){
		tools.http({
			url:'getDimensions.htm',
			data:{
				modeName:$scope.curModeName
			},
			succ:function(resp){
				if(resp.success){
					var dimensions = [];
					_.each(resp.value.dimensions,function(item){
						_.each(config.settingManage,function(v){
							if(item.dimension==v.name){
								dimensions.push($.extend(item,v));
							}
						});
					});
					debugger;
					$scope.dimensions=dimensions;
					getDis(dimensions);
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
	/*$scope.$watch('getDis',function(v,old){
		debugger;
		if(!old){
			//过滤第一次
			return;
		}else{
			$scope['distr'].page(1).reload();
		}
	});*/
	$scope['distr'] = new ngTableParams({
		page: 1,
        count: tools.config.table.count,
        sorting: {
           gradeId:'desc'
        },
        defaultSort: 'desc'
	},{
		total: 0,
        counts: [],
        getData: function ($defer, params) {
        	debugger;
            var begin = (params.page() - 1) * params.count(), end = params.page() * params.count();
            var words = [];
            if (!$scope.getDis.length) {
               words = params.sorting ?
                                        $filter('orderBy')($scope.getDis, params.orderBy()) :
                                        $scope.getDis;
	           params.total(words.length);
	           $defer.resolve(words.slice(begin, end));
	        } else {
	           $defer.resolve($scope.getDis.slice(begin, end));
	        }
        }
	});







}]);




/*已选参数*/
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
			item.modeName=$scope.modelName;
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
					modeName:$scope.modelName,
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

	$scope.check=function(v){
		if(!v){
			return;
		}
		switch(v.type){
			case 'int':function(){
				if(v%1){
					$scope.$broadcast('erro-alert','必须为整数');
				}
			}
			break;
			case 'dor':function(){
				if(!(v%1).toFixed(2)>0.10){
					$scope.$broadcast('erro-alert','只能精确到1位小数');
				}
			}
			break;
			case 'date':function(){
				
			}
			break;
		}
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
					model.modelName=$scope.modelName;
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

/*错误信息*/
dm.directive('erro',['$compile',function($compile){
	return{
		restrict:'A',
		compile:function($element){
			return function($scope,$element,$attrs){

			}
		},
		controller:function($scope,$element,$timeout){
			$scope.$on('erro-alert',function(e,v){
				$element.html(v).removeClass('hide');
				$timeout(function(){
					$element.addClass('hide');
				},3000);
			});
		}
	}
}]);