var runInterval;

function assemble() {
	processor.text = [];
	parser.consumed = "";
	parser.position = 0;
	processor.reset();

	textarea = document.getElementById("code");
	programCode = "";
	programCode = (textarea.innerHTML.length>0)? textarea.innerText : textarea.value;
	parser.readCode(programCode);
	showInstructions();
	addLineNumbers();
	updateRegisters();
	instructionsList = document.getElementById("instructions");
	if (instructionsList.children.length>0)
		instructionsList.children[processor.programCounter].style["backgroundColor"]="hsl(120,27%,90%)";
		//jump to main, if it exists
	if(processor.instrLabels["main"]!=undefined)
		processor.programCounter = processor.instrLabels["main"];
};

function showInstructions() {
	instructionsList = document.getElementById("instructions");
	while(instructionsList.lastElementChild!=null) {
		instructionsList.lastElementChild.remove();
	}
	for(ii in processor.text) {
		instr = processor.text[ii];
		instructionsList.appendChild(document.createElement("li"));
		instructionsList.lastChild.innerHTML = instr.op+ " " + instr.params.join(", ") + " (on line " + instr.lineNum.toString()+ ")";
	}
};


function updateRegisters () {
	registersList = document.getElementById("registers").lastChild;
	for(ii = 0; ii < 32; ii++) {
		console.log(processor.getRegister("$"+ii.toString()));
		registersList.children[ii].children[2].innerHTML = processor.getRegister("$"+ii.toString());
	}
};

function addLineNumbers() {
	textarea = document.getElementById("code");
	lineNumbers = document.getElementById("lineNumbers");
	lineNumbers.innerHTML = "";
	for (i = 0; i < textarea.value.match(/$/gm).length; i++) {
		lineNumbers.innerHTML = lineNumbers.innerHTML+i+"<br/>";
	}
	textarea.style["height"] = (lineNumbers.clientHeight+20).toString()+"px"
};

function runStep() {
	if(!processor.running) return;
	
	instructionsList = document.getElementById("instructions");
	if (instructionsList.children.length>0)
		instructionsList.children[processor.programCounter].style["backgroundColor"]="white";
	processor.runInstr();
	updateRegisters();

	if(!processor.running) return;

	if (instructionsList.children.length>0)
		instructionsList.children[processor.programCounter].style["backgroundColor"]="hsl(120,27%,90%)";

};

function resume(interval) {
	runInterval = window.setInterval(runStep, interval);
};

function pause() {
	window.clearInterval(runInterval);
};

updateRegisters();
addLineNumbers();

codeBox = document.getElementById("code");
console.log(codeBox);
codeBox.onkeyup = addLineNumbers;



