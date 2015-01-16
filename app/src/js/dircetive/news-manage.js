dm.directive('newsManage',function(){
	var compile = function(element,attrs){
		return function(scope,element,attrs){
			console.log('news-manage');
		}
	};
	var controller = ['$scope','$attrs','$parse','newMangeModel',function($scope,$attrs,$parse,newMangeModel){
		var model = $scope.model = new newMangeModel();
		model.getData();
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
		this.getData = function(callback){
			var getAjax = tools.promise(api.get,true);
			getAjax().then(function(resp){
				if(resp.success){
					self.list = resp.value;
				}
			});
		};
		this.update = function(item){
			tools.http({
				url:api.update,
				data:{

				},
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

					}else{
						alert(resp.message);
					}
				}
			});
		};
		this.add = function(item){
			tools.http({
				url:api.update,
				data:{

				},
				succ:function(resp){
					if(resp.success){
						alert('修改成功');
					}
				}
			});	
		} 
		return this;
	}
	return model;
}]);