var gulp = require('gulp'),
  concat = require('gulp-concat');

gulp.task('concat', function () {

  return gulp.src(['./src/instantiator.js', './src/angular-instantiator.js'])
    .pipe(concat('/scripts/scripts.js'))
    .pipe(gulp.dest('dist'));

});