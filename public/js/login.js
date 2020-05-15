function login(){


	
	var data = $('#myform').serializeArray().reduce(function(obj, item) {
		obj[item.name] = item.value;
		return obj;
	}, {});
	
	console.log(data);
	
	$.ajax({
		type: "POST",
		url: "/getAuth",
		headers: { 
				 'Content-Type': 'application/json',
				Accept: 'application/json'
			},
		data: JSON.stringify(data),
		contentType: 'application/json',
		success: function(data) {
			 // alert(data);
			 console.log(data);
			  window.location.replace("/index.html");	 
		}
	});
	
	
}