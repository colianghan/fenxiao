dm.directive('recruitIndex',['$parse',function($parse){
	var compile  = function(element,attrs,link){
		return function($scope,$element,$attrs){
			var $table = $('.recruit-index-table',$element),
				$close = $('.close',$table);
			$close.click(function(e){
				$table.hide();
			});
			console.log('recruitindex');
		}
	};
	var controller = ['$scope','$element','$attrs','initPages','recruitIndexModel',function($scope,$element,$attrs,initPages,recruitIndexModel){
		//debugger;
		var model = $scope.model = new recruitIndexModel();
		model.getData();
		//$scope.data = [1,2,3,4,5,6,7,8,9,0];
		var $table = $('.recruit-index-table',$element);
		$scope.status = undefined,$scope.trend = false;
		$scope.getTable = function(e,data,tag){
			if(!data||data.list&&!data.list.length){
				return;
			}
			$scope.tableTag = tag;
			var $ele = $(e.currentTarget);
			$table.insertAfter($ele).show();
			$scope.data = data.list;
			$scope.dataSrc = data.list;
		};
		//取消预约
		$scope.canselRecord = function(index,item){
			model.canselRecord(index,item,function(index){
				$scope.data.splice(index,1);
			});
		};
		//操作通过 拒绝
		$scope.auditRecruit = function(index,auditResult,item){
			model.auditRecruit(auditResult,item,function(){
				$scope.data.splice(index,1);
			});
		};
		//排序
		$scope.$watch('status',function(v,ov){
			if(v===undefined){
				return;
			}
			$scope.data = _.filter($scope.dataSrc,function(item){
				item.status = v;
			});
		});

		//获取趋势详情
		$scope.getTrend = function(key,value){
			$scope.operator = key;
			$scope.trend = true;
		};
		//返回
		$scope.hideTrend = function(){
			$scope.trend = false;
		}
	}];
	return {
		restrict:'E',
		scope:true,
		replace:true,
		compile:compile,
		controller:controller,
		templateUrl:'../html/template/recruit-index.html'
	}
}]);

dm.factory('recruitIndexModel',['tools',function(tools){
	var api={
		getRecruitOfAppointDistributors:tools.promise('getRecruitOfAppointDistributors.htm',true),//预约待联系
		getRecruitOfNeedToCheckDistributors:tools.promise('getRecruitOfNeedToCheckDistributors.htm',true),//二、申请待审核
		getRecruitOfYesterdayRecruitDistributors:tools.promise('getRecruitOfYesterdayRecruitDistributors.htm',true),//三、昨日招募
		getRecruitOfYesterdayContactDistributors:tools.promise('getRecruitOfYesterdayContactDistributors.htm',true),//四、昨日联系
		getRecruitOfGatherContactDistributors:tools.promise('getRecruitOfGatherContactDistributors.htm',true),//五、招募统计汇总数据（30天）
		updateRecruitOfDistributor:tools.promise('updateRecruitOfDistributor.htm',false),//取消预约
		auditRecruitOfCooperation:tools.promise('auditRecruitOfCooperation.htm',false)//分销待审核通过 拒绝
	};
	var model=function(){
		var self = this;
		this.getData=function(){
			//预约待联系
			api.
				getRecruitOfAppointDistributors().then(function(resp){
					if(resp.success){
						//debugger;
						self.appoint = resp.value;
					}
				});
			//申请待审核
			api.
				getRecruitOfNeedToCheckDistributors().then(function(resp){
					if(resp.success){
						//debugger
						_.each(resp.value.list,function(item){
							item.nick=item.distributorNick
						});
						self.needToCheck = resp.value;
					}
				});
			//昨日招募
			api.
				getRecruitOfYesterdayRecruitDistributors().then(function(resp){
					if(resp.success){
						console.log(resp.value);
						//debugger;
						var _value = resp.value;
						//添加为分销商
						self.addToCooperations={
							list:_value.addToCooperations,
							size:_value.addToCooperationSize
						};
						//self.addToCooperationSize=_value.addToCooperationSize;
						self.addRequisitionSize=_value.addRequisitionSize;//昨日新增申请数
						self.admitRequisitionSize=_value.admitRequisitionSize;//昨日通过申请数
					}
				});
			//昨日联系
			api.
				getRecruitOfYesterdayContactDistributors().then(function(resp){
					if(resp.success){
						console.log(resp.value);
						//debugger;
						var _value = resp.value;
						self.intentionSize=_value.intentionSize;//新增意向
						self.attentionSize = _value.attentionSize;//新增关注
						self.followUpSize = _value.followUpSize;//新增跟进
					}
				});
			//招募统计汇总数据
			api.
				getRecruitOfGatherContactDistributors().then(function(resp){
					if(resp.success){
						console.log(resp.value);
						self.gather = resp.value;
					}
				});
		};
		//预约待联系 取消预约
		this.canselRecord = function(index,item,callback){
			if(item){
				api.updateRecruitOfDistributor({
					data:{
						sid :item.sid,
						appointTime:'1999-10-5'
					}
				}).then(function(resp){
					if(resp.success){
						alert('取消预约成功');
						if(callback){
							callback(index);
						}
					}
				});
			}
		};
		//分销申请待审核 通过 拒绝
		this.auditRecruit = function(auditResult,item,callback){
			debugger;
			api.auditRecruitOfCooperation({
				data:{
					requisitionId:item.requisitionId,
					auditResult:auditResult
				}
			}).then(function(resp){
				if(resp.success){
					alert('操作成功');
					if(callback){
						callback();
					}
				}
			});
		};
	};
	return model;
}]);