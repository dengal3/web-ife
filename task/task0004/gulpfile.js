var gulp = require('gulp'),
    plugins = require('gulp-load-plugins')();
var path = require('path');
var http = require('http');

/*******Jade to Html**********/
gulp.task('jade', function() {
    return gulp.src('./src/jade/index.jade')
        .pipe(plugins.jade({
            pretty: true
        }))
        .pipe(gulp.dest('./dist/'))
        .pipe(plugins.livereload());
});


/******* watch  ********/
