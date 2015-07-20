var system = {
	inputFocus: false,
	inputLine:null,
	cursorPosition:0,
	reading: "none",
	printInt: function(num) {
		io = document.getElementById("io");
		line = io.lastElementChild;
		line.innerHTML = line.innerHTML + num;
	},
	readInt: function() {
		//STUB
		pause();
		system.reading = "int";
		this.enableInput();
	},
	readString: function() {
		pause();
		system.reading = "string";
		this.enableInput();
	},
	printChar: function(charCode) {
		io = document.getElementById("io");
		line = io.lastElementChild;
		line.innerHTML = line.innerHTML + String.fromCharCode(charCode);
	},
	printString: function(string) {
		io = document.getElementById("io");
		line = io.lastElementChild;
		line.innerHTML = line.innerHTML + string;
	},

	enableInput: function() {
		io = document.getElementById("io");
		io.appendChild(document.createElement("div"));
		this.inputLine = io.lastElementChild;
		this.inputLine.classList.add("input");
		this.inputLine.innerHTML = "<div id = 'cursor'>";
		this.inputFocus = true;
		window.onkeydown=this.consoleKeypress;
	},

	giveInput: function(input) {
		if(system.reading=="int") {
			processor.setRegister("$v0", parseInt(input));
		}
		if(system.reading=="string") {
			console.log("String read");
			processor.loadString(processor.getRegister("$a0"),input+String.fromCharCode(10));
		}
		io = document.getElementById("io");
		io.appendChild(document.createElement("div"));
		system.inputFocus = false;
		resume(200);
	},
	consoleKeypress: function(evt){
		inputLine = system.inputLine;
		if (system.inputFocus&&system.inputLine!=null) {
			evt.preventDefault();

			//enter
			if (evt.keyCode==13)
			{
				document.getElementById("cursor").remove();
				system.giveInput(inputLine.innerText);
			}
			//backspace
			else if (evt.keyCode==8){
				
				if (inputLine.innerText.length>0) {
					document.getElementById("cursor").remove();
					inputLine.innerHTML = inputLine.innerText.substring(0,system.cursorPosition-1) + 
						"<div id = 'cursor'></div>" +
						inputLine.innerText.substring(system.cursorPosition+1);
					system.cursorPosition--;
				}
			}
			//space
			else if (evt.keyCode==32){
				document.getElementById("cursor").remove();
				inputLine.innerHTML = inputLine.innerText + " " + "<div id = 'cursor'></div>";
				system.cursorPosition++;
			}
			//alphanumeric character
			else if (evt.keyCode>47 && evt.keyCode<91){
				document.getElementById("cursor").remove();
				code = evt.keyCode;
				if (!evt.shiftKey&&code<=90&&code>=65) code = code + 32;
				inputLine.innerHTML = inputLine.innerText + String.fromCharCode(code) + "<div id = 'cursor'></div>";
				system.cursorPosition++;
			}
			//minus sign
			else if (evt.keyCode==189) {
				document.getElementById("cursor").remove();
				inputLine.innerHTML = inputLine.innerText + String.fromCharCode(45) + "<div id = 'cursor'></div>";
				system.cursorPosition++;
			}
			console.log(evt);
		}
	},

	cursorBlink: function() {
		if(system.inputFocus) {
			cursor = document.getElementById("cursor");
			(cursor.style["borderWidth"]=="0px")? cursor.style["borderWidth"]="1px" : cursor.style["borderWidth"] = "0px";
		}
	}

}
window.setInterval(system.cursorBlink,400);