dm.controller('manage',['$rootScope','$scope','$routeParams','$animate','$filter','tools','ngTableParams','grades',function($rootScope,$scope,$routeParams,$animate,$filter,tools,ngTableParams,grades){
	var gradeId,bannerIndex = $routeParams.banner||0,
		tagIndex = $scope.tagIndex = $routeParams.tag||1;
		if (tagIndex==0 && bannerIndex!=0){
			tagIndex = $scope.tagIndex = 4;
		}
		//debugger;
		if(tagIndex<6){
			$rootScope.$broadcast('onTagChange',tagIndex);
		}else{
			gradeId = $routeParams.gradeId;
			$rootScope.$broadcast('onTagChange',gradeId);
		}
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
	$scope.curModeName = $scope.curModeName ||!model||model[0];
	$scope.dimensions = [];//维度列表
	$scope.getDis=[];$scope.Dis=[];//分销商列表
	var getDis = (function(callback){
		var modelName = $scope.curModeName;
		var getDistr = tools.promise('getModeOfDistributors.htm',true);
		getDistr({
			data:{
				modeName:$scope.curModeName
			}
		}).then(function(resp){
			if(resp.success){
				//callback(resp.value);
				layers =  new grades();
				layers.get(function(v){
					_.each($scope.Dis,function(item){
						debugger
						item.gradeName=v[item.gradeId==null?0:item.gradeId].name;
					});
					$scope.getDis = $scope.Dis.slice(0,tools.config.table.count);
				});
				_.each(resp.value,function(item){
					item.select=false;
					item.gradeName = '--';
				});
				$scope.Dis=resp.value;
				$scope.getDis = $scope.Dis.slice(0,tools.config.table.count);
				var length = resp.value.length;
				var maxPages = 0,pages=[];
				if(length>=tools.config.table.count){
					maxPages = length%tools.config.table.count==0?(length/tools.config.table.count):(length/tools.config.table.count+1);	
				}
				for(var i=0,j=Math.floor(maxPages);i<j&&j!=1;i++){
					pages.push(i);
				}
				$scope.pages=pages;
				$scope.now=1;
			}
		});
	})();
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
					//getDis(dimensions);
					$rootScope.$broadcast('setDimensions',resp.value);
				}
			}
		});
	};
	getDimensions();
	$scope.setCur = function(item){
		if($scope.curModeName===item){
			return;
		}
		debugger;
		$scope.curModeName = item;
		getDimensions();
	};
    /*table begin*/
	/*获取分页*/
	$scope.getPage=function(i){
		if(i===$scope.now){
			return;
		}
		$scope.now=i;
		var begin = (i-1)*tools.config.table.count,
			end = i*tools.config.table.count;
		$scope.getDis=$scope.Dis.slice(begin,end);
	};
	/*获取排序*/
	$scope.sort=function(e,key){
		debugger;
		var $ele = $(e.currentTarget),sortBy;
		if($ele.hasClass('sort-desc')){
			//升序
			$ele.removeClass('sort-desc').addClass('sort-asc');
			//sortBy='asc';
			sortBy=false;			
		}else{
			//降序
			$ele.removeClass('sort-asc').addClass('sort-desc');
			//sortBy='desc';
			sortBy=true;
		}
		$scope.Dis = $filter('orderBy')($scope.Dis,key,sortBy)||$scope.Dis;
		$scope.now=1;
		$scope.getDis=$scope.Dis.slice(0,30);
	}
	/*table end*/
	/*全选*/
	$scope.selAll =function(e){
		var bool = $(e.currentTarget).prop('checked');
		_.each($scope.Dis,function(item){
			item.select=bool;
		});
	}
}]);


/*已选参数*/
dm.controller('hasParams',['$scope','$rootScope','$element','tools',function($scope,$rootScope,$element,tools){
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
		var model =  $scope.hasChecked[index];
		if(model){
			var type = model.type;
			if(type=='int'){
				var _low = Number(low),_high=Number(high);
				var str = /^[0-9]*[1-9][0-9]*$/;  //获取正整数
				if(str.test(_low)&&str.test(_high)){
					//return true;
				}else{
					$scope.$broadcast('erro-alert','指标需要正整数');
					return;
				}
			}else if(type=='dor'){
				var _low = Number(low),_high=Number(high);
				if(isNaN(_low)||isNaN(_high)){
					$scope.$broadcast('erro-alert','请输入数字');
					return;
				}
				if(_low>100||_high>100){
					$scope.$broadcast('erro-alert','不能超过100%');
					return;
				}
				low = _low.toFixed(1)/100;
				high = _high.toFixed(1)/100;
				$('.low-input',parentTr).val(_low.toFixed(1)==0.0?'':_low.toFixed(1));
				$('.high-input',parentTr).val(_high.toFixed(1)==0.0?'':_high.toFixed(1));
			}else if(type=='date'){
				if(low!=''&&high!=''){
					if(high<low){
						$scope.$broadcast('erro-alert','结束时间不能晚于开始时间');
						return;
					}
				}
				low = low==''?'':low+' 00:00:00';
				high = high ==''?'':high+' 00:00:00';
			}
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
	$element.on('click','.date',WdatePicker);
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
				$element.removeClass('hide').find('span').html(v);
				$timeout(function(){
					$element.addClass('hide');
				},3000);
			});
		}
	}
}]);

dm.directive('dimensions',function($compile){
	var com = function(dimensions){
		var html='';
		for(var i=0,j=dimensions.length;i<j;i++){
			html+='<td data-title="'+dimensions[i].des+'" sortable="\''+dimensions[i].name+'\'">'+dimensions[i].name+'</td>';
		}
		return html;
	}
	return{
		restrict:'A',
		priority: 1002,
		compile:function($element,$attrs,link){
			var dimensions = $attrs.dimensions;
			var html = com(dimensions);
			$element.parents('tr').append($(html));
			return function($scope,$element,$attrs){
				console.log($scope.dimensions);
				$scope.$watch('$attrs.dimensions',function(v){
					if(v!=undefined){
						var html = com(dimensions);
						$element.parents('tr').append($(html));
					}
				});
			}
		},
		controller:function($scope,$element,$attrs,link){

		},
		scope:true,
		replace:true
	}
});

dm.filter('formateLayers',function(){
	//var _laryers=_laryers||[];
	return function(v,o){
		var _laryers = o||[];
		_.each(_laryers,function(item){
			if(v==item.id){
				return item.name;
			}
		});
	}
});


/*dm.directive('add-grades',function(){

})*/


dm.directive('',function(){
	
});