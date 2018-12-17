/*
OBJET VELO
*/


var VeloMap = function(params){
	//	Methode qui cree la map
	this.createMap = function(){
		var mapElt = this.createElementWithClass("div", "map");
		params.mapContainer.appendChild(mapElt);

	    this.googleMap = new google.maps.Map(mapElt, {
		    zoom: params.zoom,
		    center: params.coords
	    });
	}

	//	Methode qui recupere les stations d'une ville
	this.getStations = function(){
		return new Promise(function(resolve, reject){
			ajaxGet("https://api.jcdecaux.com/vls/v1/stations?contract=" + params.city + "&apiKey=e08c4e7793b84675f7add18402b21232176f90d9", function(data){
				resolve(JSON.parse(data))
			});
		});
	}

	//	Methode pour cree un element avec une class
	this.createElementWithClass = function(elt, className){
		var element = document.createElement(elt);
		element.setAttribute("class", className);
		return element;
	}

	//	Methode pour cree un element avec du texte
	this.createElementWithText = function(elt, text){
		var element = document.createElement(elt);
		element.textContent = text;
		return element;
	}

	//	Methode pour cree un element avec une class et du texte
	this.createElementWithClassAndTexte = function(elt, className, text){
		var element = document.createElement(elt);
		element.setAttribute("class", className);
		element.textContent = text;
		return element;
	}

	//	Methode qui cree des elements dans le DOM pour interagir avec la map
	this.createInfos = function(){
		//	cree la div conteneur infos + canvas
		this.divInfosCanvasElt = this.createElementWithClass("div", "infos_canvas");
		params.mapContainer.appendChild(this.divInfosCanvasElt);

		//	cree la div infos
		this.divInfosElt = this.createElementWithClass("div", "infos_station");
		this.divInfosCanvasElt.appendChild(this.divInfosElt);

		//	contenu div infos
		this.titreInfosElt = this.createElementWithText("h2", "Détail de la station");
		this.stationNameElt = this.createElementWithClassAndTexte("p", "nom_station", "Séléctionner une station");
		this.etatStationElt = document.createElement("p");
		this.addressStationElt = document.createElement("p");
		this.borneDispoElt = document.createElement("p");
		this.veloDispoElt = document.createElement("p");
		this.btnReserverElt = this.createElementWithClassAndTexte("button", "hidden", "Réserver");

		this.divInfosElt.appendChild(this.titreInfosElt);
		this.divInfosElt.appendChild(this.stationNameElt);
		this.divInfosElt.appendChild(this.etatStationElt);
		this.divInfosElt.appendChild(this.addressStationElt);
		this.divInfosElt.appendChild(this.borneDispoElt);
		this.divInfosElt.appendChild(this.veloDispoElt);
		this.divInfosElt.appendChild(this.btnReserverElt);

		this.createSignature();		//	apelle la fonction qui crée la div canvas

		//	cree la div compteur
		this.divCompteurElt = this.createElementWithClass("div", "div_compteur");
		document.getElementById("carte_interactive").appendChild(this.divCompteurElt);

		//	contenu div compteur
		this.paraCompteurElt = this.createElementWithClass("p", "para_compteur");
		this.btnAnnulerResaElt = this.createElementWithClassAndTexte("button", "annuler_resa", "Annuler");

		
	    this.btnAnnulerResaElt.addEventListener('click', this.onClickCancel.bind(this));	//	Gere le click sur annuler

		this.divCompteurElt.appendChild(this.paraCompteurElt);
		this.divCompteurElt.appendChild(this.btnAnnulerResaElt);	
	}

	//	Methode qui recupere et gere le click sur les markers
	this.addStationsMarkers = function(stations){
		//	Cree des variable pour les marqueurs suivant l'etat de la station
		var iconStationValid = new google.maps.MarkerImage('images/green-marker.png'); 
		var iconStationFermer = new google.maps.MarkerImage('images/black-marker.png');	
		var iconStationVide = new google.maps.MarkerImage('images/red-marker.png');	
		var iconBorneVide = new google.maps.MarkerImage('images/orange-marker.png');

		//	Remet dans le contexte le this et la function addIfos pour les appeller dans le forEach
 		var ctx =  this; 	
 		var showInfos = this.showInfos.bind(this);	

 		//	cree un tableau pour le regroupement avec markerclusterer
 		var markers = [];

 		//	AFICHE LES STATION SUR LA MAP
		stations.forEach(function(station){
			//	RECUPERE LES POSITIONS DES STAIONS
			var marker = new google.maps.Marker ({
				position: {lat: station.position.lat, lng: station.position.lng},
				map: ctx.googleMap,
				title: station.name,
				icon: iconStationValid,
			});

			//	GERE ICON STATION 
			if (station.status === "CLOSED") {
				marker.setIcon(iconStationFermer);
			} else if (station.available_bikes === 0) {
				marker.setIcon(iconStationVide);
			} else if (station.available_bike_stands === 0) {
				marker.setIcon(iconBorneVide);
			}

			//	GERE LE CLICK SUR UNE STATION
			marker.addListener("click", function(){ //cree un fuction
				//	reinitialise a chaque clique
				showInfos();
				//	Rempli les infos par defaut
				ctx.stationNameElt.textContent = station.name;	
				ctx.etatStationElt.textContent = "Ouvert";
				ctx.addressStationElt.textContent = ("Adresse : " + station.address);
				ctx.borneDispoElt.textContent = ("Point(s) d'attache disponible(s) : " + station.available_bike_stands);

				if(station.status === "CLOSED"){	//	gere si la station est fermer
					ctx.etatStationElt.textContent = "Station fermer (";
					ctx.borneDispoElt.textContent = "";
					ctx.veloDispoElt.textContent = "";
					ctx.btnReserverElt.classList.add("hidden");
				} else if(station.available_bikes === 0) {	//	gere si il n'y a pas de velo dispo
					ctx.veloDispoElt.textContent = "pas de velo disponible (";
					ctx.btnReserverElt.classList.add("hidden");
				} else {	//	Affiche et laisse la possibilité de reserver quand des velo sont dispo
					ctx.veloDispoElt.textContent = ("Vélo'v disponible(s) : " + station.available_bikes);
					ctx.btnReserverElt.classList.remove("hidden");
				}	
			});
			markers.push(marker);//	insere les marker dans le tableau
		});
		new MarkerClusterer(this.googleMap, markers,//	apelle la fuction markerclusterer
            {imagePath: 'images/m'});  
	}

	//	Methode qui cree la div canvas et le canvas signature
	this.createSignature = function(){
		this.divCanvasElt = this.createElementWithClass("div", "div_canvas hidden");
		this.divInfosCanvasElt.appendChild(this.divCanvasElt);
		this.titreCanvasElt = this.createElementWithText("h2", "Signer pour valider");
		this.divCanvasElt.appendChild(this.titreCanvasElt);
		this.signature = new Signature(this.divCanvasElt, this.onclickReserver.bind(this));
	}

	//	Methode remplace les infos par le canvas
	this.showCanvas = function(){
		this.divInfosElt.classList.add("hidden");
		this.divCanvasElt.classList.remove("hidden");
	}

	//	Methode qui remplace le canvas par les infos
	this.showInfos = function(){
		this.divInfosElt.classList.remove("hidden");
		this.divCanvasElt.classList.add("hidden");
	}

	//	Methode qui recupere le nom de la station et defini la date de fin du compte a rebours en session pour chaque reservation
	this.saveResa = function(){
		//	stock le nom de la station dans la session
		sessionStorage.setItem("station", this.stationNameElt.textContent);
		//	cree et stock la date de fin du comte a rebour
		var	finishDate = new Date().getTime() + 1200000;
		sessionStorage.setItem("time", finishDate);
	} 

	//	Methode qui gere le compte a rebours d'une reservation
	this.countdown = function(){ 		
		var ctx =  this;	//	remplace le this par ctx pour le recuperer dans la fuction setIntervale
		this.divCompteurElt.classList.add("visible");
	    this.intervalId = setInterval(function() {	//	lance la function a execter toute les secondes
	        var now = new Date();	
	        var diff = Math.floor( (sessionStorage.getItem("time") - now.getTime()) / 1000);
	        if(diff > 0){	//	s'affiche jusaqu a 0
	            var minutes = Math.floor(diff % 3600/60);
	            var seconds = Math.floor(diff % 60);
	            if (minutes < 10) {
	            	minutes = ("0" + minutes);
		        }
		        if (seconds < 10) {
		            seconds = ("0" + seconds);
		        }
	            ctx.paraCompteurElt.textContent = ("Veuillez allez chercher votre vélo a la station " + sessionStorage.getItem("station") + " il vous reste " + minutes + 'm ' + seconds + 's ');  
	        } else { //s'arrete a 0
	        	ctx.clearReservation();
	            ctx.paraCompteurElt.textContent = "Votre réservation a expiré";
	            ctx.btnAnnulerResaElt.classList.add("hidden");
	        }           
	    },1000); 
	}

	//	Methode qui gere la reservation
	this.onclickReserver = function(){		
		this.showInfos();	//appele la function affiche la div infos
		clearInterval(this.intervalId);
		this.saveResa();
		this.countdown();
		this.btnAnnulerResaElt.classList.remove("hidden");
	}

	//	Methode qui efface les reservations
	this.clearReservation = function(){
		clearInterval(this.intervalId);
		sessionStorage.removeItem("time");
		sessionStorage.removeItem("station");
	}

	//	Methode qui gere l'option annuler résèrvation
	this.onClickCancel = function(){
		//stock les elements dans des variables pour les appeler dans la sous fonction setTimeout
		var divCompteurElt = this.divCompteurElt;	
		var paraCompteurElt = this.paraCompteurElt;

		this.clearReservation();
	    this.paraCompteurElt.textContent = "Vous avez annulé votre réservation. Vous pouvez prendre une nouvelle réservation."; 
	    setTimeout(function () {
        divCompteurElt.classList.remove("visible");
        paraCompteurElt.textContent = "";
        }, 5000);  
	}

	//	Methode qui apelle les functions
	this.init = function(){
		this.addStationsMarkers = this.addStationsMarkers.bind(this); 	//raccoucis .bind(this)
		
		this.createMap();
		this.createInfos(); 
		this.getStations()
		.then(this.addStationsMarkers);
		this.btnReserverElt.addEventListener("click", this.showCanvas.bind(this));
		
		if (sessionStorage.getItem("station")) { //recupere la reservation si il y a au lancement de la page en storage
			this.countdown();
		}
	}

	//	Lance init
	this.init();
}


//	Initialise la map de lyon pour l'api googlemap
function initMap(){
	var mapInfosElt = document.createElement("div");
	mapInfosElt.classList.add("mapinfos");
	document.getElementById("carte_interactive").appendChild(mapInfosElt);
	var veloMap = new VeloMap({
		mapContainer: mapInfosElt,
		city: "Lyon",
		coords: {lat: 45.75, lng: 4.85},
		zoom: 13,
	});
}

