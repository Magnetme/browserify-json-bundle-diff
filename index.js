var _ = require('lodash');

module.exports = {
	create : function createDiff(from, to) {
		var diff = {};
		diff.from = from.version;
		diff.to = to.version;

		//Find all modules that have been changed or are new
		diff.modules = _(to.modules)
			.keys()
			.filter(function changed(key) {
				//Module should be in diff if it's new (not in from) or if it's content has been changed.
				//Note that we don't need to check it's dependencies, since a change in dependencies also
				//results in a change in content
				return !from.modules[key] || from.modules[key][0] !== to.modules[key][0];
			})
			.map(function pairs(key) {
				return [key, to.modules[key]];
			})
			.zipObject()
			.value();

		//Find all removed modules
		var removedModules = _.difference(Object.keys(from.modules), Object.keys(to.modules));
		_.each(removedModules, function(removed) {
			diff.modules[removed] = null;
		});

		//Check if entry has changed
		if (_.difference(from.entry, to.entry).length || _.difference(to.entry, from.entry).length) {
			diff.entry = to.entry;
		}

		return diff;
	},
	mergeDiffs : function(initialVersion, diffs) {
		if (!diffs) {
			diffs = intitialVersion;
		}
		//If we get a function as argument we use that to collect all diffs.
		//This can be usefull to let external tools, such as git, provide the diffs.
		if (typeof diffs === 'function') {
			var getNext = diffs;
			diffs = [];
			var currentVersion = initialVersion;
			var next;
			do {
				next = getNext(currentVersion);
				if (next) {
					diffs.push(next);
					currentVersion = next.to;
				}
			} while (next);
		}

		//Diffs should now be an array of diffs, and we don't need initialVersion anymore.

		return diffs.reduce(function(previous, current, key) {
			//Check that we can actually stack the current diff on the previous
			if (previous.to && current.from !== previous.to) {
				throw new Error('Invalid sequence of diffs: cannot apply diff from version ' + current.from + ' to version ' +
				                current.from + ' on a base with version ' + previous.to + '. (idx: ' + key + ')');
			}
			var result = previous;
			result.from = result.from || current.from; //first one has to set the from field
			result.to = current.to;
			//We can just overwrite all new modules
			for (var name in current.modules) {
				result.modules[name] = current.modules[name];
			}
			//And also the entry property, if set
			result.entry = current.entry || result.entry;
			return result;
		}, {});
	}
};
