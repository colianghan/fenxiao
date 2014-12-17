//经销 代销
dm.filter('tradeType_filter', function () {
    return function (value) {
        if (!value) {
            return value;
        }
        return value.toUpperCase() == 'AGENT' ? '代销' : '经销';
    }
});

/*行为监控*/
dm.controller('behavior',['$rootScope','$scope','$routeParams','tools','gradeLayerService',function($rootScope,$scope,$routeParams,tools,gradeLayerService){
	/* 进行当前的url 定位*/
	var bannerIndex = $routeParams.banner||0;
	var tagIndex = $scope.tagIndex = $routeParams.tag||1;
	$rootScope.$broadcast('onTagChange',tagIndex);
    /*--------------- 开始逻辑运算 -----------------------*/
    var disShopLevel = tools.shopLevel;
    var api = {
        get:'getBehaviorDistributors.htm',
        dropGrade:'moveDistributorToGrade.htm',
        terminateCoor:'terminateCooperation.htm',
        getCooperationIdByNick:'getCooperationIdByNick.htm'
    };
    var dropDisNick,dropTradeType;
    $scope.layerType=1;
    var _data={};
    var getData = function(data,callback){
        debugger;
        tools.http({
            url:api.get,
            data:data,
            succ:function(resp){
                if(resp.success){
                    callback(resp.value);
                }
            }
        });
    };
    var setShop = function(data){
        data = _.isArray(data)?data:_.values(data);
        _.each(data,function(item){
            item.selected=false;
            item.disShopLevel  = disShopLevel(item.disShopLevel);
        });
        debugger;
        $scope.shops=data;
        console.log(data);
    };

    /*查看详情*/
    var getProds = $scope.getProds = function(e,index){
        $scope.showLayers=false;
        var $ele = $(e.currentTarget);
        var $ele = $(e.currentTarget);
        var $tr = $ele.parents('tr');
        var $nextTr=$tr.next();
        $ele.siblings().filter('.active').removeClass('active');
        if ($nextTr.hasClass('othersPartner')&&!$nextTr.hasClass('hide')&&$ele.hasClass('active')) {
            $nextTr.addClass('hide');
            $ele.removeClass('active');
            return;
        };
        $scope.showOther=1; //用此来进行跟关联访问量区别开来
        $ele.addClass('active');
        $scope.prods=[];
        $('.othersPartner').insertAfter($tr).removeClass('hide');
        getData({
            type:$scope.type,
            disNick:$scope.shops[index].disNick
        },function(data){
            $scope.prods=data;
        });
    };
    /*降低等级*/
    var dropGrade = $scope.dropGrade = function(e,index){
        $scope.showLayers=true;
        var $ele = $(e.currentTarget);
        var $ele = $(e.currentTarget);
        var $tr = $ele.parents('tr');
        var $nextTr=$tr.next();
        $ele.siblings().filter('.active').removeClass('active');
        if ($nextTr.hasClass('othersPartner')&&!$nextTr.hasClass('hide')&&$ele.hasClass('active')) {
            $nextTr.addClass('hide');
            $ele.removeClass('active');
            return;
        };
        $scope.showOther=1; //用此来进行跟关联访问量区别开来
        $ele.addClass('active');
        $('.othersPartner').insertAfter($tr).removeClass('hide');
        //你额
    };
    /*终止合作*/
    var stopTerminal = $scope.stopTerminal =function(e,index){
        if(!confirm('是否终止合作')){
            return;
        }
        var disNicks = $scope.shops[index].disNick;
        var tradeTypes = $scope.shops[index].tradeType;
        tools.http({
            url:api.terminateCoor,
            data:{
                disNick: disNicks,
                tradeType: tradeTypes
            },
            succ:function(resp){
                if(resp.success){
                    alert('成功终止');
                    $scope.shops.splice(index,1);
                }else{
                    alert(resp.message);
                }
            }
        });
    };
    /*确定降低等级*/
    var enDropLayer = $scope.enDropLayer = function(){
         debugger;
        var type=$scope.layerType;
        var layer=$scope.layer;

        var disNicks=[],tradeTypes=[];
        if(!layer){
            alert('请选择要降低的等级');
            return;
        }
        if(type==1){
            disNicks.push(dropDisNick);
            tradeTypes.push(dropTradeType);
        }else if(type==2){
            _.each($scope.shops,function(i){
                if(i.selected){
                    disNicks.push(i.disNick);
                    tradeTypes.push(i.tradeType);
                }
            });
            if(!disNicks.length){
                alert('请选择要分销商');
            }
        }
        tools.http({
            url:api.dropGrade,
            data:{
                disNicks: disNicks.join(','),
                gradeId: layer,
                tradeTypes: tradeTypes.join(',')
            },
            succ:function(resp){
                if(resp.success){
                    alert('降低等级成功');
                }else{
                    alert(resp.message);
                }
            }
        });
    };
    /*设置降低等级方式*/
    $scope.setType=function(value){
        $scope.layerType=value;
    };


    var gradeLayers = $scope.gradeLayers = [];
     //debugger;
     gradeLayerService.get().then(function (resp) {
     if (resp.success) {
         data = resp.value;
         for (var i in data) {
             var tmp = {};
             var item = data[i];
             tmp.gradeLayerId = i;
             tmp.disNum = item.disNum || 0;
             tmp.gradeLayerName = item.supGradeInfo.name;
             tmp.discountName = item.supDiscountInfo ? item.supDiscountInfo.discountName : '';
             tmp.gradeLayerProdLinesLen = item.supProductCat.length;
             tmp.gradeLayerProdLines = (function (supProductCat) {
                 var res = [];
                 _.each(supProductCat,function (item, index) {
                    res.push(item.name);
                });
                return res.join(',');
             })(item.supProductCat);
             tmp.selected = false;
             tmp.editing = false;
             $scope.gradeLayers.push(tmp);
         }
         // 给其他版块使用
         $rootScope.$broadcast('gradeLayersDetail', $scope.gradeLayers);
     }});
	/*进行任务*/
    //debugger;
    switch(Number(tagIndex)){
        case 1:
            /*窜货嫌疑*/
            $scope.title="窜货嫌疑";
            $scope.type="fleeingGoods";
            getData({type:'fleeingGoods'},setShop);
            break;
        case 2:
            /*乱价嫌疑*/
            $scope.title="乱价嫌疑";
            $scope.type="priceRemind";
            getData({
                type:'priceRemind'
            },setShop);
            break;
        case 3 :
            /*差评监控*/
            $scope.type="badRateInfo";
            $scope.showList=true;
            getData({
                type:'badRateInfo',
                days:30
            },function(resp){
               function infoProcess(badInfo) {
                    var res = [];
                    for (var i in badInfo) {
                        res.push({
                            name: i,
                            rateNum: badInfo[i]
                        });
                    }
                    return res;
                }
                $scope.shops=$scope.shops||{};
                var badRate = infoProcess(resp.badInfo),
                    neutralBadRate = infoProcess(resp.neutralBadInfo);
                $scope.shops.badRate = badRate;
                $scope.shops.neutralBadRate = neutralBadRate;
            });
    }

    /*获取查询详情*/
    $scope.lookUpSomeDis=function(disNick, result, e){
        var param = {
            disNick: disNick,
            result: result,
            type: 'badRateInfo',
            days: 30
        };
        getData(param,function(resp){
            $scope.shops=$scope.shops||{};
            $scope.shops.prodsBadRateDetails = [];
            for (var i in resp) {
                resp[i].numberId = i;
                $scope.shops.prodsBadRateDetails.push(resp[i]);
            }
            $scope.showList=false;
        });
    }
}]);