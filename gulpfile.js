var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

gulp.task('server',function(){
	browserSync({
		server:{
			baseDir:'app',
		},
		open:true
	});
})

gulp.task('default',['server'],function(){
	gulp.watch('app/src/html/*.html',reload);
	gulp.watch('app/src/css/*.css',reload);
	gulp.watch('app/src/js/*.js',reload);
})