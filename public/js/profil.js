

function updateUser(){

	var data = $('#myform').serializeArray().reduce(function(obj, item) {
			obj[item.name] = item.value;
			return obj;
		}, {});
		
		// inclure l'image
		data.img = user.img;
		
		// inclure about 
		data.about = $('textarea#about').val();
		
		$.ajax({
			type: "POST",
			url: "/updateUser",
			headers: { 
					 'Content-Type': 'application/json',
					Accept: 'application/json'
				},
		
			data: JSON.stringify(data),
			contentType: 'application/json',
			success: function(data) {
				
				console.log(data);
				 alert('Utilisateur enregistré');
				
				 
			}
		});

}	



// UPLOADS IMAGES ET FICHIERS

$("#file-upload").on('change', function(){
		readURL(this);
	});
	
function readURL(input) {
            if (input.files && input.files[0]) {
                var reader = new FileReader();

                reader.onload = function (e) {
                    $('#avatar')
                        .attr('src', e.target.result)
                        .width(150)
                        .height(200);
                };

                reader.readAsDataURL(input.files[0]);
				
				
				
					var fd = new FormData();
				//Take the first selected file
				fd.append("file",input.files[0]);
				
                //ajax post here
                 $.ajax({
                     url: '/images',
                     data: fd,
					 headers: {'Content-Type': undefined },
					type: 'POST',
					processData: false,
					contentType: false
                  }).done(function (data) {
					// Nom d'image affectée par le serveur
					console.log(data);
					user.img = data;
					
                  }).fail(function(jqXHR, textStatus, errorThrown){

                  });
            }
        }
		

		
		
 // $(document).ready(function() { });
 