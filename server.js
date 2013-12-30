//
// DAA (Dental Affair Assist) 0.0.1
// server.js for node.js
// programming by hyvaasoft@gmail.com
// December 2013
//
//favicon is from http://www.featurepics.com/online/Cartoon-Tooth-1994919.aspx
// Royalty free license
//
//

var http = require('http');
var express = require('express');
var fs = require('fs');
var app = express();
var bigint = require('bigint');

var myDB = {
	isConnected: false,	
	name: "두번에서버",
	connect: dooConnect,
	close: dooClose,
	getDailyDataMine: dooGetDailyDataMine,
	getDataByName: dooGetDataByName,
	getDataByChartNo: dooGetDataByChartNo,
}

var mDB = {
	isConnected: false,
	name: "몽고디비",
	connect: mConnect,
	close: mClose,
}
	

myDB.connect();
mDB.connect();


function mConnect() {
	mDB.db = require('mongojs').connect('daa',['income', 'expense', 'dailyCash', 'dailyMemo']);
	mDB.isConnected = true; //// ????
	
}

function mClose() {
}

setInterval( function() {
	if (myDB.isConnected==false) {
		myDB.connect();
	}
	
	
},10000); //every 10 sec

	

app.use(express.favicon(__dirname+'/public/3127.ico'));  //////////////////////////////////////////
app.use(express.static('public'));

app.use(express.bodyParser());
app.use(app.router);

