dm.directive('recruitDetail',[function(){
	var compile = function(element,attrs,link){
		return function(scope,ele,attrs){
			console.log('recruitDetail');
		}
	};
	var controller = ['$scope','$parse','$attrs','$element','recruitDetailModel',function($scope,$parse,$attrs,$element,recruitDetailModel){
		var tag = $attrs.tag
			,item = $parse(tag)($scope);
		console.log(item);
		$scope.item = item;
		$scope.navs = ['联系人信息','联系记录','店铺基本信息'];
		$scope.setNav = function(index){
			$scope.curNavIndex = index;
		};
		var status = $scope.$parent.status;
		var parms = $scope.parms = new recruitDetailModel(item,status);
		$scope.curNavIndex=0;
		parms.getRecordList();

		//联系人信息
		$scope.addConcat =function(){
			var item = $scope.parms.concats[0];
			if(item&&item.id){
				$scope.parms.concats.unshift({});
			}else if(item == undefined){
				$scope.parms.concats.unshift({});
			}	
		};
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

		//联系记录
		$scope.record={};//添加的东西
		$scope.showAdd = false;
		$scope.addRecord = function(){
			var $contactTime = $('.contactTime',$element);
			$scope.record.contactTime = $contactTime.val();
			$scope.parms.addRecord($scope.record,function(v){
				$scope.record={};
				$contactTime.val('');
				$scope.showAdd = false;
			});
		};

		//店铺基本信息
		$scope.shopUrl = 'http://shop'+item.sid+'.taobao.com/';
		$scope.show = {
			showMessage :function(){
				$scope.showMessage = true;
			},
			caselMessage:function(){
				$scope.showMessage =false;
			}
		};

		//发送消息
		$scope.model={
			nicks:item.nick,
			sendMessage:parms.sendMessage,
			sid:item.sid
		}
		//预约联系
		//todo: 预约联系接口操作
	}];
	return {
		restrict:'E',
		replace:true,
		scope:true,
		compile:compile,
		controller:controller,
		templateUrl:'../html/template/recruit-detail.html'
	}
}]);

dm.factory('recruitDetailModel',['tools',function(tools){
	var api = {
		get:'getRecruitOfDistributorDetail.htm',
		add:'addRecruitOfLinkManInfo.htm',
		update:'updateRecruitOfLinkManInfo.htm',
		delet:'deleteRecruitOfLinkManInfo.htm',
		addRecord:'addRecruitOfContactHistoryRecord.htm',
		updateStatus:'moveRecruitOfDistributors.htm',
		sendMessage:'sendRecruitOfShortMessage.htm'
	};
	var model = function(item,status){
		var self = this;
		this.Dis = item;
		this.disSid=item.sid;
		this.status = status;
		//获取联系记录
		this.getRecordList = function(callback){
			var getAjax = tools.promise(api.get,true);
			getAjax({
				data:{
					sid:this.disSid,
					status:this.status
				}
			}).then(function(resp){
				if(resp.success){
					//
					self.concats = resp.value.disLinkManInfos;
					self.records = resp.value.disContactHistoryRecords;
					//self.shopUrl = resp.value.disRateUrl;
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
			$.extend(item,{sid:this.disSid});
			tools.http({
				url:api.add,
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
				url:api.update,
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
				url:api.delet,
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
		};
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
				sid:this.disSid
			});
			tools.http({
				url:api.addRecord,
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
		};
		//状态操作(当status传参数时，进行的是添加为分销商操作)
		this.updateStatus = function(status){
			//console.log(this.Status);
			if(!confirm('确定要进行操作么？')){
				return;
			}
			var _status = status||this.Status;
			if(!_status){
				alert('请选择要移动的状态');
				return;
			}
			tools.http({
				url:api.updateStatus,
				data:{
					sids:this.disSid,
					status:_status
				},
				succ:function(resp){
					if(resp.success){
						alert('修改成功');
						if(!status){
							//状态操作
							self.Dis.status = _status;
						}else{
							self.Dis.isFenxiao = 1;
						}
					}
				}
			});
		};
		//发送消息
		this.sendMessage = function(){
			if(this.sid==''){
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
					sids : this.sid,
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
	return model;
}]);