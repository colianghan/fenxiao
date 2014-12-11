dm.controller('index',['$scope','$routeParams','tools',function($scope,$routeParams,tools){
	//$scope.tag = $routeParams.tag||1;
	var api={
		'getHomePageNews':'getHomePageNews.htm',
		'getHomePageGeneralData':'getHomePageGeneralData.htm',
		'getActionData':'getHomePageGatherOfAuctionData.htm'
	};
	/*------------------新闻--------------------*/
	$scope.newList = $scope.newList||[];
	tools.http({
		url:api.getHomePageNews,
		succ:function(resp){
			if(resp.success){
				$scope.newList=resp.value;
				_.each($scope.newList,function(item){
					item.date=item.date.split(' ')[0];
				});
			}else{
				alert(resp.message);
			}
		}
	});
	/*------------------账号信息--------------------*/
	$scope.generaData={};
	tools.http({
		url:api.getHomePageGeneralData,
		succ:function(resp){
			console.log(resp.value);
			if(resp.success){
				$scope.generaData=resp.value
			}else{
				alert(resp.message);
			}
		}
	});
	/*------------------渠道概况--------------------*/
	var day = new Date();
	var dMothAgo = new Date();
	var dYesterDay = new Date(day.getFullYear(),day.getMonth(),day.getDate());
	var iYesterDay = dYesterDay.setTime(dYesterDay.getTime()-1*24*60*60*1000); 
	var imothAgo = dMothAgo.setTime(iYesterDay-30*24*60*60*1000);
	console.log(dYesterDay+'\n'+dMothAgo);
	$scope.begin=dMothAgo.getFullYear()+'-'+(dMothAgo.getMonth()+1)+'-'+dMothAgo.getDate();
	$scope.end=dYesterDay.getFullYear()+'-'+(dYesterDay.getMonth()+1)+'-'+dYesterDay.getDate();
	$scope.ths=['成交金额','转化率','店铺UV','客单价','订单数'];
	var frsh = $scope.refresh=function(){
		var begin = $('.date')[0].value||$scope.begin;
		var end = $('.date')[1].value||$scope.end;
		//debugger;
		var obeginDate = new Date(begin.replace('-','/')).getTime();
		var oendDate = new Date(end.replace('-','/')).getTime();
		if((obeginDate<imothAgo||obeginDate>iYesterDay)||(oendDate<imothAgo||oendDate>iYesterDay)){
			alert('选择超出界限');
			return;
		}
		if(obeginDate>oendDate){
			alert('启示时间大于结束时间');
			return;
		}
		tools.http({
			url:api.getActionData,
			data:{
				lowThedate: begin + ' 00:00:00',
				highThedate: end + ' 00:00:00'
			},
			succ:function(resp){
				if (resp.success) {
					$scope.ActionData=resp.value;
				}else{
					alert(resp.message);
				}
			}
		});
	}
	frsh();
	/*------------------数据概览--------------------*/
}]);

