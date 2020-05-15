// ------------------------------------INIT-------------------------------------------
const express 	= require('express')
const app 		= express()
var mongodb 	= require('mongodb');
var session 	= require('express-session')
var bcrypt 		= require('bcryptjs');


const {
	MongoClient,
	ObjectID
} = require('mongodb');


app.use(express.static('public'));


// -----------------------------------FIN  INIT-------------------------------------------

// ----------------------------------- GESTION DES FICHIERS ET IMAGES -----------------------------------


// PERMET DE STOCKER APP ANGULARJS SUR UN SERVER NODE
// app.use(express.static('public'));


// distribue les images accessibles
app.use(express.static('uploads'));

// §§resize
const sharp = require('sharp');
var fs = require('fs'); 

// CODE UPLOAD IMAGES
var multer  = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname+ '-' + Date.now()+'.jpg')
    }
});
var upload = multer({ storage: storage });

const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({
	extended: true,
	limit: '50mb'
}));

// create application/json parser
const jsonParser = bodyParser.json()

app.use(bodyParser.json({
	limit: '50mb',
	inflate: true,
	strict: false
}));


app.post('/images', upload.single('file'), function (req, res, next) {
		console.log(req.file)
		
		
	   sharp(req.file.path).resize(200,200).toBuffer(function(err, buffer) {
			fs.writeFile(req.file.path, buffer, function(e) {
			});
		});
	   res.send(req.file.filename);
})

// ----------------------------------- FIN GESTION DES FICHIERS ET IMAGES -----------------------------------








// -----------------------------------POOL CONNEXION DATABASE -------------------------------------------


var db;
// var url = "mongodb://localhost:27017/sbadmin"
var url = "mongodb+srv://jose:windsurf@cluster0-6kmcn.azure.mongodb.net/sbadmin?retryWrites=true&w=majority";

MongoClient.connect(url, function(err, client) {
	if (err) {
		console.log(err);
		res.send(err);
	}else{
		console.log("Connecte !!");
		db = client.db('sbadmin');	
	}
});
// -----------------------------------FIN CONNEXION DATABASE-------------------------------------------	








// ----------------------------------- use sessions for tracking logins -------------------------------------------
app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));
var sess = {};

const cors = require('cors');
app.use(require('cors')({
  origin: function (origin, callback) {
    callback(null, origin);
  },
  credentials: true
}));
// ----------------------------------- FIN use sessions for tracking logins -------------------------------------------






// ----------------------------------- MONGODB AUTH USER  -------------------------------------------
app.post('/getAuth', function(req, res) {
		
		console.log('je passe dans getAuth');
		console.log(req.body);
		
		// RECHERCHE DU USER SUR MONGODB
		var identifier = req.body;
		
		db.collection('users')
		.findOne({"email":identifier.email}, function(findErr, result) {
			
			if (findErr) res.status(403).send({errorCode:"403"});
			
			if(!result){
				res.status(403).send({errorCode:"403"})
			}else{
					
				    if(bcrypt.compareSync(identifier.password, result.password)) {
					 // Passwords match
					 
						console.log("reqsessionId ; "+req.sessionID);
						
						// INIT DE LA SESSION DU USER
						sess[req.sessionID] 		= req.session;
						sess[req.sessionID].user	= result; 
						console.log(sess[req.sessionID].user);
						
						// ENVOI DES VARIABLES DU USER AU FRONT END  ( A VIRER PLUS TARD)
						// res.send(result);
						
						res.send({"statut":"logge"});
					 
					} else {
					 // Passwords don't match
					 console.log("Passwords don't match");
					 	res.status(403).send({errorCode:"403"})
					}
			}

		});

})

// Permet de savoir si la session est anonyme ou quelqu'un de loggé , au cas l'utilisateur clique sur F5 , on relit cette fonction, puis on dit si cest un anonyme ou pas.
app.get('/getActualSession', function(req, res) {
	 
	 console.log("reqsessionId ; "+req.sessionID);
	 
	 if(sess[req.sessionID]){
		  console.log("utilisateur déjà identifié");
		 res.send(sess[req.sessionID].user)
		 
	 }else{
		 console.log("utilisateur anonyme");
		 res.status(403).send({errorCode:"403"})
	 }

})

app.get('/logout', function(req, res) {
	 
	 delete sess[req.sessionID];
	 console.log('delogge');

})