app.get('/update', function (request, response) {
	var exec = require('child_process').exec;
	exec("git clone git://github.com/hyvaa/da2.git" , function(error, stdout, stderr) {
		response.send({});
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








app.get('/api/dailyincome/:date', function (request, response) { //load
	var date=request.param('date');
	mDB.db.income.find({'dateStr8':date}, function (err,docs) {
		//console.log(docs);
		response.send(docs);
	});
});
app.delete('/api/dailyincome/:date', function (request, response) { //delete
	var date=request.param('date');
	mDB.db.income.remove({'dateStr8':date});  // clear first
	response.send({});
});  
app.post('/api/dailyincome/:date', function (request, response) {	//save
	//var pass = false;
	var item = {};
	//var date = toDate(request.param('date'));	
	
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



app.get('/api/dailyexpense/:date', function (request, response) { 
	var date=request.param('date');
	mDB.db.expense.find({'dateStr8':date}, function (err,docs) {
		//console.log(docs);
		response.send(docs);
	});
});
app.delete('/api/dailyexpense/:date', function (request, response) {
	var date=request.param('date');
	mDB.db.expense.remove({'dateStr8':date});  // clear first
	response.send({});
});
app.post('/api/dailyexpense/:date', function (request, response) {
	
	var item = {};
	var date = toDate(request.param('date'));	
	
	item.dateStr8 = request.param('date');
		
		
	if (request.body.hasOwnProperty('seq')) item.seq = parseInt(request.body['seq']);
	if (request.body.hasOwnProperty('details')) item.details = (request.body['details']);
	if (request.body.hasOwnProperty('cash')) item.cash = parseInt(request.body['cash']);
	
	
	//console.log(item);
	
	mDB.db.expense.save(item);
	
	response.send({});
	
});



app.get('/api/dailycash/:date', function (request, response) { 
	var date=request.param('date');
	mDB.db.dailyCash.findOne({'dateStr8':date}, function (err,docs) {
		//console.log(docs);
		response.send(docs);
	});
});
app.post('/api/dailycash/:date', function (request, response) { 
	
	//var date = toDate(request.param('date'));	
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
	//console.log(request.body);
	//console.log(item);
	
	mDB.db.dailyMemo.remove({'dateStr8':date}); 
	mDB.db.dailyMemo.save(item);
	
	response.send({});
});


app.get('/api/lastcash/:date', function (request, response) {
	var date8=request.param('date');
	var date = toDate(date8);
	var item = null;
	
	
	mDB.db.dailyCash.find ({'dateStr8':  { $lt: date8}}).limit(1).sort({'dateStr8':-1} , function (err,docs) {
		//console.log(docs);
		//console.log(docs[0]);
		//console.log('er:'+err);
		
		
		response.send( (docs.length ==0)? {cashEnd:NaN} : docs[0]);
		
	});
		
	
	
});
	
	
	
	





app.get('/dailydatamine/:date', function (request, response) {
	var dateStr8 = request.param('date');	
	var d = toDate(dateStr8);
	myDB.getDailyDataMine(request, response, d);	
});

app.get('/datamine/name/:name', function (request, response) {
	var name = request.param('name');
	myDB.getDataByName(request, response, name);
});

app.get('/datamine/chart/:chartno', function (request, response) {
	var chartNo = request.param('chartno');
	myDB.getDataByChartNo(request, response, chartNo);
});










http.createServer(app).listen(52273, function () {
	console.log('server running...');
});
 
 
///////////////////////////////////////////////////////////////////////
//FUNCTIONS

function toEightDigitString(date) {
	var tempDate = new Date(date.getTime() + (9*60*60*1000));  //because temp-string is UTC value...
	var temp = tempDate.toISOString();
	
	//console.log('1 : '+temp);
	
	var result = temp.substr(0,4) + temp.substr(5,2) + temp.substr(8,2);
	
	
	//console.log('2 : '+ result);
	return (result);
}	

function toDate(str8) {	
	var dateString = str8.substr(0,4)+'-'+str8.substr(4,2)+'-'+str8.substr(6,2);	
	
	return new Date(dateString);  
}

function ageGender(now, birth8digit, ssn) {	
	var interval = (now.getTime() - (toDate(birth8digit)).getTime());
	var genderDiv = (ssn).substr(6,1);
	var gender = (genderDiv=='1' || genderDiv=='3')?'M':(genderDiv=='2' || genderDiv=='4')?'F':'?';
	
	return '' + Math.floor(interval/ (1000*60*60*24*365)) + gender;
}


/////////////////////////////////////////////////////////////////////////
//DOO SERIES

function dooConnect(){

	myDB.dooDB = require('odbc')();
	var cn ="DRIVER={FreeTDS};SERVERNAME=TS;UID=sa;PWD=osstem;DATABASE=H2";

	myDB.dooDB.open(cn, function (err) {
		if (err) { myDB.isConnected=false; return console.log(err);};
		myDB.isConnected=true;
		console.log('DB connected now');
	});		   	
}

function dooQuery(qstr, param) {
	var result;
	if (myDB.isConnected == false) {
		dooConnect();
	}
	
	try {
		result = myDB.dooDB.querySync(qstr, param);
	} catch (err) {
		myDB.isConnected = false;
	};
	return result;
}

function dooClose() {
}
	

function dooGetDailyDataMine(request, response, date){
	
	var res1;
	var res=[];
	var now = new Date();
	var card,cash,insu,nonInsu;
	var toothNum;
	
	if ( isNaN (date.getTime())) { // invalid date n time
		response.send({error:'invalid date'});
		return;
	};
	
	
	res1 = dooQuery('select * from tb_ha020 where TREAT_DAT='+ toEightDigitString(date));
		
	if (Object.prototype.toString.call(res1) != '[object Array]') res1=[];
	
	for (var i=0; i<res1.length; i++) {
		var item = {};
		
		dts = res1[i].PAY_DATETIME;
		dateTime = new Date(  parseInt(dts.substr(0,4)), parseInt(dts.substr(4,2))-1, parseInt(dts.substr(6,2)),     //month numbering is zero-based
								parseInt(dts.substr(8,2)), parseInt(dts.substr(10,2)),parseInt(dts.substr(12,2)),
								0
							);
		item.dateTime = dateTime;
		
		
		
		
		item.chartNo = res1[i].PNT_ID;
		
		item.tx = res1[i].TX_NAME;
		
		ptRecord = myDB.dooDB.querySync("select * from tb_hp010 where PNT_ID='"+item.chartNo+"'")[0];
		
		item.name = ptRecord.PNT_NAME;
		item.ageGender = ageGender(now, ptRecord.BIRTH_DAT, ptRecord.RESI_NO);
		
		
		
		
		// cash...calc//////////////////////////////////////////////////
		card=cash=insu=nonInsu=0;				
				
		card = parseInt(res1[i].CARD); if  (isNaN(card)) card=0;
		cash = parseInt(res1[i].CASH); if (isNaN(cash)) cash=0;
		niof = parseInt(res1[i].NON_INSURANCE_OTHER_FEE); if (isNaN(niof)) niof=0;
		insucost = parseInt(res1[i].PNT_INSURCOST); if (isNaN(insucost)) insucost=0;
		noncost= parseInt(res1[i].PNT_NONCOST); if (isNaN(noncost)) noncost=0;		
		nonInsu = parseInt(res1[i].PNT_NONCOST); if (isNaN(nonInsu)) nonInsu=0;
		insu = insucost - noncost - niof;
		
		//NOW guess balace card and cash...
		// card+cash == insu + noninsu
		if ((card+cash)<(insu+nonInsu)) {
			omit = insu+nonInsu - card-cash;
			if (card===0) cash+=omit; else card+=omit
			//console.log('item:'+i+'//omit'+omit);
		}
		//NOw balance into 4 values...
		cashInsu=cashNonInsu=cardInsu=cardNonInsu=0;
		if (cash===0) { //all card
			if (insu===0) cardNonInsu=card;
			else {cardInsu=insu; cardNonInsu=card-insu;};
		} else if (card===0) { //all cash
			if (insu==0) cardNonInsu=cash;
			else { cashInsu=insu; cashNonInsu=cash-insu;}
		
		} else { // cash and card..  difficult -.-;
			if (insu==0) cardNonInsu=cash+card;
			else { if (insu>cash) { cardInsu=insu; cardNonInsu=card-insu+cash; }
					else if (cash==insu) { cashInsu=insu; cardNonInsu=card; }
					else if (insu <cash) { cashInsu=insu; cashNonInsu=nonInsu-insu; cardNonInsu=card-insu;}
				}
		};	
		
		item.cashInsu = cashInsu;
		item.cashNonInsu = cashNonInsu;
		item.cardInsu = cardInsu;
		item.cardNonInsu = cardNonInsu;
				
		item.transfer=0;
		//item.transferChecked=false;
		
		
		///////////////////////////////////////////////////////////////////////////////// 
		
		tooth = myDB.dooDB.querySync("select TOOTH from tb_ht020 where PNT_ID='"+item.chartNo+"'"+ " and TREAT_DAT="+ toEightDigitString(date));
		
		tooth10=tooth20=tooth30=tooth40=0;
		tooth50=tooth60=tooth70=tooth80=0;
		
		var toothP= new bigint(0);
		var toothD= new bigint(0);
		
		for (var j=0; j<tooth.length; j++) {
			v = new bigint(tooth[j].TOOTH);
			
			toothP = toothP.or(v.and(0xffffffff));
			toothD = toothD.or(v.shiftRight(32));
			
			
			
			//toothNum |= v;
			tooth1= v.and(255); v=v.shiftRight(8);
			tooth2= v.and(255); v=v.shiftRight(8);
			tooth3= v.and(255); v=v.shiftRight(8);
			tooth4= v.and(255); v=v.shiftRight(8);
			
			// dediduous teeth			
			tooth5= v.and(255); v=v.shiftRight(8);
			tooth6= v.and(255); v=v.shiftRight(8);
			tooth7= v.and(255); v=v.shiftRight(8);
			tooth8= v.and(255); 
	
			tooth10 |=  tooth1; 	tooth20 |=  tooth2;	tooth30 |=  tooth3;	tooth40 |=  tooth4;
			tooth50 |=  tooth5; 	tooth60 |=  tooth6;	tooth70 |=  tooth7;	tooth80 |=  tooth8;
			
		}
		
		
		item.toothNo=tooth10.toString(16)+"/"
					+tooth20.toString(16)+"/"
					+tooth30.toString(16)+"/"
					+tooth40.toString(16)+"//"
					+tooth50.toString(16)+"/"
					+tooth60.toString(16)+"/"
					+tooth70.toString(16)+"/"
					+tooth80.toString(16);
		item.toothNoPermanent= toothP.toNumber();
		item.toothNoDeciduous= toothD.toNumber();
			
			
		
		res.push(item);
	}
			
	// ha010 for more .. new patient..
	// ha040 for more .. appointment ..
	
	res.sort( function(a,b){ return (a.dateTime.getTime() - b.dateTime.getTime());} );
	//console.log(res);
	response.send(res);
	
	
	
}


function dooGetDataByName(request, response, name) {
	
	var res = dooQuery("select * from tb_hp010 where PNT_NAME= ?",[name]);
	
	var ret=[];
	for (i=0; i<res.length; i++) {
		var item={};
		item.chartNo = res[i].PNT_ID;
		item.name = res[i].PNT_NAME;
		item.ssn = res[i].RESI_NO;
		item.cellphone = res[i].HP_NO;
		item.address = res[i].HOME_ADDR;
		item.zipcode = res[i].HOME_ZIPCD;용
		item.email = res[i].EMAIL;
		item.birth8digit = res[i].BIRTH_DAT;
		
		
		ret.push(item);
	}
	response.send(ret);

}

function dooGetDataByChartNo(request, response, chartNo) {
	
	var res = dooQuery("select * from tb_hp010 where PNT_ID='"+chartNo+"'");
	
	var ret=[];
	for (i=0; i<res.length; i++) {
		var item={};
		item.chartNo = res[i].PNT_ID;
		item.name = res[i].PNT_NAME;
		item.ssn = res[i].RESI_NO;
		item.cellphone = res[i].HP_NO;
		item.address = res[i].HOME_ADDR;
		item.zipcode = res[i].HOME_ZIPCD;
		item.email = res[i].EMAIL;
		item.birth8digit = res[i].BIRTH_DAT;
		
		ret.push(item);
	}
	response.send(ret);

}

