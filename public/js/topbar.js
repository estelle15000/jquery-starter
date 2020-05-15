$(document).ready(function () {
	// Toggle the side navigation
	$("#sidebarToggle, #sidebarToggleTop").on("click", function (e) {
		$("body").toggleClass("sidebar-toggled")
		$(".sidebar").toggleClass("toggled")
		if ($(".sidebar").hasClass("toggled")) {
			$(".sidebar .collapse").collapse("hide")
		}
	})

	$.ajax({
		type: "GET",
		url: "/getActualSession",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		contentType: "application/json",
		error: function (request, error) {
			$("#ct").hide()
			$(".img-profile").attr("src", "img/defaut.png").width(50).height(50)
			$(".submenu").hide()

			$("#BTnom").append("Anonyme")

			user = {}
			user.pseudo = "Anonyme"

			// alert(" Can't do because not logged " );
		},
		success: function (data) {
			user = data
			$("#_id").val(user._id)
			$("#prenom").val(user.prenom)
			$("#nom").val(user.nom)
			$("#email").val(user.email)
			$("#companie").val(user.companie)
			$("#website").val(user.website)
			$("#adresse").val(user.adresse)
			$("#pseudo").val(user.pseudo)
			$("textarea#about").val(user.about)
			$("#password").val(user.password)

			$("#avatar").attr("src", user.img).width(150).height(200)

			$(".img-profile").attr("src", user.img).width(50).height(50)

			getUserMessages(user._id)
		},
	})
})

function getUserMessages(id) {
	var data = { _id: id }
	$.ajax({
		type: "POST",
		url: "/getUserMessages",
		data: JSON.stringify(data),
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		contentType: "application/json",
		error: function (request, error) {
			alert(" Can't do  ")
		},
		success: function (data) {
			console.log(data)
		},
	})
}

function logout() {
	alert("bye")
}