// Permet de savoir si la session est anonyme ou quelqu'un de loggé , au cas l'utilisateur clique sur F5 , on relit cette fonction, puis on dit si cest un anonyme ou pas.
app.get('/getActualSession', function(req, res) {
	 
	 console.log("reqsessionId ; "+req.sessionID);
	 
	 if(sess[req.sessionID]){
		  console.log("utilisateur déjà identifié");
		 res.send(sess[req.sessionID].user)
		 
	 }else{
		 console.log("utilisateur anonyme");
		 res.status(403).send({errorCode:"403"})
	 }

})

// -----------------------------------FIN AUTH USER-------------------------------------------




// -----------------------------------PERMISSION CONTROL RETURN TRUE OR FALSE-------------------------------------------

function permission_valid(permission,req){
	
	if (sess[req.sessionID] ){
		return sess[req.sessionID].user.permissions.includes(permission);
	}else{
		return false;
	}
	
}

// Vérifie si un user tente de updater lui même
function himself_valid(user,req){
	
	if (sess[req.sessionID].user.email == user.email ){
		return true;
	}else{
		return false;
	}
	
}

// -----------------------------------FIN  CONTROL RETURN TRUE OR FALSE-------------------------------------------



// ---------------------------------- USERS CRUD -------------------------------------------
app.get('/getUser', function(req, res) {
	
	
	
		var identifiant = req.param('id');

		var ObjectId = require('mongodb').ObjectID; //working
		var idObj = ObjectId(identifiant); //working
		
		
		db.collection('users')
		.findOne({"_id": idObj}, function(findErr, result) {
			if (findErr) throw findErr;
			res.send(result);
			
		});
	
})

app.post('/updateUser', function(req, res) {
	
		// CONTROLE DE LA PERMISSION
		// if(!permission_valid("UPDATE_USER",req)){
			// console.log(' NO RIGHTS');
			// res.status(403).send({errorCode:"403"})
			// return ;
		// }
		
		// RECUPERATION DU user
		var user = req.body;
		console.log(req.body);
		
		user._id  = sess[req.sessionID].user._id;
		user.password = sess[req.sessionID].user.password;
		user.last_update = new Date();
		
		// MAJ DE LA SESSION
		sess[req.sessionID].user = user;
		
		
		// CONTROLE QUI EST LE FOOTBALLEUR QUI TENTE D UPDATER, IL FAUT QUE CE SOIT LUI MEME
		// if(sess[req.sessionID].user.role == "user"){ 
			// if(!himself_valid(user,req)){
				// console.log(' HES NOT THE GOOD ONE TRYING TO UPDATE');
				// res.status(403).send({errorCode:"403"})
				// return ;
			// }
		// }
		
		// CONTROLE SI LE user APPARTIENT AU ADMINISTRATOR EN TRAIN DE UPDATER
		// if(sess[req.sessionID].user.role == "administrator"){ 
			
			
			 // if(!himself_valid(user,req)){ // SI il update lui lui meme pas la peine de faire ça
				
				// var fs = String(user._id); // ID DU user

			
				
			
				// if(!isPresent(fs,req)){
					// console.log(' user DOESNT BELONG TO ADMINSITRATOR');
					// res.status(403).send({errorCode:"403"})
					// return ;
				// }
			 // }
			
		// }


		var ObjectId = require('mongodb').ObjectID; //working
		var idObj = ObjectId(user._id); //working
		delete user._id;
		
		try {
			db.collection('users')
			.replaceOne({'_id': idObj}, user)	
			res.sendStatus(200);
			
		} catch (e) {
			res.sendStatus(400);
			console.log(e);
		}
	
})

function isPresent(fs,req){
		
			console.log('Jepasse dans la fonction is_present');
			
			var present ;
			
			if(!sess[req.sessionID].user.selectionnes){
				console.log('admin na pas de selectionnes');
				present = false;
			}
			
			if(sess[req.sessionID].user.selectionnes){
				sess[req.sessionID].user.selectionnes.forEach(function(obj){
					console.log(fs);
					console.log(String(obj._id));
					if(fs == String(obj._id)){ // SI ID DU FB == ID PRESENT DANS SELECTIONNES
						console.log('il est bien present dans le tableau des selectionnes');
						present = true;
					}
				})
			}
			
			
			return present;
		
	}

app.post('/insertUser', function(req, res) {
		
		
		console.log(req.body);
		
		// CONTROLE DE LA PERMISSION
		// if(!permission_valid("INSERT_USER",req)){
			// console.log(' NO RIGHTS');
			// res.status(403).send({errorCode:"403"})
			// return ;
		// }
		

		var user = req.body;
		
		// HASCHAGE BCRYPT DU PASSWORD
		var hash = bcrypt.hashSync(user.password, 10);
		user.password = hash;
		

		try {
			db.collection('users').insertOne(user)
			console.log('ajouté un user');	
			res.sendStatus(200);
		} catch (e) {
			console.log(e);
			res.sendStatus(400);
		}
	
})

