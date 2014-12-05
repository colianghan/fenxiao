dm.controller('manage',['$rootScope','$scope','$routeParams',function($rootScope,$scope,$routeParams){
	var bannerIndex = $routeParams.banner||0,
		tagIndex = $scope.tagIndex = $routeParams.tag||0;
		if (tagIndex==0 && bannerIndex!=0){
			tagIndex = $scope.tagIndex = 1;
		}
	$rootScope.$broadcast('onTagChange',tagIndex);
	$scope.showHighSearch=false;
	$scope.highSearch=function(){
		$scope.showHighSearch=!$scope.showHighSearch;
	}; 

}]);