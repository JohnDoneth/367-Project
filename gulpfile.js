const gulp = require("gulp");

function defaultTask(cb) {
  gulp.src("styles.css").pipe(gulp.dest("./dist"));
  gulp.src("media/**/*").pipe(gulp.dest("./dist/media"));
  cb();
}

exports.default = defaultTask;