dm.directive('distrdetail',['$rootScope','$compile',function($rootScope,$compile){
	var control = ['$scope','$rootScope','$element','distrDetail',function($scope,$rootScope,$element,distrDetail){
		$scope.options = {};
		/*
		note : ng-if 中的事件监听 没有用 可以用$scope.$parent来获取
		$scope.$on('distri-detail',function(e,v){
			console.log(v);
			$scope.distr = v;
			//debugger;
			//$scope.options = new distrDetail($scope.distr);
			//console.log($scope.options);
		});*/
		console.log($scope.$parent.detail);
		var distr = $scope.distr = $scope.$parent.detail;
		var parms = $scope.parms = new distrDetail($scope.distr);
		//返回
		$scope.return = function(){
			$rootScope.$broadcast('distri-detail-return',true);
		};
		$scope.navs=['运营基础数据','进店词数据','流量渠道数据','授权产品及折扣','联系人信息','联系记录','店铺基本信息'];
		$scope.curNavIndex = 0;
		$scope.setNav = function(index){
			$scope.curNavIndex = index;
		}
		$scope.thead=[
			[ {name:'宝贝',key:'title',sortable:false},{name:'PV',key:'ipv',sortable:'IPV'},
			  {name:'UV',key:'iuv',sortable:'IUV'},{name:'成交额',key:'alipayTradeAmt',sortable:'ALIPAY_TRADE_AMT'},
			  {name:'成交量',key:'alipayAuctionNum',sortable:'ALIPAY_AUCTION_NUM'},{name:'转化率',key:'transformationEfficiency',sortable:'ALIPAY_WINNER_NUM/IUV'},
			  {name:'停留时间',key:'pageDuration',sortable:'PAGE_DURATION/IUV'},{name:'跳失率',key:'lossRate',sortable:'BOUNCE_CNT/LANDING_CNT'},
			  {name:'拍下未付款',key:'noPayNum',sortable:'NO_PAY_NUM'},{name:'加入购物车',key:'addCartUserNum',sortable:'ADD_CART_USER_NUM'}
			]
		];
		$scope.pages=[0,1,2,3];
		$scope.getPage = function(){
			alert('distrdetail');
		}
		$scope.setLevel=function(leve){
			if(isNaN(Number(leve))){
				return;
			}
			$scope.distr.assessmentLevel = leve;
			$scope.parms.updateDistributorOfInfo();
		};
		$scope.setAttention = function(){
			distr.payAttention = !distr.payAttention;
			$scope.parms.updateDistributorOfInfo();
		};
		$scope.setWarning =function(){
			distr.warning = !distr.warning;
			$scope.parms.updateDistributorOfInfo();
		};
		





	}];
	var compile = function(element,attrs,link){
		return function(scope,element,attrs){
			console.log('distributo-detail');
		}
	};
	return {
		restrict:'E',
		replace:true,
		templateUrl:'../html/template/distributor-detail.html',
		compile:compile,
		controller:control,
		scope:true
	}
}]);

//相关操作
dm.factory('distrDetail',['$rootScope','tools',function($rootScope,tools){
	var api = {
		getOperateBasicData:'getOperateBasicData.htm',
		updateDistributorOfInfo:'updateDistributorOfInfo.htm'
	}
	var action = function(item){
		var self = this;
		this.gradId = item.gradId;
		this.tradeType = item.tradeType;
		this.operateBasicData = [];
		this.highThedate = '';
		this.lowThedate = '';
		this.getOperateBasicData = function(){
			var getAjax =  tools.promise(api.getOperateBasicData);
			getAjax({
				data:{
					disSid:this.gradId,
					tradeType : this.tradeType,
					lowThedate: this.lowThedate,
					highThedate:this.highThedate
				}
			}).then(function(resp){
				if(resp.success){
					//alert('成功');
					self.operateBasicData = resp.value.auctionData;
					console.log(resp.value);
					debugger;
				}
			});	
		};
		this.updateDistributorOfInfo = function(){
			console.log(item.warning);
			console.log(item.assessmentLevel);
			tools.http({
				url:api.updateDistributorOfInfo,
				data:{
					disSid:this.gradId,
					warning:item.warning,
					payAttention:item.payAttention,
					assessmentLevel:item.assessmentLevel,
					appointmentTime:item.appointmentTime
				},
				succ:function(resp){
					if(resp.success){
						//alert('修改成功');
					}
				}
			});
		}
		return this;
	}
	return action;
}]);