'use strict';

var fs = require('fs'),
    path = require('path'),
    when = require('when'),
    spawn = require('child_process').spawn,
    directory = path.resolve(process.cwd(), 'app'),
    proxySnippet = require('grunt-connect-proxy/lib/utils').proxyRequest;
var configureGrunt = function(grunt){
    require('time-grunt')(grunt);
    require('matchdep').filterDev(['grunt-*','!grunt-cli']).forEach(grunt.loadNpmTasks);

    var cfg ={
        paths:{
            srcDir:path.join(directory,'src'),
            builtDir:path.join(directory,'built')
        },
        releaseVersion:'',
        pkg:grunt.file.readJSON('package.json'),
        commonuBanner:[
            '@name:<%= pkg.name %>',
            '@version:<%= pkg.version %>',
            '@authot:<%= pkg.author %>',
            '@email:<%= pkg.email %>',
            '@Date:<%= grunt.template.today("yyyy-mm-dd") %>'
        ].join('\n'),
        connect:{
            server:{
                proxies:[{
                    context:'/distributor-manager',
                    host:'121.41.160.43',
                    port:'30001',
                    changeOrigin:true,
                    https:false,
                    xforward:false
                }],
                options:{
                    port:3001,
                    logger: 'dev',
                    hostname:'localhost',
                    base:['app'],
                    middleware:function(connect,options){
                        var middlewares=[];
                        middlewares.push(function(req,res,next){
                            proxySnippet(req,res,next);
                        });
                        options.base.forEach(function(base){
                            middlewares.push(connect.static(base));
                        });
                        return middlewares;
                        //return next();
                    },
                    open:true
                }
            }
        },
        watch:{
            js:{
                files:['<%= paths.srcDir %>/js/*.js'],
                tasks:['copy:prod'],
                options:{
                    livereload:9000
                }
            },
            css:{
                files:['<%= paths.srcDir %>/css/*.css'],
                tasks:['cssmin:dev','copy:prod'],
                options:{
                    livereload:9000
                }
            },
            html:{
                files:['<%= paths.srcDir %>/html/*.html'],
                tasks:[],
                options:{
                    livereload:9000
                }
            }
        },
        cssmin:{
            dev:{
                options:{
                    banner:'/*\n<%= commonuBanner %>\n@des: main css file\n*/'
                },
                src:['<%= paths.srcDir %>/css/*.css','!<%= paths.srcDir %>/css/main.css'],
                dest:'<%= paths.srcDir %>/css/main.css'
            },
            init:{
                options:{
                    report:'min',
                    banner:'/*!\n<%= commonBanner %>\n@des:vendor css file\n*/',
                },
                src:[
                    'public/components/bootstrap/docs/assets/css/bootstrap.css',
                    'public/components/bootstrap/docs/assets/css/bootstrap-responsive.css',
                    'public/components/bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.css',
                    'public/components/ng-table/ng-table.css'
                    /*'app/src/css/index.css'*/
                ],
                dest:'<%= paths.builtDir %>/css/vendor.css'
            }
        },
        copy:{
            prod:{
                files:[{
                    cwd:'<%= paths.srcDir %>/js/',
                    src:['*.js','!vendor.js','!plugin.js','!*.min.js'],
                    dest:'<%= paths.builtDir %>/js/',
                    expand:true
                },{
                    cwd:'<%= paths.srcDir %>/css/',
                    src:['main.css'],
                    dest:'<%= paths.builtDir %>/css/',
                    expand:true
                },{
                    cwd:'<%= paths.srcDir %>/fonts/',
                    src:['**'],
                    dest:'<%= paths.builtDir %>/fonts/',
                    expand:true
                },{
                    cwd: '<%= paths.srcDir %>/img/',
                    src: ['**'],
                    dest: '<%= paths.builtDir %>/img/',
                    expand: true
                }]
            }
        },
        concat:{
            init:{
                options:{
                    separator:';',
                    stripBanner:false
                },
                files:{
                    '<%= paths.builtDir %>/js/vendor.js':[
                        'public/components/jquery/jquery.js',
                        'public/components/underscore/underscore.js',
                        'public/components/bootstrap/docs/assets/js/bootstrap.js',
                        'public/components/angular/angular.js',
                        'public/components/angular-route/angular-route.js',
                        'public/components/angular-sanitize/angular-sanitize.js',
                        'public/components/angular-animate/angular-animate.js'
                    ],
                    '<%= paths.builtDir %>/js/plugin.js':[
                        'public/components/ng-table/ng-table.js',
                        'public/components/highCharts/highCharts.js',
                        'public/components/bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.js'
                    ]
                }
            },
            css:{
                files:{
                    '<%= paths.builtDir %>/css/theme.css':[
                        'public/components/bootstrap/docs/assets/css/bootstrap.css',
                        'public/components/bootstrap/docs/assets/css/bootstrap-responsive.css',
                        'public/components/bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.css',
                        'public/components/ng-table/ng-table.css',
                        'public/components/font-awesome/css/font-awesome.css'
                    ]
                }
            }
        },
        uglify:{
            prod:{
                options:{
                    banner:'/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
                },
                files:{
                    '<%= paths.builtDir %>/js/vendor.min.js':'<%= paths.builtDir %>/js/vendor.js',
                    '<%= paths.builtDir %>/js/plugin.min.js':'<%= paths.builtDir %>/js/plugin.js',
                }
            }
        },
        shell:{
            bower:{
                command:'bower install'
            },
            start:{
                command:'node app'
            }
        }
    };

    grunt.initConfig(cfg);
    grunt.registerTask('test',function(){
        console.log("test")
    });
    grunt.registerTask('init',[
            'concat:css',
            'concat:init',
            'uglify:prod',
            'copy:prod'
    ]);
    //grunt.registerTask('connect',['connect:server'])
    // grunt.registerTask('watch',['watch']);
    grunt.registerTask('server',[
        'init',
        'configureProxies:server',
        'connect:server',
        'watch'
    ]);
}
module.exports = configureGrunt;
