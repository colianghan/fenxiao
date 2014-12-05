/* 页面中的ajax请求 
$.post('http://127.0.0.1:1337','this is a',function(data){
	console.log(data)
});

$.post('http://127.0.0.1:1337',{a:122},function(data){
	console.log(data);
})*/


/*node 中的ajax请求*/

var http=require('http');  
var qs=require('querystring');  
var contents=qs.stringify({  
    name:'hgl',  
    email:'hanguoliang1992@gmail.com',  
    gitHubAddress:'github.com/korealiang/'  
});  
  
var options={  
        host:'127.0.0.1',
        port:1337,  
        path:'/',  
        method:'post'
};  
  
var req=http.request(options,function(res){  
    res.setEncoding('utf-8');  
    res.on('data',function(data){  
        console.log(data);  
    });  
});  
  
req.write(contents);  
req.end();

http.get('http://127.0.0.1:1337',function(res){
	res.setEncoding('utf-8');
	res.on('data',function(data){
		console.log(data);
	});
});