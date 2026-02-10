const { src, dest, series, watch } = require('gulp');
const cleanCSS = require('gulp-clean-css');
const gulp = require('gulp');
const rename = require('gulp-rename');
const sass = require('gulp-sass')(require('sass'));
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');

// Sass options to silence deprecation warnings from dependencies (Bootstrap)
const sassOptions = {
  quietDeps: true,
  silenceDeprecations: ['import', 'global-builtin']
};

// ============================================
// SCSS: styles/.ignore/ → styles/
// ============================================
function stylesCssBase(withSourcemaps = true) {
  let stream = src('styles/.ignore/**/*.scss');

  if (withSourcemaps) {
    stream = stream.pipe(sourcemaps.init());
  }

  stream = stream
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(cleanCSS())
    .pipe(rename(function(path) {
      path.dirname = path.dirname.replace(/.ignore/, '');
    }));

  if (withSourcemaps) {
    stream = stream.pipe(sourcemaps.write('./'));
  }

  return stream.pipe(dest('styles/'));
}

// ============================================
// SCSS: components/**/.ignore/ → components/
// ============================================
function componentsCssBase(withSourcemaps = true) {
  let stream = src('components/**/.ignore/**/*.scss');

  if (withSourcemaps) {
    stream = stream.pipe(sourcemaps.init());
  }

  stream = stream
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(rename(function(path) {
      path.dirname = path.dirname.replace(/\/.ignore/, '');
    }));

  if (withSourcemaps) {
    stream = stream.pipe(sourcemaps.write('./'));
  }

  return stream.pipe(dest('components/'));
}

// ============================================
// JS: scripts/.ignore/ → scripts/
// ============================================
function processScriptsBase(withSourcemaps = true) {
  let stream = src('scripts/.ignore/**/*.js');

  if (withSourcemaps) {
    stream = stream.pipe(sourcemaps.init());
  }

  stream = stream
    .pipe(uglify())
    .pipe(rename(function(path) {
      path.dirname = path.dirname.replace(/.ignore/, '');
    }));

  if (withSourcemaps) {
    stream = stream.pipe(sourcemaps.write('./'));
  }

  return stream.pipe(dest('scripts/'));
}

// ============================================
// JS: components/**/.ignore/ → components/
// ============================================
function processComponentsBase(withSourcemaps = true) {
  let stream = src('components/**/.ignore/**/*.js');

  if (withSourcemaps) {
    stream = stream.pipe(sourcemaps.init());
  }

  stream = stream
    .pipe(uglify())
    .pipe(rename(function(path) {
      path.dirname = path.dirname.replace(/\/.ignore/, '');
    }));

  if (withSourcemaps) {
    stream = stream.pipe(sourcemaps.write('./'));
  }

  return stream.pipe(dest('components/'));
}

// ============================================
// Development tasks (with sourcemaps)
// ============================================
const stylesCssDev = () => stylesCssBase(true);
const componentsCssDev = () => componentsCssBase(true);
const processScriptsDev = () => processScriptsBase(true);
const processComponentsDev = () => processComponentsBase(true);

// ============================================
// Production tasks (without sourcemaps)
// ============================================
const stylesCssProd = () => stylesCssBase(false);
const componentsCssProd = () => componentsCssBase(false);
const processScriptsProd = () => processScriptsBase(false);
const processComponentsProd = () => processComponentsBase(false);

// ============================================
// Cleanup — delete all sourcemap files
// ============================================
async function cleanMaps() {
  const deletedPaths = await del([
    'scripts/**/*.map',
    'styles/**/*.map',
    'components/**/*.map'
  ]);
  if (deletedPaths.length > 0) {
    console.log('[cleanMaps] Deleted', deletedPaths.length, 'sourcemap files');
  }
}

// ============================================
// Watch — rebuild on source changes
// ============================================
function watchFiles() {
  watch('styles/.ignore/**/*.scss', stylesCssDev);
  watch('components/**/.ignore/**/*.scss', componentsCssDev);
  watch('scripts/.ignore/**/*.js', processScriptsDev);
  watch('components/**/.ignore/**/*.js', processComponentsDev);
}

// ============================================
// Task compositions
// ============================================
const devBuild = series([stylesCssDev, componentsCssDev, processScriptsDev, processComponentsDev]);
const prodBuild = series([cleanMaps, stylesCssProd, componentsCssProd, processScriptsProd, processComponentsProd]);

// ============================================
// Exports
// ============================================
exports.dev = devBuild;          // gulp dev — with sourcemaps
exports.prod = prodBuild;        // gulp prod — without sourcemaps
exports.build = prodBuild;       // gulp build — production (no sourcemaps)
exports.watch = series(devBuild, watchFiles); // gulp watch — dev build + watch
exports.default = prodBuild;     // gulp — production (no sourcemaps)
