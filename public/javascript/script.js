var app = angular.module('localLibraryApp', ["ngRoute", "ui.bootstrap"]);

app.config(function ($routeProvider, $httpProvider) {
    $routeProvider.when("/", {templateUrl: "public/explore.html", controller: "bookController"})
        .otherwise({redirectTo: "/"});
});

// ================= FILTERS =====================

app.filter('startFrom', function() {
	// This filter will return a list of table data starting at a given index
	// This will be used to limit data returned and help pagination to occurr
	return function(tableData, start) {
		return tableData.slice(start);
	}
});


// ================= CONTROLLERS =================

app.controller("bookController", ["$scope", "$location", "OpenLibraryService", "ModalService", function ($scope, $location, OpenLibraryService, ModalService) {
	$scope.currentPage = 1; // Table page to view
	$scope.pageSize = 20;   // Number of results to show in our book table at a time
	$scope.books = [];      // List of returned books
	
	
	$scope.errorOccurred = false;
	$scope.showWaitSpinner = false;
	$scope.showResults = false;
	
    $scope.clear = function() {
		// Clear all input field models
		$scope.bookTitle = "";
		$scope.bookAuthor = "";
		$scope.bookISBN = "";
		$scope.bookPublisher = "";
	}
	
	$scope.submit = function() {
		// Clear any previous error messages
		$scope.errorOccurred = false;
		
		// Query the OpenLibrary catalog
		OpenLibraryService.searchCollection($scope.bookTitle, $scope.bookAuthor, $scope.bookISBN, $scope.bookPublisher)
			.then(function successCallback(res){
				// Show the number of results found
				$scope.totalResults = res.data.num_found;
				
				// Then populate our book table, we'll implement pagination in the html
				$scope.books = res.data.docs;
				
				// Pull out the identifiers to use with the Open Library Read API automater script
				// Since some properties won't be in our $scope.books object, we'll define a function
				// to check if they exist
				let hasProp = function(obj, propName) {
					return Object.prototype.hasOwnProperty.call(obj, propName);
				}
				
				$scope.identifiers = {
					isbn: (hasProp($scope.books, 'isbn') ? book.isbn[0] : null),
					lccn: (hasProp($scope.books, 'lccn') ? book.lccn[0] : null),
					oclc: (hasProp($scope.books, 'oclc') ? book.oclc[0] : null)
				};
				
				$scope.showResults = true;
				
				// Clear search fields
				$scope.bookTitle = "";
				$scope.bookAuthor = "";
				$scope.bookISBN = "";
				$scope.bookPublisher = "";
				
			}, function errorCallback(err){
				console.log(err);
				
				$scope.errorOccurred = true;
			});
	}
	
	$scope.viewBookInfo = function(clickedBook) {
		// Show the wait spinner overlay
		//$scope.showWaitSpinner = true;
		
		// Get additional book information
		OpenLibraryService.getBookInformation(clickedBook)
			.then(function successCallback(res) {
				//$scope.showWaitSpinner = false;
				
				if( res == null ){
					ModalService.showError();
				}
				else{
					// Open a modal to display the book information
					ModalService.viewBookDetails(res.data.book);					
				}
				
			}, function errorCallback(err){
				//$scope.showWaitSpinner = false;
				
				// Open a modal to display an error
				ModalService.showError();
			});
	}
}]);