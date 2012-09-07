(function(global,undefined){

var AP = Array.prototype
	,Ots =  Object.prototype.toString
	,class2type = {}
	
"Boolean Number String Function Array Date RegExp Object".split(" ").forEach(function(name){
	class2type[ "[object " + name + "]" ] = name.toLowerCase()	
	})

function weave(expr , doc){
	return new weave.fn.init(expr , doc) 
	}
weave.fn = weave.prototype = {
	 construtor : weave 
	,length : 0
	,splice: [].splice
	,init :function(expr , doc){
		if (!expr) return this
		return store_result(query(expr,doc) , this)
		
		}
	,each :function(iFn){
		for(var i=0, j=this.length ; i <j ;i++){
			iFn.call(this[i] , i)
			}
		}
	,find :function(expr){
		var ret = []
		this.each(function(){
			ret = ret.concat( query(expr,this) )
			})
		return store_result(ret)
		}
	,eq : function(start, eqlen){
		return store_result( slice(this, start, eqlen) )

		}
	,bind : function(type , bindFn){
		this.each(function(){
			this.addEventListener(type , bindFn , false)
			})
		}	
	,on : function(type , elemExp , bindFn){
		this.bind(type , function(evt){
			var srcEle = evt.target || evt.srcElement || evt.originalTarget
			if (! judgeRule(elemExp,srcEle)) return
			bindFn.call(srcEle , evt)	
			})
		}
	,attr : function(name , val){
		if (undefined === val) return this[0].getAttribute(name)
		this.each(function(){
			this.setAttribute( name , val)
			})
		}
	,html : function(content){
		this.each(function(){
			this.innerHTML = content
			})
		}
	,append : function (collec){
		var html_orgin = 'string' == weave.type(collec)
		this.each(function(){
			if (html_orgin) 
				this.innerHTML += collec
			else {
				for (var i = collec.length-1 ; i >=0 ; i--)	
					this.appendChild(collec[i])	
				}
				
			})
		}
	,before : function(collec){
		var html_orgin
		if ('string' == weave.type(collec)) html_orgin = collec
		this.each(function(){
			if (html_orgin)  collec = create(html_orgin)
			for (var i = collec.length-1 ; i >=0 ; i--)	
				this.insertBefore(collec[i] , this.firstChild)
			})
		}
	,toString : function(){
		return slice(this,0,0) 
		}
	}

weave.fn.init.prototype = weave.fn

function judgeRule(rule , element ){
	if (!element) return false
	var secs = rule.replace(/([\#\.\[])/g , '|$1').split('|')
	var ret = true
	for(var i = 0 ,j = secs.length ; i <j ; i++){
		var sec = secs[i]
		if ('' == sec) continue 
		switch (sec.charAt(0)){
			case '#':
				if (element.id != sec.substr(1) ) return ret = false
				break
			case '.':
				if (-1 == element.className.indexOf(sec.substr(1))) return ret = false
				break
			case '[':
				sec = sec.substr(1, sec.length-2).split('=')
				var attr = element.getAttribute(sec[0])
				if (null == attr) return ret = false
				if (sec[1] && attr!= sec[1]) return ret = false
				break;
			default:
				if (element.tagName != sec.toUpperCase()) return ret = false
			}

		}

	return ret
}

function create(html){
	var wpnl = document.createElement('div')
	wpnl.innerHTML = html 
	wpnl = wpnl.childNodes
	var new_node = []
	for (var i = 0 , j = wpnl.length ; i < j ; i++ ){
		if( 1 == wpnl[i].nodeType ) new_node.push(wpnl[i])
		}	
	wpnl.innerHTML = ''
	delete wpnl 
	return new_node 
	
	}
function query(expr , doc){
	doc = doc || document
	if  ('string' == weave.type(expr)) 
		if (expr.indexOf('<') > -1 && expr.indexOf('>') > 0)
			return store_result(create(expr) , this)
		else
			return AP.slice.call(doc.querySelectorAll(expr)) 
	else{
		if (!expr.length) expr = [expr]
		return store_result(expr , this)
		}

	}

function store_result(eles , thisObj){
	if (!thisObj) thisObj = new weave
	if (eles) thisObj.length = eles.length 
	for(var i = 0;i < thisObj.length;i++)
		thisObj[i] = eles[i]
	return thisObj
	}

function slice(arr , index , slicelen){
   var ret = []
   if (index < 0 ){ 
	   index += arr.length
	   if (index < 0) index = 0
   }
   if (!slicelen ) {
	   slicelen = 0 === slicelen ? arr.length: 1
	   slicelen += index
	}else if (slicelen<0)
		slicelen += arr.length + 1

   for (var i = index;i< slicelen;i++)
	   ret.push(arr[i])
	return ret
	}

/*static method*/
weave.extend = function(orgin , toExtend){
	for (var k in toExtend)
		orgin[k] = toExtend[k]
	return orgin
	}
weave.extend(weave , {
	'type' : function(obj,type){
		return class2type[Ots.call(obj)]
		}
	
	})

global.$ = weave 

})(window)
