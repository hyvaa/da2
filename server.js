//
// DAA (Dental Affair Assist) 0.2.0
// server.js for node.js
// programming by hyvaasoft@gmail.com
// March 2014
//
//favicon is from http://www.featurepics.com/online/Cartoon-Tooth-1994919.aspx
// Royalty free license
//
// 





var http = require('http');
var express = require('express');
var fs = require('fs');
var app = express();


var doo = require('./doo.js');
var tool = require('./tool.js');

var myDB = {
	isConnected: false,	
	name: "두번에서버",
	//connect: dooConnect,
	//close: dooClose,
	//getDailyDataMine: doo.getDailyDataMine,
	//getDataByName: dooGetDataByName,
	//getDataByChartNo: doo.getDataByChartNo,
}

var mDB = {
	isConnected: false,
	name: "몽고디비",
	connect: mConnect,
	close: mClose,
}
	

doo.connect();
mDB.connect();


function mConnect() {
	mDB.db = require('mongojs').connect('daa',['income', 'expense', 'dailyCash', 'dailyMemo']);
	mDB.isConnected = true; //// ????
	
}

function mClose() {
}

setInterval( function() {
	
	if (doo.isConnected()===false) {
		doo.connect();
	}
	
	
},10000); //every 10 sec

	

app.use(express.favicon(__dirname+'/public/3127.ico'));  //////////////////////////////////////////
app.use(express.static('public'));

app.use(express.bodyParser());
app.use(app.router);

app.get('/update', function (request, response) {
	var exec = require('child_process').exec;
	exec("git pull origin master && git fetch origin && git reset --hard origin/master" , function(error, stdout, stderr) {
		console.log("== DA2 Toople Server Updated ==");
		response.send(' <h2> 업데이트 명령이 실행되었습니다. 인터넷을 통해 자동으로 업데이트 됩니다.</h2><h2>다음 명령어를 치면 수동으로 업데이트를 실행합니다. </h2><h2>"sudo git pull origin master && git fetch origin && git reset --hard origin/master "</h2><h2>잠시후 Reload 해주세요. </h2>');
	}); 
	
}); 

app.get('/', function (request, response) {
	fs.readFile('./html/index.html', function (error, data) {
		response.end(data);
	})
}); 

app.get('/status', function (request, response) {
	response.send( {
		snatchServerConnected : myDB.isConnected,
		snatchServerName : myDB.name,
		//snatchServerIP : "192.168.0.100",
		innerServerConnected: mDB.isConnected,
		innerServerName: mDB.name
	});
});


app.get('/dailybook', function (request, response) {
	fs.readFile('./html/dailybook.html', function (error, data) {
		response.end(data);
	}); 
});


/*
app.get('/api/ptlist/:date' function (request, response) { //api for today's patients list
	//picking data from 1. accept list 2. reservation list 3. pay list
	var date = request.param('date');
	
	
}

*/
	




