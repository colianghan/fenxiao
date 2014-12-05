dm.controller('improve',['$rootScope','$scope','$routeParams',function($rootScope,$scope,$routeParams){
	var bannerIndex = $routeParams.banner||0;
		$scope.tagIndex=tagIndex = $routeParams.tag||1;
	$rootScope.$broadcast('onTagChange',tagIndex);
	/*内容处理*/
	
}]);