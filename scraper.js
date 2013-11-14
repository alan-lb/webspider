'use strict';
 
/**
 * Web Scraper
 */
 
 //pour mettre en paramètre de la ligne de commande l'URL
 var args = process.argv;
 var siteSource = args[2]; //1er paramètres l'URL
 var motCle = args[3]; //2ème paramètre le mot clé à chercher sur la page
 var interf = args[4]; //3ème paramètre oui ou non pour lancer la page web 

 //pour utiliser les websockets : ajout du module socket.io pour nodejs
 //http://www.atinux.fr/2011/08/28/tutoriel-socket-io-debutant/
 //coté serveur
 var io = require('socket.io');
 
 //pour utiliser le module de Mongoose (pour utiliser la BDD mongodb)
 //http://www.atinux.fr/2011/10/08/introduction-et-installation-de-mongodb/ 	>>	mongodb
 //http://www.atinux.fr/2011/10/15/tutoriel-sur-mongoose-mongodb-avec-node-js/	>>	mongoose
 var mongoose = require('mongoose');
 
//Nous allons travailler sur la BDD suivante :
//connection à la BDD
mongoose.connect('mongodb://localhost/webspider', function(err) {
  if (err) { throw err; }
});
 
// Création du schéma pour urlScraper		urlCrawled : { type : String},
var urlScraperSchema = new mongoose.Schema({
  urlSource : { type : String},
  urlCrawled : { type : String},
});

// Création du Model pour les urlScraperSchema
var urlScraperModel = mongoose.model('urlScrapers', urlScraperSchema);

// On créé une instance du Model urlScraperModel qu'on utilisera dans le code
var monUrlScraper;

// Instead of the default console.log, you could use your own augmented console.log ! 
// Ajout de la date et changement des couleurs pour console.log

var console = require('./console');
 
