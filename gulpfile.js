const {src, dest, watch, parallel, series} = require('gulp');
const del = require('del');
const scss = require('gulp-sass');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');

const browserSync = require('browser-sync').create();

const imagemin = require('gulp-imagemin');



function cleanDist(){
    return del('dist')
}

function build(){
    return src([
        'app/**/*.html',
        'app/css/style.min.css',
        'app/js/main.min.js'
    ], {base: 'app'})
        .pipe(dest('dist'));
}

function images(){
    return src('app/images/**/*.*')
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(dest('dist/images'))
}

function browser_sync() {
    browserSync.init({
        server: {
            baseDir: "app/"
        },
        host: "192.168.5.97",
        notify: false
    })
}

function styles() {
    return src('app/scss/style.scss')
        .pipe(scss({outputStyle: 'expanded'})) // or compressed
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ["last 10 versions"]
        }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream()); //stream - add styles
}


function scripts() {
    return src([
        'node_modules/jquery/dist/jquery.js',
        'app/js/main.js'
    ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.stream());
}

function watching() {
    watch(['app/scss/**/*.scss'], styles);
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
    watch(['app/*.html']).on('change', browserSync.reload);
}

exports.styles = styles;
exports.scripts = scripts;
exports.watching = watching;
exports.browser_sync = browser_sync;
exports.images = images;
exports.build = series(cleanDist, images, build);
exports.cleanDist = cleanDist;

exports.default = parallel(styles, scripts, browser_sync, watching);
