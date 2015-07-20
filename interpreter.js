var program = {

	section: "text",

	stripComments: function(code) {
		return code.replace(/\#.*?\n/g,"\n");
	},

	stripWhiteSpace: function(code) {
		return code.replace(/\t/g," ");	
	},

	splitLines: function(code) {
		return code.split("\n");
	},

	readCode: function(lines) {
		for(ll in lines){
			line = lines[ll].trim();
			if(line.length>0) {
				this.readLine(line,ll);
			}
		}
	},

	readLine: function(line, lineNum) {
		if(line.match(/^\s*\.text\s*$/m)) {
			this.section = "text";
			return;
		}
		if(line.match(/^\s*\.data\s*$/m)) {
			this.section = "data";
			return;
		}
		if(this.section=="text") {
			//if the line is a label
			if(line.match(/^\w*:$/gm)) {
				label = line.substring(0,line.length-1);
				processor.instrLabels[label]=processor.text.length;
				console.log("label "+label+" added for instruction " + processor.instrLabels[label].toString());
				return;
			}
			else {
				instr = this.readInstruction(line, lineNum);
			}
		}
		else {
			if(line.match(/^\w\w*:.*/gm)) {
				processor.labelMemory(line.split(":")[0].trim());	
			}
			if(line.match(/\.\w/)) {
				this.readDataDeclaration(line);
			}
		}

	},

	readInstruction: function(line,lineNum) {
		console.log(line);
		processor.text.push( {
			op: line.substring(0,line.indexOf(" ")>-1?line.indexOf(" "):line.length).trim(),
			params: line.indexOf(" ")>-1?line.substring(line.indexOf(" ")+1).replace(/\s/g,"").split(","):[],
			lineNum: lineNum,
		});
	},

	readDataDeclaration: function (line, al) {
			dataObj = {};
			dataObj.type = line.substring(line.indexOf(".")+1,line.indexOf(" ",line.indexOf(".")+1));
			data =  line.split(line.match(/\.\w\w*\s\s*/)[0])[1];
			console.log("raw: "+data);
			switch(dataObj.type) {
				case "asciiz":
				case "ascii":
					console.log("string data: "+data);
					data = data.trim();
					data = data.substring(1,data.length-1);
					data = data.replace(/\\n/g,String.fromCharCode(10));
					break;
				case "byte":
				case "halfword":
				case "word":
					data = replace(/\s/g,"");
					data = data.split(",");
					break;
				case "space":
					data = parseInt(data);
					break;
			}
			dataObj.data = data;

			processor.loadData(dataObj);
		}
};

