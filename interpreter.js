
var parser = {
	state: "text",
	position: 0,
	text: "",
	consumed: "",
	tokens: [],


	readCode: function(code) {
		parser.text = code;
		parser.tokens = [];
		parser.getAllTokens();
		ind = 0;
		while (ind<parser.tokens.length) {
			token = parser.tokens[ind];
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
				ind++;
				token = parser.tokens[ind];
				while (ind<parser.tokens.length && token.type!="newline") {
					console.log("adding data");
					console.log(token);
					dataObj.data.push(token.val);
					ind++;
					token = parser.tokens[ind];
					
				}
				ind--;
				console.log("data object:");
				console.log(dataObj);
				processor.loadData(dataObj);
			}
			ind++;
		}
	},

	readInstructionToken: function(token) {
		processor.text.push( {
			op: token.val,
			lineNum: token.line,
			params: [],
		});
	},

	modes: {
		text: [
			{regex: /(\n+)/, token:['newline']},
		    {regex: /\s*#(.*)\n/, token: ['comment']},
		    {regex: /\s*([a-z]{1,4})[\t ]+(\$[\w]{1,4})(?:,[\t ]*('?[-\$\w\(\)]+'?))?(?:,[\t ]*('?[-\$\w\(\)]+'?))?\s*/,
		     token: ['instr','arg','arg','arg'],},
		    {regex: /(j(?:al)?r?)[\t ]+(.+)[\t ]*/,
		    	token: ['instr','arg']},

		    {regex: /\s*(b[a-z]{0,5})(?:[\t ]+([\$\w\(\)]+))(?:[ \t]*,[\t ]+([\S]+))?(?:[\t ]*,[\t ]+([\S]+))?\s*/,
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

	},

	getNextTokens: function() {
		tokens = [];
		result = null;
		index = 0;
		while (result==null&&index<parser.modes[parser.state].length) {
			tokenMatch = parser.modes[parser.state][index];
			//only match the beginning of the string
			result = (new RegExp("^[\\t ]*"+tokenMatch.regex.toString().substring(
				1, tokenMatch.regex.toString().length-1))).exec(
				parser.text.substring(parser.position));
			index++;
		};
		console.log("\nregex result: ")
		console.log(result);
		if(result!=null) {
			console.log("match found: "+tokenMatch.regex.toString());
			result.forEach(function(val,ind) {
				if(ind==0||val==undefined) return;
				token = {};
				token["type"] = tokenMatch.token[ind-1];
				val!=undefined? token["val"] = val : token["val"]=null;
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
			parser.position = (parser.consumed = parser.consumed + result[0]).length;
			
			if(tokenMatch.next) {parser.state=tokenMatch.next;}
			console.log("\nnew tokens:");
			console.log(tokens);
			return tokens;
		}
		return [];
	},

	getAllTokens: function() {
		allTokens = [];
		newTokens = parser.getNextTokens();
		while(newTokens.length>0) {
			newTokens.forEach(function(token) {allTokens.push(token)});
			newTokens = parser.getNextTokens();
		}
		parser.tokens = allTokens;
	}

}