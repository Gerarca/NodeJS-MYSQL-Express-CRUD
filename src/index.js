const express = require('express'); // consigurar el servidor
const morgan = require('morgan');   // Registrador de Solicitudes
const exphbs = require('express-handlebars'); //Motor de plantillas hbs
const path = require('path'); // rutas de ficheros
const flash = require('connect-flash'); // Mostrar mensajes tipo popup
const session = require('express-session'); //Admistra la session de la app
const MySQLStore = require('express-mysql-session'); //Almacena session en la base de datos
const {database} = require('./keys'); // archivo key.js almacena usuario y clave de la base de datos
const passport = require('passport'); // Modulo para autenticar/manejar proceso de login

//initialiaztions
const app = express();
require('./lib/passport');

//settings
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layout'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars')
}));
app.set('view engine', '.hbs');

//Middlewares
app.use(session({
    secret: 'NodeJS-ExpressJS-MySQL',
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore(database)
})); 
app.use(flash()); 
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

//Global Variables
app.use((req, res, next) => {
    app.locals.success = req.flash('success');
    app.locals.error = req.flash('error');
    app.locals.user = req.user; 
    next();
})

//Routes
app.use(require('./routes/'));
app.use(require('./routes/authentication'));
app.use('/links', require('./routes/links'));


//Public
app.use(express.static(path.join(__dirname, 'public')));

//Starting the server
app.listen(app.get('port'), () => {
    console.log('Server on Port', app.get('port'));
});