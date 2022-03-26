"use strict";

//////////////////////////////////////
// VARS
//////////////////////////////////////

var browsersup, path;

//////////////////////////////////////
// DIRETORIOS
//////////////////////////////////////

path = {
  php: "../**/*.php", //DIRETORIO DE DESENVOLVIMENTO
  dev: "../src", //DIRETORIO DE DESENVOLVIMENTO
  prod: "../assets", //DIRETORIO DE PRODUCAO
  proxy: "http://localhost/portfólio/", //URL DO PROJETO LOCAL
};

const gulp = require("gulp");
const autoprefixer = require("autoprefixer");
const html = require("gulp-htmlmin");
const gulpif = require("gulp-if");
const imagemin = require("gulp-imagemin");
const uglify = require("gulp-uglify");
const concat = require("gulp-concat");
const newer = require("gulp-newer");
const notify = require("gulp-notify");
const rename = require("gulp-rename");
const sass = require("gulp-sass")(require("sass"));
const postcss = require("gulp-postcss"); // O PostCSS move todo o código necessário para criar funções, utilidades e mixins fora de nossas folhas de estilo e os envolve como plugins.
const plumber = require("gulp-plumber"); // substitui o pipemétodo e remove o onerrormanipulador padrão no errorevento, que despeja fluxos por erro por padrão.
const cssmin = require("gulp-cssmin"); // minifica o css
const spritesmith = require("gulp.spritesmith");
const del = require("del");
const size = require("gulp-size");
const tinypng = require("gulp-tinypng-compress");
const svgmin = require("gulp-svgmin");

const browserSync = require("browser-sync").create();

// sync
function sync() {
  browserSync.init({
    proxy: path.proxy,
    notify: true,
    port: 80, // definido a porta 8000, por default a porta é a 3000
  });

  //done();
}

// clear
function clean() {
  return del(["./build/"]);
}

// sprites
function sprite() {
  gulp
    .src(path.dev + "/images/*.png")
    .pipe(
      spritesmith({
        imgName: "sprite.png", // nome do arquivo sprite gerado.
        cssName: "_sprite.scss",
        imgPath: "../images/sprite.png",
        padding: 10,
      })
    )
    .pipe(gulpif("*.png", gulp.dest(path.prod + "/images")))
    .pipe(gulpif("_sprite.scss", gulp.dest(path.dev + "/scss")))
    .pipe(browserSync.stream());
}

// images
function images() {
  return gulp
    .src(path.dev + "/images/**/*")
    .pipe(
      size({
        title: "[ IMG  ] Tamanho do arquivo:",
        gzip: false,
        pretty: true,
        showFiles: true,
        showTotal: true,
      })
    )
    .pipe(
      tinypng({
        key: "qB8lTb6tYVHxl5TJLRKsMqmjQ4JD8PDN",
        sigFile: "images/.tinypng-sigs",
        log: true,
      })
    )
    .pipe(newer(path.prod + "/images"))

    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
      
      ])
    )
    .pipe(gulp.dest(path.prod + "/images"))
    .pipe(
      size({
        title: "[ IMG  ] Tamanho do arquivo minificado ✔ :",
        gzip: false,
        pretty: true,
        showFiles: true,
        showTotal: true,
      })
    )
    .pipe(browserSync.stream());

}



function svg() {
  return gulp
    .src(path.dev + "/svg/**/*.svg")
    .pipe(svgmin())
    .pipe(gulp.dest(path.prod + "/svg-icons"))
    .pipe(browserSync.stream());
}


// fonts
function fonts() {
  return gulp
    .src(path.dev + "/fonts/**/*")
    .pipe(
      size({
        title: "[ FONT ] Tamanho do arquivo:",
        gzip: false,
        pretty: true,
        showFiles: true,
        showTotal: true,
      })
    )
    .pipe(gulp.dest(path.prod + "/fonts"))
    .pipe(browserSync.stream());
}