app.post('/insertUserFast', function(req, res) {
		
		var user = req.body;
		console.log(req.body);
		
		if(!user.prenom || !user.pseudo || !user.email|| !user.password|| !user.role){
			 res.send({"problem":"Le formulaire est encore incomplet (serveur)"});
			return;
		}
		
		user.img = "defaut.png";
		user.date_embauche = new Date();
		user.date_naissance = new Date();

		
		user.permissions = create_permissions(user);
		
		// HASCHAGE BCRYPT DU PASSWORD
		var hash = bcrypt.hashSync(user.password, 10);
		user.password = hash;

		// CONTROLE DE DOUBLONS PSEUDO
		db.collection('users')
		.findOne({"pseudo":user.pseudo}, function(findErr, result) {

			
			if(!result){
				
					// CONTROLE DE DOUBLONS EMAIL
					db.collection('users')
					.findOne({"email":user.email}, function(findErr, result) {

						
						if(!result){
							execute();
							
						}else{
							console.log('ya un doublon email')
							 res.send({"problem":"doublonEmail"});
							return ;
						}

					});
			
			}else{
				console.log('ya un doublon pseudo')
				res.send({"problem":"doublonPseudo"});
				return ;
			}

		});

		// INSERTION
		function execute(){
			db.collection('users').insertOne(user, function (error, response) {
				if(error) {
					
					console.log('Error occurred while inserting');
				  
				} else {
				  
				   res.send(response);
			
			}})
			
			console.log('ajouté un joueur');	
		}

})







function create_permissions(user){

	var permissions;
	
	switch (user.role){
		case "watcher":
			permissions  = 
			["READ_DASHBOARD","READ_USERS"]
			break;
		case "user":
			permissions  = 
			[
			"READ_DASHBOARD",
			"CREATE_USER","READ_USER","UPDATE_USER","DELETE_USER","READ_USERS"
			]
			break;
		case "administrator":
			permissions  = 
			[
			"READ_DASHBOARD",
			"CREATE_USER","READ_USER","UPDATE_USER","DELETE_USER","READ_USERS"
			]
			break;
		case "admin":
			permissions  = 
			[
			"READ_DASHBOARD",
			"CREATE_USER","READ_USER","UPDATE_USER","DELETE_USER","READ_USERS"
			]
			break;
		default:
		permissions  = 
			["READ_DASHBOARD","READ_USERS"]
				
	}
	
	return permissions;

}

app.post('/deleteUser', function(req, res) {
		
		// CONTROLE DE LA PERMISSION
		if(!permission_valid("DELETE_USER",req)){
			console.log(' NO RIGHTS');
			res.status(403).send({errorCode:"403"})
			return ;
		}
		
		var user = req.body;
		
		// CONTROLE QUI EST LE FOOTBALLEUR QUI TENTE D UPDATER, IL FAUT QUE CE SOIT LUI MEME
		if(sess[req.sessionID].user.role == "user"){ 
			if(!himself_valid(user,req)){
				console.log(' HES NOT THE GOOD ONE TRYING TO UPDATE');
				res.status(403).send({errorCode:"403"})
				return ;
			}
		}
		
		// CONTROLE SI LE user APPARTIENT AU SELECTIONNEUR EN TRAIN DE UPDATER
		if(sess[req.sessionID].user.role == "administrator"){ 
			
			
			 if(!himself_valid(user,req)){ // SI il update lui lui meme pas la peine de faire ça
				
				var fs = String(user._id); // ID DU user

			
				
				// console.log(present);
				if(!isPresent(fs,req)){
					console.log(' user DOESNT BELONG TO ADMIn');
					res.status(403).send({errorCode:"403"})
					return ;
				}
			 }
			
		}

		
		
		
		
		
		
		
		// delete_user_from_all(fb);
		
	
		var ObjectId = require('mongodb').ObjectID; //working
		var idObj = ObjectId(user._id); //working
		try {
			db.collection('users').deleteOne( { "_id" : idObj } );
			console.log('supprimé un user');	
			// delete_user_from_all(user);
			res.sendStatus(200);
		} catch (e) {
			console.log(e);
			res.sendStatus(400);
		}
	
})



