dm.directive('distrilist',function(){
	var compile = function(element,attrs,link){
		return function(scope,element,attrs){
			console.log('distriList');
		}
	};
	var controller = ['$scope','$rootScope','$attrs','$parse','distriListModel',function($scope,$rootScope,$attrs,$parse,distriListModel){
		debugger;
		var item = $parse($attrs.item)($scope.$parent.$parent);//执行时 scope在ng-repeat中，所以是两层parent
		if(!item){
			return;
		};
		console.log(item);
		var model = $scope.model = new distriListModel(item);
		model.getList();
	}];
	return {
		restrict:'E',
		scope:true,
		templateUrl:'../html/template/distriList.html',
		compile:compile,
		controller:controller,
		replace:true
	}
});

dm.factory('distriListModel',['tools',function(tools){
	var api = {
		getDistrList:'getProductPurchasePrices.htm',
		editPrice:'updateDisPruchasePriceByDisIds.htm'
	};
	var action = function(item){
		var self = this;
		this.count = tools.config.table.count;
		this.pid = item.pid;
		this.parms = {
			pid:item.pid,
			count:this.count,
			begin:0
		};
		this.getList = function(parms,callback){
			$.extend(this.parms,parms);
			var getAjax = tools.promise(api.getDistrList,true);
			getAjax({
				data:this.parms
			}).then(function(resp){
				if(resp.success){

				}else{
					alert(resp.message);
				}
			});
		};
		this.updatePrice = function(disIds,disSids,prices){
			tools.http({
				url:api.editPrice,
				data:{
					pid:this.pid,
					disSids:disSids,
					disIds:disIds,
					prices:prices
				},
				succ:function(resp){
					if(resp.success){
						alert('修改成功');
					}else{
						alert(resp.message);
					}
				}
			});
		};
		return this;
	};
	return action;
}]);