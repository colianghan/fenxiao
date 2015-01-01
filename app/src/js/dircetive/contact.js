dm.directive('concat',['$rootScope',function($rootScope){
	var compile = function($element,$attrs,link){
		return function($scope,$element,$attrs,link){
			console.log('concat');
		}
	};
	var control = ['$rootScope','$scope','$element','$attrs','$parse','$timeout','concatModel',function($rootScope,$scope,$element,$attrs,$parse,$timeout,concatModel){
		//debugger;
		//var canSave = true; //页面没有错误
		$scope.errorMessage = '';//错误消息
		var model = $scope.model = $parse($attrs.a)($scope.$parent)||{};//获取用户东西
		if($scope.model===undefined){
			console.log('添加记录');
		}
		console.log('展示记录'+$scope.model);
		_.each(concatModel,function(item,key){
			item.key = key;
		});
		var keys = _.keys(concatModel);
		var values = _.values(concatModel);
		//var attrSrc = $scope.attrSrc = concatModel;
		var attrs= $scope.attrs = values.slice(1,keys.length-1);
		$scope.attrCheck = function(e,key){
			var $ele = $('.'+key,$element).parents('.control-group');
			if(concatModel[key].check){
				var resp = concatModel[key].check(model[key]);
				if(!resp.success){
					//出错了
					canSave = false;
					$ele.addClass('error');
					console.log(resp.message);
					$scope.errorMessage = resp.message;
					return;
					/*$timeout(function(){
						$scope.errorMessage='';
					},200);*/
				}
			}
			$ele.removeClass('error');
			$scope.errorMessage = '';
			//canSave = true;
		};
		$scope.remove = function(){
			//移除
			$rootScope.$broadcast('remove-concat',model);
			//$element.remove();
		};
		$scope.save = function(){
			//保存
			//$('input[type="text"]',$element).blur();
			$scope.attrCheck(null,'name');
			$scope.attrCheck(null,'aliNick');
			/*if(!concatModel['name'].check(model['name'])){
				$('.name',$element).blur();
				return;
			}*/
			var $error = $('.error',$element);
			if($error.length){
				return;
			}
			$rootScope.$broadcast('save-concat',model);
		};
		$scope.edit = function(){
			//编辑
			$('input[type="text"]',$element).blur();
			var $error = $('.error',$element);
			if($error.length){
				return;
			}
			$rootScope.$broadcast('edit-concat',model);
		};
	}];
	return{
		restrict:'E',
		scope:true,
		replace:true,
		templateUrl:'../html/template/contact.html',
		compile:compile,
		controller:control
	}
}]);

dm.factory('concatModel',['tools',function(tools){
	var mail =/\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;
	var mobilePhone =/^[+]{0,1}(\d){1,3}[ ]?([-]?((\d)|[ ]){1,12})+$/;
	var postcode = /^[1-9]\d{5}(?!\d)$/;
	var url=/^https?:\/\/(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_-](\?)?)*)*$/i;
	var model = {
		name:{
			name:'名称',
			check:function(v){
				if(v!=undefined&&v!=''){
					return {success:true};
				}
				return {success:false,message:'名称不能为空'};		
			}
		},
		duty:{
			name:'职务'
		},
		location:{
			name:'地址'
		},
		postcode:{
			name:'邮编',
			check:function(v){
				var _bool = {success:true};
				if(v!=undefined&&v!=''&&!postcode.test(v)){
					_bool.success = false;
					_bool.message="邮编格式不正确";
				}
				return _bool;
			}
		},
		shopUrl:{
			name:'店铺地址',
			check:function(v){
				var _bool = {success:true};
				if(v!=undefined&&v!=''&&!url.test(v)){
					_bool.success = false;
					_bool.message="店铺地址URl格式不正确";
				}
				return _bool;
			}
		},
		mobilePhone:{
			name:'手机号码',
			check:function(v){
				var _bool = {success:true};
				if(v!=undefined&&v!=''&&!mobilePhone.test(v)){
					_bool.success = false;
					_bool.message="手机号码格式不正确";
				}
				return _bool;
			}
		},
		telphone:{
			name:'联系电话'
		},
		aliNick:{
			name:'旺旺',
			check:function(v){
				var _bool = {success:true};
				if(v==undefined || v==''){
					_bool.success = false;
					_bool.message="旺旺没有填写";
				}
				return _bool;
			}
		},
		qq:{
			name:'QQ',
			check:function(v){
				var _bool = {success:true};
				if(v!=undefined&&v!=''&&!/^\d+$/.test(v)){
					_bool.success = false;
					_bool.message="QQ格式不正确";
				}
				return _bool;
			}
		},
		email:{
			name:'E-MAIL',
			check:function(v){
				var _bool = {success:true};
				if(v!=undefined&&v!=''&&!mail.test(v)){
					_bool.success = false;
					_bool.message="mail格式不正确";
				}
				return _bool;
			}
		},
		remark:{
			name:'备注',
			check:function(v){
				var _bool = {success:true};
				if(v!=undefined&&v!=''&&!v.replace(/[\u4e00-\u9fa5]/gm,'**').length>400){
					_bool.success = false;
					_bool.message = "备注不能超过200字";
				}
				return _bool;
			}
		}
	};
	return model;
}]);