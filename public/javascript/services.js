// Open Library API Service
app.factory('OpenLibraryService', function($window, $http){
	
	return{
		// Query the OpenLibrary Search API to find books
		searchCollection: function(bookTitle, bookAuthor, bookISBN, bookPublisher){
			// https://openlibrary.org/dev/docs/api/search
			
			// Return the promise to the caller to do with the data as they please
			return $http({
				method: 'GET',
				url: 'http://openlibrary.org/search.json?',
				params: {
					title: bookTitle,
					author: bookAuthor,
					isbn: bookISBN,
					publisher: bookPublisher,
					subjects: 'accessible_book', // Only get books that aren't key protected
					has_fulltext: 'true'         // And aren't lendable
				}
			});
		},
		
		// Query the Open Library Read API for more detailed information about a book
		getBookInformation: function(book) {
			// https://openlibrary.org/dev/docs/api/read
			
			/*
			Open Library's Read API requires the request link to be in the form of:
			
				http://openlibrary.org/api/volumes/brief/<id-type>/<id-value>.json
			
			Where <id-type> can be isbn, lccn, or oclc (essentially a book identifier number).
			In addition, multiple identifiers can be attached using the format:
			
				http://openlibrary.org/api/volumes/brief/json/<id-type1>:<id-value1>;<id-type2>:<id-value2>;etc
				
			Info on this can be found at the API link commented above
				
			Angular doesn't encode the parameters correctly either, so we have to do it ourselves. In addition,
			the Open Library server doesn't allow cross domain requests due to CORS, so we'll do a JSONP call instead
			*/
			
			// This function checks if an object has a given property. We use this to
			// ensure we correctly gather the available identifiers from our book object
			let hasProp = function(obj, propName) {
				return Object.prototype.hasOwnProperty.call(obj, propName);
			};
			
			let identifiers = {
				isbn: (hasProp(book, 'isbn') ? book.isbn[0] : null),
				lccn: (hasProp(book, 'lccn') ? book.lccn[0] : null),
				oclc: (hasProp(book, 'oclc') ? book.oclc[0] : null)
			};
			
			let identifier_strings = [];
			
			Object.keys(identifiers).forEach(key => {
				if( identifiers[key] ) {
					// If the identifier isn't null, encode it
					// and add it to our identifier_strings
					identifier_strings.push(key + ':' + identifiers[key]);
				}
			});
			
			// Form our final link by concatenating our identifier_strings with the base url
			// We include a JSONP callback argument to take care of any CORS issues with Open Library
			const READ_URL = 'http://openlibrary.org/api/volumes/brief/json/';
			const REQ_URL = READ_URL + identifier_strings.join(';') + '?callback=JSON_CALLBACK';
			
			// Let's call the API, then filter out the unecessary data
			return $http.jsonp(REQ_URL).success(function(res) {
				
				// Because of how JSONP works, the results aren't wrapped in the typical res.data
				// Instead, the response is in res.{Request_Paramters}
				res.book = res[identifier_strings.join(';')].items[0];

				// If we only got one result for our search, just show that result to the user.
				// However, if we got more than one, lets iterate through them and find the first
				// that has a status of "full access"
				for( let i = 0; i < res[identifier_strings.join(';')].items.length; i++ ) {
					if( res[identifier_strings.join(';')].items[i].status === 'full access' ) {
						res.book = res[identifier_strings.join(';')].items[i];
						break;
					}
				}
				
				// Remove the obscure res entry that references the book
				delete res[identifier_strings.join(';')];
				
				return res;
			});
		}
	}
});


// Service to retrieve modals to display
app.factory('ModalService', function ($http, $uibModal, $window) {
	return {
		// Opens a modal to display more info about a clicked book
		viewBookDetails: function(bookDetails) {
			$uibModal.open({
                templateUrl: 'public/book_modal.html',    // HTML for the modal
                controller: function ($scope, $uibModalInstance) {
					$scope.book = bookDetails;
					
                    $scope.back = function() {
                        // Dismiss this modal to fade back onto the login screen
                        $uibModalInstance.dismiss();
                    };
					
					$scope.redirect = function() {
						$window.open($scope.book.itemURL, "_blank");
					};
                }
            });
		},
		
		// Opens a modal to display an error
		showError: function() {
			$uibModal.open({
                templateUrl: 'public/error_modal.html',    // HTML for the modal
                controller: function ($scope, $uibModalInstance) {
                    $scope.back = function () {
                        // Dismiss this modal to fade back onto the login screen
                        $uibModalInstance.dismiss();
                    };
                }
            });
		}
	}
});