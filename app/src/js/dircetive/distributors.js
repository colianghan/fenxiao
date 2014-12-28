dm.directive('distributors',['$compile','$routeParams',function($compile,$routeParams){
	var compile = function(element,attrs,link){
		return function(scope,element,attrs,link){
			console.log('distributors');
		}
	}
	var controller = ['$rootScope','$scope','$element','tools','distriAction',function($rootScope,$scope,$element,tools,distriAction){
		/*----------------------自定义分层设置--------------------------------------*/
		$scope.showHighSearch=false;
		$scope.highSearch=function(){
			$scope.showHighSearch=!$scope.showHighSearch;
		};
		$scope.parms = {}; // 所有的操作

		//发送消息 bgin
		$scope.news = false; 
		$scope.addUser = false;
		$scope.showNews = function(){
			$scope.news = !$scope.news;
			$scope.addUser = false;
		}
		$scope.showTable = function(){
			$scope.addUser = !$scope.addUser;
		}

		//
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
			if($scope.now == page){
				return;
			}
			$('#selectAll').prop('checked',false);
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
			var value =  $('.date',$element).val();
			if(value!=''){
				$scope.parms.parms.lowDisShopCreateTime = value; 				
			}
			$scope.parms.getData();
		};
		$scope.moveLayers = function(){
			/*toDo:必须先选择完 才能移入等级中*/
			$rootScope.$broadcast('show-layers',$scope.parms.dis);
		};

		//获取分销详情页
		$scope.showDetail = false;
		$scope.getDetail = function(item){
			$scope.showDetail = true;
			$scope.detail = item;
			/*$rootScope.$broadcast('distri-detail',item);*/
		};
		$scope.$on('distri-detail-return',function(e,v){
			if(v){
				$scope.showDetail = false;
			}
		});
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
		this.allSelect = false;
		//为了获取30个数据
		if(!data.end){
			data.end = count-1;
		}
		this.parms  = data;
		this.count = tools.config.table.count;
		//获取数据
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
		//终止合作
		this.stop = function(){
			if(!confirm('是否要终止合作')){
				return;
			}
			var hasSelected = [];
			hasSelected = _.filter(this.dis,function(item){return item.select});
			var disNicks=_.pluck(hasSelected,'disNick');
			//debugger;
			if(!hasSelected.length){
				alert('请至少选择一个分销商');
				return;
			}
			tools.http({
				url:'terminateCooperation.htm',
				data:{
					disNicks:disNicks.join(',')
				},
				succ:function(resp){
					//self.dis.splice(); //移出
					self.dis = _.difference(self.dis,hasSelected);
				}
			});
		};
		//筛选 （排序时使用到了）
		this.search = function(parms){
			this.parms = parms;
			this.getData();
		};
		//清除筛选
		this.clear = function(){
			this.parms = {
				gradeId:this.parms.gradeId,
				end:this.parms.end
			}
		};
		//全选
		this.selectAll = function(e){
			var $ele = $(e.currentTarget),
				value = $ele.prop('checked');
			//debugger;
			_.each(this.dis,function(item){
				item.select = value;
			});
		};
		return this;
	};
	return action;
}]);
dm.directive('page',function(){
	return {
		templateUrl:'../html/template/table-pages.html',
		restrict:'E',
		scope:true,
		repalce:true
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