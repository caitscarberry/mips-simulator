var runInterval;

function assemble() {
	processor.text = [];
	program.data = [];
	program.labels = {};
	processor.reset();

	textarea = document.getElementById("code");
	programCode = program.stripWhiteSpace(textarea.innerText);
	program.readCode(program.splitLines(program.stripComments(programCode)));
	processor.loadProgram(program);
	showInstructions();
	addLineNumbers();
	instructionsList = document.getElementById("instructions");
	instructionsList.children[processor.programCounter].style["backgroundColor"]="hsl(120,27%,90%)";
	codeDiv = document.getElementById("code");
	codeDiv.children[processor.text[processor.programCounter].lineNum].style["backgroundColor"]="hsl(120,27%,90%)";

};

function showInstructions() {
	instructionsList = document.getElementById("instructions");
	while(instructionsList.lastElementChild!=null) {
		instructionsList.lastElementChild.remove();
	}
	for(ii in processor.text) {
		instr = processor.text[ii];
		instructionsList.appendChild(document.createElement("li"));
		instructionsList.lastChild.innerText = instr.op+ " " + instr.params.join(", ") + " (on line " + instr.lineNum.toString()+ ")";
	}
};

function showRegisters() {
	registersList = document.getElementById("registers");
	for(ii in processor.registers) {
		reg = processor.registers[ii];
		registersList.appendChild(document.createElement("tr"));
		registersList.lastChild.appendChild(document.createElement("td"));
		registersList.lastChild.lastChild.innerText = ii;
		registersList.lastChild.appendChild(document.createElement("td"));

		registersList.lastChild.lastChild.innerText = "abd";
		/*if(processor.registerNames[ii]!=undefined) {
			registersList.lastChild.lastChild.innerText = processor.registerNames[ii];
		}*/

		registersList.lastChild.appendChild(document.createElement("td"));
		registersList.lastChild.lastChild.innerText = processor.registers[ii];
	}
};

function updateRegisters () {
	registersList = document.getElementById("registers").lastChild;
	for(ii in registersList.childNodes) {
		if (registersList.children[ii]&&registersList.children[ii].children!=undefined) { 
			registersList.children[ii].children[2].innerText = processor.registers[ii];
		}
	}
};

function addLineNumbers() {
	textarea = document.getElementById("code");
	lineNumbers = document.getElementById("lineNumbers");
	lineNumbers.innerText = "";
	for (i = 0; i < textarea.innerText.match(/$/gm).length; i++) {
		lineNumbers.innerText = lineNumbers.innerText+i+"\n";
	}
};

function runStep() {
	if(!processor.running) return;
	
	instructionsList = document.getElementById("instructions");
	codeDiv = document.getElementById("code");
	instructionsList.children[processor.programCounter].style["backgroundColor"]="white";
	codeDiv.children[processor.text[processor.programCounter].lineNum].style["backgroundColor"]="white";
	processor.runInstr();

	if(!processor.running) return;
	
	updateRegisters();
	codeDiv.children[processor.text[processor.programCounter].lineNum].style["backgroundColor"]="hsl(120,27%,90%)";
	instructionsList.children[processor.programCounter].style["backgroundColor"]="hsl(120,27%,90%)";
	codeDiv.children[processor.text[processor.programCounter].lineNum].scrollIntoViewIfNeeded();
};

function resume(interval) {
	runInterval = window.setInterval(runStep, interval);
};

function pause() {
	window.clearInterval(runInterval);
};

updateRegisters();

codeBox = document.getElementById("code");
console.log(codeBox);
codeBox.onkeyup = addLineNumbers;
codeBox.onpaste = function(){console.log("a")};

