'use strict';

var objPath = {
    // template markups
    HTML: [
        'src/**/*.html'
    ],
    //load primary
    HTML1: [
        'src/app/**/answer/Partials/*.html',
        'src/app/**/common/partials/*.html',
        'src/app/**/content/partials/*.html',
        'src/app/**/layout/Partials/*.html',
        'src/app/**/rank/Partials/*.html',
        'src/app/**/admin/Partials/admin.html',
        'src/app/*.html',
    ],
    HTML2: [
        'src/app/**/admin/**/admin.html',
        'src/app/**/answer/Partials2/*.html',
        'src/app/**/customer/**/*.html',
        'src/app/**/layout/Partials2/*.html',
        'src/app/**/rank/Partials2/*.html',
        'src/app/**/promoters/**/*.html',
        'src/app/**/user/Partials/*.html'
    ],
    JS1: [
        'src/app/**/admin/Services/*.js',
        'src/app/**/answer/Controllers/answerDetail.ctrl.js',
        'src/app/**/answer/Directives/*.js',
        'src/app/**/answer/Services/*.js',
        'src/app/**/common/directives/*.js',
        'src/app/**/content/directives/*.js',
        'src/app/**/content/services/*.js',
        'src/app/**/customer/Services/*.js',
        'src/app/**/layout/Controllers/*.js',
        'src/app/**/layout/Services/*.js',
        'src/app/**/login/**/*.js',
        'src/app/**/promoters/Services/*.js',
        'src/app/**/rank/Controllers/*.js',
        'src/app/**/rank/Services/*.js',
        'src/app/*.js',
        'src/app/**/answer/Services2/*.js',
        'src/app/**/common/services/*.js',
        'src/app/**/user/Services/*.js',
        'dist/partials/templateCacheHtml.js',
    ],
    JS2: [
        'src/app/**/answer/Controllers2/*.js',
        'src/app/**/customer/Controllers/*.js',
        'src/app/**/layout/Controllers2/*.js',
        'src/app/**/rank/Controllers2/*.js',
        'src/app/**/promoters/Controllers/*.js',
        'src/app/**/user/Controllers/*.js',
        'dist/partials/templateCacheHtml2.js'
    ],
    DISTJS: [
        'js/**/*.module.js',
        'js/**/*.js'
    ],
    // images
    IMG: [
        'src/assets/**'
    ],
    // vendor css
    CSS: [
        'src/app/**/*.css',
        'src/assets/css/**/*.css'
    ],
    // vendor js
    VENDOR1: [
        './bower_components/jquery/dist/jquery.js',
        './bower_components/angular/angular.js',
        './bower_components/ng-facebook/ngFacebook.js',
        './bower_components/geolocator/dist/geolocator.js',
        './bower_components/angular-ui-select/dist/select.js',
        './bower_components/ngInfiniteScroll/build/ng-infinite-scroll.js',
        './bower_components/select2/select2.js',
        './bower_components/angular-ui-select2/src/select2.js',
        './bower_components/tinycolor/tinycolor.js',    
        './bower_components/angular-color-picker/dist/angularjs-color-picker.js',
        './bower_components/get-size/get-size.js',
        './bower_components/masonry/dist/masonry.pkgd.js',
        './bower_components/ev-emitter/ev-emitter.js',
        './bower_components/imagesloaded/imagesloaded.js',
        './bower_components/jquery-bridget/jquery-bridget.js',
        './bower_components/matches-selector/matches-selector.js',
        './bower_components/angular-masonry/angular-masonry.js',
        './bower_components/tinycolor/tinycolor.js'
    ],
    VENDOR2: [
        './bower_components/angular-animate/angular-animate.js',
        './bower_components/datatables.net/js/jquery.dataTables.js',
        './bower_components/angular-datatables/dist/angular-datatables.js',
        './bower_components/oclazyload/dist/ocLazyLoad.js',
        './bower_components/angular-strap/dist/angular-strap.js',
        './bower_components/angular-strap/dist/angular-strap.tpl.js',
        './bower_components/angular-cookies/angular-cookies.js',
        './bower_components/angular-easyfb/build/angular-easyfb.js',
        './bower_components/angular-touch/angular-touch.js',
        './bower_components/angular-sanitize/angular-sanitize.js',
        './bower_components/ng-file-upload/ng-file-upload.js',
        './bower_components/ui-scroll/dist/ui-scroll.js',
        './bower_components/x2js/xml2json.min.js',
        './bower_components/angulike/angulike.js',
        './bower_components/angular-socialshare/dist/angular-socialshare.min.js',
        './bower_components/angular-ui-router/release/angular-ui-router.js',
        './bower_components/moment/moment.js',
        './bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
        './bower_components/toastr/toastr.js',
        './bower_components/angular-route/angular-route.js',
        './bower_components/angular-messages/angular-messages.js',
        './bower_components/angularjs-datepicker/dist/angular-datepicker.js',
        './bower_components/bootstrap3-dialog/dist/js/bootstrap-dialog.min.js',
        './bower_components/lodash/lodash.js'
    ],
    VENDOR3:[
        './bower_components/angular-datatables/dist/plugins/colreorder/angular-datatables.colreorder.js',
        './bower_components/angular-datatables/dist/plugins/columnfilter/angular-datatables.columnfilter.js',
        './bower_components/angular-datatables/dist/plugins/light-columnfilter/angular-datatables.light-columnfilter.js',
        './bower_components/angular-datatables/dist/plugins/colvis/angular-datatables.colvis.js',
        './bower_components/angular-datatables/dist/plugins/fixedcolumns/angular-datatables.fixedcolumns.js',
        './bower_components/angular-datatables/dist/plugins/fixedheader/angular-datatables.fixedheader.js',
        './bower_components/angular-datatables/dist/plugins/scroller/angular-datatables.scroller.js',
        './bower_components/angular-datatables/dist/plugins/tabletools/angular-datatables.tabletools.js',
        './bower_components/angular-datatables/dist/plugins/buttons/angular-datatables.buttons.js',
        './bower_components/angular-datatables/dist/plugins/select/angular-datatables.select.js'
    ],
    DIST: './dist'
};

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');
var es = require('event-stream');
var wiredep = require('wiredep');
var _ = require('lodash');
var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});

