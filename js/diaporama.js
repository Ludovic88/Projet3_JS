/*
OBJET DIAPORAMA
*/


var Slider = function(slide){
    //  Definir le slide
    this.indexSlideActive = 0;
    this.slider = slide;
    this.slides = slide.querySelector(".slides").children;  
    this.slideCount = this.slides.length;
    this.nextButton = this.slider.querySelector(".next");   
    this.prevButton = this.slider.querySelector(".prev"); 

    //  Methode pour definir le prochain slide comme slide actif
    this.indexPlus = function (){
        this.indexSlideActive++;
        if (this.indexSlideActive > this.slideCount - 1) {
            this.indexSlideActive = 0;
        }
    }

    //  Methode pour definir le précédent slide comme slide actif
	this.indexMinus = function (){
        this.indexSlideActive--;
        if (this.indexSlideActive < 0) {
            this.indexSlideActive = this.slideCount - 1;
        }
    }

    // Methode pour afficher le slide visible
    this.activeSlide = function () {
    	for(var i = 0;i < this.slideCount; i++){
    		this.slides[i].classList.remove("active");
    	}
    	this.slides[this.indexSlideActive].classList.add("active");
    }

    // Methode pour gerer les ecouteurs d'évenements
    this.initButtons = function () {
        this.nextButton.addEventListener("click", this.nextSlide.bind(this));
        this.prevButton.addEventListener("click", this.prevSlide.bind(this));
        document.querySelector('body').addEventListener("keydown", this.onKeyDown.bind(this));
    }

    //  Methode pour demander le  prochain slide 
    this.nextSlide =  function () {
        this.indexPlus();
        this.activeSlide();
    }

    //  Methode pour demander le slide precedent
    this.prevSlide = function(){
    	this.indexMinus();
        this.activeSlide();
    }

    //  Methode pour gerer les fleches du clavier comme suivant et precedent slide
    this.onKeyDown =  function (e) {
             if (e.keyCode === 39) {
                this.nextSlide();
            } 
            else if (e.keyCode === 37) {
                this.prevSlide();
            }
        }

    //  Methode pour lancer le slide
    this.play = function(){
    	this.interval = 0;
    	this.interval = setInterval(this.nextSlide.bind(this), 5000);
    }

    //  Methode pour gerer le pause du slide
    this.pause = function(){
    	clearInterval(this.interval);
    }

    //  Methode pour initialiser le slide
    this.init = function(){
    	this.initButtons();
    	this.play();
    	this.slider.addEventListener("mouseover", this.pause.bind(this));
    	this.slider.addEventListener("mouseleave", this.play.bind(this));
    }
    //  lance la methode init au démarage
    this.init();
}


var sliderElt = document.getElementById("slider");
var theSlider = new Slider(sliderElt);

