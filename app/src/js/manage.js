dm.controller('manage',['$rootScope','$scope','$routeParams','$animate',function($rootScope,$scope,$routeParams,$animate){
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
	$scope.a=[1,2,3,4,5,6,7,8,9,10];
	var tbody =  $('.table').find('tbody');
	$scope.add=function(e){
		$scope.a.push(12);
		//console.log($this);
		//var $element1 =$(e.target);
		//if (true) {};
		/*$animate.addClass(tbody,'animate-show-hide ng-hide-add').then(function(){
			console.log('success');
		})*/
	} 

}]);