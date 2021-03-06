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
		//时间操作 begin 
		var day = new Date();
		var dMothAgo = new Date();
		var dYesterDay = new Date(day.getFullYear(),day.getMonth(),day.getDate());
		var iYesterDay = dYesterDay.setTime(dYesterDay.getTime()-1*24*60*60*1000); 
		var imothAgo = dMothAgo.setTime(iYesterDay-30*24*60*60*1000);
		$scope.lowThedate=dMothAgo.getFullYear()+'-'+(dMothAgo.getMonth()+1)+'-'+dMothAgo.getDate();
		$scope.highThedate=dYesterDay.getFullYear()+'-'+(dYesterDay.getMonth()+1)+'-'+dYesterDay.getDate();
		//时间操作 end
		var distr = $scope.distr = $scope.$parent.detail;
		var parms = $scope.parms = new distrDetail(distr);
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
		//获取等级
		$scope.setLevel=function(leve){
			if(isNaN(Number(leve))){
				return;
			}
			distr.assessmentLevel = leve;
			$scope.parms.updateDistributorOfInfo({
				assessmentLevel:distr.assessmentLevel
			});
		};
		//关注
		$scope.setAttention = function(){
			//debugger
			distr.payAttention = !distr.payAttention;
			$scope.parms.updateDistributorOfInfo({
				payAttention:distr.payAttention
			});
		};
		//警告
		$scope.setWarning =function(){
			//debugger
			distr.warning = !distr.warning;
			$scope.parms.updateDistributorOfInfo({
				warning:distr.warning
			});
		};
		//修改预约联系
		$scope.setOpTime = function(e){
			//debugger
			var $ele = $('.apponitTime',$element);
			var _time = $ele.val();
			if($ele.value!=''){
				distr.appointmentTime = _time;
			}
			$scope.parms.updateDistributorOfInfo({
				appointmentTime:_time
			});
		};

		var _obj = {
			0:function(){
				//运营基础数据
				//debugger;
				$scope.parms.lowThedate = $('.lowThedate').val();
				$scope.parms.highThedate = $('.highThedate').val();
				$scope.data = [];
				$scope.parms.getOperateBasicData(function(v){
					$scope.data = $scope.parms.operateBasicData;
					if(v.resultSize){
						initPages($scope,v.resultSize);
						distr = $scope.distr = $scope.$parent.detail = v.distributor;//重置了详细页的详情
						//debugger;
					}
				});
				$scope.shopAttr = ['ipv','iuv','alipayTradeAmt','alipayAuctionNum','transformationEfficiency',
					'noPayNum','addCartUserNum','pageDuration','lossRate'
				];
			},
			1:function(){
				$scope.shopAttr = ['click','uv','alipayTradeAmt','alipayAuctionNum','transformationEfficiency'];
				$scope.parms.lowThedate = $('.lowThedate').val();
				$scope.parms.highThedate = $('.highThedate').val();
				$scope.parms.getKeyWordInfo();
				$scope.data = [];
				$scope.parms.getKeyWordList(function(v){
					$scope.data = $scope.parms.keyword.list;
					if(v.resultSize){
						initPages($scope,v.resultSize);
					}
				});
			},
			2:function(){
				$scope.parms.getDistriDataSrc();
			},
			3:function(){
				//产品授权及折扣
				$scope.parms.getProds(function(v){
					//debugger;
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
					//debugger;
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
			}
		};
		_obj[$scope.curNavIndex]();
		//根据统计周期  获取时间
		$scope.getData = function(){
			var begin = $('.lowThedate')[0].value||$scope.lowThedate;
			var end = $('.highThedate')[0].value||$scope.highThedate;
			var obeginDate = new Date(begin.replace('-','/')).getTime();
			var oendDate = new Date(end.replace('-','/')).getTime();
			if((obeginDate<imothAgo||obeginDate>iYesterDay)||(oendDate<imothAgo||oendDate>iYesterDay)){
				alert('选择超出界限');
				return;
			}
			if(obeginDate>oendDate){
				alert('启示时间大于结束时间');
				return;
			}
			$scope.parms.begin = 0;//初始化0
			_obj[$scope.curNavIndex]();
			$scope.now=1;
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

		//获取进店词宝贝详情 关键词中的宝贝列表
		$scope.fullScreen = false;
		$scope.getQueryDetail = function(item){
			$scope.queryName = item.query;
			parms.getQueryDetail(item,function(v){
				$scope.fullScreen = true;
			});
		};
		$scope.quitFullS = function(){
			$scope.fullScreen = false;
		};
		//获取流量渠道数据 详情
		$scope.getSrcDtail = function(item){
			//debugger;
			$scope.queryName = item.srcName;
			parms.getSrcDtail(item,function(v){
				$scope.fullScreen = true;
			});
		};
		//发送消息
		$scope.showMessage = false;
		$scope.show={
			caselMessage:function(){
				//隐藏短信页
				$scope.showMessage = false;
			},
			showMessage:function(){
				$scope.showMessage = true;
			}
		};
		$scope.model={
			nicks:distr.disNick,
			sendMessage:$scope.$parent.model.sendMessage,
			content:''
		};
		//移入等级
		$scope.moveLayers = function(){
			/*toDo:必须先选择完 才能移入等级中*/
			//debugger;
			$rootScope.$broadcast('show-layers',distr);
		};
	}];
	var compile = function(element,attrs,link){
		return function(scope,element,attrs){
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
		getSrcDtail:'getDistributorPvSrcEffectsDetailByShop.htm',//获取店铺来源详情
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
		this.item = item;
		this.disId = item.disShopId||item.disSid;
		this.tradeType = item.tradeType;
		this.operateBasicData = [];//运营基础数据
		this.shopData = {}; // 对象 店铺概况
		this.distriDataSrc=[];//流量渠道数据
		this.keyword ={};//进店词  (shop:{},list:[])
		this.highThedate = '';
		this.lowThedate = '';
		this.pulling = false; //获取数据 进行的转圈操作
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
			this.pulling = true;
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
					self.pulling = false;
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
		this.updateDistributorOfInfo = function(item){
			/*console.log(item.warning);
			console.log(item.assessmentLevel);*/
			$.extend(this.item,item);
			tools.http({
				url:api.updateDistributorOfInfo,
				data:{
					disSid:this.disId,
					warning:this.item.warning,
					payAttention:this.item.payAttention,
					assessmentLevel:this.item.assessmentLevel,
					appointmentTime:this.item.appointmentTime
				},
				succ:function(resp){
					if(resp.success){
						//alert('修改成功');
					}else{
						alert(resp.message);
					}
				}
			});
		};
		/*进店词数据*/
		this.getKeyWordInfo = function(callback){
			var getAjax = tools.promise(api.getDistributorDetailOfGatherQueryEffects,true);
			getAjax({
				data:{
					disSid:this.disId,
					lowThedate:this.lowThedate,
					highThedate:this.highThedate
				}
			}).then(function(resp){
				if(resp.success){
					self.keyword.shop = resp.value;
					if(callback){
						callback(resp.value);
					}
				}else{
					alert(resp.message);
				}
			});
		};
		this.getKeyWordList = function(callback){
			//this.keyword.list = [];
			this.pulling = true;
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
					self.pulling = false;
					if(callback){
						callback(resp.value);
					}
				}else{
					alert(resp.message);
				}
			});
		};
		this.getKeyWordDetail = function(query,callback){
			this.keyword.detail = [];
			this.pulling = true;
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
					self.pulling = false;
					if(callback){
						callback(resp.value);
					}
				}else{
					alert(resp.message);
				}
			});
		};
		//获取单个 关键词详情列表
		this.getQueryDetail =function(item,callback){
			this.queDetList = [];
			this.pulling = true;
			var _getAjax =  tools.promise(api.getDistributorQueryEffectsDetailByQuery,true);
			_getAjax({
				data:{
					disSid:this.disId,
					tradeType:this.tradeType,
					lowThedate:this.lowThedate,
					highThedate:this.highThedate,
					query:item.query
				}
			}).then(function(resp){
				if(resp.success){
					// query detail list
					self.queDetList = resp.value;
					self.pulling = false;
					if(callback){
						callback(resp.value);
					}
				}
			});
		}
		/*流量渠道*/
		this.getDistriDataSrc = function(callback){
			this.distriDataSrc = [];
			this.pulling = true;
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
					self.pulling = false;
					if(callback){
						callback(resp.value);
					}
				}
			});
		}
		this.getProds = function(callback){
			//获取授权产品及折扣
			this.prods = [];
			this.pulling = true;
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
					self.productLines =  _.indexBy(resp.value.productLines,'productLineId');
					self.prods = resp.value.list;
					self.pulling = false;
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
		//获取流量渠道详情
		this.getSrcDtail = function(item,callback){
			this.srcDetList = [];
			this.pulling = true;
			var _getAjax = tools.promise(api.getSrcDtail,true);
			_getAjax({
				data:{
					disSid:this.disId,
					tradeType:this.tradeType,
					lowThedate:this.lowThedate,
					highThedate:this.highThedate,
					srcId:item.srcId
				}
			}).then(function(resp){
				if(resp.success){
					//成功
					self.srcDetList = resp.value;
					self.pulling = false;
					if(callback){
						callback(resp.value);
					}
				}
			});
		}


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


//初始化table
dm.factory('initPages',['tools',function(tools){
	 var generatePagesArray = function (currentPage, totalItems, pageSize) {
            var maxBlocks, maxPage, maxPivotPages, minPage, numPages, pages;
            maxBlocks = 11;
            pages = [];
            numPages = Math.ceil(totalItems / pageSize);
            if (numPages > 1) {
                pages.push({
                    type: 'prev',
                    number: Math.max(1, currentPage - 1),
                    active: currentPage > 1
                });
                pages.push({
                    type: 'first',
                    number: 1,
                    active: currentPage > 1
                });
                maxPivotPages = Math.round((maxBlocks - 5) / 2);
                minPage = Math.max(2, currentPage - maxPivotPages);
                maxPage = Math.min(numPages - 1, currentPage + maxPivotPages * 2 - (currentPage - minPage));
                minPage = Math.max(2, minPage - (maxPivotPages * 2 - (maxPage - minPage)));
                var i = minPage;
                while (i <= maxPage) {
                    if ((i === minPage && i !== 2) || (i === maxPage && i !== numPages - 1)) {
                        pages.push({
                            type: 'more',
                            active: false
                        });
                    } else {
                        pages.push({
                            type: 'page',
                            number: i,
                            active: currentPage !== i
                        });
                    }
                    i++;
                }
                pages.push({
                    type: 'last',
                    number: numPages,
                    active: currentPage !== numPages
                });
                pages.push({
                    type: 'next',
                    number: Math.min(numPages, currentPage + 1),
                    active: currentPage < numPages
                });
            }
            return pages;
        };
	return function($scope,length,count){
		/*var maxPages = 0,pages=[];
		var count = count || tools.config.table.count;
		if(length>=count){
			maxPages = length%count==0?(length/count):(length/count+1);	
		}
		for(var i=0,j=Math.floor(maxPages);i<j&&j!=1;i++){
			pages.push(i);
		}*/
		//debugger
		var count = count || tools.config.table.count;
		var pages = generatePagesArray(1,length,count);
		$scope.pages=pages;
		$scope.now=1;
		$scope.$watch('now',function(v,ov){
			if(v===ov){
				return;
			}
			$scope.pages = generatePagesArray(v,length,count);
		});
	}
}]);
