//
// tool.js 
//
// some miscellaneous functions
//

exports.toEightDigitString = function(date) {
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
exports.toDate = toDate;

exports.ageGender = function(now, birth8digit, ssn) {	
	var interval = (now.getTime() - (toDate(birth8digit)).getTime());
	var genderDiv = (ssn).substr(6,1);
	var gender = (genderDiv=='1' || genderDiv=='3')?'M':(genderDiv=='2' || genderDiv=='4')?'F':'?';
	
	return '' + Math.floor(interval/ (1000*60*60*24*365)) + gender;
}

function tooth2str(tn, toAdd) { //tooth number(byte) to string; 
	var res ='';
	var bit = [];
	var i,j,count;
	
	
	bit[0] = tn & 0x01;
	bit[1] = tn & 0x02;
	bit[2] = tn & 0x04;
	bit[3] = tn & 0x08;
	bit[4] = tn & 0x10;
	bit[5] = tn & 0x20;
	bit[6] = tn & 0x40;
	bit[7] = tn & 0x80;
	
	for (i=0; i<8; i++)  {
		count=0;
		for (j=i+1; j<8; j++) {
			count += ((bit[j])?1:0);
		}
		if (bit[i]) {
			res += (toAdd+i+1);
			res += (count)?',':'';
		}
	}
	
	return res;
};
exports.tooth2str = tooth2str;

function addComma2(str1, str2) {
	
	if (str1=='') {
		if (str2=='') return '';
		else return str2;
	} else {
		if (str2=='') return str1;
		else return (str1+','+str2);
	}
}
exports.addComma2 = addComma2;

function addComma8(s1,s2,s3,s4,s5,s6,s7,s8) {
	var res;
	
	res = addComma2(s1,s2);
	res = addComma2(res,s3);
	res = addComma2(res,s4);
	res = addComma2(res,s5);
	res = addComma2(res,s6);
	res = addComma2(res,s7);
	res = addComma2(res,s8);
	
	return res;
}	
exports.addComma8 = addComma8;