app.post('/getUsers', function(req, res) {

	
	// ------------------------------- AVEC FILTRES : 
	// if(!req.body.filtres){
		
		
		// db.collection('users')
		// .find()
		// .skip(req.body.debut)
		// .sort( { [req.body.sort] : -1 })
		// .limit(req.body.nombre)
		// .toArray(function(err, docs) {
			// if (err) throw err;
			// res.send(docs);
			
		// });
	// }else{

		// db.collection('users')
			// .find(req.body.filtres)
			// .skip(req.body.debut)
			// .sort( { [req.body.sort] : -1 })
			// .limit(req.body.nombre)
			// .toArray(function(err, docs) {
				// if (err) throw err;
				// console.log(err);
				// res.send(docs);	
			// });
	// }
	
	db.collection('users')
		.find()
		.toArray(function(err, docs) {
			if (err) throw err;
			console.log(err);
			res.send(docs);	
		});
	
	
	
})

app.get('/searchUsers', function(req, res) {
	
	var pseudoSearch = req.param('pseudo');
	
	db.collection('users')
	.find({pseudo: {"$regex": pseudoSearch, "$options": "i"}})
	.toArray(function(err, docs) {
		if (err) throw err;
		console.log(docs);
		res.send(docs);
		
	});		
})




app.get('/getUsersCount', function(req, res) {

	db.collection('users')
	.countDocuments().then((count) => {
		res.send({"result":count});
	});

	
})


// -----------------------------------SOlutions CRUD -------------------------------------------
// GET SOLUTIONS
app.post('/getSolutions', function(req, res, next) {
	MongoClient.connect(url, (err, client) => {

		var db = client.db('solutions');
		
		db.collection('solutions').find( {} ).toArray(function(err, docs) {
			if (err) throw err;
			res.send(docs);
			client.close();

		});
	});
})

app.get('/getSolution', function(req, res, next) {
	
	// PARAMETRES
	identifiant = req.param('id');

	MongoClient.connect(url, (err, client) => {
		
		
		
		var ObjectId = require('mongodb').ObjectID; //working
		var idObj = ObjectId(identifiant); //working
		
		db.collection('solutions').findOne({
			"_id": idObj
		}, function(findErr, result) {
			if (findErr) throw findErr;
			res.send(result);
			client.close();
		});
	});
})


app.post('/updateSolution', function(req, res, next) {
	
	mySolution = req.body;
	
	MongoClient.connect(url, {
		useNewUrlParser: true
	}, (err, client) => {
		
		if (err) throw err;
		

		var ObjectId = require('mongodb').ObjectID; //working
		var idObj = ObjectId(mySolution._id); //working

		delete mySolution._id;
		try {
			db.collection('solutions').replaceOne({
				'_id': idObj
			}, mySolution)
			client.close();
		} catch (e) {
			console.log(e);
		}
	})
})

app.post('/insertSolution', function(req, res, next) {
	solution = req.body;
	MongoClient.connect(url, (err, client) => {

		try {
			db.collection('clubs').insertOne(solution);
			client.close();
		} catch (e) {
			console.log(e);
		}
	});
})

app.get('/getSolutionsCount', function(req, res, next) {


	MongoClient.connect(url, (err, client) => {
	
		db.collection('clubs').countDocuments().then((count) => {
			res.send({"result":count});
			client.close();
		});

	});
})


app.post('/solveSolution', function(req, res, next) {
	
	// PARAMETRES
	solution = req.body;
	
	var solver = require("javascript-lp-solver"),
	  results,
	  model = {
		"optimize": "capacity",
		"opType": "max",
		"constraints": {
			"plane": {"max": 44},
			"person": {"max": 512},
			"cost": {"max": 300000}
		},
		"variables": {
			"brit": {
				"capacity": 20000,
				"plane": 1,
				"person": 8,
				"cost": 5000
			},
			"yank": {
				"capacity": 30000,
				"plane": 1,
				"person": 16,
				"cost": 9000
			}
		},
	};
	 
	results = solver.Solve(model);
	console.log(results);
	res.send(results );

})


// -----------------------------------Messages CRUD -------------------------------------------


app.post('/insertMessage', function(req, res, next) {
	
	var message = req.body;
	console.log(message);


		try {
			db.collection('messages').insertOne(message);
			res.sendStatus(200);
		} catch (e) {
			console.log(e);
			res.sendStatus(400);
		}

})


app.post('/getUserMessages', function(req, res, next) {

		
		
		var data = req.body;
		console.log(data);
		var id = data._id;
		
		console.log(id);

		// var ObjectId = require('mongodb').ObjectID; 
		// var idObj = ObjectId(id); 
		
		
		db.collection('messages')
		.find({"destinataire_id":id})
		.toArray(function(err, docs) {
			if (err) throw err;
			console.log(err);
			res.send(docs);	
		});
		
		
		
	

	
})



app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});


// app.listen(80, function() {
// 	console.log('Example app listening on port 80!')
// })
