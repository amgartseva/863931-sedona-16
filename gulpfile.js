"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var sourcemaps = require("gulp-sourcemaps");
var less = require("gulp-less");
var postcss = require("gulp-postcss");
var server = require("browser-sync").create();
var imagemin = require("gulp-imagemin");
var imageminMozjpeg = require("imagemin-mozjpeg");
var webp = require("gulp-webp");
var rename = require("gulp-rename");
var svgstore = require("gulp-svgstore");
var cheerio = require("gulp-cheerio");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var del = require("del");
var htmlmin = require("gulp-htmlmin");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var cleanCSS = require("gulp-clean-css");

gulp.task("images", function () {
return gulp.src("source/img/**/*.{png,jpg,svg}")
.pipe(imagemin([
imagemin.optipng({
optimizationLevel: 3
}),
imageminMozjpeg({
quality: 90
}),
imagemin.svgo()
]))
.pipe(gulp.dest("build/img"));
});

gulp.task("webp", function () {
return gulp.src("source/img/**/*.{png,jpg}")
.pipe(webp({
quality: 90
}))
.pipe(gulp.dest("build/img"));
});

gulp.task("html", function () {
return gulp.src("source/*.html")
.pipe(posthtml([
include()
]))
.pipe(htmlmin({
collapseWhitespace: true
}))
.pipe(gulp.dest("build"));
});

gulp.task("sprite", function () {
return gulp.src("build/img/**/{icon,logo}-*.svg")
.pipe(cheerio({
run: function ($) {
$("[fill]").removeAttr("fill");
},
parserOptions: {
xmlMode: true
}
}))
.pipe(svgstore({
inlineSvg: true
}))
.pipe(rename("sprite.svg"))
.pipe(gulp.dest("build/img"));
})

gulp.task("js", function () {
return gulp.src("source/js/*.js")
.pipe(sourcemaps.init())
.pipe(uglify())
.pipe(concat("script.min.js"))
.pipe(sourcemaps.write())
.pipe(gulp.dest("build/js"));
});

gulp.task("css", function () {
return gulp.src("source/less/style.less")
.pipe(plumber())
.pipe(sourcemaps.init())
.pipe(less())
.pipe(postcss([
require("autoprefixer")({
grid: true,
browsers: ["last 2 versions", "ie 11", "Firefox > 20"]
}),
require("postcss-object-fit-images")
]))
.pipe(cleanCSS())
.pipe(rename("style.min.css"))
.pipe(sourcemaps.write(""))
.pipe(gulp.dest("build/css"))
.pipe(server.stream());
});

gulp.task("server", function () {
server.init({
server: "build/",
notify: false,
open: true,
cors: true,
ui: false
});

gulp.watch("source/sass/**/*.less", gulp.series("css"));
gulp.watch("source/img/**/*", gulp.series("graphic", "html", "refresh"));
gulp.watch("source/*.html", gulp.series("html", "refresh"));
gulp.watch("source/js/**/*.js", gulp.series("js", "refresh"));
});

gulp.task("refresh", function (done) {
server.reload();
done();
});

gulp.task("clean", function () {
return del("build");
});

gulp.task("copy", function () {
return gulp.src([
"source/*.webmanifest",
"source/fonts/**/*.{woff,woff2}",
"source/favicons/**"
], {
base: "source"
})
.pipe(gulp.dest("build"));
});


gulp.task("graphic", gulp.series("images", "webp", "sprite", "html"));
gulp.task("build", gulp.series("clean", "copy", "graphic", "css", "js"));
gulp.task("start", gulp.series("build", "server"));