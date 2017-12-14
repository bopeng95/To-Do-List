//db.js
var mongoose = require('mongoose'); 
var URLSlugs = require('mongoose-url-slugs');

// my schema here
//==================================
let User = mongoose.Schema({
	username: String,
	password: String,
	image: String,
	todos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ToDo' }]
});

let Items = mongoose.Schema({
	task: {type: String},
	checked: {type: Boolean, default: false}
}, {
  _id: true
});

let ToDo = mongoose.Schema({
	user: {type: String, required: true},
	name: {type: String, required: true},
	count: {type: Number, min:0},
	items: [Items]
});

User.plugin(URLSlugs('username'));
ToDo.plugin(URLSlugs('name', {field: 'slug2'}));

mongoose.model('User', User);
mongoose.model('ToDo', ToDo);
mongoose.model('Items', Items);

// is the environment variable, NODE_ENV, set to PRODUCTION? 
let dbconf;
if (process.env.NODE_ENV === 'PRODUCTION') {
 // if we're in PRODUCTION mode, then read the configration from a file
 // use blocking file io to do this...
 const fs = require('fs');
 const path = require('path');
 const fn = path.join(__dirname, 'config.json');
 const data = fs.readFileSync(fn);

 // our configuration file will be in json, so parse it and set the
 // conenction string appropriately!
 const conf = JSON.parse(data);
 dbconf = conf.dbconf;
} else {
 // if we're not in PRODUCTION mode, then use
 dbconf = 'mongodb://localhost/project';
}
mongoose.connect(dbconf);