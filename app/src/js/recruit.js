dm.controller('recruit',['$rootScope','$scope','$routeParams',function($rootScope,$scope,$routeParams){
	var bannerIndex = $routeParams.banner||0;
		$scope.tagIndex=tagIndex = $routeParams.tag||0;
	var status;
	switch(Number(tagIndex)){
		case 1:
			status = 'contact';
			break;
		case 2:
			status = 'contact';
			break;
		case 3:
			status = 'noContact';
			break;
		case 4:
			status = 'noContact';
			break;
		default:
			status = 'noContact';
			break;
	};
	$scope.status = status;
	$rootScope.$broadcast('onTagChange',tagIndex);
	//$scope.text="分销招募"
	$scope.detail = false;
	$scope.detailModel={};

	//获取详情页
	$scope.getDetail = function(item){
		$scope.detailModel = item;
		$scope.detail = true;
	};
	//隐藏详情页
	$scope.hideDetail = function(){
		$scope.detail = false;
	}
}]);