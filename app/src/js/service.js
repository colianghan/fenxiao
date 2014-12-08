//var dm = angular.module("distributManager", ['ngTable', 'ngSanitize']);
/*dm.config(function ($sceProvider) {
    $sceProvider.enabled(false);
});*/
dm.factory('tools', function ($q, $http, $rootScope) {
    //var origin = window.location.origin == "http://fenxiao8.com" ? 'http://fenxiao8.com/distributor-manager/html/' : '';
    //var origin = (window.location.origin.indexOf('fenxiao8') != -1) ? window.location.origin + '/distributor-manager/html/' : '';
    var origin = '/distributor-manager/html/';
    var toolset = {
        cache: {},
        http: function (param) {
            if (!param instanceof Object || !param.url) {
                return;
            }
            $http({
                method: param.method || 'GET',
                url: origin + param.url,
                params: param.data || {},
                headers: {
                    'Accept': 'application/json, text/javascript, */*'
                }
            }).success(function (resp) {
                if (resp.value == "session expire") {
                    return window.location.href = window.location.href.replace('home', 'login');
                }
                if (resp.success != undefined && !resp.success) {
                    param.fail && param.fail(resp);
                }
                param.succ && param.succ(resp);
            }).error(function (resp) {
                param.fail && param.fail(resp);
            });
        },
        promise: function (url, iscache) {
            if (!iscache) {
                return function (param) {
                    var defer = $q.defer();
                    var _data = param ? param.data || param : {};
                    var _method = param ? param.method : false;
                    toolset.http({
                        data: _data,
                        url: url,
                        succ: function (resp) {
                            defer.resolve(resp);
                        },
                        fail: function (resp) {
                            defer.reject(resp);
                        },
                        method: _method
                    });
                    return defer.promise;
                }
            } else {
                return function (param) {
                    var cached_resp = toolset.cache[url + JSON.stringify(param)], defer = $q.defer();
                    if (cached_resp) {
                        defer.resolve(cached_resp);
                    } else {
                        var _data = param ? param.data || param : {};
                        var _method = param ? param.method : false;
                        toolset.http({
                            data: _data,
                            url: url,
                            succ: function (resp) {
                                toolset.cache[url + JSON.stringify(param)] = resp;
                                defer.resolve(resp);
                            },
                            fail: function (resp) {
                                defer.reject(resp);
                            },
                            method: _method
                        });
                    }
                    return defer.promise;
                }
            }
        },
        shopLevels: ['无信誉', '1心', '2心', '3心', '4心', '5心', '1钻', '2钻', '3钻', '4钻', '5钻', '1蓝冠', '2蓝冠', '3蓝冠', '4蓝冠', '5蓝冠', '1金冠', '2金冠', '3金冠', '4金冠', '5金冠'],
        shopLevel: function (level) {
            if (level === null) {
                return '--';
            } else if (level === 0) {
                return 'noCredit';
            } else if (('' + level).indexOf('w_') != -1) {
                return level;
            }
            sl = +level;
            return sl >= 1 && sl <= 5 ? "star w_" + sl : (sl >= 6 && sl <= 10 ? "diamond w_" + (sl - 5) : (sl >= 11 && sl <= 15 ? "crown w_" + (sl - 10) : "goldcrown w_" + (sl - 15)));
        },
        config: {
            table: {count: 30}
        }
    }
    return toolset;
});
dm.factory('terminateCooperation', function ($rootScope, tools, $q) {
    return function (args) {
        var defer = $q.defer();
        var param = {
            title: '停止合作',
            text: '您确定要终止与' + args.disNick + '的' + (args.tradeType == 'AGENT' ? '代销' : '经销') + '合作吗?',
            btns: [
                {
                    text: '确定',
                    fn: function () {
                        tools.http(
                            {
                                url: 'terminateCooperation.htm',
                                data: {
                                    disNick: args.disNick,
                                    tradeType: args.tradeType
                                },
                                succ: function (resp) {
                                    defer.resolve(resp);
                                },
                                fail: function (resp) {
                                    defer.reject(resp);
                                }
                            }
                        );
                        $rootScope.$broadcast('dialog-hide');
                    }
                },
                {
                    text: '取消',
                    fn: function () {
                        $rootScope.$broadcast('dialog-hide');
                        defer.reject();
                    }
                }
            ],
            close: function () {
                defer.reject();
            }
        }
        $rootScope.$broadcast('dialog-show', param);
        return defer.promise;
    }
});
dm.factory('gradeLayerService', function (tools) {
    var promiseTool = tools.promise;
    return {
        get: promiseTool('getSupGradeInfos.htm', 'cache'),
        addGrade: promiseTool('addSupGradeInfo.htm'),
        delGrade: promiseTool('deleteSupGradeInfo.htm'),
        edtGrade: promiseTool('updateSupGradeInfo.htm'),
        addDistributors: promiseTool('accreditGrade.htm'),
        addAuthoredProdLines: promiseTool('accreditProductCat.htm'),
        setDiscount: promiseTool('accreditSupDiscountInfo.htm')
    }
});