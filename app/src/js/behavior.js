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
dm.controller('behavior',['$rootScope','$scope','$routeParams','tools','grades',function($rootScope,$scope,$routeParams,tools,grades){
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
    var dropDisNick,dropTradeType;//降低等级时 所选的分销商
    $scope.layerType=1;
    var _data={};
    $scope.pulling = false; //初次加载 获取数据
    //获取数据
    var getData = function(data,callback){
        $scope.pulling = true;
        tools.http({
            url:api.get,
            data:data,
            succ:function(resp){
                $scope.pulling = false;
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
        $scope.shops=data;
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
        dropDisNick = $scope.shops[index].disNick;
        dropTradeType = $scope.shops[index].tradeType;
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
                disNicks: disNicks,
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
    var parms = $scope.parms = {};
    var enDropLayer = $scope.enDropLayer = function(){
        var type=$scope.layerType;
        var layer=parms.layer;
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
                return;
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
    //获取等级
    var gradeLayers = $scope.gradeLayers = [];
    var layer = new grades();
    layer.get(function(v){
        $scope.gradeLayers=v;
    });
	/*进行任务*/
    switch(Number(tagIndex)){
        case 1:
            /*窜货嫌疑*/
            $scope.title="窜货嫌疑";
            $scope.type="fleeingGoods";
            $scope.nav = '串货监控';
            getData({type:'fleeingGoods'},setShop);
            break;
        case 2:
            /*乱价嫌疑*/
            $scope.title="乱价嫌疑";
            $scope.type="priceRemind";
            $scope.nav = '乱价监控';
            getData({
                type:'priceRemind'
            },setShop);
            break;
        case 3 :
            /*差评监控*/
            $scope.type="badRateInfo";
            $scope.showList=true;
            $scope.nav = '差评监控';
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
    };
    //全选
    $scope.selectAll = function(e){
        var ele = e.target;
        if(ele.tagName.toLocaleUpperCase()=="INPUT"){
            var bool = ele.checked;
            _.each($scope.shops,function(item){
                item.selected = bool;
            });
        }
    };

}]);