dm.directive('recruitIndex',['$parse',function($parse){
	var compile  = function(element,attrs,link){
		return function($scope,$element,$attrs){
			console.log('recruitindex');
		}
	};
	var controller = ['$scope','$element','$attrs','initPages','recruitIndexModel',function($scope,$element,$attrs,initPages,recruitIndexModel){
		debugger;
	}];
	return {
		restrict:'E',
		scope:true,
		replace:true,
		compile:compile,
		controller:controller,
		templateUrl:'../html/template/recruit-index.html'
	}
}]);

dm.factory('recruitIndexModel',['tools',function(tools){
	return {};
}]);