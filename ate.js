function tmpl(str, data){
    var fn = !/\W/.test(str) ?
    tmpl.cache[str] = tmpl.cache[str] ||
    tmpl(document.getElementById(str).innerHTML) :
    new Function("",
        "var p=[];p.push('" +
        str
        .replace(/[\r\t\n]/g, " ")
        .split("<\?").join("\t")
        .replace(/((^|\?>)[^\t]*)'/g, "$1\r")
        .replace(/\t=(.*?)\?>/g, "',$1,'")
        .split("\t").join("');")
        .split("\?>").join("p.push('")
        .split("\r").join("\\'")
        + "');return p.join('');");
    return data ? fn.call( data ) : fn;
	}
tmpl.cache = {}


function Ate(tplid , options){
	// update append 
	options = $.extend({},options)

	function ate(){
		this.data = options.data 
		if (options.init) options.init.call(this)
		}

	function callUp(thisObj , opt , data, tplid2){
		var html = tmpl(tplid2 ||tplid , data )	
		options[opt].call(thisObj , html)
		} 

	ate.prototype = {
		construtor: ate
		,update : function (new_data){
			//if (undefined === new_data) new_data = this.data
			//else this.data = new_data
			callUp(this , 'update' , new_data || this.data , options.update_tpl)
			}
		,append : function(new_data){
			//this.data.push(new_data)
			callUp(this , 'append' , new_data)
			}
		}

	return new ate
	} 

