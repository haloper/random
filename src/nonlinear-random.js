/*!
 * JavaScript Log Random
 * https://github.com/haloper/js-object-wrapper
 *
 * Released under the MIT license
 */
(function (factory) {
	'use strict';
	if (typeof define === 'function' && define.amd) define(factory); //for AMD(RequireJS)
	else if (typeof exports === 'object') module.exports = factory(); //for CommonJS
	else {
		var oldRandom = window.NonlinearRandom;
		var random = window.NonlinearRandom = factory();

		random.noConflict = function () {
			window.NonlinearRandom = oldRandom;
			return random;
		};
	}
}(function () {
	'use strict';

	function factory(min, max) {
		if(min < 0 || max <= min) throw new Error("Check : min > 0 && max > min");
		return new api(min, max);
	}

	function api(min, max) {
		this.min = min;
		this.max = max;

		//Adjust scale of result
		//xMin -> yMin, xMax -> yMax
		//value(xMin ~ xMax) -> result(yMin, yMax)
		this.scale = function(xMin, xMax, yMin, yMax, value) {

			//check arguments
			if(xMin < 0 || xMax <= xMin) throw new Error("Check : xMin > 0 && xMax > xMin");
			if(yMin < 0 || yMax <= yMin) throw new Error("Check : yMin > 0 && yMax > yMin");
			if(value < xMin || value > xMax) throw new Error("Check : rangeMin <= value <= rangeMax");

			return (yMax - yMin) / (xMax - xMin) * (value - xMin) + yMin;

		}

		//return float random number between min and max
		this.random = function(min, max) {
			var val = Math.random() * (max - min) + min;
			return val;
		}

	}

	//return float randome number transformed by logic
	api.prototype.number = function() {
		if(typeof this.logic === 'function') {
			var value = this.random(this.domainMin, this.domainMax);
			var y = this.logic(value);
			var result = this.scale(this.rangeMin, this.rangeMax, this.min, this.max + 1, y);
			if(this.isReverse) {
				result = this.max - result + this.min + 1;
			}
			return result;
		}
		else {
			return this.random(this.min, this.max + 1);
		}
	}

	//get next float random number
	api.prototype.next = function() {
		return this.number();
	}

	//get next integer random number
	api.prototype.nextInt = function() {
		return Math.floor(this.number());
	}

	//set transform logic
	//logic is a graph, and domain is the range of the graph
	api.prototype.transform = function(logic, domainMin, domainMax) {

		//check arguments
		if(domainMin < 0 || domainMax <= domainMin) throw new Error("Check : domainMin >= 0 && domainMax > domainMin");

		this.logic = logic;
		this.domainMin = domainMin;
		this.domainMax = domainMax;
		this.rangeMin = logic(domainMin);
		this.rangeMax = logic(domainMax);

		if(this.rangeMin < 0 || this.rangeMax <= this.rangeMin) throw new Error("Check : logic(domainMin) >= 0 && logic(domainMax) > logic(domainMin)");

		return this;
	}

	//reverse result
	api.prototype.reverse = function() {
		this.isReverse = typeof this.isReverse === 'undefined' ? true : !this.isReverse;
		return this;
	}

	//Bigger values will be appeared more than smaller values.
	api.prototype.slopeTransform = function() {
		return this.transform(function(x) { return Math.log(x) / Math.log(2); }, 1, 2);
	}

	//Smaller values will be appeared more than bigger values.
	api.prototype.slopeReverseTransform = function() {
		return this.transform(function(x) { return Math.log(x) / Math.log(2); }, 1, 2).reverse();
	}

	//Bigger values will be sharply appeared more than smaller values.
	api.prototype.concaveSlopeTransform = function() {
		return this.transform(function(x) { return Math.sin(x) }, 0, Math.PI / 2);
	}

	//Smaller values will be sharply appeared more than bigger values.
	api.prototype.concaveSlopeReverseTransform = function() {
		return this.transform(function(x) { return Math.sin(x) }, 0, Math.PI / 2).reverse();
	}

	//Edge values will be appeared more than middle values.
	api.prototype.ltTransform = function() {
		return this.transform(function(x) { 
			if(x <= 1) return Math.pow(2, x); 
			else return Math.log(x) / Math.log(2) + 2;
		}, 0, 2);
	}

	//Middle values will be appeared more than edge values.
	api.prototype.gtTransform = function() {
		return this.transform(function(x) { 
			if(x <= 1) return Math.log(x + 1) / Math.log(2); 
			else return Math.pow(2, x - 1);
		}, 0, 2);
	}

	//Edge values will be sharply appeared more than middle values.
	api.prototype.concaveLtTransform = function() {
		return this.transform(function(x) { return Math.cos(x) + 1 }, Math.PI, Math.PI * 2);
	}

	//Middle values will be sharply appeared more than edge values.
	api.prototype.concaveGtTransform = function() {

		return this.transform(function(x) {
			if(x <= Math.PI / 2) return Math.sin(x);
			else return Math.sin(x) * (-1) + 2;
		}, 0, Math.PI)

	}

	return factory;
}));
