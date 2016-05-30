/* ph ignoringStamps */
/* webapp, service */
/* endph */
import gulp from 'gulp'
import del from 'del'

function defineCleanTask (taskName, dirs) {
  gulp.task(taskName, function () {
    return del(dirs)
  })
}
/* stamp webapp */
/* endstamp */
/* stamp lib */
defineCleanTask('clean', ['./dist'])
/* endstamp */
/* stamp service */
/* endstamp */
