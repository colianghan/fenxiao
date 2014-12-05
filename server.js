var http =require('http');
var qs=require('querystring')
http.createServer(function(req,res) {
	if(req.method='POST'){
		var _data='';
		req.on('data',function(data){
			_data+=data
		});
		req.on('end',function(){
			var POST = qs.parse(_data);
			console.log(POST);
		});
	}
	res.writeHead(200,{'Content-Type':'text/plain'});
	res.end('<h1>hello world</h1>');
}).listen(1337,'127.0.0.1');
console.log('server running at http://127.0.0.1:1337/');