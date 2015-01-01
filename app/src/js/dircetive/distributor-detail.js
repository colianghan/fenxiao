dm.directive('distrdetail',['$rootScope','$compile',function($rootScope,$compile){
	var control = ['$scope','$rootScope','$element','distrDetail','initPages',function($scope,$rootScope,$element,distrDetail,initPages){
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
			$scope.parms.begin = 0;
			$scope.parms.end = false;
			$scope.now=1;
			$scope.data = null;
			$scope.pages=null;
			_obj[$scope.curNavIndex]();
		};
		$scope.thead=[
			[ {name:'宝贝',key:'title',sortable:false},{name:'PV',key:'ipv',sortable:'IPV'},
			  {name:'UV',key:'iuv',sortable:'IUV'},{name:'成交额',key:'alipayTradeAmt',sortable:'ALIPAY_TRADE_AMT'},
			  {name:'成交量',key:'alipayAuctionNum',sortable:'ALIPAY_AUCTION_NUM'},{name:'转化率',key:'transformationEfficiency',sortable:'ALIPAY_WINNER_NUM/IUV'},
			  {name:'停留时间',key:'pageDuration',sortable:'PAGE_DURATION/IUV'},{name:'跳失率',key:'lossRate',sortable:'BOUNCE_CNT/LANDING_CNT'},
			  {name:'拍下未付款',key:'noPayNum',sortable:'NO_PAY_NUM'},{name:'加入购物车',key:'addCartUserNum',sortable:'ADD_CART_USER_NUM'}
			],
			[{name:'关键词',key:'query',sortable:false},{name:'访客数',key:'uv',sortable:'UV'},{name:'成交额',key:'alipayTradeAmt',sortable:'ALIPAY_TRADE_AMT'},
			 {name:'成交用户数',key:'alipayAuctionNum',sortable:'ALIPAY_AUCTION_NUM'},{name:'客单价',key:'perCustomerTransaction',sortable:'SUM(ALIPAY_TRADE_AMT)/SUM(ALIPAY_WINNER_NUM)'},{name:'转化率',key:'transformationEfficiency',sortable:'SUM(ALIPAY_WINNER_NUM)/SUM(UV)'},
			 {name:'展现量',key:'impression',sortable:'IMPRESSION'},{name:'点击率',key:'clickRate',sortable:'SUM(CLICK)/SUM(IMPRESSION)'}
			],
			[{name:'PV',key:'ipv',sortable:'IPV'},{name:'UV',key:'iuv',sortable:'IUV'},{name:'成交额',key:'alipayTradeAmt',sortable:'ALIPAY_TRADE_AMT'},
			 {name:'成交量',key:'alipayAuctionNum',sortable:'ALIPAY_AUCTION_NUM'},{name:'订单数',key:'alipayTradeNum',sortable:'ALIPAY_TRADE_NUM'},{name:'转化率',key:'transformationEfficiency',sortable:'SUM(ALIPAY_WINNER_NUM)/SUM(IUV)'},
			 {name:'客单价',key:'perCustomerTransaction',sortable:'SUM(ALIPAY_TRADE_AMT)/SUM(ALIPAY_WINNER_NUM)'}
			]
		];
		//$scope.pages=[0,1,2,3];
		$scope.getPage = function(page){
			//var begin = 
			if($scope.now == page){
				return;
			}
			$scope.now=page;
			var count = $scope.parms.tableLength,
				begin = (page-1)*count,
				end = page*count-1;
			//$scope.parms.search(newParms);
			//alert('distrdetail');
			$scope.parms.begin = begin;
			$scope.parms.end = end;
			_obj[$scope.curNavIndex]();
		}
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
			$scope.parms.sortBy=sortBy;
			$scope.parms.sortColumn = item.sortable;
			//$scope.parms.search(newParms);
			_obj[$scope.curNavIndex]();
		};
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
		var _obj = {
			0:function(){
				//运营基础数据
				//debugger;
				$scope.parms.lowThedate = $('.lowThedate').val()||'2014-11-29';
				$scope.parms.highThedate = $('.highThedate').val()||'2014-12-19';
				$scope.parms.getOperateBasicData(function(v){
					$scope.data = $scope.parms.operateBasicData;
					if(v.resultSize){
						initPages($scope,v.resultSize);
					}
				});
				$scope.shopAttr = ['ipv','iuv','alipayTradeAmt','alipayAuctionNum','transformationEfficiency',
					'noPayNum','addCartUserNum','pageDuration','lossRate'
				];
			},
			1:function(){
				$scope.shopAttr = ['click','uv','alipayTradeAmt','alipayAuctionNum','transformationEfficiency'];
				$scope.parms.lowThedate = $('.lowThedate').val()||'2014-11-29';
				$scope.parms.highThedate = $('.highThedate').val()||'2014-12-19';
				$scope.parms.getKeyWordInfo();
				$scope.parms.getKeyWordList(function(v){
					$scope.data = $scope.parms.keyword.list;
					if(v.resultSize){
						initPages($scope,v.resultSize);
					}
					console.log($scope.parms.keyword);
				});
			},
			2:function(){
				$scope.parms.getDistriDataSrc(function(resp){
					//debugger;
					console.log($scope.parms.distriDataSrc);
				});
			},
			3:function(){
				//产品授权及折扣
				$scope.parms.getProds(function(v){
					debugger;
					if(v.resultSize){
						initPages($scope,v.resultSize);
					}
				});
			},
			4:function(){
				$scope.parms.concats || $scope.parms.getRecordList(function(v){
					//$scope.parms.concats=v.disLinkManInfos;
					/*for(var i =0;i<=10;i++){
						$scope.parms.concats.unshift({});
					}*/
				});
				//console.log();
				$scope.$on('remove-concat',function(e,v){
					if(!v){
						return;
					}
					/*if(!v.id){
						$scope.parms.concats.shift();
					}*/
					$scope.parms.deleteConcat(v);
					debugger;
				});
				$scope.$on('save-concat',function(e,v){
					$scope.parms.addConcat(v);
				});
				$scope.$on('edit-concat',function(e,v){
					$scope.parms.alterConcat(v);
				});
			},
			5:function(){
				$scope.parms.records ||$scope.parms.getRecordList();
				$scope.record={};//添加的东西
				$scope.showAdd = false;
				$scope.addRecord = function(){
					$scope.record.contactTime = $('.contactTime',$element).val();
					$scope.parms.addRecord($scope.record,function(v){
						$scope.record={};
					});
				};
			},
			6:function(){
				$scope.parms.shopUrl || $scope.parms.getRecordList();
				console.log($scope.parms.shopUrl);
				console.log('店铺基本信息');
			}
		};
		_obj[$scope.curNavIndex]();
		$scope.getData = function(){
			_obj[$scope.curNavIndex]();
		};
		$scope.editCount = function(i){
			var value = $('#pricCount_'+i).val();
			$scope.parms.editCount(i,value);
		};
		$scope.addConcat =function(){
			var item = $scope.parms.concats[0]
			if(item&&item.id){
				$scope.parms.concats.unshift({});
			}else if(item == undefined){
				$scope.parms.concats.unshift({});
			}	
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
		updateDistributorOfInfo:'updateDistributorOfInfo.htm',
		getDistributorDetailPvSrcEffectsByShop:'getDistributorDetailPvSrcEffectsByShop.htm',
		getDistributorDetailQueryEffectsByQuery:'getDistributorDetailQueryEffectsByQuery.htm',/*获取汇总数据*/
		getDistributorQueryEffectsDetailByQuery:'getDistributorQueryEffectsDetailByQuery.htm',/*获取单个详情*/
		getDistributorDetailOfGatherQueryEffects:'getDistributorDetailOfGatherQueryEffects.htm',/*获取关键词 母店和分销的数据*/
		getPrudsList:'getProductLineOfDistributorPurchasePriceList.htm',//获取膜分销商的授权产品信息
		updatePrice:'updateDisPruchasePriceByPids.htm',//修改分销商的折扣
		getRecordList:'getDistributorDetailContactInfo.htm', //获取联系记录列表
		insertRecordList:'addDisContactHistoryRecord.htm', //添加联系记录
		addConcat:'addDisLinkManInfo.htm',
		updateConcat:'updateDisLinkManInfo.htm',
		deleteConcat:'deleteDisLinkManInfo.htm'
	};
	var action = function(item){
		var self = this;
		this.tableLength = tools.config.table.count;
		this.disId = item.disShopId;
		this.tradeType = item.tradeType;
		this.operateBasicData = [];//运营基础数据
		this.shopData = {}; // 对象 店铺概况
		this.distriDataSrc=[];//流量渠道数据
		this.keyword ={};//进店词  (shop:{},list:[])
		this.highThedate = '';
		this.lowThedate = '';
		/*this.parms = {
			disSid:this.disId,
			tradeType : this.tradeType,
			lowThedate: this.lowThedate,
			highThedate:this.highThedate,
			sort:this.sortBy,
			sortColumn:this.sortKey
		};*/
		/*运营基础数据*/
		this.getOperateBasicData = function(callback){
			var getAjax =  tools.promise(api.getOperateBasicData,true);
			getAjax({
				data:{
					disSid:this.disId,
					tradeType : this.tradeType,
					lowThedate: this.lowThedate,
					highThedate:this.highThedate,
					sort:this.sortBy,
					sortColumn:this.sortColumn,
					begin:this.begin||0,
					end:this.end||this.tableLength-1
				}
			}).then(function(resp){
				if(resp.success){
					//alert('成功');
					self.operateBasicData = resp.value.auctionData;
					self.shopData = resp.value.shopData;
					//console.log(resp.value);
					if(callback){
						callback(resp.value);
					}
				}else{
					alert(resp.message);
				}
			});	
		};
		/*更新用户状态*/
		this.updateDistributorOfInfo = function(){
			console.log(item.warning);
			console.log(item.assessmentLevel);
			tools.http({
				url:api.updateDistributorOfInfo,
				data:{
					disSid:this.disId,
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
		};
		/*进店词数据*/
		this.getKeyWordInfo = function(callback){
			var getAjax = tools.promise(api.getDistributorDetailOfGatherQueryEffects,true);
			getAjax({
				data:{
					disSid:this.disId
				}
			}).then(function(resp){
				if(resp.success){
					self.keyword.shop = resp.value;
					//debugger;
					if(callback){
						callback(resp.value);
					}
				}else{
					alert(resp.message);
				}
			});
		};
		this.getKeyWordList = function(callback){
			var getAjax = tools.promise(api.getDistributorDetailQueryEffectsByQuery,true);
			getAjax({
				data:{
					disSid:this.disId,
					tradeType : this.tradeType,
					lowThedate: this.lowThedate,
					highThedate:this.highThedate,
					sort:this.sortBy,
					sortColumn:this.sortColumn,
					begin:this.begin||0,
					end:this.end||this.tableLength-1
				}
			}).then(function(resp){
				if(resp.success){
					self.keyword.list=resp.value.list;
					if(callback){
						callback(resp.value);
					}
				}else{
					alert(resp.message);
				}
			});
		};
		this.getKeyWordDetail = function(query,callback){
			var getAjax = tools.promise(api.getDistributorDetailQueryEffectsByQuery,true);
			getAjax({
				data:{
					disSid:this.disId,
					tradeType : this.tradeType,
					lowThedate: this.lowThedate,
					highThedate:this.highThedate,
					query:query
				}
			}).then(function(resp){
				if(resp.success){
					self.keyword.detail=resp.value;
					if(callback){
						callback(resp.value);
					}
				}else{
					alert(resp.message);
				}
			});
		};
		/*流量渠道*/
		this.getDistriDataSrc = function(callback){
			var getAjax = tools.promise(api.getDistributorDetailPvSrcEffectsByShop,true);
			getAjax({
				data:{
					disSid:this.disId,
					tradeType : this.tradeType,
					lowThedate: this.lowThedate,
					highThedate:this.highThedate,
					sort:this.sortBy,
					sortColumn:this.sortKey,
					begin:this.begin||0,
					end:this.end||this.tableLength-1
				}
			}).then(function(resp){
				if(resp.success){
					//成功
					console.log(resp);
					var _arry = _.filter(resp.value,function(item){return item.srcLevel<=2});//清除2级目录下的其他东东..
                    var pil = _.indexBy(_arry,function(item){return item.srcParentId===0});
					var _arryTmp = _.filter(_arry,function(item){return item.srcParentId===0});//进行循环的数组
					var _src = [];
					//debugger;
					_.each(_arryTmp,function(item,index){
						item.chanels = _.filter(_arry,function(i){
							return i.srcParentId === item.srcId
						});
						var length = item.chanels.length;
						if(length){
							item.chanels[0].parentName=item.srcName;
							item.chanels[0].childLength = length;
						}
						//debugger;
						_src = _src.concat(item.chanels);
					});
					self.distriDataSrc = _src;
					if(callback){
						callback(resp.value);
					}
				}
			});
		}
		this.getProds = function(callback){
			//获取授权产品及折扣
			var getAjax = tools.promise(api.getPrudsList,true);
			getAjax({
				data:{
					disSid:this.disId,
					begin:this.begin||0,
					count:this.tableLength
				}
			}).then(function(resp){
				if(resp.success){
					//debugger;
					console.log(resp.value);
					self.productLines =  _.indexBy(resp.value.productLines,'productLineId');
					self.prods = resp.value.list;
					if(callback){
						callback(resp.value);
					}
				}else{
					alert(resp.message);
				}
			});
		}
		this.editCount = function(index,value){
			if(value==''){
				alert('请输入整数');
				return;
			};
			value = Number(value);
			if(isNaN(value)){
				alert('请输入整数');
				return;
			};
			value = value.toFixed(2);
			var prod = this.prods[index];
			var price = (prod.standardPrice*(value/100)).toFixed(2);
 			tools.http({
				url:api.updatePrice,
				data:{
					pids:prod.pid,
					disId:item.disId,
					disSid:this.disId,
					prices:price
				},
				succ:function(resp){
					if(resp.success){
						alert('修改成功');
						prod.agentCostPrice = price;
					}else{
						alert(resp.message);
					}
				}
			});
		};
		//获取联系记录
		this.getRecordList = function(callback){
			var getAjax = tools.promise(api.getRecordList,true);
			getAjax({
				data:{
					disSid:this.disId
				}
			}).then(function(resp){
				if(resp.success){
					//
					self.concats = resp.value.disLinkManInfos;
					self.records = resp.value.disContactHistoryRecords;
					self.shopUrl = resp.value.disRateUrl;
					if(callback){
						callback(resp.value);
					}
				}
			});
		};
		//添加联系人
		this.addConcat = function(callback){
			var item = self.concats[0];
			if(item.id){
				//修改
				return;
			};
			$.extend(item,{disSid:this.disId});
			tools.http({
				url:api.addConcat,
				data:item,
				succ:function(resp){
					if(resp.success){
						item.id =  resp.value.id;
					}else{
						alert(resp.message);
					}
				}
			});
		};
		//修改联系人
		this.alterConcat = function(item){
			if(!item.id){
				alert('页面异常，请刷新页面');
				return;
			}
			tools.http({
				url:api.updateConcat,
				data:item,
				succ:function(resp){
					if(resp.success){
						alert('修改成功');
					}else{
						alert('修改失败，请刷新页面重试');
					}
				}
			});
		};
		//删除联系人
		this.deleteConcat = function(item){
			if(!item.id){
				//alert('页面异常，请刷新页面');
				self.concats.shift();
				return;
			};
			tools.http({
				url:api.deleteConcat,
				data:{
					id:item.id
				},
				succ:function(resp){
					if(resp.success){
						alert('删除成功..');
						debugger;
						self.concats =_.reject(self.concats,function(i){
							return i.id==item.id
						});
					}
				}
			});
		}
		//联系记录
		this.addRecord = function(item,callback){
			if(item.name==undefined||item.name==''){
				alert('请填写真实姓名');
				return;
			}
			if(item.contactTime==undefined||item.contactTime==''){
				alert('请填写联系时间');
				return;
			}
			if(item.aliNick == undefined || item.aliNick==''){
				alert('请填写联系旺旺');
				return;
			}
			if(item.contactResult==undefined || item.contactResult ==''){
				alert('请填写联系结果');
				return;
			}
			$.extend(item,{
				disSid:this.disId
			});
			tools.http({
				url:api.insertRecordList,
				data:item,
				succ:function(resp){
					if(resp.success){
						//
						var obj = {};
						$.extend(obj,item);
						self.records.push(obj);
						alert('添加成功');
						if(callback){
							callback(resp.value);
						}
					}else{
						alert(resp.message);
					}
				}
			});
		}
		return this;
	}
	return action;
}]);


dm.factory('initPages',['tools',function(tools){
	return function($scope,length,count){
		var maxPages = 0,pages=[];
		var count = count || tools.config.table.count;
		if(length>=count){
			maxPages = length%count==0?(length/count):(length/count+1);	
		}
		for(var i=0,j=Math.floor(maxPages);i<j&&j!=1;i++){
			pages.push(i);
		}
		$scope.pages=pages;
		$scope.now=1;
	}
}]);
