//Implémentation du nouveau console.log
//Ajout de la date au début
//Modification de la couleur pour l'invite de commande windows
//Pour cela il suffit d'ajouter du code ANSI
//Tutoriel >> http://www.iut-arles.up.univ-mrs.fr/eremy/Aide/SeqEscANSI.html
//Montre un exemple d'utilisation d'ANSI >> http://www.rgagnon.com/javadetails/java-0047.html 

var oldLog=console.log; //je sauvegarde dans une variable l'ancien console.log pour pouvoir le réutiliser
var date=new Date();
date=date.getDate()+":"+date.getMonth()+":"+date.getFullYear()+" | "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();

var ANSI_NORMAL = "\u001b[0m";
var ANSI_VERT = "\u001b[32m";
var ANSI_ROUGE = "\u001b[31m";
var ANSI_JAUNE = "\u001b[33m";
var ANSI_BLEUE = "\u001b[36m";
var ANSI_GRRIS = "\u001b[37m";
var ANSI_POURPRE_VIF= "\u001b[35m";

console.log=function(/* args */){
	var args=Array.prototype.slice.call(arguments); //on simule slice et on définit le contexte d'execution pour un tableau
	args.unshift(ANSI_BLEUE+" "+date+" "+ANSI_VERT); //unshit permet d'ajouter un élément au début d'un tableau (ajout de la date)
	args.push(ANSI_NORMAL);
	oldLog.apply(console, args); //appelle l'ancienne fonction, en substituant l'objet oldLog avec la valeur de console, et les arguments
};

//Ecrire le module pour nodejs (environnement windows)
module.exports = console;