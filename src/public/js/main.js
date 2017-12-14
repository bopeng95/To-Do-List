function sign() {
	let x = document.forms[0];
	let e = document.querySelector('#signfo');
	let pass = '';

	for(let i = 0; i < (x.elements.length)-1; i++) {
		if ((x.elements[i].value === "") || (x.elements[i].value === null)) {
			e.textContent = 'Please enter something.';
			mod(x, i);
			return false;
		}
		else {
			x.elements[i].style.backgroundColor="white";
		}
		if(i === 1) { 
			if(x.elements[i].value.length < 8) {
				mod(x, i);
				e.textContent = 'Enter at least 8 characters for pass.';
				return false;
			}
			else { pass = x.elements[i].value; }
		}
		if(i === 2) {
			if(x.elements[i].value !== pass) {
				e.textContent = 'The passwords don\'t match.';
				mod(x, i);
				return false;
			}
		}
	}
	e.textContent = '';
	return true;
}

function log() {
	let x = document.forms[0];
	let e = document.querySelector('#logfo');

	for(let i = 0; i < (x.elements.length)-1; i++) {
		if ((x.elements[i].value === "") || (x.elements[i].value === null)) {
			mod(x, i);
			e.textContent = 'Please enter something.';
			return false;
		}
		else {
			x.elements[i].style.backgroundColor="white";
		}
	}
	e.textContent = '';
	return true;
}

function noEmpty() {
	let x = document.forms[1];
	let elem = x.elements[0].value;
	if(elem === "") { return false; }
	else { return true; }
}

function noEmpty2() {
	let x = document.forms[2];
	let elem = x.elements[0].value;
	if(elem === "") { return false; }
	else { return true; }
}

function mod(x, i) {
	x.elements[i].focus();
	x.elements[i].select();
	x.elements[i].style.backgroundColor="#FFABA7";
}