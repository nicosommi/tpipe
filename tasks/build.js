/* ph ignoringStamps */
/* webapp, service */
/* endph */
import gulp from 'gulp'
import babel from 'gulp-babel'

function defineBuildLibrariesTask (taskName, deps, libPath, distPath) {
  gulp.task(taskName, deps, () => {
    return gulp.src(libPath)
      .pipe(babel())
      .pipe(gulp.dest(distPath))
  })
}

/* stamp webapp */
/* endstamp */
/* stamp lib */
defineBuildLibrariesTask('build-lib', ['clean'], './source/**/*.js', './dist')
gulp.task('build', ['build-lib'])
/* endstamp */
/* stamp service */
/* endstamp */
