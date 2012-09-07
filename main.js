(function(){
	const WsHost = "ws://192.168.60.2:8100"
	const Chats_Max = 100 
	const ReConnectTTL = 5000

	var ws 
	
	var user_list_con = $('#user_list')
		,chat_con = $('#chat_con')
		,say_input = $('#say')
		,status_bar = $('#header')
		,chats_list = []
	var myname  
		,atMyName
		,mycolor = $('#color')[0].value 
		,enableNotify = false

	var user_list = Ate('user_list_tpl',{
		'update' :function(html){
			user_list_con.html(html)
			}
		})
	var chats = Ate('chat_tpl',{
		'data' : chats_list
		,'update' :function(html){
			chat_con.html(html)
			}
		,'append' : function(html){
			chat_con.append( $(html))
			}
		})
	
	
	initConn()
	$('#chat_con').on('click' ,'span.nicky' , function(){
		say_input[0].value += '@' + this.innerHTML + ' '
		say_input[0].focus()

		})
	$('#notify').bind('click' , function(){
		enableNotify = this.checked
		 if(myNotifications && myNotifications.checkPermission() === 1) {
			  myNotifications.requestPermission()
			}
		})

	$('#myname').bind('change' , function(){
		setMyName(this.value)	
		})
	$('#color').bind('change' , function(){
		mycolor = this.value
		})
	say_input.bind('keyup' , function(evt){
		var msg = this.value.trim()
		if(msg.length && false === evt.shiftKey && 13 == evt.keyCode){
			sendMsg('sendMsg', msg)
			this.value = ''	
			this.focus()
			if (chats_list.length > Chats_Max) {
				chats_list.splice(0 , chats_list.length - Chats_Max)
				chats.update()
				} 
			}
		})


	
	function initConn(){
		ws = new WebSocket(WsHost)
		ws.onopen = function(){
			myname = getMyName()
			sendMsg("login", myname)
			//status_bar.html('Welcome back '+ myname)
			status_bar.html('')
			}
		ws.onmessage = function(evt){
			receiveMsg(evt.data)
			//ws.close()
			}
		ws.onclose =  function(evt){
			//status_bar.html('Server closed')
			delete ws
			}
		ws.addEventListener('error' , function(){
			//console.log("WebSocketError!")
			status_bar.html('Server closed , reconnecting...')
			window.setTimeout(initConn , ReConnectTTL)
			} , false)
	}
	function updateNameReg(){
		atMyName = new RegExp('@' + myname + '\\b')

		}
	function getMyName(){
		$('#myname')[0].value = myname = localStorage.getItem('name') 
		updateNameReg()
		return myname
		}
	function setMyName(name){
		myname = name
		updateNameReg()
		sendMsg('setName',name)	
		localStorage.setItem('name', name)

		}

	function sendMsg(optype ,data){
		if (!ws) return
		ws.send(JSON.stringify({"type":optype ,"data":data , "color": mycolor}))
		}
	/*ubb translation*/
	function transData(data){

		return data
		}
	function receiveMsg(receive){
		receive = receive ? JSON.parse(receive) : null
		if (!receive.type) return

		var data = receive.data
		switch ( receive.type){
			case 'msg':
				chats_list.push(data)
				notify && notify(data)
				chats.append([data])
				break
			case 'users':
				user_list.update( data )
				break
			}
		}
	function decodeHtml(html){
		return html.replace('&lt;','<').replace('&gt;','>')
		}

	
	var myNotifications = window.webkitNotifications    
		,notify 
	if (myNotifications){	
		$('#notify')[0].parentNode.style.display = ''
		notify = function(msg){
			if (!enableNotify) return
			if( !atMyName.test(msg.data)) return
			if(myNotifications.checkPermission() === 1) {    
				myNotifications.requestPermission()    
			} else if (myNotifications.checkPermission() === 0) {    
				//var notification = myNotifications.createNotification('images/message.jpg', 'New Message Received', 'The html5 has send you an email.');    
				var notification = myNotifications.createNotification('', decodeHtml(msg.from) + ' say:',decodeHtml(msg.data) )    
				notification.ondisplay = function() { setTimeout(function(){notification.cancel()}, 3000) }    
				notification.show()    
			} else       
				alert('Permission has been denied.')    
		}
	}    
})()
