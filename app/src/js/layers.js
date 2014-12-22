dm.factory('grades',['$rootScope','tools',function($rootScope,tools){
	var grades=[];
	var api={
		get:tools.promise('getAllGradeInfos.htm',true),
		add:tools.promise('addGradeInfo.htm',false),
		update:tools.promise('updateFenxiaoGrade.htm',false),
		move:tools.promise('moveDistributorToGrade.htm',false)
	};
	var action = function(){
		this.get=function(callback){
			api.get().then(function(resp){
				//debugger;
				//console.log(resp);
				if (resp.success) {
					callback(resp.value);
				};
			});
		},
		this.add=function(name,callback){
			api.add({data:{
				name:name
			}}).then(function(resp){
				if(resp.success){
					callback(resp.value);
				}
			});
		},
		this.update=function(gradeId,name){
			api.update({
				data:{
					gradeId:gradeId,
					name:name
				}
			}).then(function(resp){

			});
		},
		this.move=function(gradeId,disNicks){
			api.move({
				data:{
					gradeId:gradeId,
					disNicks:disNicks
				}
			}).then(function(resp){

			});
		}
	};
	return action;
}]);



