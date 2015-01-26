dm.controller('manage',['$rootScope','$scope','$routeParams','$animate','$filter','tools','ngTableParams','grades','initPages',function($rootScope,$scope,$routeParams,$animate,$filter,tools,ngTableParams,grades,initPages){
	var gradeId,bannerIndex = $routeParams.banner||0,
		tagIndex = $scope.tagIndex = $routeParams.tag||0;
		//debugger;
		if (tagIndex==0 && bannerIndex!=0){
			tagIndex = $scope.tagIndex = 4;
		}
		//debugger;
		if(tagIndex<6){
			$rootScope.$broadcast('onTagChange',tagIndex);
		}else{
			gradeId = $routeParams.gradeId;
			//debugger;
			$rootScope.$broadcast('onTagChange',gradeId);
		}
		/*潜力模型分销商*/
		if(tagIndex==3){
			/*id 是识别 nick是设置*/
			$scope.potential=[
				{id:'amtData',name:'30天成交额',nick:'amtDataOfTrend',click:true,unit:'元'},
				{id:'chainIndexs',name:'环比增长率',nick:'chainIndexOfTrend',click:true,unit:'%'},
				{id:'yearToYears',name:'同比增长率',nick:'yearToYearOfTrend',click:true,unit:'%'},
				{id:'scores',name:'综合潜力值',nick:'',click:false}
			];
		}else{
			$scope.potential=[];//
		}
	/*----------------------路由设置 end----------------------------------------*/
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
		var modelName = $scope.curModeName,getDistr,data;
		if(tagIndex==3){
			getDistr = tools.promise('getPotentialDistributors.htm',false);
			data = {};
		}else{
			getDistr = tools.promise('getModeOfDistributors.htm',true);
			data = {
				modeName:$scope.curModeName
			};
		}
		getDistr({
			data:data
		}).then(function(resp){
			if(resp.success){
				var value,source;
				if(tagIndex==3){
					value=resp.value.distributors;
					$scope.trend = resp.value.data;
					$scope.weight= resp.value.weightPercents;
					//console.log(resp.value.data[value[0].disSid]);
					//debugger;
				}else{
					value = resp.value;
					$scope.trend = {}; //趋势数据
					$scope.weight= {}; //权重信息
				}
				//callback(resp.value);
				layers =  new grades();
				layers.get(function(v){
					_.each($scope.Dis,function(item){
						item.gradeName=v[item.gradeId==null?0:item.gradeId].name;
					});
					$scope.getDis = $scope.Dis.slice(0,tools.config.table.count);
				});
				_.each(value,function(item){
					item.select=false;
					item.gradeName = '--';
				});
				$scope.Dis=value;
				$scope.getDis = $scope.Dis.slice(0,tools.config.table.count);
				var length = value.length;
				initPages($scope,length);
			}
		});
	});
	getDis();
	//获取维度
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
					$scope.dimensions=dimensions;
					//getDis(dimensions);
					if(!resp.value.modeName){
						resp.value.modeName = $scope.curModeName;
					}
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
		//debugger;
		$scope.curModeName = item;
		getDimensions();
		getDis();
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
		//debugger;
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
	$scope.mark=function(item){
		if(item!=null){
			_.each($scope.Dis,function(v){
				if(v.disNick==item.disNick){
					v.select = item.select;
				}
			})
		}
	};
	$scope.addLayers=function(){
		$rootScope.$broadcast('show-layers',$scope.Dis);
	};
	// 潜力型分销商的获取接口
	$scope.$on('reset',function(e,v){
		if(v){
			getDis();
		}
	});
	/*获得柱形图*/
	$scope.getTrend = function(e,item,v,index){
		if(index===3){
			//综合潜力值
			return;
		}
		var _src = $scope.trend[item.disSid] || {},
			_dataSrc = _src[v.nick],
			$container = $('.pop-charts').length?$('.pop-charts'):$('<div>',{'class':'pop-charts'}),
			$ele = $(e.currentTarget),
			$tr = $ele.parents('tr:first'),
			$next = $tr.next();
		if($next.hasClass('active-charts')&&$ele.hasClass('active')){
			$next.addClass('hide');
			$ele.removeClass('active');
		}else{
			$('.active-charts').removeClass('hide').insertAfter($tr);
			$ele.addClass('active').siblings('.active').removeClass('active');
		}
		//$ele.append($container);
		var dates = _.keys(_dataSrc).sort()[0].split(' ')[0].split('-'),
			data = _.values(_dataSrc);
		var options={
			chart:{
				type:'line'
			},
			title:{
				text:v.name+'趋势'
			},
			xAxis:{
				type:'datetime',
				dateTimeLabelFormats:{
					day:'%e/%b'
				}
			},
			yAxis:{
				title:{
					text:v.name+'(单位:'+v.unit+')'
				}
			},
			tooltip:{
				shared:true,
				formatter:function(){
					var day = new Date();
					day.setTime(this.x);
					var dayFormater= day.getFullYear()+'-'+(day.getMonth()+1)+'-'+day.getDate();
					var s = '<b>'+dayFormater+'</b>';
					$.each(this.points,function(){
						s+='<br />'+this.series.name+':'+this.y+v.unit;
					});
					return s;
				}
			},
			credits:{
				enabled:false
			},
			series:[{
				name:v.name,
				data:data,
				pointStart:Date.UTC(dates[0],dates[1]-1,dates[2]),
				pointInterval:24*60*60*1000
			}]
		}
		$container.highcharts(options).highcharts();
	};
}]);


