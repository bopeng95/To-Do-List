//app.js 
require('./db');
const express = require('express');
const app = express();
let mongoose = require('mongoose');
let User = mongoose.model('User');
let ToDo = mongoose.model('ToDo');
let Items = mongoose.model('Items');
const bodyParser = require('body-parser');
const session = require('express-session');
let bcrypt = require('bcrypt');
const saltRounds = 10;

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('public'));

app.set('view engine', 'hbs');

let ses = [];

const sessionOptions = { 
	secret: 'secret for signing session id', 
	saveUninitialized: true, 
	resave: true 
};

app.use(session(sessionOptions));

const q = [
	"Whatever you are, be a good one.",
	"If you dream it, you can do it.",
	"I expect 1 less task from you.",
	"Don’t wait. The time will never be just right.",
	"If not us, who? If not now, when?",
	"Everything you can imagine is real.",
	"You can, therefore do it.",
	"Turn your wounds into wisdom.",
	"Hope is a waking dream.",
	"May you live every day of your life todo.",
	"Don't be so lazy come on.",
	"All you need is some todo.",
	"Do it do it do it do itttt.",
	"Hey, do something today.",
	"Treat yourself after you finish."
]

let randNum = 0;

app.get('/', (req, res) => {
	req.session.sameUser = '';
	User.find((err, result, count) => {
		res.render('login', {user: result, loginfo: req.session.right});
	})
});

app.post('/', (req, res) => {
	let u = req.body.userlog;
	let p = req.body.passlog;
	User.find({username: u}, (err, result, count) => {
		if(result[0] === undefined) {
			req.session.right = 'wrong username or password!';
			res.redirect('/');
		}
		else {
			bcrypt.compare(p, result[0].password, function(err, r) {
				if(r === true) {
					req.session.right = '';
					let id = req.session.id;
					ses.push(id);
					randNum = Math.floor(Math.random()*(q.length));
					res.redirect('home/'+u);
				}
				else{ 
					req.session.right = 'wrong username or password!';
					res.redirect('/'); 
				}
			})
		}
	})
})

app.get('/signup', (req, res) => {
	req.session.right = '';
	res.render('signup', {sameuser: req.session.sameUser});
})

app.post('/signup', (req, res) => {
	let u = req.body.usersign;
	let p = req.body.passsign;
	User.find({username: u}, (err, result, count) => {
		if(result[0] === undefined) {
			let user = new User({
				username: u,
				image: 'http://voice4thought.org/wp-content/uploads/2016/08/default1.jpg'
			});
			bcrypt.hash(p, saltRounds, function(err, hash) {
				user.password = hash;
				user.save(function(err, result, count) {
					if(err) { res.send(err); }
					else { res.redirect('/'); }
				});
			});
		}
		else {
			req.session.sameUser = 'This username is in use';
			res.redirect('/signup');
		}
	});
});

app.post('/logout', (req, res) => {
	User.find({slug: req.params.slug}, (err, result, count) => {
		let index = ses.indexOf(req.session.id);
		if (index > -1) { ses.splice(index, 1); }
		res.redirect('/');
	});
});

app.get('/home/:slug', (req, res) => {
	if(ses.includes(req.session.id)) {
		User.find({slug: req.params.slug}, (err, result, count) => {
			ToDo.find({ "_id": { $in: result[0].todos } }, function(err, docs) {
				res.render('home', {slug: req.params.slug, todos: docs, quotes: q[randNum]});
			});
		});
	} else { res.sendStatus(404); }
});

app.post('/home/:slug', (req, res) => {
	let group = req.body.group;
	let td = new ToDo ({
		user: req.params.slug,
		name: group
	});
	td.save( err => {
		if(err) { res.send(err); }
		else {
			User.findOneAndUpdate({slug: req.params.slug}, 
				{$push: {
					todos: td._id
				}}, function(err, result, count) {
					if(err) { res.send(err); }
					else { res.redirect('/home/' + req.params.slug); }
				});
		}
	});
})

app.get('/home/:slug/profile', (req, res) => {
	if(ses.includes(req.session.id)) {
		User.find({slug: req.params.slug}, (err, result, count) =>{
			ToDo.find({ "_id": { $in: result[0].todos } }, function(err, docs) {
				let tk = 0;
				for(let i = 0; i < docs.length; i++) {
					tk += docs[i].items.length;
				}
				res.render('profile', {slug: req.params.slug, userimg: result[0].image,cat: result[0].todos.length, tk: tk});
			});
		});
	}
	else { res.sendStatus(404); }
});

app.post('/home/:slug/profile', (req, res) => {
	let u = req.body.imgurl;
	User.find({slug: req.params.slug}, (err, result, count) =>{
		result[0].image = u;
		result[0].save(function(err) {
			if(err) { res.send(err); }
			else { res.redirect('/home/'+req.params.slug+'/profile'); }
		});
	});
});

app.get('/home/:slug/:slug2', (req, res) => {
	if(ses.includes(req.session.id)) {
		User.find({slug: req.params.slug}, (err, result, count) =>{
			ToDo.find({name: req.params.slug2}, (err, result2, count) =>{
				res.render('tasks', {slug: req.params.slug, slug2: req.params.slug2, todos: result2});
			});
		});
	} else { res.sendStatus(404); }
});

app.post('/home/:slug/:slug2', (req, res) => {
	let userTask = req.body.tk;
	ToDo.findOneAndUpdate({name: req.params.slug2}, 
		{$push: {
			items: {
				task: userTask 
			}
		}}, function(err, result, count) {
			if(err) { res.send(err); }
			else { res.redirect('/home/'+req.params.slug+'/'+req.params.slug2); }
		});
})

app.post('/home/:slug/:slug2/deletegroup', (req, res) => {
	User.find({slug: req.params.slug}, function(err, result, count) {
		ToDo.find({name: req.params.slug2}, function(err, result2, count) {
			result[0].todos.pull(result2[0].id);
			result[0].save(function(err) {
				if(err) { res.send(err); }
				else { res.redirect('/home/'+req.params.slug); }
			})
		});
	});
});

app.post('/home/:slug/:slug2/deletetask', (req, res) => {
	User.find({slug: req.params.slug}, function(err, result, count) {
		ToDo.find({name: req.params.slug2}, function(err, result2, count) {
			let arr = req.body.deletetask;
			if(Array.isArray(arr)) {
				arr.map(function(e) {
					result2[0].items.map(function(a) {
						if(a.id === e) { result2[0].items.pull(e); }
					});
				});
			}
			else if(arr !== undefined) {
				result2[0].items.map(function(a) {
					if(a.id === arr) { result2[0].items.pull(arr); }
				});
			}
			result2[0].save(function(err) {
				if(err) { res.send(err); }
				else { res.redirect('/home/' + req.params.slug + '/' + req.params.slug2); }
			});
		});
	});
});

app.listen(process.env.PORT || 3000);