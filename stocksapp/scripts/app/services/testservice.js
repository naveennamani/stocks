angular.module('myapp').service('testservice',['$http','$q',function ($http,$q) {
	var name = [];
	this.name = [];
	this.list = function () {
		var stocklist = {};
		var stock_list = [];
		var url = 'http://localhost:4000/stocks/' + this.name;
		var defer = $q.defer();
		$http.get(url).then(function (response) {
			response = JSON.parse(response.data.replace(/\/\//g,""));
			stocklist = response;
			if (stocklist.length == undefined) {
				// console.log(typeof(stocklist));
				stock_list.push(stocklist);
				defer.resolve(stock_list);
			}
			else {
				defer.resolve(stocklist);
			}
		}), function (data, status) {
			if (status == 404) {
				console.log("wrong data");
			}
			defer.reject(data);
		};
		return defer.promise;
	};
	this.addentry = function (symbol) {
		if(this.name.indexOf(symbol)==-1)
			this.name.push(symbol);
		console.log(this.name);
	};
	this.database = function () {
		var companylist = [];
		var url = 'http://localhost:4000/companylist';
		var defer = $q.defer();
		$http.get(url).then(function (response) {
			console.log(response);
			companylist = response.data.results;
			console.log(companylist);
			defer.resolve(companylist);
		}), function (data, status) {
			if (status == 404) {
				console.log("wrong data");
			}
			defer.reject(data);
		};
		return defer.promise;
	};
	this.getdata = function (q) {
	    var defer = $q.defer();
	    $http.get(q).then(function (response) {
	        console.log(response);
	        defer.resolve(response.data);
	    }), function (data, status) {
	        if (status == 404) {
	            console.log("wrong data");
	        }
	        defer.reject(data);
	    };
	    return defer.promise;
	};
	
	/*
	this.deletedb = function(removeitem) {
		var url ='http://localhost:4000/remove/'+ removeitem;
		$http.post(url).then(function (response) {
			console.log(response);
			return false;
		}), function (data, status) {
			if (status == 404) {
				console.log("wrong data");
			}
		};
		return false;
	};
	*/

}]);