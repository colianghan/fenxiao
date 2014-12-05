dm.factory('behaviorBaseService', function (tools) {
    var promiseTool = tools.promise;
    return {
        get: promiseTool('getBehaviorDistributors.htm'),
        dropGrade: promiseTool('moveDistributorToGrade.htm'),
        terminateCoor: promiseTool('terminateCooperation.htm'),
        getCooperationIdByNick: promiseTool('getCooperationIdByNick.htm', 'cache')
    }
});
/*乱价监控和串货监控的抽象类*/
var shopParent = function (type) {
    this.shops = [];
    this.selectAll = false;
    this.applyRange = 'single';
    this.selectedGradeLayerId = "";
    this.type = type;
    this.fleeingProds = [];
    this.checkDetail = function (e, index) {
        var that = this,
            elem = $(e.target),
            $closestDiv = elem.closest('tr'),
            next = $closestDiv.next();
        //'disFleeingGoodsInfo'
        var param = {
            disNick: this.shops[index].disNick,
            type: this.type
        };
        //当前元素存在 隐藏
        if (next.hasClass('fleeingProds') && !next.is(':hidden')) {
            //next.addClass('none');
            next.hide(500);
            return;
        }
        behaviorBaseService.get(param).then(function (resp) {
            if (resp.success) {
                that.fleeingProds = resp.value;
            }
            elem.text('查看详情');
            $closestDiv.siblings('.fleeingProds').insertAfter($closestDiv).show(500);
        }, function (resp) {
            //console.log(resp);
            elem.text('查看详情');
        });
        elem.text('加载中..');
        /* if (next.hasClass('fleeingProds') && !next.hasClass('none')) {
         next.addClass('none');
         } else {
         $closestDiv.siblings('.fleeingProds').insertAfter($closestDiv).removeClass('none');
         }*/
    };
    this.dropGrade = function (e, index) {
        var $closestDiv = $(e.target).closest('tr'),
            next = $closestDiv.next();
        if (next.hasClass('gradesSelectable') && !next.is(':hidden')) {
            /*next.slideUp('slow',function(){
             $(this).addClass('none');
             });*/
            next.hide(500);
            return;
        } else {
            $closestDiv.siblings('.gradesSelectable').slideUp('fast', function () {
                $(this).insertAfter($closestDiv).show(500);
            });
        }
        this.disNicks = this.shops[index].disNick;
        this.tradeTypes = this.shops[index].tradeType;
    },
    this.ensureDropGrade = function (e, index) {
        var that = this,
            tar = $(e.target),
            disNicks = [],
            tradeType = [];
        if (that.applyRange == 'single') {
            disNicks.push(that.disNicks);
            tradeType.push(that.tradeTypes);
        } else {
            that.shops.forEach_(function (item) {
                if (item.selected) {
                    disNicks.push(item.disNick);
                    tradeType.push(item.tradeType);
                }
            });
            if (!disNicks.length) {
                return alert('请您至少选择一个分销商进行操作');
            }
        }
        tar.text('正在降低等级....');
        behaviorBaseService.dropGrade({
            disNicks: disNicks.join(','),
            gradeId: that.selectedGradeLayerId,
            tradeTypes: tradeType.join(',')
        }).then(function (resp) {
            if (resp.success) {
                tar.text('成功降低等级!');
                that.selectAll = false;
                setTimeout(function () {
                    tar.closest('.gradesSelectable').hide().end().text('确定');
                }, 1500);
            }
            else {
                alert('加载出错，请联系客服人员或重试..');
                tar.text('确定');
                //console.log(resp.message);
            }
        }, function (resp) {
            //console.log(resp);
            tar.text('确定');
        });
    },
    this.terminateCoor = function (e, index) {
        var that = this;
        var disNicks = this.shops[index].disNick,
            tradeTypes = this.shops[index].tradeType,
            tar = $(e.target);
        tar.text('正在终止合作....');
        terminateCooperation({
            disNick: disNicks,
            tradeType: tradeTypes
        }).then(function (resp) {
            if (resp.success) {
                setTimeout(function () {
                    $scope.$apply(function () {
                        tar.closest('tr').hide(500);
                    });
                }, 1000);
                tar.text('成功终止!');
            }
            else {
                alert('加载出错，请联系客服人员或重试..');
                tar.text('终止合作');
            }
        }, function (resp) {
            tar.text('终止合作');
        });
    };
    this.init = (function (win) {
        behaviorBaseService.get({
            type: win.type
        }).then(function (resp) {
            //debugger;
            if (resp.success) {
                var value = resp.value;
                if (!value) return;
                if (value.forEach_) {
                    value.forEach_(function (item) {
                        item.selected = false;
                        item.disShopLevel = disShopLevel(item.disShopLevel);
                    });
                    win.shops = value;
                }
                else {
                    for (var i in value) {
                        var item = value[i];
                        item.selected = false;
                        item.disShopLevel = disShopLevel(item.disShopLevel);
                        win.shops.push(item);
                    }
                }
            }
        });
    })(this);
};


dm.controller('behavior',['$rootScope','$scope','$routeParams',function($rootScope,$scope,$routeParams){
	/* 进行当前的url 定位*/
	var bannerIndex = $routeParams.banner||0;
		$scope.tagIndex=tagIndex = $routeParams.tag||1;
	$rootScope.$broadcast('onTagChange',tagIndex);
	/*进行任务*/






}]);