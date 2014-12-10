dm.controller('improve',['$rootScope','$scope','$routeParams',function($rootScope,$scope,$routeParams){
	var bannerIndex = $routeParams.banner||0;
		$scope.tagIndex=tagIndex = $routeParams.tag||1;
	$rootScope.$broadcast('onTagChange',tagIndex);
	/*内容处理*/
}]);

//皇金关键词
dm.controller('goldkeywords',['$rootScope','$routeParams','$scope','$filter','tools','ngTableParams',function($rootScope,$routeParams,$scope,$filter,tools,ngTableParams){
	var tagIndex = $routeParams.tag||1;
	var type="clickRate";
	var selectDisWordIntoStores = tools.promise('getDwsAuctionQueryEffectsByType.htm', 'cache');
    $scope.direction=1;
	if(tagIndex==1){
		$scope.title = '高流量、高转化关键词TOP50'
		$scope.theads=['点击量','成交量','转化率(%)'];
		$scope.attrs = ['click','alipayAuctionNum','transformationEfficiency'];
	}
	else if(tagIndex==2){
		$scope.title = '高展现、高点击关键词TOP50'
		$scope.theads=['展现','点击','成交金额'];
		$scope.attrs=['impression','clickRate','alipayTradeAmt'];
		type='perCustomerTransaction';
	}
	$scope.words=[];//关键词
	$scope['keywords']=new ngTableParams({
                    page: 1,
                    count: tools.config.table.count,
                    sorting: {
		                click: 'desc'
		            },
		            defaultSort: 'desc'
    }, {
        total: 0,
        counts: [],
        getData: function ($defer, params) {
            var begin = (params.page() - 1) * params.count(), end = params.page() * params.count();
            if (!$scope.words.length) {
                selectDisWordIntoStores({type: type, days: 30}).then(function (resp) {
                    var words = $scope.words = resp.value || [];
                    _.each(words,function(item){
                    	item.clickRate = (item.clickRate * 100).toFixed(2);
                    	item.transformationEfficiency=(item.transformationEfficiency * 100).toFixed(2);
                    });
                    words = params.sorting ?
                                        $filter('orderBy')(words, params.orderBy()) :
                                        words;
                    params.total(words.length);
                    $defer.resolve(words.slice(begin, end));
                });
            } else {
                $defer.resolve($scope.words.slice(begin, end));
            }
        }
    });
    $scope.getShops = function (word) {
        //$scope.direction=2;
        $scope.activeKeyword = word;
        tools.http({
            url: 'getDwsAuctionQueryEffectsByQuery.htm',
            data: {
                days: 30,
                query: word
            },
            succ: function (resp) {
                $scope.shops = resp.value;
                _.each($scope.shops,function (shop) {
                    shop.clickRate = (shop.clickRate * 100).toFixed(2);
                    shop.transformationEfficiency = (shop.transformationEfficiency * 100).toFixed(2);
                });
                //$scope['shopes'].reload();
                mkTable('shopes',$scope.shops);
                $scope.direction=2;
            }
        });
        //scope.show('shops');
    };
    $scope.getProds=function (shop,disSid) {
        $scope.activeShopDisSid = disSid;
        $scope.activeShop = shop;
        tools.http(
            {
                url: 'getQueryEffectsByDisSidAndQuery.htm',
                data: {
                    days: 30,
                    query: $scope.activeKeyword,
                    disSid: disSid
                },
                succ: function (resp) {
                    if (resp.success) {
                        $scope.prods = resp.value;
                        _.each($scope.prods,function (prod) {
                            prod.clickRate = (prod.clickRate * 100).toFixed(2);
                            prod.transformationEfficiency = (prod.transformationEfficiency * 100).toFixed(2);
                        });
                         mkTable('prods',$scope.prods);
                        $scope.direction=3;
                    }
                }
            }
        );
        //scope.show('prods');
    };
    function mkTable(key,value){
        $scope[key] = new ngTableParams({
                    page: 1,
                    count: tools.config.table.count,
                    sorting: {
                        click: 'desc'
                    },
                    defaultSort: 'desc'
            }, {
                total: 0,
                counts: [],
                getData: function ($defer, params) {
                    var begin = (params.page() - 1) * params.count(), end = params.page() * params.count();
                    if (!value.length) {
                        //没有数据
                        return;
                    } else {
                        value = params.sorting ?
                                            $filter('orderBy')(value, params.orderBy()) :
                                            value;
                        params.total(value.length);
                        $defer.resolve(value.slice(begin, end));
                    }
                }
            });
    };
}]);

