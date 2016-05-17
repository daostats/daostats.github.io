function getData(url, success){
    
    if(typeof(Storage) !== undefined && localStorage.fastMode == "true"){
            console.log("Fast mode");
            url = "https://raw.githubusercontent.com/daostats/daostats.github.io/master/" + url + ".js";
            
            var updateCycle = Math.floor((new Date().getMinutes()-1)/5);
            url += "?c=" + updateCycle;
    }

    else url = url + ".js";
    
    console.log("Getting data at " + url);
    
    $.getJSON(url, success)  .done(function() {
    console.log( "second success" );
  })
  .fail(function(jqXHR, textStatus, errorThrown) {
        console.log("error " + textStatus);
        console.log("incoming Text " + jqXHR.responseText);
        success([], "error");
    })
  .always(function() {
    console.log( "complete" );
  });
    /*
    $.ajax({
  url: url,
  cache: false
})
  .done(function( str ) {
      console.log(str);
    success($.parseJSON(str));
  });*/

}

function setElemText(elem, val){
    $("#"+elem).html(val);
}

function applyData(data){
    
    console.log(data);
    $.each(data, function(key, val){
        $("#"+key+"-js").html(val);
    })
}

function dictSlice(dict, elems){
    out = {}
    for(e in elems)
    {
        out[elems[e]] = dict[elems[e]];
    }
    return out;
}

function dictToArray(dict, elems){
    out = [];
    
    for (var i = 0; i < elems.length; i++) {
        out.push(dict[elems[i]]);
    }
    return out;
}
String.format = function() {
    var s = arguments[0];
    for (var i = 0; i < arguments.length - 1; i++) {
    var reg = new RegExp("\\{" + i + "\\}", "gm");
    s = s.replace(reg, arguments[i + 1]);
    }
    return s;
    }

function formatFloat(f, e){
    if (e === undefined)
        return Math.floor(f*10000)/10000;
    else{
        m = Math.pow(10, e);
        return Math.floor(f*m)/m;
    }
} 
    
function baseToDAO(value){
    
    daos = value * (1e-16);
    
    parts = (daos).toExponential().split("e");
    m = parseFloat(parts[0]);
    e = parseFloat(parts[1]);

    if (e < -3) return String.format("{0}&times;10<sup>{1}</sup> DAO", +m.toFixed(2), e);
    else if(e < 0) return String.format("{0} DAO", +daos.toFixed(3));
    else if(e < 3) return String.format("{0} DAO", +daos.toFixed(4));
    else if(e < 6) return String.format("{0} KDAO", +(daos/1000).toFixed(3));
    else return String.format("{0} MDAO", +(daos/1000000).toFixed(3));
}

function baseToETH(value, base){
    
    if (base == "eth"){
        value = value * (1e18);
    }
    
    if (value < 1e3) return value + " Wei";
    if (value < 1e6) return formatFloat(value*(1e-3)) + " KWei";
    if (value < 1e9) return formatFloat(value*(1e-6)) + " MWei";
    if (value < 1e12) return formatFloat(value*(1e-9)) + " GWei";
    if (value < 1e15) return formatFloat(value*(1e-12)) + " szabo";
    if (value < 1e18) return formatFloat(value*(1e-15)) + " finny";
    if (value < 1e21) return formatFloat(value*(1e-18)) + " ether";
    if (value < 1e24) return formatFloat(value*(1e-21)) + " Kether";
    else return formatFloat(value*(1e-24)) + " Mether";
}

function hexLink(){
    $("a.hexLink").each(function(){
        $(this).prop("href", "https://etherchain.org/account/" + $(this).text());
    });
}
var nullAddr = "0x0000000000000000000000000000000000000000";
function accLink(){
    $("a.accLink").each(function(){
        
        hash = $(this).text()
	if($(this).text() == nullAddr){
            $(this).text("The DAO token sale");
	}
        else if($(this).hasClass("shrink")){
            $(this).text(hash.substr(0, 16) + "...");
        }
            
        $(this).prop("href", "tokenbalance.html#" + hash);
    });
}

function blockLink(){
    $("a.blockLink").each(function(){
        $(this).prop("href", "https://etherchain.org/block/" + $(this).text());
    });
}

function propLink(){
    $("a.propLink").each(function(){
        $(this).prop("href", "proposal.html#" + $(this).text());
    });
}


function ethSupply(block){
    supAtOrigin = 79654622.06;
    origin = 1447403;
    ethPerBlock = 5;
    
    return supAtOrigin + (block - origin)*ethPerBlock;
    
    
}

function cleanGraphClass(cname){
    return cname.split(' ').join('');
}

function padTime(m){
    return ('0' + m).slice(-2);
}