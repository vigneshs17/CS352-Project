var CryptoJS = require("crypto-js");
const prompt = require('prompt-sync')();
var s = 3; // synchronisation parameter

// hmac-result is a 20-byte string returned by the HMAC-SHA-1 algorithm
var digit = 6;
var queue = [];
var counter = "0";

function generateOTP() {
    var key="";
    var charSet="0123456789abcdef";
    for(var i=0;i<32;i++) {
        key+=charSet.charAt(Math.floor(Math.random()*charSet.length));
    }
    var hmac_result=CryptoJS.HmacSHA1(key, counter).toString();
    counter = (parseInt(counter, 10) + 1).toString();
    return hotp(hmac_result, digit);
}

function hotp(hmac_result, digit) {

    function pad_with_zeroes(number, length) {
        var my_string = '' + number;
        while (my_string.length < length) {
            my_string = '0' + my_string;
        }
        return my_string;
    }
    
    function hexStringToByte(str) {
        if (!str) {
            return new Uint8Array();
        }
    
        var a = [];
        for (var i = 0, len = str.length; i < len; i+=2) {
            a.push(parseInt(str.substr(i,2),16));
        }
    
        return new Uint8Array(a);
    }

    function dynamicTruncation(s) {
        var offSet = s[19] & 0xF;
        var P = (s[offSet] & 0x7f) << 24 | (s[offSet + 1] & 0xff) << 16 | (s[offSet + 2] & 0xff) << 8 | (s[offSet + 3] & 0xff);
        var result = P&0x7FFFFFFF
        return result;
    }    

    var byteArray = hexStringToByte(hmac_result);
    var sBits = dynamicTruncation(byteArray);
    var hotpValue = sBits%(Math.pow(10, digit));
    var hotpString = pad_with_zeroes(hotpValue, digit);
    hotpValue=parseInt(hotpString, 10);
    return hotpValue;
}

function validateOTP() {
    var enteredOTP = prompt('Enter OTP: ');
    
    var found=false;
    enteredOTP = parseInt(enteredOTP, 10);
    queue.forEach(function(hotpValue) {
        console.log(hotpValue);
        if(hotpValue===enteredOTP)
            found=true;
    });

    return found;
}
hotpValue = generateOTP();
console.log(hotpValue);
if(queue.length>2)
    queue.shift();
queue.push(hotpValue);
verified = validateOTP();
console.log(verified);



