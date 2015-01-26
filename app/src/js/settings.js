dm.controller('settings',['$scope','$rootScope','$routeParams','setShortCurts',function($scope,$rootScope,$routeParams,setShortCurts){
	/*系统*/
	var bannerIndex = $routeParams.banner||0;
		$scope.tagIndex=tagIndex = $routeParams.tag||1;
	$rootScope.$broadcast('onTagChange',tagIndex);

	/*获取数据*/
	var settingsArry = $.extend({},config.route);
	var _arry = ['recruit','manage','improve','behavior'];
	var linkShorts = $scope.linkShorts ={};
	_.each(_arry,function(key){
		linkShorts[key] = settingsArry[key].child||[];
	});

	setShortCurts.get(function(shortcut){
		$scope.shortCurSelected = shortcut;
	});
	$scope.shortCurSelected = {};
	/*设置快捷*/
	$scope.setShort = function(){
		var _sele = {},_bool=false;
		_.each($scope.shortCurSelected,function(v,k){
			if(v!=false&&v!=''){
				_sele[k]=v;
				_bool=true;
			}
		});
		if(_bool){
			setShortCurts.set(JSON.stringify(_sele),function(v){
				$rootScope.$broadcast('update-sortCut',v);
			});
		}
	};
	$scope.headNav = $scope.tagIndex==1?'快捷设置':'新闻管理';
}]);

dm.filter('settingsName',function(){
	return function(v){
		_arry={
			recruit:'分销招募',
			manage:'分销管理',
			improve:'分销提升',
			behavior:'行为监控'
		};
		return _arry[v]||'--';
	}
});

dm.factory('setShortCurts',['tools',function(tools){
	var api = {
		getShortcut:'getShortcut.htm',
		updateShortcut:'updateShortcut.htm'
	};
	return {
		shortcut:'',
		get:function(callback){
			var _getAjax = tools.promise(api.getShortcut,false);
			_getAjax().then(function(resp){
				if(resp.success){
					var shortcut = JSON.parse(resp.value.shortcut)||{}; //对象
					if(callback){
						callback(shortcut);
					}
				}else{
					alert(resp.message);
				}
			});
		},
		set:function(shortcut,callback){
			tools.http({
				url:api.updateShortcut,
				data:{
					shortcut:shortcut
				},
				succ:function(resp){
					if(resp.success){
						alert('修改成功');
						callback(JSON.parse(shortcut));
					}else{
						alert(resp.message);
					}
				},
				fail:function(resp){
					alert(resp.message);
				}
			});
		}
	}
}]);