app.get('/api/dailyincome/:date', function (request, response) { //load
	var date=request.param('date');
	mDB.db.income.find({'dateStr8':date}, function (err,docs) {
		console.log(docs);
		response.send(docs);
	});
});
app.delete('/api/dailyincome/:date', function (request, response) { //delete
	var date=request.param('date');
	mDB.db.income.remove({'dateStr8':date});  // clear first
	response.send({});
});  
app.post('/api/dailyincome/:date', function (request, response) {	//save 1  //deprecated 
	
	var item = {};
	
	item.dateStr8 = request.param('date');
	
	if (request.body.hasOwnProperty('seq')) item.seq = parseInt(request.body['seq']);
	
	if (request.body.hasOwnProperty('chartNo')) item.chartNo = (request.body['chartNo']);
	if (request.body.hasOwnProperty('tx')) item.tx = (request.body['tx']);
	if (request.body.hasOwnProperty('name')) item.name = (request.body['name']);
	
	if (request.body.hasOwnProperty('ageGender')) item.ageGender = (request.body['ageGender']);
	if (request.body.hasOwnProperty('toothNo')) item.toothNo = (request.body['toothNo']);
	
	if (request.body.hasOwnProperty('cashInsu')) item.cashInsu = parseInt(request.body['cashInsu']);
	if (request.body.hasOwnProperty('cashNonInsu')) item.cashNonInsu = parseInt(request.body['cashNonInsu']);
	if (request.body.hasOwnProperty('cardInsu')) item.cardInsu = parseInt(request.body['cardInsu']);
	if (request.body.hasOwnProperty('cardNonInsu')) item.cardNonInsu = parseInt(request.body['cardNonInsu']);
	if (request.body.hasOwnProperty('transfer')) item.transfer = parseInt(request.body['transfer']);
	
	if (request.body.hasOwnProperty('toothNoPermanent')) item.toothNoPermanent = parseInt(request.body['toothNoPermanent']);
	if (request.body.hasOwnProperty('toothNoDeciduous')) item.toothNoDeciduous = parseInt(request.body['toothNoDeciduous']);
	
	
	mDB.db.income.save(item);
	
	response.send({});
	
}); 
app.post('/api/dailyincomeset/:date', function (request, response) {	//save1 array
	
	//console.log(request.body['array']);
	var a = request.body['array'];

	for (var i in a) {		
		//console.log(i+'------------');
		//console.log(a[i]);
		
		var item = {};
		item.dateStr8 = request.param('date');
		if (a[i].hasOwnProperty('seq')) item.seq = parseInt(a[i]['seq']);
	
		if (a[i].hasOwnProperty('chartNo')) item.chartNo = (a[i]['chartNo']);
		if (a[i].hasOwnProperty('tx')) item.tx = (a[i]['tx']);
		if (a[i].hasOwnProperty('name')) item.name = (a[i]['name']);
		
		if (a[i].hasOwnProperty('ageGender')) item.ageGender = (a[i]['ageGender']);
		if (a[i].hasOwnProperty('toothNo')) item.toothNo = (a[i]['toothNo']);
	
		if (a[i].hasOwnProperty('cashInsu')) item.cashInsu = parseInt(a[i]['cashInsu']);
		if (a[i].hasOwnProperty('cashNonInsu')) item.cashNonInsu = parseInt(a[i]['cashNonInsu']);
		if (a[i].hasOwnProperty('cardInsu')) item.cardInsu = parseInt(a[i]['cardInsu']);
		if (a[i].hasOwnProperty('cardNonInsu')) item.cardNonInsu = parseInt(a[i]['cardNonInsu']);
		if (a[i].hasOwnProperty('transfer')) item.transfer = parseInt(a[i]['transfer']);
	
		if (a[i].hasOwnProperty('toothNoPermanent')) item.toothNoPermanent = parseInt(a[i]['toothNoPermanent']);
		if (a[i].hasOwnProperty('toothNoDeciduous')) item.toothNoDeciduous = parseInt(a[i]['toothNoDeciduous']);
		
		//console.log(item);
		
		mDB.db.income.save(item);
		
	};
	response.send({});

});



app.get('/api/dailyexpense/:date', function (request, response) { 
	var date=request.param('date');
	mDB.db.expense.find({'dateStr8':date}, function (err,docs) {
		console.log(docs);
		response.send(docs);
	});
});
app.delete('/api/dailyexpense/:date', function (request, response) {
	var date=request.param('date');
	mDB.db.expense.remove({'dateStr8':date});  // clear first
	response.send({});
});
app.post('/api/dailyexpense/:date', function (request, response) {  //save2 //deprecated
	
	var item = {};
	var date = tool.toDate(request.param('date'));	
	
	item.dateStr8 = request.param('date');
		
		
	if (request.body.hasOwnProperty('seq')) item.seq = parseInt(request.body['seq']);
	if (request.body.hasOwnProperty('details')) item.details = (request.body['details']);
	if (request.body.hasOwnProperty('cash')) item.cash = parseInt(request.body['cash']);
	
	mDB.db.expense.save(item);
	
	response.send({});
	
});
app.post('/api/dailyexpenseset/:date', function (request, response) {  //save2 array
	var a = request.body['array'];
	
	for(var i in a) {
		var item = {};
	//var date = tool.toDate(request.param('date'));	
		item.dateStr8 = request.param('date');
		if (a[i].hasOwnProperty('seq')) item.seq = parseInt(a[i]['seq']);
		if (a[i].hasOwnProperty('details')) item.details = (a[i]['details']);
		if (a[i].hasOwnProperty('cash')) item.cash = parseInt(a[i]['cash']);
	
		mDB.db.expense.save(item);
	};
	
	response.send({});
	
});



