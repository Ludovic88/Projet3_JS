/*
OBJET SIGNATURE
*/


function Signature(container, onConfirm){
    this.container = container;
    this.onConfirm = onConfirm;
    this.isDrawing = false;

    //  Methode qui cree la div canvas et ses elements et gere les ecouteurs d'evenements liees
    this.init = function(){ 
        //  cree les elements et defini les attributs
        this.canvas = document.createElement("canvas");
        this.canvas.width = 259;
        this.canvas.height = 154;
        this.context = this.canvas.getContext("2d");
        this.context.fillStyle = "#fff";
        this.context.strokeStyle = "#444";
        this.context.lineWidth = 1.5;
        this.context.lineCap = "round";
        this.canvas.setAttribute("class", "canvas_sign");
        this.btnConfirmerCanvasElt = document.createElement("button");
        this.btnConfirmerCanvasElt.classList.add("confirmer_sign", "hidden");
        this.btnConfirmerCanvasElt.textContent = "confirmer";
        this.btnEffacerCanvasElt = document.createElement("button");
        this.btnEffacerCanvasElt.textContent = "Confirmer";
        this.btnEffacerCanvasElt.classList.add("effacer_sign");
        this.btnEffacerCanvasElt.textContent = "Effacer";

        //  Insere les elements dans le container
        this.container.appendChild(this.canvas);
        this.container.appendChild(this.btnConfirmerCanvasElt);
        this.container.appendChild(this.btnEffacerCanvasElt);

        //  Appelle des ecouteur d'évenement
        this.btnConfirmerCanvasElt.addEventListener("click", this.onConfirm);
        this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
        this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
        this.canvas.addEventListener("mouseup", this.StopDrawing.bind(this));
        this.canvas.addEventListener("mouseleave", this.StopDrawing.bind(this));
        this.canvas.addEventListener("touchstart", this.onMouseDown.bind(this));
        this.canvas.addEventListener("touchmove", this.onMouseMove.bind(this));
        this.canvas.addEventListener("touchend", this.StopDrawing.bind(this));
        this.btnEffacerCanvasElt.addEventListener("click", this.clearSignature.bind(this));
      }

    //  Methode qui retourne les coordonées de la souris
    this.getCoords = function(event){
        var x, y;

        if (event.changedTouches && event.changedTouches[0]) { // gere le tactile 
            var offsety = this.canvas.offsetTop || 0;
            var offsetx = this.canvas.offsetLeft || 0;

            x = event.changedTouches[0].pageX - offsetx;
            y = event.changedTouches[0].pageY - offsety;
        } else if (event.layerX || 0 === event.layerX) {   // gere la souris navigateur type google
            x = event.layerX;
            y = event.layerY;
        } else if (event.offsetX || 0 === event.offsetX) { // autre navigateur opera
            x = event.offsetX;
            y = event.offsetY;
        }

        return {
        x : x, y : y
        };
    }

    //  Methode qui dessine une ligne d'un point de dpart a un point d'arriver
    this.drawLine = function(depart, finish){
        this.context.beginPath();
        this.context.moveTo(depart.x, depart.y);
        this.context.lineTo(finish.x, finish.y);
        this.context.stroke();
        this.context.closePath();
    }

    //  Methode qui donne l'odre de dessiner stock les coordones de la souris du point de depart et affiche le bouton confirmer
    this.onMouseDown = function(event){
        this.isDrawing = true;
        this.coords = this.getCoords(event); //stock coord mouse
        this.btnConfirmerCanvasElt.classList.remove("hidden");
        event.preventDefault();
    }

    //  Methode qui recupere le point de destination et apelle la fuction dessiner avec en parametre le poin de depart et d arriver
    this.onMouseMove = function(event){
        if(this.isDrawing){
            var coords = this.getCoords(event); //stock le point de destination
            this.drawLine(this.coords, coords); //dessine la trajectoire
            this.coords = coords; //stock le nouveau poin de depart
            event.preventDefault();
        } 
    }

    //  Methode qui arrete le desssin
    this.StopDrawing = function(){
        this.isDrawing = false;
    }

    //  Methode qui efface tout signature dans le canvas
    this.clearSignature = function(){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.btnConfirmerCanvasElt.classList.add("hidden");
    }

    this.init();
}