// Url regexp from http://daringfireball.net/2010/07/improved_regex_for_matching_urls //pattern for Matching URLs
var EXTRACT_URL_REG = /\b((?:https?:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/gi;
var PORT            = 3000;
 
var request         = require('request');
 
// See: http://expressjs.com/guide.html
var express         = require('express');
var app             = express(); // app est le serveur 
 
// You should (okay: could) use your OWN implementation here!
var EventEmitter    = require('events').EventEmitter;

// We create a global EventEmitter (Mediator pattern: http://en.wikipedia.org/wiki/Mediator_pattern ) //mediateur donne les informations
var em              = new EventEmitter();

/*
	//je fais écouter Socket.IO à mon serveur 
	var server = app.listen(PORT);
	console.log('Server listen on http://localhost:3000/');
	var io=io.listen(server);

	//évènement connection du serveur au client
	io.sockets.on('connection', function (socket) {
		socket.emit('faitUneAlerte'); //appelle l'évènement faitUneAlerte du client actuel
	});
	 
	 //appelle l'évènement faitUneAlerte2 du client actuel
	 io.sockets.on('connection', function (socket) {
		socket.emit('faitUneAlerte2', 'Je suis fou');
	 });
 */
 
/**
 * Remainder:
 * queue.push("http://..."); // add an element at the end of the queue //ajouter un élément à la fin de la queue
 * queue.shift(); // remove and get the first element of the queue (return `undefined` if the queue is empty > vide) 
 *				  // supprime et donne le premier élément de la queue
 *
 * // It may be a good idea to encapsulate queue inside its own class/module and require it with: 
 * var queue = require('./queue');
 */
 
var queue = require('./queue'); 		//var queue        = [];
	 
/**
 * Get the page from `page_url`
 * @param  {String} page_url String page url to get
 *
 * `get_page` will emit
 */
function get_page(page_url){
  em.emit('page:scraping', page_url);
 
  // See: https://github.com/mikeal/request //utilisation de request
	  
  request({
	url:page_url,
  }, function(error, http_client_response, html_str){
	/**
	 * The callback argument gets 3 arguments.
	 * The first is an error when applicable (usually from the http.Client option not the http.ClientRequest object).
	 * The second is an http.ClientResponse object.
	 * The third is the response body String or Buffer.
	 */
 
	/**
	 * You may improve what get_page is returning by: 		//ameliorer
	 * - emitting HTTP headers information like:
	 *  -> page size
	 *  -> language/server behind the web page (php ? apache ? nginx ? using X-Powered-By)
	 *  -> was compression active ? (Content-Encoding: gzip ?)
	 *  -> the Content-Type
	 */
 
	if(error){
	  em.emit('page:error', page_url, error);
	  return;
	}
 
	//em.emit('page', page_url, html_str);
	
	if (!error && http_client_response.statusCode == 200) {
		em.emit('page', page_url, html_str, http_client_response._readableState.defaultEncoding, http_client_response.headers.server,
			http_client_response.headers['content-type'], http_client_response.headers['content-length']);
	}
	
  });
}
	 
/**
 * Extract links from the web pagr			//extaire les liens 
 * @param  {String} html_str String that represents the HTML page
 *
 * `extract_links` should emit an `link(` event each
 */
function extract_links(page_url, html_str){
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match
  // "match" can return "null" instead of an array of url
  // So here I do "(match() || []) in order to always work on an array (and yes, that's another pattern).
  (html_str.match(EXTRACT_URL_REG) || []).forEach(function(url){
// see: http://nodejs.org/api/all.html#all_emitter_emit_event_arg1_arg2
// Here you could improve the code in order to: - check if we already crawled this url - ...
	
	//em.emit('url', page_url, html_str, url);
	
	//si il n'est pas indexé, on l'ajoute, sinon on affiche un message pour dire que l'url est déjà crawled
	if(queue.indexOf(url) < 0){
		// Ajout dans BDD
	    // On créé une instance du Model urlScraperModel
		monUrlScraper = new urlScraperModel();
		monUrlScraper.urlSource = page_url;
		monUrlScraper.urlCrawled = url;

		// On le sauvegarde dans MongoDB
		monUrlScraper.save(function (err) {
			if (err) { throw err; }
			console.log('monUrlScraper ajouté avec succès !');
		});
	
		queue.push(url); //ajoute l'URL à la queue
		em.emit('url', page_url, html_str, url);	
	}else{
		console.log("URL : "+url+" déjà crawled");
	}
		
  });
	 
}


//push new url into waiting queue
function handle_new_url(from_page_url, from_page_str, url){
  // Add the url to the queue
  queue.push(url);
 
  // ... and may be do other things like saving it to a database //ou autre l'enregistrer dans une BDD
  // in order to then provide a Web UI to request the data (or monitoring the scraper maybe ?) //interface web
  // You'll want to use `express` to do so
  
  //var JSONqueue = JSON.stringify(queue); //sérialiser une valeur en JSON
  //var backToJS = JSON.parse(JSONqueue); //désérialiser une valeur en JSON > repasse une valeur en javascript
	
}
 
//Extraction du lien se trouvant dans la queue puis on fait de nouveau get_page
function get_next_page(){
  if(queue!=null){
    var next = queue.push();
    get_page(next);
  }else{
	console.log("waiting ! ");
  }
} 
 
em.on('page:scraping', function(page_url){
  console.log('Loading... ', page_url);
});
	   
// Listen to events, see: http://nodejs.org/api/all.html#all_emitter_on_event_listener
em.on('page', function(page_url, html_str){
  console.log('We got a new page!', page_url);
});
	 
em.on('page:error', function(page_url, error){
  console.error('Oops an error occured on', page_url, ' : ', error);
});
	 
em.on('page', extract_links);
	 
em.on('url', function(page_url, html_str, url){
  console.log('We got a link! ', url); 
});
	 
em.on('url', handle_new_url);

em.on('next', function(){
  console.log("Next link !");
});

em.on('next', get_next_page);

var api = require('./api')(queue, express, app, get_page, PORT); //utilisation de l'API
	 
/* Fonctionne mais ne doit pas être implémenté ici 
	//essai ajout dans BDD
	    // On créé une instance du Model urlScraperModel
		var monUrlScraper = new urlScraperModel();
		monUrlScraper.urlSource = 'hello ';
		//monUrlScraper.urlCrawled = 'A implementer !';

		// On le sauvegarde dans MongoDB
		monUrlScraper.save(function (err) {
			if (err) { throw err; }
			console.log('monUrlScraper ajouté avec succès !');
		});	 
*/
	 
// #debug Start the crawler with a link
if (siteSource==null){
	get_page('http://twitter.com/FGRibreau');
}else{
	get_page(siteSource);
}
	
// Après avoir utilisé mongoose.connect() et effectuer tous les traitements je ferme la BDD
mongoose.connection.close();