dm.directive('recruitDistris',['$parse',function($parse){
	var compile  = function(element,attrs,link){
		return function($scope,$element,$attrs){
			console.log('recruitindex');
		}
	};
	var controller = ['$scope','$element','$attrs','initPages','recruitDistrisModel',function($scope,$element,$attrs,initPages,recruitDistrisModel){
		debugger;
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
		$scope.getPage = function(page){
			alert(page);
		};
		$scope.getSort = function(e,item){

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
		getOperaters:'getRecruitOfOperaters.htm'
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
		this.selectAll = function(bool){
		};
		this.getOperaters = function(callback){
			var getAjax = tools.promise(api.getOperaters,true);
			getAjax().then(function(resp){
				if(resp.success){
					self.operaters = resp.value;
				}
			});
		};
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