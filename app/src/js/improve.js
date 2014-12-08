dm.controller('improve',['$rootScope','$scope','$routeParams',function($rootScope,$scope,$routeParams){
	var bannerIndex = $routeParams.banner||0;
		$scope.tagIndex=tagIndex = $routeParams.tag||1;
	$rootScope.$broadcast('onTagChange',tagIndex);
	/*内容处理*/
}]);

dm.controller('goldkeywords',['$rootScope','$routeParams','$scope','tools','ngTableParams',function($rootScope,$routeParams,$scope,tools,ngTableParams){
	var tagIndex = $routeParams.tag||1;
	var type="clickRate";
	var selectDisWordIntoStores = tools.promise('getDwsAuctionQueryEffectsByType.htm', 'cache');
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
                    params.total(words.length);
                    $defer.resolve(words.slice(begin, end));
                });
            } else {
                $defer.resolve($scope.words.slice(begin, end));
            }
        }
    });
}]);






/*dm.directive('goldKeyWords', function ($rootScope, tools, ngTableParams) {
    return{
        restrict: "AE",
        scope: {},
        templateUrl: '../html/widget/goldkeywords.html',
        controller: function ($scope, $element, $attrs) {
            $scope.module = $attrs.module;
            if ($scope.module == '高流量、高转化关键词') {
                $scope.fieldsEn = ['click', 'alipayAuctionNum', 'transformationEfficiency'];
                $scope.fieldsCn = {
                    click: '点击量',
                    alipayAuctionNum: '成交量',
                    transformationEfficiency: '转化率'
                }
                $scope.type = 'clickRate';
            } else {
                $scope.fieldsEn = ['impression', 'clickRate', 'alipayTradeAmt'];
                $scope.fieldsCn = {
                    impression: '展现量',
                    clickRate: '点击率',
                    alipayTradeAmt: '成交金额'
                }
                $scope.type = 'perCustomerTransaction';
            }
            $scope.activeKeyword = '';
            $scope.activeShop = '';
            $scope.words = [];
            $scope.shops = [];
            $scope.prods = [];
            var selectDisWordIntoStores = tools.promise('getDwsAuctionQueryEffectsByType.htm', 'cache');
            $scope.words_table_param = new ngTableParams(
                {
                    page: 1,
                    count: tools.config.table.count
                }, {
                    total: 0,
                    counts: [],
                    getData: function ($defer, params) {
                        var begin = (params.page() - 1) * params.count(), end = params.page() * params.count();
                        if (!$scope.words.length) {
                            selectDisWordIntoStores({type: $scope.type, days: 30}).then(function (resp) {
                                $scope.words = resp.value || [];
                                $scope.words.forEach_(function (word) {
                                    word.clickRate = (word.clickRate * 100).fixed(2);
                                    word.transformationEfficiency = (word.transformationEfficiency * 100).fixed(2);
                                });
                                params.total($scope.words.length);
                                $defer.resolve($scope.words.slice(begin, end));
                            });
                        } else {
                            $defer.resolve($scope.words.slice(begin, end));
                        }
                    }
                }
            );
        },
        link: function (scope, ele, attrs) {
            scope.wordsShown = true;
            scope.shopsShown = false;
            scope.prodsShown = false;
            scope.getShopsByWord = function (word) {
                scope.activeKeyword = word;
                tools.http({
                    url: 'getDwsAuctionQueryEffectsByQuery.htm',
                    data: {
                        days: 30,
                        query: word
                    },
                    succ: function (resp) {
                        scope.shops = resp.value;
                        scope.shops.forEach_(function (shop) {
                            shop.clickRate = (shop.clickRate * 100).fixed(2);
                            shop.transformationEfficiency = (shop.transformationEfficiency * 100).fixed(2);
                        });
                    }
                });
                scope.show('shops');
            };
            scope.getProdsByShop = function (shop, disSid) {
                scope.activeShopDisSid = disSid;
                scope.activeShop = shop;
                tools.http(
                    {
                        url: 'getQueryEffectsByDisSidAndQuery.htm',
                        data: {
                            days: 30,
                            query: scope.activeKeyword,
                            disSid: disSid
                        },
                        succ: function (resp) {
                            if (resp.success) {
                                scope.prods = resp.value;
                                scope.prods.forEach_(function (prod) {
                                    prod.clickRate = (prod.clickRate * 100).fixed(2);
                                    prod.transformationEfficiency = (prod.transformationEfficiency * 100).fixed(2);
                                });
                            }
                        }
                    }
                );
                scope.show('prods');
            };
            scope.show = function (type) {
                scope.wordsShown = scope.shopsShown = scope.prodsShown = false;
                scope[type + 'Shown'] = true;
            };
            scope.sort = function (module, sort, sortColumn) {
                scope[module].sort(function (item0, item1) {
                    return sort == 'down' ? item1[sortColumn] - item0[sortColumn] : item0[sortColumn] - item1[sortColumn];
                });
                if (module == 'words') {
                    scope.words_table_param.reload();
                }
            };
        }
    }
});*/
dm.controller('good_channel_ctrl', function ($scope, $rootScope, tools, ngTableParams) {
    $scope.showing = 'channels';
    $scope.nodata = false;
    $scope.requestData = {
        days: 30,
        srcId: '',
        disSid: '',
        srcType: 'srcPay',
        lowDisShopLevel: '1',
        highDisShopLevel: '5',
        sort: 'down',
        sortColumn: 'IUV'
    };
    $scope.switchType = function (srcType) {
        $scope.requestData.srcType = srcType;
        $scope[$scope.showing].ngTableParam.page(1).reload();
    };
    $scope.switchDays = function (days) {
        $scope.requestData.days = days;
        $scope[$scope.showing].ngTableParam.page(1).reload();
    };
    $scope.switchLevel = function (lowDisShopLevel, highDisShopLevel) {
        $scope.requestData.lowDisShopLevel = lowDisShopLevel;
        $scope.requestData.highDisShopLevel = highDisShopLevel;
        $scope[$scope.showing].ngTableParam.page(1).reload();
    };
    $scope.sort = function (sort, sortColumn) {
        $scope.requestData.sort = sort;
        $scope.requestData.sortColumn = sortColumn;
        $scope[$scope.showing].ngTableParam.page(1).reload();
    };
    $scope.channels = {
        prom: tools.promise('getPromotionPvSrcEffects.htm', true),
        newStart: true,
        ngTableParam: new ngTableParams(
            {
                page: 1,
                count: tools.config.table.count
            },
            {
                total: 0,
                counts: [],
                getData: function ($defer, params) {
                    $scope.requestData.begin = $scope.channels.newStart ? 0 : (params.page() - 1) * params.count();
                    $scope.requestData.count = params.count();
                    $rootScope.$broadcast('tip-show', '请稍等，正在加载新渠道数据......');
                    $scope.nodata = false;
                    $scope.channels.prom($scope.requestData).then(function (resp) {
                        if (resp.success && resp.value.list.length) {
                            $defer.resolve(resp.value.list);
                            resp.value.resultSize && params.total(resp.value.resultSize);
                        } else {
                            $defer.resolve([]);
                            params.total(0);
                            $scope.nodata = true;
                        }
                        $rootScope.$broadcast('tip-hide');
                    });
                }
            }
        ),
        getShopsByChannel: function (srcId, srcName) {
            $scope.requestData.srcId = srcId;
            $scope.showing = 'shops';
            $scope.shops.ajax = true;
            $scope.shops.channel = srcName;
            $scope.shops.ngTableParam.reload();
        }
    };
    $scope.shops = {
        prom: tools.promise('getPromotionPvSrcEffectsBySrc.htm', true),
        ajax: false,
        newStart: true,
        channel: '',
        ngTableParam: new ngTableParams(
            {
                page: 1,
                count: tools.config.table.count
            },
            {
                total: 0,
                counts: [],
                getData: function ($defer, params) {
                    if (!$scope.shops.ajax) return;
                    $scope.requestData.begin = $scope.shops.newStart ? 0 : (params.page() - 1) * params.count();
                    $scope.requestData.count = params.count();
                    $rootScope.$broadcast('tip-show', '请稍等，正在加载分销商数据......');
                    $scope.nodata = false;
                    $scope.shops.prom($scope.requestData).then(function (resp) {
                        if (resp.success && resp.value.list.length) {
                            $defer.resolve(resp.value.list);
                            resp.value.resultSize && params.total(resp.value.resultSize);
                        } else {
                            $scope.nodata = true;
                            $defer.resolve([]);
                            params.total(0);
                        }
                        $rootScope.$broadcast('tip-hide');
                    });
                }
            }
        ),
        getProdsByShop: function (disSid, disNick) {
            $scope.requestData.disSid = disSid;
            $scope.showing = 'prods';
            $scope.prods.ajax = true;
            $scope.prods.shop = disNick;
            $scope.prods.ngTableParam.reload();
        }
    };
    $scope.prods = {
        prom: tools.promise('getPromotionPcSrcEffectsByDistributor.htm', true),
        ajax: false,
        newStart: true,
        shop: '',
        ngTableParam: new ngTableParams(
            {
                page: 1,
                count: tools.config.table.count
            },
            {
                total: 0,
                counts: [],
                getData: function ($defer, params) {
                    if (!$scope.prods.ajax) return;
                    $scope.requestData.begin = $scope.prods.newStart ? 0 : (params.page() - 1) * params.count();
                    $scope.requestData.count = params.count();
                    $rootScope.$broadcast('tip-show', '请稍等，正在加载新分销商品......');
                    $scope.nodata = false;
                    $scope.prods.prom($scope.requestData).then(function (resp) {
                        if (resp.success) {
                            $defer.resolve(resp.value);
                        }
                        $rootScope.$broadcast('tip-hide');
                    });
                }
            }
        )
    };
    $scope.back = function (type) {
        $scope.showing = type;
    }
});
dm.controller('best_partner_ctrl', function ($scope, $rootScope, tools) {
    $scope.sortColumn = 'ASSO_ACCESS_USER_NUM';
    $scope.days = 30;
    $scope.partners = [];
    $scope.otherPartners = [];
    $scope.shopAssocialData = [];
    var fieldDict = {
        ASSO_ALIPAY_AMT: {
            enName: 'assoAlipayAmt',
            cnName: '关联成交额'
        },
        ASSO_ACCESS_USER_NUM: {
            enName: 'assoAccessUserNum',
            cnName: '关联访问量'
        },
        TRANSFORMATION_EFFICIENCY: {
            enName: 'transformationEfficiency',
            cnName: '关联转化率'
        }
    };
    var getPromotionAssociationProm = tools.promise('getPromotionAssociation.htm');
    $scope.getPartners = function (type, value) {
        if (arguments.length) {
            $scope[type] = value;
        }
        $scope.sortField = fieldDict[$scope.sortColumn].cnName;
        $rootScope.$broadcast('tip-show', '请稍等，正在加载新搭配数据......');
        getPromotionAssociationProm({days: $scope.days, sortColumn: $scope.sortColumn}).then(function (resp) {
            if (resp.success) {
                $scope.partners = resp.value;
                $scope.partners.forEach_(function (item) {
                    item.sortValue = item[fieldDict[$scope.sortColumn].enName];
                });
            }
            $rootScope.$broadcast('tip-hide');
        });
    };
    $scope.otherDataShown = false;
    $scope.otherDataType = false;
    var $otherPartners = $('.otherPartners');
    $scope.getOtherPartners = function (e, pid1, title1, picUrl1) {
        var $tr = $(e.target).closest('tr');
        if ($tr.next().hasClass('otherPartners') && !$tr.next().hasClass('none')) {
            $otherPartners.addClass('none');
            return;
        }
        $otherPartners.removeClass('none').insertAfter($tr);
        $shopAssocialData.addClass('none');
        $scope.otherPartners.length = 0;
        $rootScope.$broadcast('tip-show', '请稍等，正在加载该产品与其他产品的关联数据......');
        tools.http(
            {
                url: 'getAssociationProductDetail.htm',
                data: {
                    pid1: pid1,
                    days: $scope.days
                },
                succ: function (resp) {
                    if (resp.success) {
                        resp.value.forEach_(function (item, index, array) {
                            if (item.picUrl2.indexOf('null') != -1 && !item.title2) return;
                            item.sortValue = item[fieldDict[$scope.sortColumn].enName];
                            $scope.otherPartners.push(angular.extend(item, $scope.prod1));
                        });
                    }
                    $rootScope.$broadcast('tip-hide');
                }
            }
        );
    };
    var $shopAssocialData = $('.shopAssocialData');
    $scope.getShopAssocialData = function (e, pid1, pid2) {
        var $tr = $(e.target).closest('tr');
        if ($tr.next().hasClass('shopAssocialData') && !$tr.next().hasClass('none')) {
            $shopAssocialData.addClass('none');
            return;
        }
        $shopAssocialData.removeClass('none').insertAfter($tr);
        $otherPartners.addClass('none');
        $scope.shopAssocialData.length = 0;
        $rootScope.$broadcast('tip-show', '请稍等，正在加载分销商数据......');
        tools.http(
            {
                url: 'getAssociationDataDetail.htm',
                data: {
                    pid1: pid1,
                    pid2: pid2,
                    days: $scope.days
                },
                succ: function (resp) {
                    if (resp.success) {
                        $scope.shopAssocialData = resp.value;
                        $scope.shopAssocialData.forEach_(function (item) {
                            item.sortValue = item[fieldDict[$scope.sortColumn].enName];
                        });
                    }
                    $rootScope.$broadcast('tip-hide');
                }
            }
        );
    };
    $scope.getPartners();
    $scope.backToMainList = function () {
        $scope.otherPartnersDataShown = false;
        $scope.getPartners();
    };
});