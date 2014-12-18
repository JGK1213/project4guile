angular.module('myApp', [])

.controller('myController', ["$scope", "helper", function($scope, helper){

		helper.sayHi;

}])

.service('helper', function() {

	return {
		sayHi: console.log('hi')
	}
});