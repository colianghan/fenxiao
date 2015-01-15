dm.directive('sendMessage',['$parse',function($parse){
	var compile  = function(element,attrs,link){
		return function($scope,$element,$attrs){
			console.log('sendMessage');
		}
	};
	var controller = ['$scope','$element','$attrs','initPages','sendMessageModel',function($scope,$element,$attrs,initPages,sendMessageModel){
		//debugger;
	}];
	return {
		restrict:'E',
		scope:true,
		replace:true,
		compile:compile,
		controller:controller,
		templateUrl:'../html/template/send-message.html'
	}
}]);

dm.factory('sendMessageModel',['tools',function(tools){
	return {};
}]);