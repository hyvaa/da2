//
// doo.js 
//
// connect doobune v6.0 (MSDE2000) via Unix ODBC-freeTDS
//





var isConnected = false;

var dooDB;
var tool = require('./tool.js');
var bigint = require('bigint');



exports.connect = function() {

	dooDB = require('odbc')();
	var isWaitingConnection = true;
	
	var cn ="DRIVER={FreeTDS};SERVERNAME=TS;UID=sa;PWD=osstem;DATABASE=Hanaro";

	setTimeout( function() {
		if (isWaitingConnection) {
			isWaitingConnection= false;
			isConnected=false;
			console.log('DB connection timeout');
		
		} else {} //do nothing
	}, 5000);

	console.log('trying to connect to Doo DB');
	
	dooDB.open(cn, function (err) {
		if (err)  {
			isConnected=false; 
			console.log('DB connection failed! - '+err);
		} else { 
			isConnected=true;
			console.log('DB connected now');
		}
		
		isWaitingConnection=false;
		
		
	});		   	
	
	
};


function query(qstr, param, callback) {
	
	var result;
	var isWaiting = true;
		
	if (isConnected == false) {
		connect();
		return {};
	}
	
			
	dooDB.query(qstr, param, callback);
		
};
exports.query = query;



function querySync(qstr, param) {
	
	if (isConnected == false) {
		connect();
		return [];
	}
	
	try {
		result = dooDB.querySync(qstr, param);
	} catch (e) {
		console.log('error on querySync');
		isConnected = false;
		
		return [];
	}
	return (result);
};
exports.querySync = querySync;
	
		

exports.close = function() {
	if (isConnected) dooDB.close(function(err) {
		console.log('DB disconnected');
	});
};
	
exports.isConnected = function() { return isConnected; };



exports.getDailyDataMine = function(request, response, date){
	
	var res1;
	var res=[];
	var now = new Date();
	var card,cash,insu,nonInsu;
	var toothNum;
	
	var async = require('async');
	
	
	if ( isNaN (date.getTime())) { // invalid date n time
		response.send({error:'invalid date'});
		return;
	};
	
	var date8=tool.toEightDigitString(date);
	
	
	async.parallel ([
		function(callback) {
			query('select * from tb_account_book where TREATment_DATe='+ date8, null, callback);  // 1. 특정날짜의 결제정보가 있는 사람을 찾는다.
		}

	],
	//function (err, rows, moreResultSets) {
	function( err, results) {
		
		//console.log( results[0][0]);
			
		rows= results[0][0];
		res1=rows;
		if (err) res1=[];
		
		for (var i=0; i<res1.length; i++) {
			res.push(manupulateAccountRecord(res1[i], date8));
		};

		var res2 = dooGetApp(date); //약속 리스트 
		if (Object.prototype.toString.call(res2) != '[object Array]') res2=[];
		// now check unpaid list.. 결제정보 있는사람은 약속리스트에서 제거하기로 체크, 약속에만 있는 사람 올릴 예정 
		for (var i in res2) {
			res2[i].toDelete = false;
			for (var j in res) {			
				if (res2[i].chartNo == res[j].chartNo) {
					res2[i].toDelete = true;
				}
			}			
		};
		for (var j in res2) {
			if  (res2[j].toDelete==true) {}
			else {			
				var item={};
				item.chartNo = res2[j].chartNo;
				if (item.chartNo.slice(0,4)=='temp') continue;
				item.tx = res2[j].tx;
				item.dateTime = res2[j].dateTime;
				item.cashInsu = item.cashNonInsu = item.cardInsu = item.cardNonInsu = item.transfer=0;
				item.toothNo = '-';
				
				var nameRes = querySync("select * from tb_patient_info where PNT_ID='"+item.chartNo+"'");
				
				if (nameRes.length!=0) {
					item.name = nameRes[0].PNT_NAME;
					item.ageGender = tool.ageGender(now, nameRes[0].BIRTH_DAT, nameRes[0].RESI_NO);
				}
			
			res.push(item);
			}
		}
		res.sort( function(a,b){ return (a.dateTime.getTime() - b.dateTime.getTime());} );
		
		response.send(res);
		
	});

}
	