gulp.task('build-fonts', function () {
    gulp.src($.mainBowerFiles())
        .pipe($.filter('**/*.{eot,svg,ttf,woff,woff2}'))
        .pipe($.flatten())
        .pipe(gulp.dest(path.join(conf.paths.dist, 'fonts/')));
});

gulp.task('build-other', function () {
    var fileFilter = $.filter(function (file) {
        return file.stat.isFile();
    });

    gulp.src([
            path.join(conf.paths.src, '/**/*'),
            path.join('!' + conf.paths.src, '/**/*.{html,css,js}')
        ])
        .pipe(fileFilter)
        .pipe(gulp.dest(path.join(conf.paths.dist, '/')));
});

gulp.task('build-partials', function () {
    return gulp.src(objPath.HTML1)
        .pipe($.minifyHtml({
            empty: true,
            spare: true,
            quotes: true
        }))
        .pipe($.angularTemplatecache({
            module: 'app',
            root: 'app',
        }))
        .pipe($.sourcemaps.init())
        .pipe($.concat('templateCacheHtml.js'))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest(path.join(conf.paths.dist, 'partials/')));
});

gulp.task('build-partials2', function () {
    return gulp.src(objPath.HTML2)
        .pipe($.minifyHtml({
            empty: true,
            spare: true,
            quotes: true
        }))
        .pipe($.angularTemplatecache({
            module: 'app',
            root: 'app',
        }))
        .pipe($.sourcemaps.init())
        .pipe($.concat('templateCacheHtml2.js'))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest(path.join(conf.paths.dist, 'partials/')));
});

gulp.task('build-admin-partials', function () {
    return gulp.src('src/app/admin/**/*.html')
        .pipe($.minifyHtml({
            empty: true,
            spare: true,
            quotes: true
        }))
        .pipe($.angularTemplatecache({
            module: 'app',
            root: 'app/admin',
            standAlone: false
        }))
        .pipe($.concat('templateAdminCacheHtml.js'))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest(path.join(conf.paths.dist, 'partials/')));
});

