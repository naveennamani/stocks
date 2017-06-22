angular.module('myapp').controller('mainctrl', ['testservice', '$scope', '$interval', function (testservice, $scope, $interval) {
	$scope.companylist = [];
	$scope.tickernames={};
	$scope.stocklist = [];
	$scope.name = '';
	$scope.symbol = '';
	testservice.database().then(function (list) {      
		$scope.companylist = list;
		$scope.companylist.forEach(function(x) {
			$scope.tickernames[x.symbol]=x.Name;
			$scope.tickerchartdata[x.symbol]=[[],[]];
		});
	});

	$scope.show = function () {
	    return  $scope.stocklist!=null && $scope.stocklist.length != undefined;
	};

	$scope.upload = function (change) {
		return 'http://images.financialcontent.com/studio-6.0/arrows/arrow5'+(change.match(/\-/g)?'down':'up')+'.png';
	};
	
	$scope.addcompany = function (name) {
		var _symbol = $scope.name.split("|")[1].replace(/ /g, "");
		testservice.addentry(_symbol);
		$scope.tickercomp= _symbol;
		testservice.list().then(function (list) {
			$scope.stocklist = list;
			localStorage.setItem('stockList', JSON.stringify($scope.stocklist));
		});
		$scope.showtickerchart($scope.tickercomp);
	};
	$scope.timer;
	$scope.init = function () {
	    $scope.stocklist = JSON.parse(localStorage.getItem('stockList'));
		$scope.timer=$interval(function() {
			testservice.list().then(function (list) {
				var ns='';
				var present_list=[],names=[];
				if($scope.stocklist.length!=0) {
					$scope.stocklist.forEach(function(v,i) {
						for(var i=0;i<list.length;i++)
							if(v.t==list[i].t) {
								present_list.push(list[i]);
								names.push(v.t);
								var dt=$scope.tickerchartdata[list[i].t][0];
								var vv=$scope.tickerchartdata[list[i].t][1];
								$scope.tickerchartdata[list[i].t][0].push(new Date(v.lt_dts.replace(/Z/g,'')));
								vv.push(list[i].l);
								if(vv.length>1 && vv[vv.length-1]!=vv[vv.length-2])
									ns+=('Price Change for '+v.t+'\n');
								break;
							}
					});
				}
				//console.log(present_list);
				$scope.stocklist = present_list;
				testservice.name=names;
				$scope.showtickerchart(undefined,ns);
				localStorage.setItem('stockList', JSON.stringify($scope.stocklist));
			});
		},1000*3);
		//$interval.cancel($scope.timer);
		if($scope.stocklist!=undefined && $scope.stocklist.length!=undefined)
			$scope.stocklist.forEach(function (x) {
				testservice.name.push(x["t"]);
			});
	};

	$scope.remove = function (id) {
	    $scope.stocklist.splice(id, 1);
	    console.log($scope.stocklist);
		if($scope.stocklist!=undefined && $scope.stocklist.length!=undefined)
			$scope.stocklist.forEach(function (x) {
				testservice.name.push(x["t"]);
			});
		localStorage.setItem('stockList', JSON.stringify($scope.stocklist));
	};
	
	$scope.alertchange=function(str) {
		if (!("Notification" in window)) {
			alert("This browser does not support desktop notification");
		}
		else if (Notification.permission === "granted") {
			var options = {
				body: str,
				icon: "icon.png",
				dir : "ltr"
			};
			var notification = new Notification("Stocks update",options);
			setTimeout(notification.close.bind(notification),2000);
		}
		else if (Notification.permission !== 'denied') {
			Notification.requestPermission(function (permission) {
				if (!('permission' in Notification)) {
					Notification.permission = permission;
				}
				if (permission === "granted") {
					var options = {
						body: str,
						icon: "icon.png",
						dir : "ltr"
					};
					var notification = new Notification("Stocks update",options);
					setTimeout(notification.close.bind(notification),2000);
				}
			});
		}
	};

	/*
	$scope.showgraph = function (sym,type,id) {
	    $scope.symbol = sym;
	    var q = [];
	    //type = 'TIME_SERIES_INTRADAY';
		q.push('function='+type);
		if(type!='TIME_SERIES_INTRADAY')
			q.push('symbol=NSE:'+sym);
		else
			q.push('symbol='+sym);
		if(type.match(/TIME_SERIES_INTRADAY|TIME_SERIES_DAILY|TIME_SERIES_DAILY_ADJUSTED/g)) {
			q.push('interval=1min');
			q.push('outputsize=compact');
			//q.push('outputsize=full');
		}
		var func=function() {
			testservice.getdata('/history/'+q.join('&')).then(function(resp) {
				$scope.drawchart(resp,id);
			});
		};
		func();
	};
	*/
	
	$scope.showgraph = function (sym) {
	    $scope.symbol = sym;
		console.log(sym);
		testservice.getdata('/history/'+sym).then(function(resp) {
			console.log(resp);
			$scope.drawchart(resp);
		});
	};
	
	$scope.setcomp=function(sym) {
		$scope.symbol=sym;
		console.log(sym);
		$("#chart").html("");
		$("#volumechart").html("");
		$scope.showgraph(sym);
	};

	$scope.tickerchartdata={};
	$scope.tickercomp='';
	$scope.showtickerchart=function(comp,ns) {
		console.log(ns);
		console.log(comp,$scope.tickercomp);
		if(comp!=undefined) {
			console.log('clearing');
			//$scope.tickerchartdata[comp]=[[],[]];
			$scope.tickercomp=comp;
		}
		console.log($scope.tickerchartdata);
	    Plotly.newPlot('tickerchart',[
            {
                type:'scatter',
				x:$scope.tickerchartdata[$scope.tickercomp][0],
				y:$scope.tickerchartdata[$scope.tickercomp][1],
				name:'price',
            }
		],{
	        width:400,
	        height:400,
	        xaxis:{title:'Time'},
	        yaxis:{title:'Stocks price'},
	        shapes: {layer:'above'},
			title:$scope.tickernames[$scope.tickercomp]
	    },{
			displaylogo:false
		});
		console.log(ns);
		if(ns!=undefined && ns!='')
			$scope.alertchange(ns);
	};
	
	/*
	$scope.drawchart=function(data,id) {
	    //data=JSON.parse(data);
	    var x=[],y=[],ox=[],open=[],high=[],low=[],close=[],volume=[];
	    var metadata,tsdata;
	    for(var key in data)
	        if(key.match(/Meta Data/g)) metadata=data[key];
	        else tsdata=data[key];
	    for(var key in tsdata) {
	        x.push(new Date(new Date(key+" EDT").toLocaleString()));
	        ox.push(key);
	        //x.push(new Date(key));
	        open.push(tsdata[key]["1. open"]);
	        high.push(tsdata[key]["2. high"]);
	        low.push(tsdata[key]["3. low"]);
	        close.push(tsdata[key]["4. close"]);
	        volume.push(tsdata[key]["5. volume"]);
	    }
	    console.log(x, y);
	    window.tsdata=tsdata;
		var dive = document.getElementById("chart");
	    // dive.on('plotly_afterplot', function () {
	        // $scope.view = true;
	    // });
		var maxmarkersx=[],maxmarkersy=[];
		var minmarkersx=[],minmarkersy=[];
		var max=0,ind=0,min=open[0],indm=0;
		open.forEach(function(a,b) {
			if(max<a) {
				max=a;
				ind=b;
			}
			if(min>a) {
				min=a;
				indm=b;
			}
		});
		maxmarkersx.push(x[ind]);
		maxmarkersy.push(max);
		minmarkersx.push(x[indm]);
		minmarkersy.push(min);
		/*
		var max=0,ind=0,min=high[0],indm=0;
		high.forEach(function(a,b) {
			if(max<a) {
				max=a;
				ind=b;
			}
			if(min>a) {
				min=a;
				indm=b;
			}
		});
		maxmarkersx.push(x[ind]);
		maxmarkersy.push(max);
		minmarkersx.push(x[indm]);
		minmarkersy.push(min);
		var max=0,ind=0,min=low[0],indm=0;
		low.forEach(function(a,b) {
			if(max<a) {
				max=a;
				ind=b;
			}
			if(min>a) {
				min=a;
				indm=b;
			}
		});
		maxmarkersx.push(x[ind]);
		maxmarkersy.push(max);
		minmarkersx.push(x[indm]);
		minmarkersy.push(min);
		var max=0,ind=0,min=close[0],indm=0;
		close.forEach(function(a,b) {
			if(max<a) {
				max=a;
				ind=b;
			}
			if(min>a) {
				min=a;
				indm=b;
			}
		});
		maxmarkersx.push(x[ind]);
		maxmarkersy.push(max);
		minmarkersx.push(x[indm]);
		minmarkersy.push(min);
		console.log(maxmarkersx,maxmarkersy,minmarkersx,minmarkersy);
		/
	    Plotly.newPlot(id,[
            {type:'scatter',x:x,y:open,name:'open',mode:'lines'},
            {x:x,y:high,name:'high'},
            {x:x,y:low,name:'low'},
            {x:x,y:close,name:'close'},
			{x:maxmarkersx,y:maxmarkersy,type:'markers',name:'max value',marker: {size:10}},
			{x:minmarkersx,y:minmarkersy,type:'markers',name:'min value',marker: {size:10}}
	    ],{
	        width:(id=='tickerchart')?400:660,
	        height:400,
	        xaxis:{title:'Time'},
	        yaxis:{title:'Stocks value'},
	        shapes: {layer:'above'},
			title:$scope.tickernames[metadata["2. Symbol"]]
	    });
	    Plotly.newPlot('volumechart',[
            {
				x:x,
				y:volume,
				name:'volume',
				type:'bar'
            },
	    ],{
	        width:660,
	        height:400,
	        xaxis:{
	            title:'Time'
	        },
	        yaxis:{
	            title:'Stocks value'
	        },
	        shapes: {
	            layer:'above'
	        }
	    });
	};
	*/

	$scope.drawchart=function(data) {
	    data=data.dataset;
	    var x=[],y=[],ox=[],open=[],high=[],low=[],close=[],volume=[];
	    for(var i=0;i<data.data.length;i++) {
	        x.push(new Date(data.data[i][0]));
	        open.push(data.data[i][1]);
	        high.push(data.data[i][2]);
	        low.push(data.data[i][3]);
	        close.push(data.data[i][5]);
	        volume.push(data.data[i][6]);
	    }
	    console.log(x,y);
		var maxmarkersx=[],maxmarkersy=[];
		var minmarkersx=[],minmarkersy=[];
		var max=0,ind=0,min=open[0],indm=0;
		/*
		open.forEach(function(a,b) {
			if(max<a) {
				max=a;
				ind=b;
			}
			if(min>a) {
				min=a;
				indm=b;
			}
		});
		maxmarkersx.push(x[ind]);
		maxmarkersy.push(max);
		minmarkersx.push(x[indm]);
		minmarkersy.push(min);
		*/
		high.forEach(function(a,b) {
			if(max<=a) {
				max=a;
				ind=b;
			}
		});
		maxmarkersx.push(x[ind]);
		maxmarkersy.push(max);
		low.forEach(function(a,b) {
			if(min>a) {
				min=a;
				indm=b;
			}
		});
		minmarkersx.push(x[indm]);
		minmarkersy.push(min);
		/*
		var max=0,ind=0,min=close[0],indm=0;
		close.forEach(function(a,b) {
			if(max<a) {
				max=a;
				ind=b;
			}
			if(min>a) {
				min=a;
				indm=b;
			}
		});
		maxmarkersx.push(x[ind]);
		maxmarkersy.push(max);
		minmarkersx.push(x[indm]);
		minmarkersy.push(min);
		console.log(maxmarkersx,maxmarkersy,minmarkersx,minmarkersy);
		*/
		/*
		document.getElementById('chart').innerHTML='';
		document.getElementById('volumechart').innerHTML='';
		*/
	    Plotly.newPlot('chart',[
			{type:'scatter',x:x,y:open,name:'open',mode:'lines',visible:'legendonly'},
			{x:x,y:high,name:'high'},
            {x:x,y:low,name:'low'},
            {x:x,y:close,name:'close',visible:'legendonly'},
			{x:maxmarkersx,y:maxmarkersy,type:'scatter',mode:'markers',name:'max value',marker: {size:10}},
			{x:minmarkersx,y:minmarkersy,type:'scatter',mode:'markers',name:'min value',marker: {size:10}}
	    ],{
	        width:660,
	        height:400,
	        xaxis:{title:'Time'},
	        yaxis:{title:'Stocks value'},
	        shapes: {layer:'above'},
			title:$scope.tickernames[data.dataset_code]
	    },{
			displaylogo:false
		});
	    Plotly.newPlot('volumechart',[
            {
                x:x,
                y:volume,
                name:'volume',
				type:'bar'
            },
	    ],{
	        width:660,
	        height:400,
	        xaxis:{
	            title:'Time'
	        },
	        yaxis:{
	            title:'Stocks value'
	        },
	        shapes: {
	            layer:'above'
	        }
	    },{
			displaylogo:false
		});
	};
}]);
function hidesplash() {
	document.getElementById("splashscreen").style='display:none';
}