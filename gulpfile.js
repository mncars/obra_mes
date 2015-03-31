'use strict';

var $ = require('gulp-load-plugins')(),
    gulp = require('gulp'),
    nn = require('node-notifier'),
    path = require('path'),
    browserSync = require('browser-sync'),
    runSequence = require('run-sequence'),
    inquirer = require('inquirer'),
    spawn = require('child_process').spawn,
    del = require('del'),
    mainBowerFiles = require('main-bower-files'),

    // Custom Gulp configuration
    config = require('./package.json').customConfig,

    // Dependencias para obtener IP
    os = require('os'),
    ifaces = os.networkInterfaces(),
    ipToBrowser = null,

    // Paths and other global variables
    jekyllPath = "src",
    jsPath = "src/js",
    sassPath = "src/_sass",
    vendorPath = "src/vendor",
    
    tmpPath = ".tmp",
    cssDestinationPath = ".tmp/css",

    jekyllTmpPath = ".jekyll",
    distPath = "dist",
    bowerComponentsPath = "bower_components";

function errorHandler(error, error_type) {
	var notifier = new nn.NotificationCenter();
	notifier.notify({
		title: "¡¡ERROR!!",
		message: error.message
	});
	console.error("\n" + error.message);
	this.emit('end');
}

// ****************************************************
// Actualiza los componentes de bower
// ****************************************************
gulp.task('bower', function(done) {
  runSequence('bower:update', 'clean:vendor', 'bower:sync', done);
});

// Sincroniza los ficheros de bower con la carpeta vendor del theme
gulp.task('bower:sync', function() {
  return gulp
    .src(mainBowerFiles(), { base: bowerComponentsPath})
    .pipe(gulp.dest(vendorPath));
});

// Actualiza bower
gulp.task('bower:update', function() {
  return $.bower().pipe(gulp.dest(bowerComponentsPath));
});

// ****************************************************
// Compila SASS
// ****************************************************
gulp.task('sass', function () {
  var cb = gulp
    .src([sassPath + "/*.scss", "!" + sassPath + "/_*.scss" ], { base: sassPath })
    .pipe($.plumber({ errorHandler: errorHandler }))
    .pipe($.sass({ precision: 10 }))
    .pipe($.autoprefixer('last 2 version', '> 1%', 'ie >= 8', 'Opera 12.1'))
    .pipe(gulp.dest(cssDestinationPath))
    .pipe($.notify("Compilación SASS terminada"));

  return cb;
});


// ****************************************************
// Chequeo de los ficheros javascript
// ****************************************************
gulp.task('lint', function() {
  return gulp.src(jsPath + "/**/*.js")
    .pipe($.jshint())
    .pipe($.jshint.reporter('default'));
});


// ****************************************************
// Compila site de plantillas de Jekyll
// ****************************************************
gulp.task('jekyll', function (done) {
    var stderr = "",
        jekyll = spawn('jekyll', ['build'], { stdio: 'inherit' });

    jekyll.on('close', function(code) {
      if (code > 0) {
        new nn().notify({ 
          title: "Jekyll",  
          message: "Error de compilación, revisa la consola" 
        });
        return done('Error al ejecutar jekyll');
      }
      return done();
    });
});

// ****************************************************
// Compila la documentación de la hoja de estilos
// ****************************************************
gulp.task('hologram', function(done) {
    var hologram = spawn('hologram', [], { stdio: 'inherit' });

    hologram.on('close', function(code) {
        if (code > 0) {
          new nn().notify({ 
            title: "Hologram",  
            message: "Error de compilación, revisa la consola" 
          });
          return done('Error al ejecutar hologram');
        }
        return done();
    });
});

// ****************************************************
// Compila y lanza en un server el site de jekyll
// ****************************************************
gulp.task('serve', function() {
  $.livereload.listen({ auto: true });

  $.connect.server({
    root: [jekyllTmpPath, tmpPath]
  });

  gulp.watch([
    jekyllTmpPath + "/**/*", 
    tmpPath + "/**/*"
  ]).on('change', $.livereload.changed);
});

// ****************************************************
// Compila y lanza en un server el site para producción de jekyll
// ****************************************************
gulp.task('serve:dist', ['build'], function() {
  $.connect.server({
    root: [distPath]
  });
});

// ****************************************************
// Copia los ficheros compilados a dist
// ****************************************************
gulp.task('copy:dist', function() {
  return gulp.src([jekyllTmpPath + "/**/*", tmpPath + "/**/*"])
             .pipe(gulp.dest(distPath));
});

// ****************************************************
// Borrar carpetas temporales
// ****************************************************

// Borra la carpeta vendor
gulp.task('clean:vendor', function(done) {
  del([
    vendorPath + "/**"
  ], done);
});

// Borra la carpeta de los componentes de bower 
gulp.task('clean:bower', function(done) {
  del([
    bowerComponentsPath + "/**"
  ], done);
});

// Borra la carpeta tmp
gulp.task('clean:tmp', function(done) {
  del([
    tmpPath + "/**"
  ], done);
});

// Borra la carpeta dist
gulp.task('clean:dist', function(done) {
  del([
    distPath + "/**"
  ], done);
});


// ****************************************************
// Sube el site a divshot
// ****************************************************
gulp.task('divshot', function (done) {
  spawn('divshot', ['push', 'production'], { stdio: 'inherit' })
    .on('close', function(code) {
      return done();
    });
});

// ****************************************************
// Espía cambios en ficheros para lanzar tareas automáticamente
// ****************************************************
gulp.task('watch', function() {
  gulp.watch([sassPath + "/**/*.scss"], ['sass']);
  gulp.watch([jekyllPath + "/**/*", "!" + sassPath + "**/*"], ['jekyll']);
  gulp.watch([jsPath + "**/*.js"], ['lint']);
  gulp.watch([jekyllPath + "/_doc_assets/**/*", sassPath + "/**/*"], ['hologram']);
});


// ****************************************************
// Compila el site y hoja de estilos
// ****************************************************
gulp.task('compile', function(done) {
  runSequence('clean:tmp', ['jekyll', 'sass'], 'hologram', done);
});

// ****************************************************
// Tarea por defecto
// ****************************************************

gulp.task('default', function(done) {
  runSequence('compile', 'watch', 'serve', done);
});

gulp.task('build', function(done) {
  runSequence('compile', 'clean:dist', 'copy:dist', done);
});

gulp.task('deploy', function(done) {
  runSequence('build', 'divshot', done);
});