gulp.task('build-admin', function () {
    return gulp.src([
            'src/app/admin/Controllers/**/*.js',
            'src/app/admin/*.js',
            'dist/partials/templateAdminCacheHtml.js'
        ])
        .pipe($.angularFilesort()).on('error', conf.errorHandler('AngularFilesort'))
        .pipe($.concat('admin-app.js'))
        .pipe($.ngAnnotate())
        .pipe($.uglify({  })).on('error', conf.errorHandler('Uglify'))
        .pipe(gulp.dest(path.join(conf.paths.dist, 'scripts')));
});


gulp.task('build-app2', ['build-partials2'], function () {
    return gulp.src(objPath.JS2)
        .pipe($.angularFilesort()).on('error', conf.errorHandler('AngularFilesort'))
        .pipe($.ngAnnotate())
        .pipe($.concat('app2.js'))
        .pipe($.uglify({  mangle: false })).on('error', conf.errorHandler('Uglify'))
        .pipe(gulp.dest(path.join(conf.paths.dist, 'scripts')));
        
});

gulp.task('build-inject', ['build-partials', 'build-admin-partials',
                          'build-admin', 'build-app2', 'build-fonts', 'build-other'], function () {
    var injectStyles = gulp.src(objPath.CSS)
        .pipe($.concat('app.css'))
        .pipe($.csso({ reduceIdents: false }))
        .pipe(gulp.dest(path.join(conf.paths.dist, 'css')));

    var injectBowerStyles = gulp.src(wiredep().css)
        .pipe($.concat('bower.css'))
        .pipe($.csso())
        .pipe(gulp.dest(path.join(conf.paths.dist, 'css')));

    var injectAppStream = gulp.src(objPath.JS1)
        .pipe($.angularFilesort()).on('error', conf.errorHandler('AngularFilesort'))
        .pipe($.concat('app.js'))
        .pipe($.ngAnnotate())
        .pipe($.uglify({  mangle: false })).on('error', conf.errorHandler('Uglify'))
        .pipe(gulp.dest(path.join(conf.paths.dist, 'scripts')));
    
    var injectVendor1 = gulp.src(objPath.VENDOR1)
        .pipe($.concat('vendor1.js'))
        .pipe($.ngAnnotate())
        .pipe($.uglify())
        .pipe(gulp.dest(path.join(conf.paths.dist, 'scripts')));
    
    var injectVendor2 = gulp.src(objPath.VENDOR2)
        .pipe($.concat('vendor2.js'))
        .pipe($.ngAnnotate())
        .pipe($.uglify())
        .pipe(gulp.dest(path.join(conf.paths.dist, 'scripts')));
    
    var injectVendor3 = gulp.src(objPath.VENDOR3)
        .pipe($.concat('vendor3.js'))
        .pipe($.ngAnnotate())
        .pipe($.uglify())
        .pipe(gulp.dest(path.join(conf.paths.dist, 'scripts')));

    return gulp.src(path.join(conf.paths.src, '*.html'))
        .pipe(gulp.dest(path.join(conf.paths.dist, '/')))
        .pipe($.inject(injectBowerStyles, {
            starttag: '<!-- inject:vendor.css -->',
            relative: true
        }))
        .pipe($.inject(injectStyles, {relative: true}))
        .pipe($.inject(es.merge(injectVendor1, injectVendor2), {
            starttag: '<!-- inject:vendor.js -->',
            relative: true
        }))
        .pipe($.inject(injectAppStream, {relative: true}))
        .pipe($.sourcemaps.write())
        .pipe($.minifyHtml({
          empty: true,
          spare: true,
          quotes: true,
          conditionals: true
        }))
        .pipe(gulp.dest(path.join(conf.paths.dist, '/')))

});

gulp.task('build', ['build-inject'], function () {
    //$.del.sync(['dist/partials/**']);
});