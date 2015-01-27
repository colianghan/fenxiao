dm.controller('improve',['$rootScope','$scope','$routeParams',function($rootScope,$scope,$routeParams){
	var bannerIndex = $routeParams.banner||0;
		$scope.tagIndex=tagIndex = $routeParams.tag||1;
	$rootScope.$broadcast('onTagChange',tagIndex);
    $scope.nav = [undefined,'高流量、高转化关键词','高展现、高点击关键词','免费流量','付费流量','最佳搭配宝贝','提升工具箱'][tagIndex];   
}]);

//皇金关键词
dm.controller('goldkeywords',['$rootScope','$routeParams','$scope','$filter','tools','ngTableParams',function($rootScope,$routeParams,$scope,$filter,tools,ngTableParams){
	var tagIndex= $scope.tagIndex = $routeParams.tag||1;
	var type="clickRate";
	var selectDisWordIntoStores = tools.promise('getDwsAuctionQueryEffectsByType.htm', true);
    $scope.direction=1;
    $scope.pulling = false;//转圈操作
	if(tagIndex==1){
		//$scope.title = '高流量、高转化关键词TOP50'
        $scope.parms = {
            theads:['点击量','成交量','转化率(%)'],
            attrs:['click','alipayAuctionNum','transformationEfficiency']
        }
	}
	else if(tagIndex==2){
        $scope.parms = {
            theads:['展现','点击','成交金额'],
            attrs:['impression','clickRate','alipayTradeAmt']
        }
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
            $scope.pulling = true;
            var begin = (params.page() - 1) * params.count(), end = params.page() * params.count();
            if (!$scope.words.length) {
                selectDisWordIntoStores({type: type, days: 30}).then(function (resp) {
                    var words = $scope.words = resp.value || [];
                    $scope.pulling = false;
                    /*_.each(words,function(item){
                    	item.clickRate = Number((item.clickRate * 100).toFixed(2));
                    	item.transformationEfficiency=Number((item.transformationEfficiency * 100).toFixed(2));
                    });*/
                    words = params.sorting ?
                                        $filter('orderBy')(words, params.orderBy()) :
                                        words;
                    params.total(words.length);
                    $defer.resolve(words.slice(begin, end));
                    
                });
            } else {
               var words = params.sorting ?
                                        $filter('orderBy')($scope.words, params.orderBy()) :
                                        $scope.words;
                $scope.pulling = false;
                $defer.resolve(words.slice(begin, end));
            }
        }
    });
    $scope.getShops = function (word) {
        //$scope.direction=2;
        $scope.activeKeyword = word;
        $scope.pulling = true;
        var _getAjax = tools.promise('getDwsAuctionQueryEffectsByQuery.htm',true);
        _getAjax({
            data:{
                days: 30,
                query: word
            }
        }).then(function (resp) {
                $scope.shops = resp.value;
                /*_.each($scope.shops,function (shop) {
                    shop.clickRate = (shop.clickRate * 100).toFixed(2);
                    shop.transformationEfficiency = (shop.transformationEfficiency * 100).toFixed(2);
                });*/
                //$scope['shopes'].reload();
                $scope.pulling = false;
                mkTable('shopes',$scope.shops);
                $scope.direction=2;
            });
    };
    $scope.getProds=function (shop,distr) {
        $scope.activeShopDisSid = distr.shopId;
        $scope.activeDirNick = distr.disNick;
        $scope.activeShop = shop;
        $scope.pulling = true;
        var _getAjax = tools.promise('getQueryEffectsByDisSidAndQuery.htm',true);
        _getAjax({
            data: {
                days: 30,
                query: $scope.activeKeyword,
                disSid: distr.shopId
            }
        }).then(function (resp) {
                    if (resp.success) {
                        $scope.prods = resp.value;
                        /*_.each($scope.prods,function (prod) {
                            prod.clickRate = (prod.clickRate * 100).toFixed(2);
                            prod.transformationEfficiency = (prod.transformationEfficiency * 100).toFixed(2);
                        });*/
                        $scope.pulling = false;
                         mkTable('prods',$scope.prods);
                        $scope.direction=3;
                    }
                });
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
    $scope.$watch('direction',function(v,ov){
        if(v!=undefined){
            $scope.aList = ['关键词列表','分销商列表'].slice(0,v-1);
            $scope.title = ['关键词列表',$scope.activeKeyword+'分销商列表',$scope.activeDirNick+'商品列表'][v-1];
        }
    });
    $scope.setDir = function(index){
        $scope.direction = index+1;
    };
}]);
//优质渠道
dm.controller('good_channel_ctrl',['$scope','$rootScope','$routeParams','initPages','goodChannelModel',function($scope,$rootScope,$routeParams,initPages,goodChannelModel){
   
    var tagIndex = $routeParams.tag;
    if(tagIndex<3&&tagIndex>4){
        return;
    }
    var lowDisShopLevel,highDisShopLevel;//最低等级，最高等级
    $scope.layer=0;//监听等级
    var type;  //类型
    //$scope.direction=1;
    if(tagIndex==3){
        type="srcFree";
    }else if(tagIndex==4){
        type="srcPay";
    }
    var model = $scope.model = new goodChannelModel(type);
    $scope.$watch('layer',function(v,ov){
        if(v===undefined||v==ov){
            return;
        }
        switch(Number(v)){
            case 0:
                model.parms.lowDisShopLevel=0;
                model.parms.highDisShopLevel=20;
                break;
            case 1:
                model.parms.lowDisShopLevel=0;
                model.parms.highDisShopLevel=5;
                break;
            case 2:
                model.parms.lowDisShopLevel=6;
                model.parms.highDisShopLevel=10;
                break;
            case 3:
                model.parms.lowDisShopLevel=11;
                model.parms.highDisShopLevel=20;
                break;
        };
        model.getData({
            begin:0
        },function(v){
            if(v.resultSize){
                initPages($scope,v.resultSize);
            }
        });
    });
    //排序
    $scope.getSort=function(e,v){
        var sortColumn=v;
        var $ele = $(e.currentTarget),sortBy;
        if($ele.hasClass('sort-desc')){
            //升序
            $ele.removeClass('sort-desc').addClass('sort-asc').siblings().removeClass('sort-asc sort-desc');
            sortBy='up';        
        }else{
            //降序
            $ele.removeClass('sort-asc').addClass('sort-desc').siblings().removeClass('sort-asc sort-desc');
            sortBy='down';
        }
        model.getData({
            begin:0,
            sort:sortBy,
            sortColumn:sortColumn
        },function(v){
            if(v.resultSize){
                initPages($scope,v.resultSize);
            }
        });
    };
    //分页
    $scope.getPage = function(page){
        if($scope.now == page){
            return;
        }
        $scope.now=page;
        var count = $scope.model.count,
            begin = (page-1)*count,
            end = page*count-1;
        model.getData({
                begin:begin
            },function(v){
                if(v.resultSize){
                    initPages($scope,v.resultSize);
                }
            });
    }
    //点击下一步
    $scope.setDir = function(index){
        model.direction = index+1;
    };
    $scope.$watch('model.direction',function(v,ov){
        $scope.curName = ['优质渠道列表','来自'+$scope.srcName+'分销商列表',$scope.disNick+'的商品列表'][v-1];
        if(v===ov){
            return;
        }
        $scope.aList = ['优质渠道列表','分销商列表'].slice(0,v-1)||[];
    });
    //获取分销商列表
    $scope.getDistr = function(item){
        var srcId = item.srcId;
            $scope.srcName=item.srcName;
        model.direction = 2;
        model.getData({
            begin:0,
            srcId:srcId
        },function(v){
            if(v.resultSize){
                initPages($scope,v.resultSize);
            }
        });
       
    };
    //获取产品列表
    $scope.getProds = function(item){
        var shopId = item.shopId;
            $scope.disNick = item.disNick;
        model.direction = 3;
        model.getData({
            begin:0,
            disSid :shopId
        },function(v){
            if(v.resultSize){
                initPages($scope,v.resultSize);
            }
        });
    };
    $scope.$watch('model.parms.days',function(v,ov){
        //console.log(v+'--'+ov);
        if(ov!=undefined){
            model.getData({
                begin:0,
            },function(v){
                if(v.resultSize){
                    initPages($scope,v.resultSize);
                }
            });
        }
    });
}]);
dm.factory('goodChannelModel',function(tools){
    var api = {
        getSrc:'getPromotionPvSrcEffects.htm',
        getDistr:'getPromotionPvSrcEffectsBySrc.htm',
        getProd:'getPromotionPcSrcEffectsByDistributor.htm'
    };
    var model = function(srcType){
        var self = this;
        this.count = tools.config.table.count;
        this.srcType = srcType;//收费类型
        this.pulling = false; //获取数据 
        this.parms = {
             days:30,
             srcType:this.srcType,
             lowDisShopLevel:0,
             highDisShopLevel:20,
             sort:'down',
             sortColumn:'IUV',
             begin:0,
             count:this.count
        };
        this.direction=1;
        //获取渠道列表
        this.getSrc = function(item,callback){
            this.srcList = [];
            var _getAjax = tools.promise(api.getSrc,true);
            $.extend(this.parms,item);
            _getAjax({
                data:this.parms
            }).then(function(resp){
                if(resp.success){
                    self.srcList = resp.value.list;
                    self.pulling = false;
                    if(callback){
                        callback(resp.value);
                    }
                }
            })
        };
        //获取分销商列表
        this.getDistr = function(item,callback){
            this.disList = [];
            var _getAjax = tools.promise(api.getDistr,true);
            $.extend(this.parms,item);
            _getAjax({
                data:this.parms
            }).then(function(resp){
                if(resp.success){
                    self.disList = resp.value.list;
                    self.pulling = false;
                    if(callback){
                        callback(resp.value);
                    }
                }
            });
        };
        //获取产品列表
        this.getProd = function(item,callback){
            this.prodsList = [];
            var _getAjax = tools.promise(api.getProd,true);
            $.extend(this.parms,item);
            _getAjax({
                data:this.parms
            }).then(function(resp){
                if(resp.success){
                    self.prodsList = resp.value;
                    self.pulling = false;
                    if(callback){
                        callback(resp.value);
                    }
                }
            })
        };
        //获取数据
        this.getData = function(item,callback){
            this.pulling = true;
            switch(this.direction){
                case 1:
                    this.getSrc(item,callback);
                    break;
                case 2:
                    this.getDistr(item,callback);
                    break;
                case 3:
                    this.getProd(item,callback);
                    break;
            }
        }
        return this;
    }
    return model;
});
//最佳搭配
dm.controller('best_partner_ctrl',['$scope','$rootScope','$routeParams','$filter','tools','ngTableParams',function($scope,$rootScope,$routeParams,$filter,tools,ngTableParams){
    var sortColumn = $scope.sortColumn = 'ASSO_ACCESS_USER_NUM';
    var attr = 'assoAccessUserNum';
    var day = $scope.day = 30;
    var _get = tools.promise('getPromotionAssociation.htm',true);
    var $tbody = $('.partnerTbody');//表格的tbody
    $scope.pulling = false; //首次加载转圈
    function getData(){
        $scope.data = [];
        $scope.pulling = true;
        _get({days:day,sortColumn:sortColumn}).then(function(resp){
            if (resp.success) {
                _.each(resp.value,function(item){
                    if('transformationEfficiency'===attr){
                        item.sortValue = (item[attr]*100).toFixed(2)+'%';
                    }else{
                        item.sortValue = item[attr];
                    }
                });
                $scope.data=resp.value;
                $scope.pulling = false;
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
        $('.othersPartner').addClass('hide').appendTo($tbody);
        getData();
    });
    $scope.$watch('day',function(v){
        day=$scope.day=v;
        $('.othersPartner').addClass('hide').appendTo($tbody);
        getData();
    });
    /*$scope['source']=new ngTableParams({
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
    });*/
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
        $scope.pulling = true;
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
                           if('transformationEfficiency'===attr){
                              item.sortValue = (item[attr]*100).toFixed(2)+'%';
                           }else{
                              item.sortValue = item[attr];
                           }
                           item.transformationEfficiency=(item.transformationEfficiency*100).toFixed(2)+'%';
                           $scope.otherPartners.push(item);
                        });
                        $scope.pulling = false;
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
        $scope.pulling = true;
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
                          if('transformationEfficiency'===attr){
                              item.sortValue = (item[attr]*100).toFixed(2)+'%';
                           }else{
                              item.sortValue = item[attr];
                           }
                        });
                        $scope.shopAssocialData = resp.value;
                        $scope.pulling = false;
                    }
                }
            }
        );
    };
}]);