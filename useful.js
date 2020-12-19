function haveCommonElement(a, b) {
	for (let elt of a) {
		if (b.includes(elt)) return true;
	}
	return false;
}
module.exports = { haveCommonElement };
