dm.directive('newsManage',function(){
	var compile = function(element,attrs){
		return function(scope,element,attrs){
			console.log('news-manage');
		}
	};
	var controller = ['$scope','$attrs','$parse','newMangeModel',function($scope,$attrs,$parse,newMangeModel){
		var model = $scope.model = new newMangeModel();
		model.getData();
		//修改 添加
		$scope.showDetail = false;
		$scope.show = function(item){
			model.addObj = item || {};
			$scope.showDetail = true;
		};
		$scope.hide = function(){
			$scope.showDetail = false;
		};
		$scope.save = function(){
			//debugger;
			if(model.check()){
				if(model.addObj.id){
					//修改
					model.update();
				}else{
					//新增
					model.add();
				}
			}
		};
		$scope.$watch('model.addObj.url',function(v,ov){
			if(v!=''&&v!=undefined){
				if(!/http:\/\//.test(v)){
					model.addObj.url = 'http:\/\/'+v;
				}
			}
			if(v==='http:\/\/'){
				model.addObj.url='';
			}
		});
	}];
	return {
		restrict:'E',
		replace:true,
		templateUrl:'../html/template/news-manage.html',
		scope:true,
		compile:compile,
		controller:controller
	}
});

dm.factory('newMangeModel',['tools',function(tools){
	var api = {
		add:'addHomePageNews.htm',
		update:'updateHomePageNews.htm',
		delet:'deleteHomePageNews.htm',
		get:'getHomePageNews.htm'
	};
	var model = function(){
		var self = this;
		this.addObj = {};
		this.error = {
			title:'标题不能为空',
			url:'链接不能为空'
		};
		this.getData = function(callback){
			var getAjax = tools.promise(api.get,true);
			getAjax().then(function(resp){
				if(resp.success){
					self.list = resp.value;
				}
			});
		};
		this.update = function(item){
			if(!this.addObj.id){
				alert('页面出错，请刷新页面重试');
				return;
			}
			tools.http({
				url:api.update,
				data:this.addObj,
				succ:function(resp){
					if(resp.success){
						alert('修改成功');
					}
				}
			});	
		};
		this.delet = function(index,item){
			if(!confirm('是否删除该新闻?')){
				return;
			}
			tools.http({
				url:api.delet,
				data:{
					id:item.id
				},
				succ:function(resp){
					if(resp.success){
						self.list.splice(index,1);
					}else{
						alert(resp.message);
					}
				}
			});
		};
		this.add = function(item){
			tools.http({
				url:api.add,
				data:this.addObj,
				succ:function(resp){
					if(resp.success){
						alert('添加成功');
						self.list.push(resp.value);
					}
				}
			});	
		};
		this.check = function(){
			if(this.addObj.title==undefined || this.addObj.title==''){
				this.addObj.title='';
				return false;
			}
			if(this.addObj.url==undefined || this.addObj.url==''){
				this.addObj.url='';
				return false;
			}
			return true;
		} 
		return this;
	}
	return model;
}]);