function manupulateAccountRecord(src,date8) {
	var item={};
	var dts = src.ACCOUNT_BOOK_DATE;  // 같은 날짜이지만 시분을 추출하기 위함. 뒤에서 시간순으로 소팅할 것임. //5.0에서 업그레이드한 경우 예전값은 날짜는 맞는데 시간이 이상하게 됨.
	var	dateTime = new Date(  parseInt(dts.substr(0,4)), parseInt(dts.substr(4,2))-1, parseInt(dts.substr(6,2)),     //month numbering is zero-based
								parseInt(dts.substr(8,2)), parseInt(dts.substr(10,2)),parseInt(dts.substr(12,2)),
								0
							);
	
	
	item.dateTime = dateTime;  
	item.chartNo = src.PATIENT_ID;
	item.tx = src.TX_NAME;
	
	var ptRecord = querySync("select * from tb_patient_info where PNT_ID='"+item.chartNo+"'")[0];  // 이름하고 나이등을 빼내야지!
	
	item.name = ptRecord.PNT_NAME;
	item.ageGender = tool.ageGender(new Date(), ptRecord.BIRTH_DAT, ptRecord.RESI_NO);
	
	// 
	item.cardInsu = src.INSURANCE_FEE;
	item.cardNonInsu = src.NON_INSURANCE_FEE;
	item.cashInsu = item.cashNonInsu = 0;
	item.transfer=0;  
	
	// 치아번호 찾기. 청구 항목에 1개 이상으로 있음 
	var tooth = querySync("select TOOTH from tb_remedy where PNT_ID='"+item.chartNo+"'"+ " and TREATment_DATe="+ date8 );//////////////////////////////////////////////////////////////////////////////////////////////////////////1;
	
	tooth10=tooth20=tooth30=tooth40=0; 		tooth50=tooth60=tooth70=tooth80=0; 	full=false;
		
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
		// if full, set flag
		if (	((tooth1==0xff)||(tooth1==0x7f)) &&
				((tooth2==0xff)||(tooth2==0x7f)) &&
				((tooth3==0xff)||(tooth3==0x7f)) &&
				((tooth4==0xff)||(tooth4==0x7f)) ) full= true;
					
		if (	(tooth5==0x1f) &&
				(tooth6==0x1f) &&
				(tooth7==0x1f) &&
				(tooth8==0x1f) ) full= true;
					
		// all means nothing
		tooth1= ((tooth1==0xff)||(tooth1==0x7f))?0:tooth1;
		tooth2= ((tooth2==0xff)||(tooth2==0x7f))?0:tooth2;
		tooth3= ((tooth3==0xff)||(tooth3==0x7f))?0:tooth3;
		tooth4= ((tooth4==0xff)||(tooth4==0x7f))?0:tooth4;
		tooth5= (tooth5==0x1f)?0:tooth5;
		tooth6= (tooth6==0x1f)?0:tooth6;
		tooth7= (tooth7==0x1f)?0:tooth7;
		tooth8= (tooth8==0x1f)?0:tooth8;
			
		tooth10 |=  tooth1; 	tooth20 |=  tooth2;	tooth30 |=  tooth3;	tooth40 |=  tooth4;
		tooth50 |=  tooth5; 	tooth60 |=  tooth6;	tooth70 |=  tooth7;	tooth80 |=  tooth8;
			
	}
	item.toothNo = tool.addComma2( ((full)?('전악'):'') ,	tool.addComma8(	tool.tooth2str(tooth10,10),
									tool.tooth2str(tooth20,20),
									tool.tooth2str(tooth30,30),
									tool.tooth2str(tooth40,40),
									tool.tooth2str(tooth50,50),
									tool.tooth2str(tooth60,60),
									tool.tooth2str(tooth70,70),
									tool.tooth2str(tooth80,80)));
		
	item.toothNoPermanent= toothP.toNumber();
	item.toothNoDeciduous= toothD.toNumber();
	
	return item;
	
	
}

	
	
function dooGetApp(date) {
	var res1;
	var res=[];
	
	
	
	var dayBegin = date.getTime()/1000;
	var dayEnd = dayBegin + 60*60*24;
	
	
	
	
	res1 = querySync('select * from tb_reservation where BTIME BETWEEN '+dayBegin+' AND '+dayEnd);
	
	for (var i=0; i<res1.length; i++) {
		var item={};
		var time;
		item.chartNo = res1[i].PNT_ID;
		time = new Date(res1[i].BTIME*1000);
		
		/*
		var hh,mm,ss;
		hh=('0'+time.getHours()).slice(-2);
		mm=('0'+time.getMinutes()).slice(-2);
		ss=('0'+time.getSeconds()).slice(-2);
		
		item.dateTime = toEightDigitString(time)+ hh+mm+ss;
		*/
		item.dateTime = time;
		
		item.tx = res1[i].CONTENT;
		
		
		res.push(item);
	}
	return res;
}
	
	


//function dooGetDataByName(request, response, name) {
exports.getDataByName = function(request, response, name) {
	
	var res = querySync("select * from tb_patient_info where PNT_NAME= ?",[name]);
	
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

//function dooGetDataByChartNo(request, response, chartNo) {
exports.getDataByChartNo = function(request, response, chartNo) {
	
	var res = querySync("select * from tb_patient_info where PNT_ID='"+chartNo+"'");
	
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