/*已选参数*/
dm.controller('hasParams',['$scope','$rootScope','$element','tools',function($scope,$rootScope,$element,tools){
	var parms = $scope.parms = config.settingManage;
	var hasChecked = $scope.hasChecked =[];
	$scope.$on('mange-checked',function(e,v){
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
		if(v==undefined){
			return;
		}
		_.each($scope.hasChecked,function(item,index){
			if(item.index==v){
				//$scope.hasChecked.splice(index,1);
				if(item.key==undefined){
					$scope.hasChecked.splice(index,1);
					return;
				}
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
					high:high,
					low:low
				},
				succ:function(resp){
					if(resp.success){
						//parentTr.data('key',resp.value);
						$scope.hasChecked[index].key=resp.value;
						alert('添加成功');
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
			//debugger;
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
			}
		},
		controller:['$rootScope','$scope','$element',function($rootScope,$scope,$element){
			//debugger;
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
			//开始时进行设置,同时触发生成
			$scope.$on('setDimensions',function(e,v){
				//debugger;
				var models = [];
				$scope.modelName = v.modeName;
				$('input:checkbox:checked',$element).prop('checked',false);
				_.each(v.dimensions,function(item){
					var $input = $('input[value="'+item.dimension+'"]',$element),
						index = $('input:checkbox',$element).index($input);
					//console.log(index);
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

/*dm.filter('formateLayers',function(){
	//var _laryers=_laryers||[];
	return function(v,o){
		var _laryers = o||[];
		_.each(_laryers,function(item){
			if(v==item.id){
				return item.name;
			}
		});
	}
});*/


/*dm.directive('add-grades',function($rootScope){
	return{
		restrict:'A',
		compile:function(element,attrs,link){
			return function(scope,element,attrs){
				element.click(function(){
					$rootScope.$broadcast('show-layers',true);
				});
			}
		}
	}
});
*/

dm.directive('layers',function($rootScope){
	return {
		restrict:'E',
		templateUrl:'../html/template/add-layers.html',
		compile:function(element,attrs,link){
			return function(scope,element,attrs){
			}
		},
		controller:function($scope,$element,tools,grades){
			var select = [];
			var layer = new grades();
			layer.get(function(v){
				_.each(v,function(item){
					item.select=false;
				});
				$scope.lay=v;
			});
			$scope.data={id:''};
			$scope.$on('show-layers',function(e,v){
				$element.toggle();
				if(v){
					if(_.isArray(v)){
						select = _.pluck(_.filter(v,function(item){return item.select;}),'disNick');
					}else{
						select=[v.disNick];
					}
				}
			});
			$scope.cansel = function(){
				$element.toggle();
			};
			$scope.move = function(id){
				//debugger;
				var gradeId = id|| (function(){
					var _id = '';
					$('input[type="radio"]',$element).each(function(index,item){
						if(item.checked){
							_id = item.value;
							return; 
						}
					});
					return _id;
				})(),
					disNicks = select.join(',');
				if(gradeId==''){
					alert('请选择要移入的等级');
					return;
				}
				if(disNicks==''){
					alert('请选择要进行操作的分销商');
					return;
				}
				tools.http({
					url:'moveDistributorToGrade.htm',
					data:{
						gradeId:gradeId,
						disNicks:disNicks
					},
					succ:function(resp){
						if(resp.success){
							if(resp.value.successList.length){
								alert('移入成功');
							}
							else{
								alert('操作失败，请稍后重试..');
							}
						}else{
							alert('操作失败，请稍后重试..');
						}
					}
				});
			};
			$scope.creatMove = function(){
				var name = $scope.layeName;
				var length = $.trim(name).replace(/[\u4e00-\u9fa5]/g, 'xx').length;
				if(!length){
					alert('请输入要定义分层的名字');
					return;
				}
				if(length>10){
					alert('只能添加5个字以内');
					return;
				}
				layer.add(name,function(v){
					if(!v) return;
					$scope.move(v.id); // 添加东西
					//$scope.lay.push(v);
					$rootScope.$broadcast('add-layers',v);
				});
				$scope.$on('add-layers',function(e,v){
					//debugger;
					$scope.lay[v.gradeId]=v;
				});
			};
		},
		replace:true,
		scope:true
	}	
});

dm.directive('weight',function(){
	return {
		templateUrl:'../html/template/potential.html',
		restrict:'E',
		scope:true,
		compile:function(element,attrs,link){
			return function(scope,element,attrs){
			}
		},
		controller:function($rootScope,$scope,tools){
			$scope.alter = function(){
				var sellAmt = Number($('#sellAmt').val()),
					chainIndex = Number($('#chainIndex').val()),
					yearOnYear = Number($('#yearOnYear').val());
				if(sellAmt+chainIndex+yearOnYear!=100){
					alert('三个权重之和必须等于100%哦');
					return;
				}
				tools.http({
					url:'updatePotentialWeightPercent.htm',
					data:{
						weightPercents:'sellAmt='+sellAmt/100+';chainIndex='+chainIndex/100+';yearOnYear='+yearOnYear/100
					},
					succ:function(resp){
						if(resp.success){
							alert('修改成功');
							$rootScope.$broadcast('reset',true);
						}else{
							alert(resp.message);
						}
					}
				});
			};
		},
		replace:true
	}
});