  "use strict";

  var selfEasyrtcid = "";
	var connectedUsers = [];
	var myComradeID = "";
	var isChannelActive = false;
	var localBusyUsers = [];
  var isUserReady = false;

  var text_btn_start = "Start (F8)";
  var text_btn_stop = "Stop (F8)";
  var text_btn_next = "Następny (F9)"

  var btn_start_stop;
  var btn_next;
  var btn_send;

  var input_send;

	Array.prototype.remove = function(s) {
        for(var i = 0; i < s.length; i++) {
			if (s == this[i]) this.splice(i, 1);
		}
	}

  document.addEventListener("DOMContentLoaded", function() {
    init();

    document.addEventListener("keydown", function(event) {
      handleInput(event);
    });
    window.addEventListener("resize", changeNav);
    window.addEventListener("onload", changeNav);

    btn_start_stop = document.getElementById("btn_start_stop");
    btn_next = document.getElementById("btn_next");
    btn_send = document.getElementById("send");
    input_send = document.getElementById("sendMsg");

    btn_start_stop.addEventListener("click", function() {
      if (!isUserReady) {
        isUserReady = true;
        start();
      }
      else {
        isUserReady = false;
        stop();
      }
    });
    btn_next.addEventListener("click", findPartner);
    btn_send.addEventListener("click", sendMsg);
    input_send.addEventListener("keydown", function(event) {
      handleInput(event);
    });
  });

  function init() {
    easyrtc.setVideoDims(640,480);
    easyrtc.enableDataChannels(true);
    easyrtc.setRoomOccupantListener(updateUsersStats);
    easyrtc.setPeerListener(addToConversation);
    easyrtc.setDataChannelOpenListener(channelOpenListener);
    easyrtc.setDataChannelCloseListener(channelCloseListener);
    easyrtc.easyApp("flaszka.online", "selfVideo", ["callerVideo"], initSuccess, failure);
  }

  function start() {
    findPartner();
  }

  function performCall(otherEasyrtcid) {
      easyrtc.hangupAll();
      var successCB = function() {};
      var failureCB = function() {};
      easyrtc.call(otherEasyrtcid, successCB, failureCB);
    }

  function initSuccess(easyrtcid) {
    	selfEasyrtcid = easyrtcid;
      addToConversation("Komunikat", "statement", "Witamy na flaszka.online! Kliknij START (F2), aby znaleźć kompana do picia. (ID: " + selfEasyrtcid + ")");
    }

  function failure(errorCode, message) {
      easyrtc.showError(errorCode, message);
    }

  function findPartner() {
  	var cookiesData = document.cookie.split("; ");
  	var globalBusyUsers = [];
  	var freeUsers = connectedUsers.slice(1);

  	for (var i = 0; i < cookiesData.length; i++) {
  		globalBusyUsers.push(cookiesData[i].split("=")[0]);
  		if (freeUsers.includes(globalBusyUsers[i])) {
  			freeUsers.remove(globalBusyUsers[i]);
  		}
  	}
  	if (connectedUsers.length == 1) {
      addToConversation("Komunikat", "statement", "Nikt oprócz Ciebie w tym momencie nie pije :(");
  		console.log("There's no one online");
  		return; // TODO: Komunikat o braku użytkowników online
  	}
  	else if (freeUsers === undefined || freeUsers.length == 0) {
  		console.log("Everyone's busy");
      addToConversation("Komunikat", "statement", "Wszyscy już piją!");
  		return;
  	}
  	else {
  		var myComradeIndex = Math.floor(Math.random() * (freeUsers.length-1));
      // document.getElementById("conversation").innerHTML = "";
  		performCall(freeUsers[myComradeIndex]);
  		myComradeID = freeUsers[myComradeIndex];
  	}
  }

  function toggleNavButtons() {
    if (!isUserReady) {
      btn_start_stop.innerHTML = text_btn_start;
      btn_next.disabled = true;
    }
    else {
      btn_start_stop.innerHTML = text_btn_stop;
      btn_next.disabled = false;
    }
  }

  function changeNav() {
      var w = window.innerWidth;
      var buttons = document.getElementsByClassName("btn-nav");
      var nav_left = document.getElementById("nav-left");
      var logo = document.getElementById("logo");
      var nav_right = document.getElementById("nav-right");
      if (w < 789) {
        for (var i = 0; i < buttons.length; i++) {
          buttons[i].style.width = "40px";
        }
        buttons[0].textContent = "";
        buttons[1].textContent = "";
        if (buttons[0].className != "btn btn-default btn-nav glyphicon glyphicon-play" ||
        buttons[1].className != "btn btn-default btn-nav glyphicon glyphicon-step-forward") {
          buttons[0].className += " glyphicon glyphicon-play";
          buttons[1].className += " glyphicon glyphicon-step-forward";
        }

        nav_left.className = "col-xs-4 text-left";
        logo.className = "col-xs-4 text-center";
        nav_right.className = "col-xs-4 text-right";
      }
      else {
        for (var i = 0; i < buttons.length; i++) {
          buttons[i].style.width = "";
        }
        if (myComradeID == "") {
          buttons[0].textContent = text_btn_start;
        }
        else {
          buttons[0].textContent = text_btn_stop;
        }
        buttons[0].className = "btn btn-default btn-nav btn-start-stop";
        buttons[1].textContent = text_btn_next;
        buttons[1].className = "btn btn-default btn-nav";

        nav_left.className = "col-xs-5 text-left";
        logo.className = "col-xs-2 text-center";
        nav_right.className = "col-xs-5 text-right";

      }
    }

	function setCookie(name, val, days) {
		if (days) {
			var data = new Date();
			data.setTime(data.getTime() + (days * 24*60*60*1000));
			var expires = "; expires="+data.toGMTString();
		} else {
			var expires = "";
		}
		document.cookie = name + "=" + val + expires + "; path=/";
	}

	function showCookie(name) {
		if (document.cookie!="") { //jeżeli document.cookie w ogóle istnieje
			var cookies=document.cookie.split("; ");  //tworzymy z niego tablicę ciastek
			for (var i=0; i<cookies.length; i++) { //i robimy po niej pętlę
				var cookieName=cookies[i].split("=")[0]; //nazwa ciastka
				var cookieVal=cookies[i].split("=")[1]; //wartość ciastka
				if (cookieName===name) {
					return decodeURI(cookieVal) //jeżeli znaleźliśmy ciastko o danej nazwie, wtedy zwracamy jego wartość
				}
			}
		}
	}

	function deleteCookie(name) {
		document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	}

	function handleInput(event) {
		if (event.which == 13 || event.keyCode == 13) { // wciśnięto ENTER
			sendMsg();
		}
    else if (event.which == 119 || event.keyCode == 119) { // wciśnięto F8 (START/STOP)
      if (myComradeID == "") {
        findPartner();
      }
      else {
        stopConversation();
      }
		}
    else if (event.which == 120 || event.keyCode == 120) { // wciśnięto F9 (NEXT)
			if (btn_next.disabled == false) {
        findPartner();
      }
		}
	}

  function addToConversation(who, msgType, content) {
    var message = "";
    content = content.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    content = content.replace(/\n/g, "<br />");
    if (who == "Ty") {
      message = '<p><span class="you">' + who + '</span>: ' + content + '</p>';
    }
    else if (who == myComradeID) {
      message = '<p><span class="someone">Kompan</span>: ' + content + '</p>';
    }
    else if (who == "Komunikat") {
      message = '<p><span class="statement">' + who + ': ' + content + '</span></p>';
    }
    else {
      message = '<p class="error">Wystąpił nieoczekiwany błąd</p>';
    }
    var chat = document.getElementById("conversation");
    var oldScrollHeight = chat.scrollHeight;
		chat.innerHTML += message;
    var newScrollHeight = chat.scrollHeight;
    if (newScrollHeight > oldScrollHeight) {
      chat.scrollTo(0, newScrollHeight);
    }
	}

	function channelOpenListener(otherParty) {
    var sendMsgArea = document.getElementById("sendMsg");
    var statementContent = 'Nawiązano połączenie';
		isChannelActive = true;
		myComradeID = otherParty;
		localBusyUsers.push(easyrtc.myEasyrtcid);
		localBusyUsers.push(myComradeID);
		setCookie(easyrtc.myEasyrtcid, true);
		setCookie(myComradeID, true);
    sendMsgArea.disabled = false;
    sendMsgArea.setAttribute("placeholder", "Napisz wiadomość");
    addToConversation("Komunikat", "statement", statementContent);
    toggleNavButtons();

		console.log("Channel is open");
	}

	function channelCloseListener(otherParty) {
    var statementContent = 'Twoj rozmówca opuścił cię';
    var sendMsgArea = document.getElementById("sendMsg");
    sendMsgArea.disabled = true;
    sendMsgArea.setAttribute("placeholder", "Połącz się, aby rozmawiać");
    sendMsgArea.value = "";
		isChannelActive = false;
    deleteCookie(localBusyUsers[0]);
		deleteCookie(localBusyUsers[1]);
		localBusyUsers.remove(easyrtc.myEasyrtcid);
		localBusyUsers.remove(myComradeID);
		myComradeID = "";
    addToConversation("Komunikat", "statement", statementContent);
    toggleNavButtons();

		console.log("Channel is close");
	}

	function sendMsg() {
		var text = document.getElementById("sendMsg").value;
		if(text.replace(/\s/g, "").length === 0) { // Don"t send just whitespace
			return;
		}
		if (easyrtc.getConnectStatus(myComradeID) === easyrtc.IS_CONNECTED) {
			easyrtc.sendDataP2P(myComradeID, "message", text);
		}
		else {
			easyrtc.showError("NOT-CONNECTED", "not connected to " + easyrtc.idToName(myComradeID) + " yet.");
			return;
		}
		addToConversation("Ty", "message", text);
		document.getElementById("sendMsg").value = "";
	}

  function updateUsersStats(roomName, data) {
		connectedUsers = [];
		connectedUsers.push(easyrtc.myEasyrtcid);
		 for (var id in data) {
			 connectedUsers.push(id);
		 }

		 var onlineUsersText = document.getElementById('onlineUsers');
		 onlineUsersText.innerHTML = "Pijący online: " + connectedUsers.length;
	 }

  function stop() {
    easyrtc.disconnect();
    easyrtc.cleanMediaStream(document.getElementById("selfVideo"));
  }
