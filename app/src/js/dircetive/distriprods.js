dm.directive('distriprods',['$rootScope','distriProdModel',function($rootScope,distriProdModel){
	var compile = function(element,attrs,link){
		return function($scope,$element,$attrs){
			console.log('distriprods');
		}
	};
	var controller = ['$scope','$element','$attrs','$parse','initPages',function($scope,$element,$attrs,$parse,initPages){
		var tagIndex = $scope.tagIndex = $parse($attrs.tag)($scope),
			status = tagIndex==4?'up':'down';
		console.log(status);
		$scope.highSearch = false,$scope.searchParm ={begin:0};
		var searchBase = $scope.searchBase = 'Dis';
		var theads = $scope.theads=[
			{name:'浏览量',key:'Ipv',sortable:'IPV'},{name:'访客数',key:'Iuv',sortable:'IUV'},{name:'成交额',key:'AlipayTradeAmt',sortable:'ALIPAY_TRADE_AMT'},
			{name:'成交量',key:'AlipayAuctionNum',sortable:'ALIPAY_AUCTION_NUM'},{name:'转化率',key:'TransformationEfficiency',sortable:'TRANSFORMATION_EFFICIENCY'},
			{name:'购物车',key:'AddCartUserNum',sortable:'ADD_CART_USER_NUM'},{name:'收藏量',key:'AuctionCollectNum',sortable:'AUCTION_COLLECT_NUM'},
			{name:'停留时间',key:'PageDuration',sortable:'PAGE_DURATION'},{name:'跳失率',key:'LossRate',sortable:'LOSS_RATE'}
		];
		var model = $scope.model = new distriProdModel(theads,status);
		model.getData({
			begin:0
		},function(v){
			initPages($scope,v.resultSize); 
		});
		$scope.show = 1;//[1,2,3]:首页，分销列表，分销详情
		$scope.getSort = function(e,item){
			//debugger
			if(!item.sortable){
				return;
			}
			var $ele = $(e.currentTarget),sortBy;
			if($ele.hasClass('sort-desc')){
				//升序
				$ele.removeClass('sort-desc').addClass('sort-asc').siblings().removeClass('sort-asc sort-desc');
				sortBy='up';	
			}else{
				//降序
				$ele.removeClass('sort-asc').addClass('sort-desc').siblings().removeClass('sort-asc sort-desc');
				sortBy='down';
			}
			/*var oldPram  =  model.filter;
			var newPram = $.extend(oldPram,{
				sortColumn: $scope.searchBase.toUpperCase()+'_'+item.sortable,
				sort : sortBy
			});*/
			$scope.now = 1;
			model.getData({
				sortColumn: $scope.searchBase.toUpperCase()+'_'+item.sortable,
				sort : sortBy,
				begin:0
			},function(v){
				initPages($scope,v.resultSize);
			});
		};
		$scope.getPage = function(page){
			//alert(index);
			if($scope.now == page){
				return;
			}
			$scope.now=page;
			var count = model.count,
				begin = (page-1)*count;
			model.getData({
				begin:begin
			});
		};
		$scope.up_down_options = function(id){
			if(!confirm('是否要进行上下架操作')){
				return;
			}
			model.updateStatus(id);
		};
		$scope.search = function(){
			var _parms = $.extend({},$scope.searchParm);
			var lowTrans = $scope.searchParm['low'+$scope.searchBase+'TransformationEfficiency'];
			var highTrans =$scope.searchParm['high'+$scope.searchBase+'TransformationEfficiency'];
			if(lowTrans!=undefined&&lowTrans!=''){
				_parms['low'+$scope.searchBase+'TransformationEfficiency']=lowTrans/100;
			}
			if(highTrans!=undefined&&highTrans!=''){
				_parms['high'+$scope.searchBase+'TransformationEfficiency']=highTrans/100;
			}
			model.getData(_parms,function(v){
				initPages($scope,v.resultSize);
			});
		};
		$scope.getDistrList = function(item){
			$scope.detailDistr = item || {};
			$scope.show = 2;
		};
	}];
	return {
		restrict:'E',
		scope:true,
		replace:true,
		templateUrl:'../html/template/distriprods.html',
		compile:compile,
		controller:controller
	}
}]);


dm.factory('distriProdModel',['tools',function(tools){
	var api ={
		getData:'getDistributorManageProductEffectByPage.htm',
		updateStatus:'updateProductStatus.htm'
	};
	var action = function(theads,status){
		this.theads = theads;
		var self = this;
		this.status = status;
		this.parms = {};
		this.count = tools.config.table.count;
		this.filter = {
			status:this.status,
			count:this.count
		};
		this.getData = function(parms,callback){
			$.extend(this.filter,parms);
			//this.filter = parms;
			var _ajax = tools.promise(api.getData,true);
			_ajax({
				data:this.filter
			}).then(function(resp){
				if(resp.success){
					//将数据进行了分离处理
					//debugger;
					var tmp=[];
					_.each(resp.value.list,function(item,index){
						tmp.push(item);
						var _dis={},_sup={};
						_.each(self.theads,function(i,index){
							_dis[i.key] = item['dis'+i.key];
							_dis.picUrl = item.picUrl;
							_dis.pid = item.pid;
							_sup[i.key] = item['sup'+i.key]; 
							_sup.picUrl = item.picUrl;
							_sup.pid = item.pid;
						});
						tmp.push(_sup);
						tmp.push(_dis);
					});
					self.prods = tmp;
					if(callback){
						callback(resp.value);
					}
				}
			});
 		};
		this.updateStatus = function(id,callback){
			tools.http({
				url:api.updateStatus,
				data:{
					pid:id,
					status:this.status=='up'?'down':'up'
				},
				succ:function(resp){
					if(resp.success){
						alert('修改成功');
						var tmp = [];
						_.each(self.prods,function(item,index){
							if(item.pid != id){
								tmp.push(item);
							}
						});
						self.prods = tmp;
						if(callback){
							callback(resp.value);
						}
					}
					else{
						alert(resp.message);
					}
				}
			});
		};
		return this;
	};
	return action;
}]);