Highcharts.setOptions({
	lang:{
		months:['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
		shortMonths:[1,2,3,4,5,6,7,8,9,10,11,12]
	}
});


dm.controller('data-preview',['$scope','tools','translate',function($scope,tools,translate){
	//数据概览
	$scope.sort=1;
	/*饼图*/
	var getAllData = function(){
		if($scope.sort===1){
			tools.http({
				url:'getHomePageTrendOfTradeAmt.htm',
				succ:function(resp){
					if (resp.success) {
						var d = translate(resp.value.disAmtTrend);
						var dateList = d.keys, // 日期列表
						    disAmtTrend = d.values,//分销商数据
						    supAmtTrend = translate(resp.value.supAmtTrend).values;//供应商数据
						var dates = dateList[0].split(' ')[0].split('-');
						debugger;
						var options={
							chart:{
								type:'line'
							},
							title:{
								text:'整体概况'
							},
							xAxis:{
								type:'datetime',
								dateTimeLabelFormats:{
									day:'%e/%b'
								}
							},
							yAxis:{
								title:{
									text:'成交金额'
								}
							},
							tooltip:{
								shared:true,
								formatter:function(){
									var day = new Date();
									day.setTime(this.x);
									var dayFormater= day.getFullYear()+'-'+(day.getMonth()+1)+'-'+day.getDate();
									var s = '<b>'+dayFormater+'</b>';
									$.each(this.points,function(){
										s+='<br />'+this.series.name+':'+this.y+'元';
									});
									return s;
								}
							},
							credits:{
								enabled:false
							},
							series:[{
								name:'分销商',
								data:disAmtTrend,
								pointStart:Date.UTC(dates[0],dates[1]-1,dates[2]),
								pointInterval:24*60*60*1000
							},{
								name:'供应商',
								data:supAmtTrend,
								pointStart:Date.UTC(dates[0],dates[1]-1,dates[2]),
								pointInterval:24*60*60*1000
							}]
						}
						$('.highCharts').highcharts(options).highcharts();
					}else{
						alert(resp.message);
					}
				}
			});
		}
	} 
	/*------------------母店概况--------------------*/
	$scope.fieldName = 'alipayTradeAmt';
	var _obj={
		 datas:{
		 	sup:{},
		 	dis:{},
		 	baby:{}
		 },
		 getDate:function(){
		 	var type = ['','','sup','dis','baby'][$scope.sort];
		 	var fieldName = $scope.fieldName;
		 	if(!type){
		 		return;
		 	}
		 	var data  = type[fieldName]||[];
		 	if(data.length){
		 		//有值
		 		this.render(data);
		 		return;
		 	}
		 	tools.http({
		 		url:this.api[type],
		 		data:{fieldName:fieldName},
		 		succ:function(resp){
		 			console.log(resp);
		 			debugger;
		 			if(resp.success){
		 				var _tmp = fieldName=='rise'?'alipayTradeAmt':fieldName;
		 				var baseNum = resp.value[0][_tmp];
		 				_.each(resp.value,function(item){
		 					if(baseNum==0){
		 						item.width=0;
		 					}else{
		 						//debugger;
			 					item.width=
			 						((item[_tmp]/baseNum)*100).toFixed(0);
			 				}
			 				item.rise=item['alipayTradeAmt'];
			 				if(item['transformationEfficiency']){
				 				item['transformationEfficiency']=item['transformationEfficiency']+'%';
				 			}
		 				});
		 				_obj.datas[type][fieldName]=resp.value;
		 				_obj.render(resp.value);
		 			}else{
		 				alert(resp.message);
		 			}
		 		}
		 	});
		 },
		 api:{
		 	sup:'getHomePageTopOfSupItemData.htm?type=sup',
		 	dis:'getHomePageTopOfDistributorData.htm',
		 	baby:'getHomePageTopOfSupItemData.htm?type=dis'
		 },
		 render:function(data){
		 	$scope.dataList = data;
		 }
	}
	$scope.$watch('fieldName',function(v){
		debugger;
		if($scope.sort!==1){
			$scope.fieldName=v;
			_obj.getDate();
		}
	});
	$scope.$watch('sort',function(v){
		if(v==1){
			getAllData();
		}else{
			_obj.getDate();
		}
	});
}]);

dm.factory('translate',function(){
	return function(value){
		var _arr = _.pairs(value);
		var temp = _.sortBy(_arr,function(v){
			return v[0];
		});
		var keys=[],values=[]
		_.each(temp,function(v){
			keys.push(v[0]);
			values.push(v[1]);
		});
		return {keys:keys,values:values};
	}
});



dm.filter('percent',function(){
	return function(value,i){
		if(!Number(value)){
			return 0;
		}
		i=i||2;
		return (value*100).toFixed(i)+'%';
	}
});

dm.directive('dateTime',function(){
	return function($scope,$ele,$attrs,$controller){
		$ele.on('click',WdatePicker);
	}
});

dm.directive('trendClass',function(){
	return{
		restrict:'A',
		compile:function(element,attrs,link){
			return function(scope,element,attr,link){
				debugger;
				var value = attrs.trendClass;
				if(value>=0){
					element.addClass('fa-arrow-up');
				}else if (value<0){
					element.addClass('fa-arrow-down');
				}
				scope.$watch('attrs.trendClass',function(value){
					if(value>=0){
						element.addClass('fa-arrow-up');
					}else if (value<0){
						element.addClass('fa-arrow-down');
					}
				});
			}
		}
	}
})
