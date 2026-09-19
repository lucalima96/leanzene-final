// ADJUST FOR CLOUD CALLS!!
// 
// mydomain/datadomain/subdomain/

class N2 
{
	constructor($basename)
    {
    	let obj = this;
    	this.basename = $basename;
        let handler = {
            get: function (target, prop)
            {
            	return async function()
            	{
            		var args = Array.prototype.slice.call(arguments);
            		let request = {
						"_o": obj.basename,
						"_m": prop,
						"_a": args
					};
					
					return await jQuery.ajax({
						type: 'POST',
						url: wpinstance + "?action=" + PLUGIN_NAME,
						data: request,
						error:function( jqXHR, textStatus, errorThrow){
							console.log(errorThrow);
						},
						dataType: "json"
					});
            	}
            }
        }
        return new Proxy(this, handler)
    }
}

class FEO
{
	/*
	rewriter 
	common data - all files & public pages
	session data - 
	
	when we create a session:
		- generate an id
		- bind id with private resources 
		- dynamic data - ? 
	*/
}

var N2O = {
	env:{},
	baseurl:document.currentScript.getAttribute("baseurl"),
	forceProcess:false,
	ajax: function(url, onload){
		var xhttp = new XMLHttpRequest();
		xhttp.onload = onload;
		xhttp.open("GET", url, true);
		xhttp.send();
	},
	
	processELM: function(selm) {
		var variable = selm.getAttribute("n2-var");
		if(variable > "")
		{
			var setvalue = selm.getAttribute("n2-set");
			if(setvalue > "")
			{
				if(setvalue == "@")
				{
					N2O.set(variable, selm.innerHTML.trim());
				} else {
					N2O.set(variable, setvalue);
				}
			} else {
				// extract just the children!
				selm.append(N2O.HTMLize(selm, N2O.get(variable)));
				N2O.processHTML(selm);
			}
		}
		
		if(selm.getAttribute("n2-load") > "")
		{	// find a better way? we insulate the env at the time of request
			selm.reload = function(){
				var src = selm.getAttribute("n2-load");
				N2O.processLoad(src, selm);
			};
			selm.reload();
		}
	},
	
	processLoad: function(src, selm, clean)
	{
		var env = JSON.parse(JSON.stringify(N2O.env));
		src = N2O.baseurl + src;  
		selm.setAttribute("N2_loading","");
		
		N2O.ajax(src,function(){
			N2O.env = env;
			var forceProcess = false;
			
			if(clean)
				selm.innerHTML = "";
			
			if(!selm.N2O_template)
				selm.N2O_template = selm.innerHTML;
			else{
				selm.innerHTML = selm.N2O_template;
				N2O.forceProcess = true;
				forceProcess = true;
			}
			
			selm.append(N2O.HTMLize(selm, this.responseText));
			N2O.processHTML(selm);
			N2O.forceProcess = forceProcess?false:true;
			selm.removeAttribute("N2_loading");
		});
	},
	
	processHTML: function(elm){
		var elms = elm.querySelectorAll(":not([n2-process] *) > [n2-load],:not([n2-process] *) > [n2-var]");
		elms.forEach(function(item){return N2O.processELM(item)});
	},
	
	HTMLize: function ($host, $htmlString){
		
		var process = $host.getAttribute("n2-process");
		if(process > "")
			$host.N2O_process = process;
		if(N2O.forceProcess)
			process = $host.N2O_process;
			
		$host.removeAttribute("n2-process");
		var results = $htmlString;
		if(process > "")                 
		{
			var key = "";// what do we set this to?
			results = N2O.DATAProcess(process,key,results,$host);
			return document.createDocumentFragment();
		}
		else
		{
			return document.createRange().createContextualFragment(results);
		}
	},
	
	DATAProcess: function(process, key, results, $host)
	{
		var proc_arr = process.split(",");
		for(var i in proc_arr)
		{
			var setup = proc_arr[i].match(/([a-z0-9_-]+)([\[\{].*)?/);
			var context = setup[2] !==undefined?(new Function('return ' + setup[2] + ';'))():{};
			
			if(N2O[setup[1]] !== undefined)
			{
				results = N2O[setup[1]].apply(context,[key, results, $host]);
			}
			else if(window[setup[1]] !== undefined)
			{
				results = window[setup[1]].apply(context,[key, results, $host]);
			}
		}
		return results;
	},
	
	set: function(key, value)
	{
		N2O.env[key] = value;
	},
	
	get: function(key)
	{
		return N2O.env[key];
	},
	
	getLoader: function(obj)
	{
		if(!obj.parentNode)
			return null;
		return (!obj.reload)?N2O.getLoader(obj.parentNode):obj;
	},
	
	reload: function(obj)
	{
		N2O.getLoader(obj).reload();
	},
	
	getData: function(obj)
	{
		if(!obj.parentNode)
			return null;
		return (!obj.N2O_data)?N2O.getData(obj.parentNode):obj.N2O_data;
	},
	
	getKey: function(obj)
	{
		if(!obj.parentNode)
			return null;
		return (!obj.N2O_key)?N2O.getKey(obj.parentNode):obj.N2O_key;
	}
};

N2O.json = function(key, data, host){
	return JSON.parse(data);
};
N2O.justonce = function(key, data, host){
	for (let i in data) return [data[i]];
}; 

N2O.getPath = function(path, context)
{
	if(typeof path == "string")
	{
		path = path.split(".");
	}
	if(path.length>0)
	{
		return N2O.getPath(path, context[path.shift()]);
	}
	else
	{
		return context;
	}
}

N2O.template = function(key, data, host)
{
	host.N2O_data = data;
	host.N2O_key = key;
	
	var localdata = data;
	// we have a value assignation
	var value = host.getAttribute("n2-value");
	if(value !== null)
	{
		host.appendChild(N2O.HTMLize(host, (value>""?data[value]:data)));
		//return host;
	}
	
	if(host.getAttribute("n2-key") !== null)
	{
		host.appendChild(N2O.HTMLize(host, key));
	}
	
	// we have a pack/iterator
	var path = host.getAttribute("n2-unpack");
	if(path !== null)
	{
		if(path>"")
		{
			try{
				localdata = N2O.getPath(path, localdata);
			} catch {
				return;
			}
		}
		
		var process = host.getAttribute("n2-process");
		if(process > "")
		{
			localdata = N2O.DATAProcess(process, key, localdata, host);
		}
		
		var fragment = document.createDocumentFragment();
		for(key in localdata)
		{
			var lhost = host.cloneNode(true);
			for(elm of lhost.children)
			{
				fragment.appendChild(N2O.template(key, localdata[key], elm));       
			}
		}
		host.innerHTML = "";
		host.appendChild(fragment);
		return host;
	}
	else
	{
		for(elm of host.children)
		{
			//key 
			N2O.template(key, localdata, elm);
		}
		return host;
	}
}


if (document.readyState === "complete" 
     || document.readyState === "loaded" 
     || document.readyState === "interactive")
	N2O.processHTML(document.body);
else
	window.addEventListener("DOMContentLoaded", ()=>{N2O.processHTML(document.body);});
