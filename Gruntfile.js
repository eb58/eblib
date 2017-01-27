module.exports = function (grunt) {

// Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    qunit: {
      all: {
        options: {
          urls: [
            'http://localhost:8383/tests/unittests/mx/mxtests.html',
            'http://localhost:8383/tests/unittests/ebtable/test0.html',
            'http://localhost:8383/tests/unittests/ebtable/test1.html',
          ]
        }
      }
    },
    concat: {
      options: {
        //separator: '\n\n/*################################################*/\n\n'
        process: function (src, filepath) {
          return '\n/*#########################################*/\n/*####  ' + filepath + ' #####*/\n/*#########################################*/\n\n' + src;
        }
      },
      dist: {
        src: ['public_html/js/eblib/*.js'],
        dest: 'public_html/dist/<%= pkg.name %>.js'
      },
      css: {
        src: 'public_html/css/*.css',
        dest: 'public_html/dist/eblib.css'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> Version:<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */',
        compress: true,
        mangle: true
      },
      dist: {
        files: {
          'public_html/dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    cssmin: {
      dist: {
        options: {
          banner: '/*! eblib 1.0.0  */'
        },
        files: {
          'public_html/dist/<%= pkg.name %>.min.css': ['public_html/css/**/*.css']
        }
      }
    },
    jshint: {
      files: ['public_html/js/**/*.js'],
      options: {
//        curly: false,
//        eqeqeq: true,
//        immed: true,
//        latedef: true,
//        newcap: true,
//        noarg: true,
//        sub: true,
//        undef: true,
//        boss: true,
//        eqnull: true,
//        node: true,
        multistr: false,
        browser: true,
        devel: true
      }
    },
    watch: {
      files: ['<%= jshint.files %>', 'public_html/css/*.css', 'public_html/tests/**/*.html', 'public_html/tests/**/*.js'],
      tasks: ['jshint', 'qunit']
    }

  });
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  // task(s).
  grunt.registerTask('default', ['watch']);
  grunt.registerTask('test', ['jshint', 'qunit']);
};
