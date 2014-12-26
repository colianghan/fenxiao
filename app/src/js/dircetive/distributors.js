dm.directive('distributors',['$compile','$routeParams',function($compile,$routeParams){
	var compile = function(element,attrs,link){
		return function(scope,element,attrs,link){
			console.log('distributors');
		}
	}
	var controller = ['$scope','$element','tools','distriAction',function($scope,$element,tools,distriAction){
		/*----------------------自定义分层设置--------------------------------------*/
		$scope.showHighSearch=false;
		$scope.highSearch=function(){
			$scope.showHighSearch=!$scope.showHighSearch;
		};
		$scope.parms = {}; // 所有的操作
		var gradeId = $routeParams.gradeId;
		if(gradeId){
			$scope.gradeId = gradeId;
			$scope.parms = new distriAction({gradeId:$scope.gradeId});
			$scope.parms.getData(function(v){
				if(v.pageSize){
					var length = v.pageSize;
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
		}
		$scope.thead=[
			{name:'店铺旺旺',sortable:false},{name:'UV',sortable:'DIS_UV'},{name:'PV',sortable:'DIS_PV'},
			{name:'成交额',sortable:'DIS_SELL_MONEY'},{name:'成交量',sortable:'DIS_SELL_AMOUNT'},{name:'客单价',sortable:'DIS_PER_CUSTOMER_TRANSACTION'},
			{name:'转化率',sortable:'DIS_TRANSFORMATION_EFFICIENCY'},{name:'金额占比',sortable:'SELL_MONEY_PERCENT'},{name:'量占比',sortable:'SELL_AMOUNT_PERCENT'},
			{name:'店铺信誉',sortable:false},{name:'类型',sortable:false},{name:'好评率',sortable:'DIS_BUYER_GOOD_RATE'},
			{name:'开店时间',sortable:'DIS_SHOP_CREATE_TIME'}
		];
		$scope.sort = function(e,item){
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
			};
			var oldPrams = $scope.parms.parms;
			var newParms = $.extend(oldPrams,{
				sortColumn:item.sortable,
				sort:sortBy
			});
			$scope.parms.search(newParms);
		};
		$scope.getPage =function(page){
			$scope.now=page;
			var count = tools.config.table.count,
				begin = (page-1)*count,
				end = page*count-1;
			var oldPrams = $scope.parms.parms;
			var newParms = $.extend(oldPrams,{
				begin:begin,
				end:end
			});
			$scope.parms.search(newParms);
		};
		$scope.search = function(){
			$scope.parms.getData();
		};
	}];
	return {
		restrict:'E',
		templateUrl:'../html/template/distributors.html',
		scope:true,
		compile:compile,
		controller:controller
	}
}]);

dm.factory('distriAction',['tools',function(tools){
	var getUrl = tools.promise('getCooperationDistributors.htm',true);
	var action = function(data){
		var self = this,
			count = tools.config.table.count;
		this.dis = [];
		this.getDis=[];
		//为了获取30个数据
		if(!data.end){
			data.end = count-1;
		}
		this.parms  = data;
		this.count = tools.config.table.count;
		this.getData = function(callback){
			this.dis = [];
			getUrl({
				data:this.parms
			}).then(function(resp){
				if(resp.success){
					var value =_.isArray(resp.value)?resp.value:resp.value.resultList || [];
					_.each(value,function(item){
						item.select=false;
						item.disShopLevel = tools.shopLevel(item.disShopLevel);
						item.disShopCreateTime = item.disShopCreateTime?item.disShopCreateTime.split(' ')[0]:'';
					});
					//debugger;
					self.dis = value;
					if(callback){
						callback(resp.value);
						return;
					}
				}
			});
		};
		this.stop = function(){
			if(!confirm('是否要终止合作')){
				return;
			}
			var hasSelected = [];
			hasSelected = _.filter(this.dis,function(item){return item.select});
			if(!hasSelected.length){
				alert('请至少选择一个分销商');
				return;
			}
			tools.http({
				url:'',
				data:'',
				succ:function(resp){
					self.dis.splice(); //移出
				}
			});
		};
		this.search = function(parms){
			this.parms = parms;
			this.getData();
		};
		this.clear = function(){
			this.parms = {
				gradeId:this.parms.gradeId,
				end:this.parms.end
			}
		};
		return this;
	};
	return action;
}]);
dm.directive('page',function(){
	return {
		templateUrl:'../html/template/table-pages.html',
		restrict:'E',
		scope:true
	}
});


dm.filter('shopType',function(){
	return function(v){
		if(v=='商城'){
			return '淘宝';
		}
		return '天猫';
	}
});