//优质渠道
dm.controller('good_channel_ctrl',['$scope','$rootScope','$routeParams','$filter','tools','ngTableParams',function($scope,$rootScope,$routeParams,$filter,tools,ngTableParams){
    function tableReload(){
        if($scope.direction===1){
            $scope['source'].page(1).reload();
        }else if($scope.direction===2){
            $scope['shops'].page(1).reload();
        }else if ($scope.direction===3){
            $scope['prods'].page(1).reload();
        }
    }
    var tagIndex = $routeParams.tag;
    if(tagIndex<3&&tagIndex>4){
        return;
    }
    var lowDisShopLevel,highDisShopLevel;//最低等级，最高等级
    var sortBy='down',sortKey='IUV';//排序顺序，排序键值
    var day = $scope.day=30;
    var start= true; //判断是否是第一次加载数据 (好像不需要了)
    var layer = $scope.layer=1;
    var type;  //类型
    $scope.direction=1;
    if(tagIndex==3){
        $scope.title="免费流量";
        type="srcFree";
    }else if(tagIndex==4){
        $scope.title="付费流量";
        type="srcPay";
    }
    var _get = tools.promise('getPromotionPvSrcEffects.htm', true);
    $scope['source']=new ngTableParams({
        page:1,
        count:tools.config.table.count
    },{
        total:0,
        counts:[],
        getData:function($defer,params){
           var begin = (params.page() - 1) * params.count();
           var count = params.count();
           _get({
                 days:day,
                 srcType:type,
                 lowDisShopLevel:lowDisShopLevel,
                 highDisShopLevel:highDisShopLevel,
                 sort:sortBy,
                 sortColumn:sortKey,
                 begin:begin,
                 count:count
            }).then(function (resp) {
                        if (resp.success && resp.value.list.length) {
                            $defer.resolve(resp.value.list);
                            resp.value.resultSize && params.total(resp.value.resultSize);
                        } else {
                            $defer.resolve([]);
                            params.total(0);
                            $scope.nodata = true;
                        }});
        }
    });
    $scope.$watch('layer',function(v){
        switch(Number(v)){
            case 0:
                lowDisShopLevel=0;
                highDisShopLevel=20;
                break;
            case 1:
                lowDisShopLevel=0;
                highDisShopLevel=5;
                break;
            case 2:
                lowDisShopLevel=6;
                highDisShopLevel=10;
                break;
            case 3:
                lowDisShopLevel=11;
                highDisShopLevel=20;
                break;
        }
        tableReload();
        //$scope['source'].page(1).reload();
    });
    $scope.getSort=function(e,v){
        $ele = $(e.currentTarget);
        $ele.siblings().find('.sort-asc,.sort-desc').removeClass('sort-asc sort-desc');
        sortKey=v;
        if($ele.hasClass('sort-asc')){
            sortBy='down';
            $ele.removeClass('sort-desc').addClass('sort-asc');
        }else{
            sortBy='up';
            $ele.removeClass('sort-desc').addClass('sort-asc');
        }
        tableReload();
    };
    $scope.$watch('day',function(v){
        day = $scope.day=v;
        tableReload();
        //$scope['source'].page(1).reload();
    });
    //获取店铺列表
    $scope.getShops=function(id,name){
         var _get = tools.promise('getPromotionPvSrcEffectsBySrc.htm', true);
         $scope.srcId=id;
         $scope['shops']=new ngTableParams({
            page:1,
            count:tools.config.table.count
         },{
            total:0,
            counts:[],
            getData:function($defer,params){
               var begin = (params.page() - 1) * params.count();
               var count = params.count();
               _get({
                     days:day,
                     srcId:id,
                     lowDisShopLevel:lowDisShopLevel,
                     highDisShopLevel:highDisShopLevel,
                     sort:sortBy,
                     sortColumn:sortKey,
                     begin:begin,
                     count:count
                }).then(function (resp) {
                            if (resp.success && resp.value.list.length) {
                                $defer.resolve(resp.value.list);
                                resp.value.resultSize && params.total(resp.value);
                            } else {
                                $defer.resolve([]);
                                params.total(0);
                                $scope.nodata = true;
                            }});
            }
        });
        $scope.direction=2;
    }
    //获取宝贝列表
    $scope.getProds=function(id,name){
        var _get=tools.promise('getPromotionPcSrcEffectsByDistributor.htm',true);
         $scope['prods']=new ngTableParams({
            page:1,
            count:tools.config.table.count
         },{
            total:0,
            counts:[],
            getData:function($defer,params){
               var begin = (params.page() - 1) * params.count();
               var count = params.count();
               _get({
                     days:day,
                     srcId:$scope.srcId,
                     disSid:id,
                     lowDisShopLevel:lowDisShopLevel,
                     highDisShopLevel:highDisShopLevel,
                     sort:sortBy,
                     sortColumn:sortKey,
                     begin:begin,
                     count:count
                }).then(function (resp) {
                            if (resp.success && resp.value) {
                                $defer.resolve(resp.value);
                                //resp.value.resultSize && params.total(resp.value.resultSize);
                                params.total(resp.value.length);
                            } else {
                                $defer.resolve([]);
                                params.total(0);
                                $scope.nodata = true;
                            }});
            }
        });
        $scope.direction=3;
    }
}]);