app.get('/api/dailycash/:date', function (request, response) { 
	var date=request.param('date');
	mDB.db.dailyCash.findOne({'dateStr8':date}, function (err,docs) {
		console.log(docs);
		response.send(docs);
	});
});
app.post('/api/dailycash/:date', function (request, response) { 
	
	var item = {};
	var date = request.param('date');
	item.dateStr8 = date;
		
	if (request.body.hasOwnProperty('cashBegin')) item.cashBegin = parseInt(request.body['cashBegin']);
	if (request.body.hasOwnProperty('cashIncomeTotal')) item.cashIncomeTotal = parseInt(request.body['cashIncomeTotal']);
	if (request.body.hasOwnProperty('cashExpenseTotal')) item.cashExpenseTotal = parseInt(request.body['cashExpenseTotal']);
	if (request.body.hasOwnProperty('cashBossTaken')) item.cashBossTaken = parseInt(request.body['cashBossTaken']);
	if (request.body.hasOwnProperty('cashBossBTaken')) item.cashBossBTaken = parseInt(request.body['cashBossBTaken']);
	if (request.body.hasOwnProperty('tip')) item.tip = parseInt(request.body['tip']);
	if (request.body.hasOwnProperty('cashEnd')) item.cashEnd = parseInt(request.body['cashEnd']);
	
	
	mDB.db.dailyCash.remove({'dateStr8':date}); 
	mDB.db.dailyCash.save(item);
	
	response.send({});
});





app.get('/api/dailymemo/:date', function (request, response) { //load
	var date=request.param('date');
	mDB.db.dailyMemo.findOne({'dateStr8':date}, function (err,docs) {
		response.send(docs);
	});
});
app.post('/api/dailymemo/:date', function (request, response) { 
	
	var item = {};
	var date = request.param('date');
	
	item.dateStr8 = date;
	if (request.body.hasOwnProperty('memo')) item.memo = request.body['memo'];
	
	mDB.db.dailyMemo.remove({'dateStr8':date}); 
	mDB.db.dailyMemo.save(item);
	
	response.send({});
});


app.get('/api/lastcash/:date', function (request, response) {
	var date8=request.param('date');
	var date = tool.toDate(date8);
	var item = null;
	
	
	mDB.db.dailyCash.find ({'dateStr8':  { $lt: date8}}).sort({'dateStr8':-1} , function (err,docs) {
		
		console.log(docs[0]);
		
		response.send( (docs.length ==0)? {cashEnd:NaN} : docs[0]);
		
	});
	
});




app.get('/dailydatamine/:date', function (request, response) {
	var dateStr8 = request.param('date');	
	var d = tool.toDate(dateStr8);
	doo.getDailyDataMine(request, response, d);	
});

app.get('/datamine/name/:name', function (request, response) {
	var name = request.param('name');
	doo.getDataByName(request, response, name);
});

app.get('/datamine/chart/:chartno', function (request, response) {
	var chartNo = request.param('chartno');
	doo.getDataByChartNo(request, response, chartNo);
});

app.get('/api/raw/app/:date', function (request, response) {  //get pt that have appointment that day
	var dateStr8 = request.param('date');	
	var d = tool.toDate(dateStr8);

	response.send(dooGetApp(d));
	
});


http.createServer(app).listen(52273, function () {
	console.log('server running...');
});
 
 








