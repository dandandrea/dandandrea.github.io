angular.module('starter', ['ionic', 'ngCordova'])

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider.state('map', {
    url: '/',
    templateUrl: 'templates/map.html',
    controller: 'MapCtrl'
  });

  $urlRouterProvider.otherwise("/");
})

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.controller('MapCtrl', function($scope, $state) {
  updateLocation($scope);

  setInterval(function() { updateLocation($scope); }, 1000);
});

function updateLocation($scope) {
  var options = {
    timeout: 10000,
    enableHighwayAccuracy: true
  };

  navigator.geolocation.getCurrentPosition(
    function(position) {
      var minRandomFactor = 0.00005;
      var maxRandomFactor = 0.00008;
      var randomFactor = (Math.random() * (minRandomFactor - maxRandomFactor) + maxRandomFactor);

      if ($scope.latLng == null) {
        $scope.latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      }
      else {
        $scope.latLng = new google.maps.LatLng($scope.latLng.lat() + randomFactor, $scope.latLng.lng() + randomFactor);
      }

      var mapOptions = {
        center: $scope.latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      if ($scope.map == null)
      {
        $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
      }
      else {
        $scope.marker.setPosition($scope.latLng);
        $scope.map.panTo($scope.latLng);
      }

      // Wait until the map is loaded
      google.maps.event.addListenerOnce($scope.map, 'idle', function(){
        if ($scope.marker == null) {
          $scope.marker = new google.maps.Marker({
            map: $scope.map,
            position: $scope.latLng
          });      
        }
      });
    },

    function(error) {
      console.log("Could not get location");
    },

    options
  );
}