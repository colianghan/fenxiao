dm.directive('recruitDistris',['$parse',function($parse){
	var compile  = function(element,attrs,link){
		return function($scope,$element,$attrs){
			console.log('recruitindex');
		}
	};
	var controller = ['$scope','$element','$attrs','initPages','recruitDistrisModel',function($scope,$element,$attrs,initPages,recruitDistrisModel){
		//debugger;
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
			$scope.locations = v.locations;
			initPages($scope,v.totalSize);
		});
		//获取分页
		$scope.getPage = function(page){
			//alert(page);
			if($scope.now == page){
				return;
			}
			$scope.now=page;
			var count = $scope.model.count,
				begin = (page-1)*count,
				end = page*count-1;
			$scope.getData({
				begin:begin
			});
		};
		//获取排序
		$scope.getSort = function(e,item){
		};
		//获取查询
		$scope.getSearch = function(){
			//todo: 所在地数据获取 
			var lowOperateTime  = $('.low',$element).val();//操作时间
			var highOperateTime  = $('.high',$element).val();
			var lowShopCreateTime = $('.creat-time-low',$element).val();//开店时间
			var highShopCreateTime = $('.creat-time-high',$element).val();
			//好评率
			var lowBuyerGoodRate ='',highBuyerGoodRate='';
			var _lowBuyerGoodRate = Number($('.low-buyer-rate',$element).val()||'s');
			if(!isNaN(_lowBuyerGoodRate)){
				lowBuyerGoodRate = (_lowBuyerGoodRate/100).toFixed(2);
			}
			var _highBuyerGoodRate = Number($('.high-buyer-rate',$element).val()||'s');
			if(!isNaN(_highBuyerGoodRate)){
				highBuyerGoodRate = (_highBuyerGoodRate/100).toFixed(2);
			}
			model.getData({
				begin:0,
				lowOperateTime:lowOperateTime,
				highOperateTime:highOperateTime,
				lowShopCreateTime:lowShopCreateTime,
				highShopCreateTime:highShopCreateTime,
				lowBuyerGoodRate:lowBuyerGoodRate,
				highBuyerGoodRate:highBuyerGoodRate
			},function(v){
				initPages($scope,v.totalSize);
			});
		};
		//清除筛选
		$scope.getRest = function(){
			$('.low',$element).val('');
			$('.high',$element).val('');
			$('.creat-time-low',$element).val('');
			$('.creat-time-high',$element).val('');
			$('.low-buyer-rate',$element).val('');
			$('.high-buyer-rate',$element).val('');
			var oldPrams = $scope.model.parms;
			var tmpObj = {
				status:oldPrams.status,
				isSimilarQ:oldPrams.isSimilarQ,
				begin:0,
				count:oldPrams.count
			};
			$scope.model.parms = tmpObj;
		};
		//全选
		$scope.selectAll = function(e){
			//debugger
			$label = $(e.currentTarget);
			$check = $label.find('input[type="checkbox"]');
			model.selectAll($check.prop('checked'));
		};
		//天猫和合作状态
		$scope.change = function(){
			model.getData({
				begin:0
			},function(v){
				initPages($scope,v.totalSize);
			});
		};
		//显示操作
		$scope.showHighSearch=false,$scope.showTable=true,$scope.showMessage=false,$scope.isShowLocation=false;
		$scope.show = {
			highSearch:function(){
				$scope.showHighSearch = !$scope.showHighSearch;
				$scope.showTable=true;
				$scope.showMessage=false;
			},
			showMessage :function(){
				$scope.showMessage = !$scope.showMessage;
				$scope.showTable=false;
				$scope.showHighSearch = false;
			},
			showTable :function(){
				$scope.showTable = !$scope.showTable;
			},
			caselMessage:function(){
				$scope.showMessage =false;
				$scope.showTable=true;
			},
			showLocation:function(){
				$scope.isShowLocation=true;
			},
			caselLocation:function(){
				$scope.isShowLocation=false;
			}
		};
		$scope.citys={};
		//地区
		$scope.selectPros = function(e,provs){
			//--疑问 阻止不了事件冒泡 stopPropagation不管用
			if(e.target.tagName=='INPUT'){
				var $ele = $(e.target);
				if($ele.prop('checked')){
					//选中了
					var _citys = $scope.locations[provs];
					_.each(_citys,function(item,index){
						if($scope.citys[provs]==undefined){
							$scope.citys[provs] = {};
						}
						$scope.citys[provs][index] = item;
					});
					$scope.citys[provs].all=true;
				}else{
					$scope.citys[provs] = {};
					$scope.citys[provs].all=false;
				}
			}
		};
		//选择城市
		$scope.selectCity = function(e,provs,city,index){
			//alert('city');
			if(e.target.tagName=='INPUT'){
				var $ele = $(e.target);
				if($ele.prop('checked')){
					//选中了
					//var _citys = $scope.locations[provs];
					if($scope.citys[provs]==undefined){
						$scope.citys[provs] = {};
					}
					$scope.citys[provs][index] = city;
				}else{
					delete $scope.citys[provs][index];
				}
				var _ciLength = _.values($scope.citys[provs]).length;
				if('all' in $scope.citys[provs]){
					_ciLength--;
				}
				if(_ciLength==$scope.locations[provs].length){
					$scope.citys[provs].all = true;
				}else{
					$scope.citys[provs].all = false;
				}
			}
		};
		//确定城市
		$scope.ensureCity = function(){
			var _tmp = [];
			_.each($scope.citys,function(item,key){
				_.each(item,function(v,key){
					if(key!='all'){
						_tmp.push(v);
					}
				});
			});
			model.parms.city = _tmp.join(',');
			$scope.show.caselLocation();
		};
		//排序
		$scope.getSort = function(e,sortColumn){
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
			model.getData({
				begin:0,
				sort:sortBy,
				sortColumn:sortColumn
			},function(v){
				initPages($scope,v.totalSize);
			});
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
		getOperaters:'getRecruitOfOperaters.htm',
		updateStatus:'moveRecruitOfDistributors.htm',
		sendMessage:'sendRecruitOfShortMessage.htm'
	};
	var action = function(status,isSimilarQ){
		var self= this;
		this.count = tools.config.table.count;
		this.parms = {
			contactStatus:status,
			isSimilarQ:isSimilarQ,
			begin:0,
			count:this.count
		};
		this.nicks='',this.sids='',this.sendContent = '';//选择的昵称和sids,发送信息的消息
		this.graders = tools.shopLevels;
		//获取数据
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
		//全选
		this.selectAll = function(bool){
			var _nick = [],_sids = [];
			_.each(this.list,function(item,index){
				item.select = bool;
				_nick.push(item.nick);
				_sids.push(item.sid);
			});
			this.nicks = _nick.join(',');
			this.sids = _sids.join(',');
		};
		//获取操作员
		this.getOperaters = function(callback){
			var getAjax = tools.promise(api.getOperaters,true);
			getAjax().then(function(resp){
				if(resp.success){
					self.operaters = resp.value;
				}
			});
		};
		//状态操作(当status传参数时，进行的是添加为分销商操作)
		this.updateStatus = function(status){
			//console.log(this.Status);
			var _status = status||this.Status;
			var sids=[],items=[];
			if(!_status){
				alert('请选择要移动的状态');
				return;
			}
			_.each(this.list,function(item){
				if(item.select){
					sids.push(item.sid);
					items.push(item);
				}
			});
			if(!sids.length){
				alert('请选择要进行操作的分销商');
				return;
			}
			tools.http({
				url:api.updateStatus,
				data:{
					sids:sids.join(','),
					status:_status
				},
				succ:function(resp){
					if(resp.success){
						alert('修改成功');
						if(!status){
							//状态操作
							_.each(items,function(item){
								item.status = status;
							});
						}else{
							_.each(items,function(item){
								item.isFenxiao = 1;
							});
						}
					}
				}
			});
		};
		this.selectNick = function(){
			var nicks=[],sids=[];
			_.each(this.list,function(item){
				if(item.select){
					sids.push(item.sid);
					nicks.push(item.nick);
				}
			});
			return {
				nicks : nicks.join(','),
				sids:sids.join(',')
			}
		};
		//为了进行发送消息而进行的交互
		this.selectItem = function(i){
			var _nick = [],_sids = [];
			_.each(this.list,function(item,index){
				if(item.select){
					_nick.push(item.nick);
					_sids.push(item.sid);
				}
			});
			this.nicks = _nick.join(',');
			this.sids = _sids.join(',');
		};
		//发送消息
		this.sendMessage = function(){
			if(this.sids==''){
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
					sids : this.sids,
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
		return v==null?'--':v.split(' ')[0];
	}
});
dm.filter('shopLevel',function(tools){
	return function(v){
		return tools.shopLevel(v);
	}
});