dm.controller('best_partner_ctrl',['$scope','$rootScope','$routeParams','$filter','tools','ngTableParams',function($scope,$rootScope,$routeParams,$filter,tools,ngTableParams){
    var sortColumn = $scope.sortColumn = 'ASSO_ACCESS_USER_NUM';
    var attr = 'assoAccessUserNum';
    var day = $scope.day = 30;
    var _get = tools.promise('getPromotionAssociation.htm',true);
    function getData(){
        _get({days:day,sortColumn:sortColumn}).then(function(resp){
            if (resp.success) {
                //console.log(resp);
                $scope.data=resp.value;
                //var attrs = sortColumn.toLowerCase().split('_');
                _.each(resp.value,function(item){
                    item.sortValue = item[attr];
                });
                $scope['source'].page(1).reload();
            }
        });
    }
    //监听
    $scope.$watch('sortColumn',function(v){
        sortColumn=$scope.sortColumn=v;
        switch(sortColumn){
            case 'ASSO_ACCESS_USER_NUM':
                attr='assoAccessUserNum'
                $scope.dataTitle='关联访问量';
                break;
            case 'TRANSFORMATION_EFFICIENCY':
                attr='transformationEfficiency';
                $scope.dataTitle='关联转化率';
                break;
            case 'ASSO_ALIPAY_AMT':
                attr='assoAlipayAmt';
                $scope.dataTitle='关联成交额';
                break;
        }
        getData();
    });
    $scope.$watch('day',function(v){
        day=$scope.day=v;
        getData();
    });
    $scope['source']=new ngTableParams({
            page:1,
            count:tools.config.table.count
         },{
            total:0,
            counts:[],
            getData:function($defer,params){
                //
                var begin = (params.page() - 1) * params.count(), end = params.page() * params.count();
                data = $scope.data||[];
                params.total(data.length);
                $defer.resolve(data.slice(begin,end));
            }
    });

    $scope.getOthers=function(e,id1,id2){
        var $ele = $(e.currentTarget);
        var $tr = $ele.parents('tr');
        var $nextTr=$tr.next();
        $ele.parents('td').siblings().find('.active').removeClass('active');
        if ($nextTr.hasClass('othersPartner')&&!$nextTr.hasClass('hide')&&$ele.hasClass('active')) {
            $nextTr.addClass('hide');
            $ele.removeClass('active');
            return;
        };
        $scope.showOther=1; //用此来进行跟关联访问量区别开来
        $ele.addClass('active');
        $('.othersPartner').insertAfter($tr).removeClass('hide');
        $scope.otherPartners=[];
        tools.http(
            {
                url: 'getAssociationProductDetail.htm',
                data: {
                    pid1: id1,
                    days: $scope.day
                },
                succ: function (resp) {
                    if (resp.success) {
                        _.each(resp.value,function(item){
                           if (item.picUrl2.indexOf('null') != -1 && !item.title2) return;
                           item.sortValue = item[attr];
                           $scope.otherPartners.push(item);
                        });
                    }
                }
            }
        );
    };
    $scope.getOthersData=function(e,id1,id2){
        var $ele = $(e.currentTarget);
        var $tr = $ele.parents('tr');
        var $nextTr=$tr.next();
        $ele.parents('td').siblings().find('.active').removeClass('active');
        if ($nextTr.hasClass('othersPartner')&&!$nextTr.hasClass('hide')&&$ele.hasClass('active')) {
            $nextTr.addClass('hide');
            $ele.removeClass('active');
            return;
        };
        $scope.showOther=2; //用此来进行跟关联访问量区别开来
        $ele.addClass('active');
        $('.othersPartner').insertAfter($tr).removeClass('hide');
        $scope.shopAssocialData=[];
        tools.http(
            {
                url: 'getAssociationDataDetail.htm',
                data: {
                   pid1: id1,
                   pid2: id2,
                   days: $scope.days
                },
                succ: function (resp) {
                    if (resp.success) {
                        _.each(resp.value,function(item){
                           /*if (item.picUrl2.indexOf('null') != -1 && !item.title2) return;
                           $scope.otherPartners.push(item);*/
                           item.sortValue = item[attr];
                        });
                        $scope.shopAssocialData = resp.value;
                    }
                }
            }
        );
    };
}]);