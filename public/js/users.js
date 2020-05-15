function getUsers() {
	$.ajax({
		type: "POST",
		url: "/getUsers",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		contentType: "application/json",
		error: function (request, error) {
			alert(" Can't do  ")
		},
		success: function (data) {
			users = data

			$.each(data, function (idx, obj) {
				console.log(obj.img)

				// IMAGE DU USER PAR DEFAUT
				if (!obj.img) {
					obj.img = "img/defaut.png"
				}

				$("#users").append(`
							
							
							
							
							
							<div class="card" style="width:400px">
							  <img class="card-img-top" src="${obj.img}" alt="Card image">
							  <div class="card-body">
								<h4 class="card-title">${obj.nom.toUpperCase()}</h4>
								<p class="card-text">Description ...</p>
								
								
								<button type="button" onclick ="feedPopup('${
									obj._id
								}','${obj.nom.toUpperCase()}')" class=" btn btn-primary float-right" data-toggle="modal" data-target="#exampleModal">
									  Message
									</button>
																	
								
								
								
								
								
							  </div>
							</div>
							
							
							
							
							
							
							
							
						
						`)
			})
		},
	})
}

getUsers()

$(document).on("click", ".open-AddBookDialog", function () {})

function feedPopup(id, nom) {
	$("#nomEnvoi").empty()
	$("#nomEnvoi").append(nom)
	window.selectedMongoDbId = id
}

function envoyerMessage() {
	console.log("envoi")

	var content = $("#myMessage").val()
	console.log(content)
	var data = {
		destinataire_id: window.selectedMongoDbId,
		auteur_id: user._id,
		content: content,
		auteur_pseudo: user.pseudo,
		creation_date: new Date(),
	}
	console.log(data)
	console.log(user)

	$.ajax({
		type: "POST",
		url: "/insertMessage",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},

		data: JSON.stringify(data),
		contentType: "application/json",
		success: function (data) {
			alert("Message envoyé !")
		},
	})
}
