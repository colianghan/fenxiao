dm.directive('recruitTrend',['$parse',function($parse){
	var compile = function(element,attrs,link){
		return function(scope,element,attrs){
			console.log('recruit-trend');
		}
	};
	var controller = ['$parse','$scope','$element','$attrs','recruitTrendModel',function($parse,$scope,$element,$attrs,recruitTrendModel){
		var operater = $scope.operater =  $parse($attrs.operater)($scope.$parent);
		$scope.status = 'attention';//意向
		var model = $scope.model = new recruitTrendModel(operater);
		$scope.$watch('status',function(v,ov){
			var _name = $scope.navs;
			model.getData(v,function(obj){
				console.log(model.values.length);
				var operaterStr = operater=='all'?'全部':operater;
				var options={
						chart:{
							type:'column'
						},
						title:{
							text:_name[v],
							align:'left'
						},
						xAxis:{
							categories:model.times
						},
						yAxis:{
							title:{
								text:'人数'
							}
						},
						tooltip:{
							shared:true
							/*formatter:function(){
								var day = new Date();
								day.setTime(this.x);
								var dayFormater= day.getFullYear()+'-'+(day.getMonth()+1)+'-'+day.getDate();
								var s = '<b>'+dayFormater+'</b>';
								$.each(this.points,function(){
									s+='<br />'+this.series.name+':'+this.y+'元';
								});
								return s;
							}*/
						},
						credits:{
							enabled:false
						},
						series:[{
							name:operaterStr+'的'+_name[v],
							data:model.values
						}]
					}
				$('.highCharts',$element).highcharts(options).highcharts();
			});
		});
		$scope.navs= {
				intention:'意向',
				attention:'关注',
				followUp:'跟进',
				cooperation:'合作'
			};
		$scope.setStatus = function(key){
			if($scope.status===key){
				return;
			}
			$scope.status = key;
		};
	}];
	return {
		restrict:'E',
		scope:true,
		replace:true,
		compile:compile,
		controller:controller,
		templateUrl:'../html/template/recruit-trend.html'
	}
}]);

dm.factory('recruitTrendModel',['tools',function(tools){
	var api = {
		//招募统计趋势数据（30天）
		get:tools.promise('getRecruitOfTrendContactDistributors.htm',true)
	};
	var model = function(operater){
		var self = this;
		this.operater = operater;
		this.times=[],this.time1=[],this.time2=[],this.values=[];//时间 数据
		this.getData = function(status,callback){
			//招募统计趋势数据
			api.
				get({
					data:{
						status:status,
						operater:this.operater
					}
				}).then(function(resp){
					if(resp.success){
						console.log(resp.value);
						var _sortKey = _.keys(resp.value).sort();
						self.times=[],self.time1=[],self.time2=[],self.values=[];//时间 数据 （重置）
						_.each(_sortKey,function(i){
							_.each(resp.value,function(item,key){
								if(key==i){
									self.values.push(item);
									var _key = key==null?'':key.split(' ')[0];
									var moDayArry = _key.split('-'),moDayStr = '';
									if(moDayArry.length==3){
										moDayStr = moDayArry[1]+'-'+moDayArry[2];
									}
									self.times.push(moDayStr);
									if(self.time1.length>=15){
										self.time2.push(moDayStr);
									}else{
										self.time1.push(moDayStr);
									}
								}
							});
						});
						self.objSrc = _.object(self.times,self.values);
						if(callback){
							callback(self.objSrc);
						}
					}
				});
		};
		return this;
	};
	return model;
}]);