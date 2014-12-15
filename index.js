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
	merge : function merge(first, second) {
		if (first.to && second.from !== first.to) {
			throw new Error('Invalid sequence of diffs: cannot apply diff from version ' + second.from + ' to version ' +
											second.from + ' on a base with version ' + first.to + '. (idx: ' + key + ')');
		}
		var result = first;
		result.to = second.to;
		//We can just overwrite all new modules
		for (var name in second.modules) {
			result.modules[name] = second.modules[name];
		}
		//And also the entry property, if set
		result.entry = second.entry || result.entry;
		return result;
	}
};
