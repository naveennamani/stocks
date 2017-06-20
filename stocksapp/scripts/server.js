var express = require('express');
var app = express();
var path = require('path');
var https = require('https');
var request = require('request');
var MongoClient = require('mongodb').MongoClient;

app.use('/app', express.static(path.join(__dirname, 'app')));

app.get('/stock/:name', function (req, res) {
	// from yahoo API
    console.log(req.params.name);
	var q='http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20(' + req.params.name + ')&env=store://datatables.org/alltableswithkeys&format=json';
	var q='https://www.alphavantage.co/query?function=GLOBAL_QUOTE&apikey=GMKL9INXICS0JYIW&'+req.params.name;
	console.log(q);
    request(q, function (error, response, body) {
        console.log(body);
        res.json(body);
    });

});

app.get('/stocks/:name',function(req,res) {
	console.log(req.params.name);
	//var q='http://www.alphavantage.co/query?function=GLOBAL_QUOTE&apikey=GMKL9INXICS0JYIW&'+req.params.name;
	var q='http://www.google.com/finance/info?q=NSE:'+req.params.name;
	console.log(q);
    request(q,function (error, response, body) {
		if(error) res.send('error'+error);
        console.log(body);
        res.send(body);
    });
});

app.get('/history/:name',function(req,res) {
	// history data form alphavantage API
	console.log(req.params.name);
	//var q='http://www.alphavantage.co/query?'+req.params.name+'&apikey=GMKL9INXICS0JYIW';
	var q='https://www.quandl.com/api/v3/datasets/NSE/'+req.params.name+'.json?&collapse=weekly&api_key=4Chexk98oD5dpkzhCnmn&limit=52';
	console.log(q);
    request(q,function (error, response, body) {
        console.log(body);
        res.send(body);
    });
});

app.get('/companylist', function (req, res, next) {
    MongoClient.connect('mongodb://127.0.0.1:27017/project', function (err, db) {
        if (err) {
            throw err;
        } else {
            console.log("successfully connected to the database");
        }
        var collection = db.collection('nse');
        collection.find({}).toArray(function (err, results) {
            console.log(results);
            res.json({ results });
            db.close();
        });
    });
});

app.get('/delete/:name', function (req, res, next) {
    MongoClient.connect('mongodb://127.0.0.1:27017/project', function (err, db) {
        if (err) {
            throw err;
        } else {
            console.log("successfully connected to the database");
        }
        var collection = db.collection('nsedb');
        collection.find({}).toArray(function (err, results) {
            console.log(results);
            res.json({ results });
            db.close();
        });
    });
});

app.post('/remove/:removeitem', function (req, res, next) {
    MongoClient.connect('mongodb://127.0.0.1:27017/project', function (err, db) {
        if (err) {
            throw err;
        } else {
            console.log("successfully connected to the database");
        }
        var collection = db.collection('nse');
        collection.remove({"symbol":req.params.removeitem});
		db.close();
		res.end(false);
    });
});

app.listen(4000);
console.log("server running on 4000");