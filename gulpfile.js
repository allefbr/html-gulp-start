"use strict";

const paths = {
  dev: "./_src",
  prod: "./assets",
  images: "images",
  fonts: "fonts",
  js: "js",
  sass: "sass",
  css: "css",
  proxy: "http://projetos.teturismo"
};

const autoprefixer = require("autoprefixer");
const browsersync = require("browser-sync").create();
const cssnano = require("cssnano");
const del = require("del");
const gulp = require("gulp");
const imagemin = require("gulp-imagemin");
const newer = require("gulp-newer");
const plumber = require("gulp-plumber");
const uglify = require("gulp-uglify");
const concat = require("gulp-concat");
const postcss = require("gulp-postcss");
const rename = require("gulp-rename");
const sass = require("gulp-sass");

function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: "./"
    },
    options: {
      reloadDelay: 250
    },
    notify: true
  });

  done();
}

function clean() {
  return del([paths.prod]);
}

function images() {
  return gulp
    .src(`${paths.dev}/${paths.images}/**/*`)
    .pipe(newer(`${paths.prod}/${paths.images}`))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: false,
              collapseGroups: true
            }
          ]
        })
      ])
    )
    .pipe(gulp.dest(`${paths.prod}/${paths.images}`));
}

function fonts() {
  return gulp
    .src(`${paths.dev}/${paths.fonts}/**/*`)
    .pipe(gulp.dest(`${paths.prod}/${paths.fonts}`));
}

function css() {
  return gulp
    .src(`${paths.dev}/${paths.sass}/**/*.scss`)
    .pipe(plumber())
    .pipe(sass({ outputStyle: "expanded" }))
    .pipe(gulp.dest(`${paths.prod}/${paths.css}/`))
    .pipe(rename({ suffix: ".min" }))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(plumber.stop())
    .pipe(gulp.dest(`${paths.prod}/${paths.css}/`))
    .pipe(browsersync.stream());
}

function scripts() {
  return gulp
    .src([
      `${paths.dev}/${paths.js}/_includes/**/*.js`,
      `${paths.dev}/${paths.js}/*.js`
    ])
    .pipe(plumber())
    .pipe(concat("main.min.js"))
    .pipe(uglify())
    .pipe(gulp.dest(`${paths.prod}/${paths.js}`))
    .pipe(browsersync.stream());
}

function watchFiles() {
  gulp.watch(`${paths.dev}/${paths.sass}/**/*`, css);
  gulp.watch(`${paths.dev}/${paths.fonts}/**/*`, fonts);
  gulp.watch(`${paths.dev}/${paths.js}/**/*`, scripts);
  gulp.watch(`${paths.dev}/${paths.images}/**/*`, images);
}

gulp.task("images", images);
gulp.task("sass", css);
gulp.task("fonts", fonts);
gulp.task("scripts", scripts);
gulp.task("clean", clean);
gulp.task(
  "build",
  gulp.series(clean, gulp.parallel(css, scripts, images, fonts))
);
gulp.task("default", gulp.parallel(watchFiles, browserSync));
