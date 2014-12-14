module.exports = function(grunt) {


	// configure tasks
	grunt.initConfig({

		nodemon: {
			dev: {
				script: 'server.js'
			}
		},

		uglify: {

			build: {
				files: {
					'dist/app.min.js' : ['src/js/*.js']


				}
			}
		},

		ngAnnotate: {
			option: {
				singleQuotes: true
			},
		
		ngapp: {
			files: {
				'src/js/main.js' : ['src/js/main.js'],
				'src/js/game.js' : ['src/js/game.js']

			}
		}
	}

	});

	//load tasks
	grunt.loadNpmTasks('grunt-nodemon');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-ng-annotate');

	// set default
	grunt.registerTask('default', ['ngAnnotate', 'uglify', 'nodemon']);
}