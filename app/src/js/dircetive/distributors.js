dm.directive('distributors',['$compile','$routeParams',function($compile,$routeParams){
	var compile = function(element,attrs,link){
		return function(scope,element,attrs,link){
			console.log('distributors');
		}
	}
	var controller = ['$rootScope','$scope','$element','tools','distriAction','initPages',function($rootScope,$scope,$element,tools,distriAction,initPages){
		/*----------------------自定义分层设置--------------------------------------*/
		$scope.showHighSearch=false;
		$scope.highSearch=function(){
			$scope.showHighSearch=!$scope.showHighSearch;
		};
		$scope.parms = {}; // 所有的操作

		//发送消息 bgin
		$scope.news = false,$scope.addUser = false;
		$scope.show={
			caselMessage:function(){
				//隐藏短信页
				$scope.news = false;
			},
			showMessage:function(){
				$scope.news = true;
				$scope.addUser = false;
			},
			showTable:function(){
				$scope.addUser = !$scope.addUser;
			}
		};
		var gradeId = $routeParams.gradeId||'',
			transf = ['lowDisTransformationEfficiency','highDisTransformationEfficiency','lowInAllTransformationEfficiency',
				'highInAllTransformationEfficiency','lowSellMoneyPercent','highSellMoneyPercent','lowSellAmountPercent','highSellAmountPercent'
			];
		$scope.gradeId = gradeId;
		$scope.model = $scope.parms = new distriAction({gradeId:$scope.gradeId});
		$scope.parms.getData({},function(v){
			if(v.pageSize){
				initPages($scope,v.pageSize);
			}
		});
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
				sort:sortBy,
				begin:0
			});
			$scope.parms.search(newParms,function(v){
				if(v.pageSize){
					initPages($scope,v.pageSize);
				}
			});
			$scope.now=1;
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
			var _arry = transf;//进行转化率的计算
			var _obj = {begin:0};
			_.each(_arry,function(item){
				var _tmp = $('.'+item,$element).val();
				if(_tmp!=''){
					_obj[item] = _tmp/100;
				}
			});
			$scope.parms.getData(_obj,function(v){
				if(v.pageSize){
					initPages($scope,v.pageSize);
				}
			});
			$scope.now=1;
		};
		//清除筛选
		$scope.clearSearch = function(){
			var _arry = transf;//进行转化率的计算
			_.each(_arry,function(item){
				$('.'+item,$element).val('');
			});
			$scope.parms.clear();
			$scope.parms.getData({},function(v){
				if(v.pageSize){
					initPages($scope,v.pageSize);
				}
			});
			$scope.now=1;
		}
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
	var api = {
		sendMessage:'sendDistributorOfShortMessage.htm'//发送消息
	};
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
		this.nicks='',this.sids='',this.sendContent = '';//选择的昵称和sids,发送信息的消息
		//获取数据
		this.getData = function(item,callback){
			this.dis = [];
			$.extend(this.parms,item);
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
		this.stop = function(item){
			if(!confirm('是否要终止合作')){
				return;
			}
			var hasSelected = [];
			hasSelected =item ? [item] : _.filter(this.dis,function(item){return item.select});
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
					var tmp = hasSelected;
					if(item){
						alert('终止合作成功');
						tmp = [];
						_.each(disNicks,function(nick){
							_.each(self.dis,function(item,index){
								if(item.disNick==nick){
									tmp.push(item);
								}
							})
						});
					}
					self.dis = _.difference(self.dis,tmp);
				}
			});
		};
		//筛选 （排序时使用到了）
		this.search = function(parms,callback){
			this.parms = parms;
			this.getData(callback);
		};
		//清除筛选
		this.clear = function(){
			this.parms = {
				gradeId:this.parms.gradeId,
				end:this.parms.end,
				begin:0
			}
		};
		//全选
		this.selectAll = function(e){
			var $ele = $(e.currentTarget),
				value = $ele.prop('checked');
			//debugger;
			var _nick = [],_sids = [];
			_.each(this.dis,function(item){
				item.select = value;
				_nick.push(item.disNick);
				/*_sids.push(item.sid);*/
			});
			this.nicks = _nick.join(',');
			this.sids = _sids.join(',');
		};
		//为了进行发送消息而进行的交互
		this.selectItem = function(i){
			/*todo  方法执行了两遍  因为冒泡的原因*/
			var _nick = [],_sids = [];
			_.each(this.dis,function(item,index){
				if(item.select){
					_nick.push(item.disNick);
					/*_sids.push(item.sid);*/
				}
			});
			this.nicks = _nick.join(',');
			this.sids = _sids.join(',');
		};
		//发送消息
		this.sendMessage = function(){
			if(this.nicks==''){
				alert('请选择要发送的联系人');
				return;
			}
			if(!this.sendContent){
				alert('请填写要发送的信息内容');
				return;
			}
			tools.http({
				url:api.sendMessage,
				data:{
					disNicks : this.nicks,
					content:this.sendContent
				},
				succ:function(resp){
					if(resp.success){
						if(!resp.value.fail.length){
							alert('发送成功'+resp.value.message);
						}else{
							alert('发送失败，建议对单个分销商进行短信发送');
						}
					}else{
						alert('网络异常，请稍后重试');
					}
				}
			});
		}
		return this;
	};
	return action;
}]);
dm.directive('page',function(){
	var getPages = function(currentPage, totalItems, pageSize){
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
			return '天猫';
		}
		return '淘宝';
	}
});