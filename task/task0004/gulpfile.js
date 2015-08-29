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

/*********js pipe************/
gulp.task('js', function() {
    return gulp.src('./src/js/*.js')
        .pipe(gulp.dest('./dist/js'));
});

/**********css pipe************/
gulp.task('css', function() {
    return gulp.src('./src/css/*.css')
        .pipe(gulp.dest('./dist/css'))
})

/********static***************/
gulp.task('static', function() {
    return gulp.src('./static/**/*.*')
        .pipe(gulp.dest('./dist/static'))
})

/********clean****************/
gulp.task('clean', function() {
    return gulp.src('./dist')
        .pipe(plugins.clean());
})

/******* watch  ********/

/******default********/
gulp.task('default', ['jade', 'css', 'js', 'static'])
