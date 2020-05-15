function record() {
	var data = $("#myform")
		.serializeArray()
		.reduce(function (obj, item) {
			obj[item.name] = item.value
			return obj
		}, {})

	console.log(data)

	$.ajax({
		type: "POST",
		url: "/insertUser",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},

		data: JSON.stringify(data),
		contentType: "application/json",
		success: function (data) {
			alert("Utilisateur enregistré")
			window.location.replace("/index.html")
		},
	})
}
