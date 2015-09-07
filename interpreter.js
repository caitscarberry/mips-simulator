
var parser = {
	state: "text",
	position: 0,
	text: "",
	consumed: "",
	tokens: [],
};

parser.modes = {
	text: [
		{regex: /(\n+)/, token:['newline']},
	    {regex: /\s*#(.*)\n/, token: ['comment']},
	    {regex: new RegExp(
	    	["\\s*([a-z]{1,5})[\\t ]+(\\$[\\w]",
	    	 "{1,4})(?:,[\\t ]*('?[-\\$\\w\\(\\)]",
	    	 "+'?))?(?:,[\\t ]*('?[-\\$\\w\\(\\)]+",
	    	 "'?))?\\s*"].join('')),
	     token: ['instr','arg','arg','arg'],},
	    {regex: /(j(?:al)?r?)[\t ]+(\S+)\b[\t ]*/,
	     token: ['instr','arg']},
	    {regex: new RegExp(
	    	["\\s*(b[a-z]{0,5})(?:[\\t ]+",
	    	 "([\\$\\w\\(\\)]+))(?:[ \\t]*",
	    	 ",[\\t ]+([\\S]+))?(?:[\\t ]*,",
	    	 "[\\t ]+([\\S]+))?\\s*"].join('')),
	     token: ['instr','arg','arg','arg']},
	    {regex: /(syscall)\s*/,
	     token: ['syscall']},
	    {regex: /(\.data)\s*/,
	     token: ['dataStart'],
	     next: 'data',},
	    {regex: /\n?[\t ]*(\w+)\:\s*/,
	     token: ['instrLabel']},
	    {regex: /\s*\.(text)[\t ]*\n/,
		 token: ['textStart'],
		 next: 'text'},
		{regex: /\.(globl)[\t ]+(.+)[\t ]*/,
		 token: ['globalDirective','label']},
	],

	data: [
		{regex: /\s*#(.*)\n/, token: ['comment']},
		{regex: /[\t ]*(\w+)\:[\t ]*/,
	     token: ['dataLabel']},
		{regex: /[\t ]*\.(text)[\t ]*/,
		 token: ['textStart'],
		 next: 'text'},
		 {regex: /\s*\.(globl)[\t ]+(.+)[\t ]*/,
		  token: ['globalDirective','label']},
		 {regex: /[\t ]*\.(align)[\t ]+(\d+)[\t ]*/,
		  token: ['align','number']},
		 {regex: /\.(asciiz?)[\t ]+(.+)[\t ]*/,
		  token: ['dataType','str']},
		 {regex: /\.(word|byte|half)[\t ]+/,
		  token: ['dataType']},
		 {regex: /\.(space)[\t ]+(\d+)[\t ]*/,
		  token: ['dataType','space']},
		 {regex: /(\n+)/, token: ['newline']},
		 {regex: /(\d+)\b,?/, token: ['number']}
		 ],

	dataList: [

	]
};

parser.readCode = function(code) {
	parser.text = code;
	parser.tokens = [];
	parser.getAllTokens();
	currentTokenIndex = 0;
	while (currentTokenIndex<parser.tokens.length) {
		token = parser.tokens[currentTokenIndex];
		console.log("reading token");
		if(token.type=="instr") {
			parser.readInstructionToken(token);
		}
		if(token.type=="syscall") {
			processor.text.push( {
				op: "syscall",
				lineNum: token.line,
				params: [],
			});
		}
		if(token.type=="arg") {
			processor.text[processor.text.length-1].params.push(token.val);
		}
		if(token.type=="instrLabel") {
			processor.instrLabels[token.val] = processor.text.length;
		}
		if(token.type=="dataLabel") {
			processor.dataLabels[token.val] = processor.memoryPointer;
		}
		if(token.type=="dataType") {
			dataObj = {
				type : token.val,
				data: [],
			}
			currentTokenIndex++;
			token = parser.tokens[currentTokenIndex];
			while (currentTokenIndex<parser.tokens.length 
			&& token.type!="newline") {
				console.log("adding data");
				console.log(token);
				dataObj.data.push(token.val);
				currentTokenIndex++;
				token = parser.tokens[currentTokenIndex];
				
			}
			currentTokenIndex--;
			console.log("data object:");
			console.log(dataObj);
			processor.loadData(dataObj);
		}
		currentTokenIndex++;
	}
};

parser.readInstructionToken = function(token) {
	processor.text.push( {
		op: token.val,
		lineNum: token.line,
		params: [],
	});
};

parser.getNextTokens = function() {
	tokens = [];
	result = null;
	index = 0;

	//find the matching token
	while (result==null&&index<parser.modes[parser.state].length) {
		tokenMatch = parser.modes[parser.state][index];
		
		expressionToMatch = tokenMatch.regex.toString();

		//only match the beginning of the string
		result = (new RegExp("^[\\t ]*" +
			expressionToMatch.substring(
			1, expressionToMatch.length-1))).exec(
			parser.text.substring(parser.position));
		index++;
	};


	if(result!=null) {

		//turn each capture group into its
		//own token
		result.forEach(function(val,index) {
			//the first element of the match
			//object is the entire string,
			//so we skip that
			if(index==0) {return;}
			token = {};
			token["type"] = tokenMatch.token[index-1];
			token["val"] = val;
			tokens.push(token);
		});


		tokens.forEach( function(token) {
			if(parser.consumed.length==0||parser.consumed.match(/\n/g)==null) {
				token["line"] = 0;
			}
			else {
				token["line"]=parser.consumed.match(/\n/g).length;
			}
		});

		parser.consumed = parser.consumed + result[0];
		parser.position = parser.consumed.length;
		
		if(tokenMatch.next) {parser.state=tokenMatch.next;}

		return tokens;
	}
	return [];
};

parser.getAllTokens = function() {
	newTokens = parser.getNextTokens();
	while(newTokens.length>0) {
		newTokens.forEach(function(token) {
			parser.tokens.push(token);
		});
		newTokens = parser.getNextTokens();
	}
};