// scripts
function scripts() {
  return gulp
    .src([
      "!" + path.dev + "/js/excludes/**/*.js",
      path.dev + "/js/includes/**/*.js",
      path.dev + "/js/*.js",
    ])
    .pipe(
      size({
        title: "[  JS  ] Tamanho do arquivo:",
        gzip: false,
        pretty: true,
        showFiles: true,
        showTotal: true,
      })
    )
    .pipe(concat("main.min.js"))
    .pipe(uglify())
    .pipe(gulp.dest(path.prod + "/js"))
    .pipe(
      size({
        title: "[  JS  ] Tamanho do arquivo minificado ✔ :",
        gzip: false,
        pretty: false,
        showFiles: true,
        showTotal: true,
      })
    )
    .pipe(browserSync.stream());
}

// sass
function css() {
  var onError = function (err) {
    notify.onError({
      title: "Gulp",
      subtitle: "Failure!",
      message: "Error: <%= error.message %> +",
      sound: "Beep",
    })(err);

    this.emit("end");
  };

  return gulp
    .src(path.dev + "/scss/**/*.scss")
    .pipe(
      size({
        title: "[ CSS  ] Tamanho do arquivo:",
        gzip: false,
        pretty: true,
        showFiles: true,
        showTotal: true,
      })
    )
    .pipe(sass({ outputStyle: "expanded" })) // gera o arquivo main.css com o css expanded
    .pipe(postcss([autoprefixer()])) // adc os autoprefixo nas propriedades css para suporte aos browser - atentar o browserslist no arquivo npm pois estamos utilizando o autoprefix direto do node.
    .pipe(gulp.dest(path.prod + "/css/")) // primeiro destino do arquivo main.css.
    .pipe(concat("main.css")) // concatena tudo que for css(libs,seus arquivos css) no arquivo main.css.
    .pipe(browserSync.stream())
    .pipe(cssmin()) // minifica tudo de css.
    .pipe(rename("main.min.css")) // renomeia o arquivo main.css para main.min.css, gerando um novo arquivo.
    .pipe(gulp.dest(path.prod + "/css/")) // adc o novo arquivo gerado chamado main.min.css para a pasta css.
    .pipe(plumber({ errorHandler: onError })) // notifica erro nos arquivos css e plugins. OBS: gulp-plumber pode ser usado para não interromper a execução e forçar você a reiniciar o gulp.
    .pipe(
      size({
        title: "[ CSS  ] Tamanho do arquivo minificado ✔ :",
        gzip: false,
        pretty: true,
        showFiles: true,
        showTotal: true,
      })
    )
    .pipe(browserSync.stream());
}

// html
function dom() {
  // log(file);

  return gulp
    .src(path.php)
    .pipe(
      size({
        title: "[ PHP ] Foi Alterado.",
        gzip: false,
        pretty: false,
        showFiles: false,
        showTotal: true,
      })
    )
    .pipe(browserSync.stream());
}

gulp.task("sass", css);
gulp.task("js", scripts);
gulp.task("svg", svg);
gulp.task("fonts", fonts);
gulp.task("clean", clean);


// gulp.watch("../*.php").on("change", function (file) {
//   log(path.proxy);
//   return gulp.src("../*.php").pipe(livereload());
// });

// watch
function watch() {
  gulp.watch(path.php, dom);
  gulp.watch(path.dev + "/scss/**/*", css);
  gulp.watch(path.dev + "/images/*.png", sprite);
  gulp.watch(path.dev + "/images/**/*", images);
  gulp.watch(path.dev + "/svg/**/*", svg);
  gulp.watch(path.dev + "/fonts/**/*", fonts);
  gulp.watch(path.dev + "/js/**/*", gulp.series(scripts));
  // gulp.watch(path.php).on('change', browserSync.stream());
}

// build - limpa primeiro e depois build o dom e css
gulp.task(
  "build",
  gulp.series(clean, gulp.parallel(css, images, sprite, svg, fonts, scripts))
);

// default - observa os arquivos e syncroniza com o browser
gulp.task("default", gulp.parallel(watch, sync));



