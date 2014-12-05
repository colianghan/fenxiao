dm.controller('recruit',['$rootScope','$scope','$routeParams',function($rootScope,$scope,$routeParams){
	var bannerIndex = $routeParams.banner||0;
		$scope.tagIndex=tagIndex = $routeParams.tag||0;
	$rootScope.$broadcast('onTagChange',tagIndex);
	

	//$scope.text="分销招募"
	$scope.showHighSearch=false;
	$scope.highSearch=function(){
		$scope.showHighSearch = !$scope.showHighSearch;
	}
}]);