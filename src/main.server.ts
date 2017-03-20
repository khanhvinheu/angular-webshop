import 'zone.js/dist/zone-node';
import './polyfills';

import 'reflect-metadata';
import 'rxjs/Rx';

import { platformServer, renderModuleFactory } from '@angular/platform-server';
import { AppServerModule } from './app/modules/app.server.module';
import { ngExpressEngine } from './app/modules/ng-express-engine/express-engine';

import * as express from 'express';
import { App } from './api/app';
import { ROUTES } from './routes';

const port = 8000;
const baseUrl = `http://localhost:${port}`;

const bodyParser = require('body-parser');
const credential = require('credential');
const mongo = require('mongodb').MongoClient;
const jwt = require('jsonwebtoken');
import { JWTKey } from './constants';

let db;
const app = express();
const pww = credential();
const api = new App();

function capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

app.engine('html', ngExpressEngine({
  aot: false,
  bootstrap: AppServerModule
}));

app.set('view engine', 'html');
app.set('views', 'dist');

app.get('/', (req, res) => {
  res.render('index', {req});
});

app.use('/', express.static('dist', {index: false}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

ROUTES.forEach(route => {
  app.get(route, (req, res) => {
    res.render('index', {
      req: req,
      res: res
    });
  });
});

app.get('/data', (req, res) => {
  res.json(api.getData());
});

app.post('/api/register', (req, res) => {
  pww.hash(req.body.password, function (err, hash) {
    if (err) {
      res.json({'error': 'true', 'msg': 'Een onbekende fout is opgetreden, probeer het later nog eens.'});
      return;
    }

    db.collection('users', function (err2, collection) {
      if (err2) {
        res.json({'error': 'true', 'msg': 'Een onbekende fout is opgetreden, probeer het later nog eens.'});
        return;
      }

      collection.findOne({email: req.body.email.toLowerCase()}, function(err3, doc) {
        if (err3) {
          res.json({'error': 'true', 'msg': 'Een onbekende fout is opgetreden, probeer het later nog eens.'});
          return;
        }

        if (doc) {
          res.json({'error': 'true', 'msg': 'Dit email adres is al geregistreerd!'});
          return;
        } else {
          collection.insert({
            firstname: capitalizeFirstLetter(req.body.firstname.toLowerCase()),
            surname_prefix: req.body.surname_prefix.toLowerCase(),
            surname: capitalizeFirstLetter(req.body.surname.toLowerCase()),
            streetname: req.body.streetname.toLowerCase(),
            house_number: req.body.house_number,
            postal_code: req.body.postal_code,
            city: req.body.city,
            country: req.body.country,
            email: req.body.email.toLowerCase(),
            password: String(hash),
          });
          res.json({'error': 'false'});
        }
      });
    });
  });
});

app.post('/api/login', (req, res) => {

  db.collection('users', function (err2, collection) {
    if (err2) {
      res.json({'error': 'true', 'msg': 'Een onbekende fout is opgetreden, probeer het later nog eens.'});
      return;
    }

    collection.findOne({email: req.body.email.toLowerCase()}, function(err3, doc) {
      if (err3) {
        res.json({'error': 'true', 'msg': 'Een onbekende fout is opgetreden, probeer het later nog eens.'});
        return;
      }

      if (doc) {
        pww.verify(doc.password, req.body.password, function (err, isValid) {
          if (err) {
            res.json({'error': 'true', 'msg': 'Een onbekende fout is opgetreden, probeer het later nog eens.'});
            return;
          }
          if (isValid) {
            const token = jwt.sign({
              exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 365),
              data: req.body.email.toLowerCase()
            }, JWTKey);
            res.json({'error': 'false', 'data': token});
          } else {
            res.json({'error': 'true', 'msg': 'Inlog gegevens incorrect'});
          }
        });
      } else {
        res.json({'error': 'true', 'msg': 'Inlog gegevens incorrect'});
      }
    });
  });
});

app.post('/api/get_profile', (req, res) => {
  jwt.verify(req.body.token, JWTKey, function(err, decoded) {
    if (err) {
      res.json({'verify': 'false'});
      return;
    } else {
      db.collection('users', function (err2, collection) {
        if (err2) {
          res.json({'error': 'true', 'msg': 'Een onbekende fout is opgetreden, probeer het later nog eens.'});
          return;
        }

        collection.findOne({email: decoded.data.toLowerCase()}, function(err3, doc) {
          if (err3) {
            res.json({'error': 'true', 'msg': 'Een onbekende fout is opgetreden, probeer het later nog eens.'});
            return;
          }

          if (doc) {
            res.json({'error': 'false', 'data': doc});
            return;
          } else {{
            res.json({'error': 'true', 'msg': 'Een onbekende fout is opgetreden, probeer het later nog eens.'});
            return;
          }}
        });
      });
    }
  });
});

app.post('/api/save_profile', (req, res) => {
  console.log(JSON.parse(req.body[0])['token']);

  jwt.verify(JSON.parse(req.body[0])['token'], JWTKey, function(err, decoded) {
    if (err) {
      res.json({'verify': 'false'});
      return;
    } else {
      db.collection('users', function (err2, collection) {
        if (err2) {
          res.json({'error': 'true', 'msg': 'Een onbekende fout is opgetreden, probeer het later nog eens.'});
          return;
        }

        collection.update({email: decoded.data.toLowerCase()}, { $set: {
            firstname: capitalizeFirstLetter(req.body[1].firstname.toLowerCase()),
            surname_prefix: req.body[1].surname_prefix.toLowerCase(),
            surname: capitalizeFirstLetter(req.body[1].surname.toLowerCase()),
            streetname: req.body[1].streetname.toLowerCase(),
            house_number: req.body[1].house_number,
            postal_code: req.body[1].postal_code,
            city: req.body[1].city,
            country: req.body[1].country
          }
        }, function(err3) {
          if (err3) {
            res.json({'error': 'true', 'msg': 'Een onbekende fout is opgetreden, probeer het later nog eens.'});
            return;
          }

          res.json({'error': 'false', 'data': 'Uw account is succesvol geüpdatet!'});
          return;
        });
      });
    }
  });
});

app.post('/api/verify', (req, res) => {
  jwt.verify(req.body.token, JWTKey, function(err, decoded) {
    if (err) {
      res.json({'verify': 'false'});
    }
    res.json({'verify': 'true'});
  });
});

mongo.connect('mongodb://localhost:27017/ingrid', (err, database) => {
  if (err) {
    return console.log(err);
  }

  db = database;
  app.listen(port, () => {
    console.log(`Listening at ${baseUrl}`);
  });
});
