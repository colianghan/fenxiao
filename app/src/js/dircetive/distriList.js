dm.directive('distrilist',function(){
	var compile = function(element,attrs,link){
		return function(scope,element,attrs){
			//console.log('distriList');
		}
	};
	var controller = ['$scope','$rootScope','$attrs','$parse','distriListModel','initPages',function($scope,$rootScope,$attrs,$parse,distriListModel,initPages){
		//debugger;
		var item = $scope.item = $parse($attrs.item)($scope.$parent.$parent);//执行时 scope在ng-repeat中，所以是两层parent
		if(!item){
			return;
		};
		//console.log(item);
		var model = $scope.model = new distriListModel(item);
		model.getList(null,function(v){
			initPages($scope,v.resultSize);
		});
		$scope.getPage = function(page){
			//获取分页
			//debugger;
			if($scope.now == page){
				return;
			}
			$scope.now=page;
			var count = model.count,
				begin = (page-1)*count;
			model.getList({
				begin:begin
			});
		};
		$scope.showDetail = function(item){
			//显示详情页
			$scope.$parent.$parent.detail = item;
			$scope.$parent.$parent.show=3;
		};
		$scope.editCount=function(index,type){
			var value = $('#pricCount_'+type+'_'+index).val(),price;
			if(value==''){
				alert('请输入数字');
				return;
			};
			value = Number(value);
			if(isNaN(value)){
				alert('请输入数字');
				return;
			};
			value = value.toFixed(2);
			var prod = model.list[index];
			var price = type==='discount'?(prod.standardPrice*(value/100)).toFixed(2):value;
			model.updatePrice(prod,price,function(v){
				var _tmp,_value;
				if(type==='discount'){
					//是修改的打折 需要修改采购价里的输入框
					_tmp = 'price';
					_value = prod.agentCostPrice;
				}else{
					_tmp = 'discount';
					_value = (prod.agentCostPrice/prod.standardPrice*100).toFixed(2);
				}
 				$('#pricCount_'+_tmp+'_'+index).val(_value);
			});
		};
		$scope.back = function(){
			$scope.$parent.$parent.show=1;
		};
		$scope.gradeCur = 'all';//  所选等级
		$scope.$watch('gradeCur',function(v,ov){
			if(ov==undefined){
				//过滤初始化的时候
				return;
			}
			if(v=='all'){
				delete model.parms.gradeId;
				model.getList({begin:0},function(v){
					initPages($scope,v.resultSize);
				});
				return;
			}
			model.getList({
				gradeId:v,
				begin:0
			},function(v){
				initPages($scope,v.resultSize);
			});
		});
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
		this.pulling = false; // 获取数据转圈操作
		this.parms = {
			pid:item.pid,
			count:this.count,
			begin:0
		};
		//获取列表
		this.getList = function(parms,callback){
			$.extend(this.parms,parms);
			var getAjax = tools.promise(api.getDistrList,true);
			this.pulling = true;
			getAjax({
				data:this.parms
			}).then(function(resp){
				if(resp.success){
					var _gradesObj = _.indexBy(resp.value.gradeInfo,'gradeId');
					_gradesObj[0]={gradeId:0,name:'未分组'};
					self.list = resp.value.list;
					self.gradeList = _gradesObj;
					self.pulling = false;
					if(callback){
						callback(resp.value);
					}
				}else{
					alert(resp.message);
				}
			});
		};
		//修改价格
		this.updatePrice = function(prod,prices,callback){
			tools.http({
				url:api.editPrice,
				data:{
					pid:this.pid,
					disSids:prod.disSid,
					disIds:prod.disId,
					prices:prices
				},
				succ:function(resp){
					if(resp.success){
						alert('修改成功');
						prod.agentCostPrice = prices;
						if(callback){
							callback(resp.value);
						}
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