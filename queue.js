var queue = []; //j'initialise la queue
var oldpush = queue.push; //je sauvegarde dans une variable l'ancien queue.push pour pouvoir le r�utiliser
var oldshift = queue.shift;

queue.push = function (/*args*/){
	var args = Array.prototype.slice.call(arguments);
	args.forEach(function(val){
		if(queue.indexOf(val) == -1)
			oldpush.call(this, val); //appelle la m�thode de l'objet et remplace l'objet en cours par un autre.

	});
}

module.exports = queue;