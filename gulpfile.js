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

gulp.task("js", function () {
return gulp.src("source/js/*.js")
.pipe(sourcemaps.init())
.pipe(uglify())
.pipe(concat("script.min.js"))
.pipe(sourcemaps.write())
.pipe(gulp.dest("build/js"));
});

gulp.task("css", function () {
return gulp.src("source/less/style.scss")
.pipe(plumber())
.pipe(sourcemaps.init())
.pipe(less({
includePaths: require("node-normalize-scss").includePaths
}))
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
  
gulp.task("copy", function () {
return gulp.src([
"source/fonts/**/*.{woff,woff2}",
"source/img/**",
"source/js/**",
"source/*.ico"
], {
base: "source"
})
.pipe(gulp.dest("build"));
});

gulp.watch("source/less/**/*.less", gulp.series("css"));
gulp.watch("source/img/**/*", gulp.series("graphic", "html", "refresh"));
gulp.watch("source/*.html", gulp.series("html", "refresh"));
