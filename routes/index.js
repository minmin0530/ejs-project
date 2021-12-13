const express = require('express');
const router = express.Router();
const {v4: uuidv4} = require('uuid');
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'myMongo';
const connectOption = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}
var currentUUID = null;
const session = require('express-session');
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, './public/images/')
  },
  filename: function(req, file, cb){

    const uuid = uuidv4();

    currentUUID = uuid;
    let data = {
      path: uuid + ".jpg",
      mail: req.session.mail,
      name: req.session.name
    };
    transactionImagePathInsert(data);

    cb(null, uuid + '.jpg')
  }
})

router.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
  cookie:{
  httpOnly: true,
  secure: false,
  maxage: 1000 * 60 * 30
  }
}))

const transactionImagePathInsert = async (data) => {
  let client;
  data = Object.assign(data, {date: new Date() });
  try {
    client = await MongoClient.connect(url, connectOption);
    const db = client.db(dbName);
    const collection = db.collection('image');
//    const a = await collection.updateOne({mail:data.path, date:data.date}, {$set:data}, true );
   // if (a.result.n == 0) {
      await collection.insertOne(data);
   // }
  } catch (error) {
    console.log(error);
  } finally {
    client.close();
  }
};

const upload = multer({storage: storage})

router.post('/upload',upload.single('file'), async function(req,res){
  res.render('image', {currentPath: currentUUID, allPath: {} });    
  let client;
  try {
    client = await MongoClient.connect(url, connectOption);
    const db = client.db(dbName);
    const collection = db.collection('image');
    await collection.find({}).toArray((err, docs) => {
      console.log("aaaaaaaaaaa" + err);
      console.log(docs);
      res.render('image', {currentPath: currentUUID, allPath: docs });    
    });
  } catch (error) {
    console.log(error);
  } finally {}
});

const transactionKururiDownload = async (data, res) => {
  let client;
  let login = false;
  try {
    client = await MongoClient.connect(url, connectOption);
    const db = client.db(dbName);
    const collection = db.collection('account');
      await collection.find({}).toArray( (err, docs) => {
        for (const doc of docs) {
          if (doc.mail == data.mail) {
            if (doc.password == data.password) {
              login = true;
              res.render("index");
            }
          }
        }
        if (!login) {
          res.send("login error");
        }
      });
  } catch (error) {
    console.log(error);
  } finally {
//    client.close();
  }
};

const transactionKururiInsert = async (data, res) => {
  let client;
  data = Object.assign(data, {date: new Date() });
  try {
    client = await MongoClient.connect(url, connectOption);
    const db = client.db(dbName);
    const collection = db.collection('account');
    // const a = await collection.updateOne({mail:data.mail, password:data.password, name:data.name, date:data.date}, {$set:data}, true );
    // if (a.result.n == 0) {
      await collection.insertOne(data);
    // }
  } catch (error) {
    console.log(error);
  } finally {
    client.close();
  }
};

router.get('/', async (req, res) => {
  let client;
  try {
    client = await MongoClient.connect(url, connectOption);
    const db = client.db(dbName);
    const collection = db.collection('image');
    await collection.find({}).toArray((err, docs) => {
       res.render("login", { allPath: docs });
 //      res.render("layouteditor");
 //      res.render("game");
    });
  } catch (error) {
    console.log(error);
    res.send(error);
  } finally {}
});
router.get('/signup', (req, res) => {
  res.render("signup");
});

router.post('/signup', async (req, res) => {
  let client;
  let exist = false;
  try {
    client = await MongoClient.connect(url, connectOption);
    const db = client.db(dbName);
    const collection = db.collection('account');
      await collection.find({}).toArray( (err, docs) => {
        console.log(docs);
        for (const doc of docs) {
          if (doc.mail == req.body.mail){
            console.log(req.body.mail);
            exist = true;
          }
        }

        let user = {mail:"", name:"", password:""};

        if (!exist && req.body.mail != "" && req.body.password != "") {
          user["mail"] = req.body.mail;
          user["password"] = req.body.password;
          user["name"] = user.mail.substr(0, user.mail.indexOf("@"));
          transactionKururiInsert(user, res);

          res.render("signuped");
        } else {
          res.render("signuperror");
        }
      });
  } catch (error) {
    console.log(error);
  } finally {
//    client.close();
  }
});


router.post('/', (req, res) => {

  let user = {
    mail:"", name:"", password:""
  };

  user["mail"] = req.body.mail;
  user["password"] = req.body.password;
  user["name"] = user.mail.substr(0, user.mail.indexOf("@"));

  req.session.mail = req.body.mail;
  req.session.password = req.body.password;
  req.session.name = user["name"];
  transactionKururiDownload(user, res);

});

router.get('/images', async (req, res) => {
  let client;
  try {
    client = await MongoClient.connect(url, connectOption);
    const db = client.db(dbName);
    const collection = db.collection('image');
    await collection.find({}).toArray((err, docs) => {
      res.json({ allPath: docs });
    });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

//router.get('*',function(req,res,next){
//  if(req.headers['x-forwarded-proto']!='https') {
//    res.redirect('https://bigaru.com'+req.url);
//  } else {
//    next(); /* Continue to other routes if we're not redirecting */
//  }
//});

module.exports = router;
