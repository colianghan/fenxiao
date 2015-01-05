dm.directive('recruitDistris',['$parse',function($parse){
	var compile  = function(element,attrs,link){
		return function($scope,$element,$attrs){
			console.log('recruitindex');
		}
	};
	var controller = ['$scope','$element','$attrs','initPages','recruitDistrisModel',function($scope,$element,$attrs,initPages,recruitDistrisModel){
		//debugger;
		var tagIndex = $scope.$parent.tagIndex,status,isSimilarQ;
		console.log(tagIndex);
		switch(Number(tagIndex)){
			case 1:
				status = 'contact';
				isSimilarQ = 1;
				break;
			case 2:
				status = 'contact';
				isSimilarQ = 0;
				break;
			case 3:
				status = 'noContact';
				isSimilarQ = 1;
				break;
			case 4:
				status = 'noContact';
				isSimilarQ = 0;
				break;
		};
		var model = $scope.model = new recruitDistrisModel(status,isSimilarQ);
		model.getOperaters(); // 获取操作员列表
		model.getData(null,function(v){
			initPages($scope,v.totalSize);
		});
		//获取分页
		$scope.getPage = function(page){
			//alert(page);
			if($scope.now == page){
				return;
			}
			$scope.now=page;
			var count = $scope.model.count,
				begin = (page-1)*count,
				end = page*count-1;
			$scope.getData({
				begin:begin
			});
		};
		//获取排序
		$scope.getSort = function(e,item){
		};
		//获取查询
		$scope.getSearch = function(){
			//todo: 所在地数据获取 
			var lowOperateTime  = $('.low',$element).val();//操作时间
			var highOperateTime  = $('.high',$element).val();
			var lowShopCreateTime = $('.creat-time-low',$element).val();//开店时间
			var highShopCreateTime = $('.creat-time-high',$element).val();
			//好评率
			var lowBuyerGoodRate ='',highBuyerGoodRate='';
			var _lowBuyerGoodRate = Number($('.low-buyer-rate',$element).val()||'s');
			if(!isNaN(_lowBuyerGoodRate)){
				lowBuyerGoodRate = (_lowBuyerGoodRate/100).toFixed(2);
			}
			var _highBuyerGoodRate = Number($('.high-buyer-rate',$element).val()||'s');
			if(!isNaN(_highBuyerGoodRate)){
				highBuyerGoodRate = (_highBuyerGoodRate/100).toFixed(2);
			}
			model.getData({
				begin:0,
				lowOperateTime:lowOperateTime,
				highOperateTime:highOperateTime,
				lowShopCreateTime:lowShopCreateTime,
				highShopCreateTime:highShopCreateTime,
				lowBuyerGoodRate:lowBuyerGoodRate,
				highBuyerGoodRate:highBuyerGoodRate
			},function(v){
				initPages($scope,v.totalSize);
			});
		};
		//清除筛选
		$scope.getRest = function(){
			$('.low',$element).val('');
			$('.high',$element).val('');
			$('.creat-time-low',$element).val('');
			$('.creat-time-high',$element).val('');
			$('.low-buyer-rate',$element).val('');
			$('.high-buyer-rate',$element).val('');
			var oldPrams = $scope.model.parms;
			var tmpObj = {
				status:oldPrams.status,
				isSimilarQ:oldPrams.isSimilarQ,
				begin:0,
				count:oldPrams.count
			};
			$scope.model.parms = tmpObj;
		};
		//全选
		$scope.selectAll = function(e){
			//debugger
			$label = $(e.currentTarget);
			$check = $label.find('input[type="checkbox"]');
			model.selectAll($check.prop('checked'));
		};
	}];
	return {
		restrict:'E',
		scope:true,
		replace:true,
		compile:compile,
		controller:controller,
		templateUrl:'../html/template/recruit-distributors.html'
	}
}]);
dm.factory('recruitDistrisModel',['tools',function(tools){
	var api = {
		getList:'getRecruitOfDistributors.htm',
		getOperaters:'getRecruitOfOperaters.htm',
		updateStatus:'moveRecruitOfDistributors.htm'
	};
	var action = function(status,isSimilarQ){
		var self= this;
		this.count = tools.config.table.count;
		this.parms = {
			status:status,
			isSimilarQ:isSimilarQ,
			begin:0,
			count:this.count
		};
		this.graders = tools.shopLevels;
		//获取数据
		this.getData = function(parm,callback){
			$.extend(this.parms,parm);
			var getAjax = tools.promise(api.getList,true);
			getAjax({
				data:this.parms
			}).then(function(resp){
				if(resp.success){
					console.log(resp.value);
					_.each(resp.value.recruitDistributors,function(item){
						item.select = false;
					});
					self.list = resp.value.recruitDistributors;
					self.city = resp.value.locations;
					if(callback){
						callback(resp.value);
					}
				}
			});
		};
		//全选
		this.selectAll = function(bool){
			_.each(this.list,function(item,index){
				item.select = bool;
			});
		};
		//获取操作员
		this.getOperaters = function(callback){
			var getAjax = tools.promise(api.getOperaters,true);
			getAjax().then(function(resp){
				if(resp.success){
					self.operaters = resp.value;
				}
			});
		};
		//状态操作
		this.updateStatus = function(){
			console.log(this.Status);
			var sids=[],items=[];
			if(!this.Status){
				alert('请选择要移动的状态');
				return;
			}
			_.each(this.list,function(item){
				if(item.select){
					sids.push(item.sid);
					items.push(item);
				}
			});
			if(!sids.length){
				alert('请选择要进行操作的分销商');
				return;
			}
			tools.http({
				url:api.updateStatus,
				data:{
					sids:sids.join(','),
					status:this.Status
				},
				succ:function(resp){
					if(resp.success){
						alert('修改成功');
						_.each(items,function(item){
							item.status = this.updateStatus;
						});
					}
				}
			});
		}
		return this;
	};
	return action;
}]);
dm.filter('recruitStatus',function(){
	return function(v){
		var _str = '--';
		switch(v){
			case 'noContacted':
				_str = '未联系';
				break;
			case 'attention':
				_str = '关注';
				break;
			case 'followUp':
				_str = '跟进';
				break;
			case 'intention':
				_str ='意向';
				break;
			case 'deleted':
				_str = '回收站';
				break;
			case 'cooperation':
				_str = '合作';
				break;
		};
		return _str;
	}
});
dm.filter('timer',function(){
	return function(v){
		return v.split(' ')[0];
	}
});
dm.filter('shopLevel',function(tools){
	return function(v){
		return tools.shopLevel(v);
	}
});