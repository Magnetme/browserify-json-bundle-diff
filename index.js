module.exports = function generateBundleDiff(from, to) {
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
};
