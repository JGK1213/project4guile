angular.module('myApp', [])

.controller('myController', ["$scope", "helper", function($scope, helper){

		helper.sayHi;

		$scope.user = {name: 'Alfredo', sex: 'male'};
}])

.service('helper', function() {

	return {
		sayHi: console.log('hi')
	}
});