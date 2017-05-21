const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const SessionStore = require('connect-mongo')(session);
const mongoose = require('mongoose');

const app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(`${__dirname}/public`));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.Promise = global.Promise;

const articleConnection = mongoose.createConnection('mongodb://localhost/articles');
const userConnection = mongoose.createConnection('mongodb://localhost/users');

const articleSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
    index: true,
  },
  content: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  img: {
    type: [String],
    required: false,
  },
  createdAt: {
    type: Date,
    index: true,
  },
  tags: {
    type: [String],
    required: false,
    index: true,
  },
});

const userSchema = mongoose.Schema({
  login: {
    type: String,
    unique: true,
    required: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
});
const dbArticle = articleConnection.model('Article', articleSchema);
const dbUser = userConnection.model('User', userSchema);

passport.use(new LocalStrategy(
  function(username, password, done) {
    dbUser.findOne({ login: username })
    .then(user => {
      if (user.password != password) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, username);
    })
    .catch((err) => {
      done(err);
    });
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.use(session({
  secret: 'SourCat',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  name: 'sid',
  cookie: { maxAge: 86400000 },
  store: new SessionStore({
    url: 'mongodb://localhost/sessions',
  })
}));
app.use(passport.initialize());
app.use(passport.session());

function getArticles(skip, top, filter) {
  if (skip < 0 || top < 0) {
    return undefined;
  }
  let articles = [];
  let filterConfig;
  if (filter) {
    filterConfig = JSON.parse(filter, (keyN, value) => {
      return (keyN === 'createdAfter' || keyN === 'createdBefore') ? new Date(value) : value;
    });
  }
  const query = {};
  if(filterConfig){
    if (filterConfig.author) {
      query.author = { $regex: filterConfig.author, $options: 'i' };
    }
    if (filterConfig.from || filterConfig.to) {
      query.createdAt = {};
    }
    if (filterConfig.from) {
      query.createdAt.$gte = filterConfig.from;
    }
    if (filterConfig.to) {
      query.createdAt.$lte = filterConfig.to;
    }
    if (filterConfig.tags && filterConfig.tags.length > 0) {
      query.tags = { $all: filterConfig.tags };
    }
  }

  return dbArticle.find(query).sort({ createdAt: -1 })
    .then((articles) => {
        return articles.slice(skip, skip + top);
      }).catch((err) => {console.log(err);});
}

function getArticle(id) {
  return dbArticle.findById(id).catch((err) => {console.log(err);});
}

function addArticle(articleN) {
  if(!validateArticle(articleN)){
    return false;
  }
  const article = new dbArticle(articleN);
  article.createdAt = Date.now();
  return article.save().catch((error) => {
      throw error;
    });
}

function validateArticle(article) {
  if (article.title.length === 0 || article.title.length > 99 ||
    article.summary.length === 0 || article.summary.length > 199 ||
    article.author.length === 0 || article.content.length === 0) {
    return false;
  }
  const tags = article.tags;
  for (let i = 0; i < tags.length; i++) {
    if (tags[i].length === 0 || ~tags[i].indexOf(' ')) {
      return false;
    }
  }
  return true;
}

function getArticlesAmount() {
  return dbArticle.find()
    .then((articles) => {
      return articles.length;
    }).catch((err) => {console.log(err);});
}

function editArticle(article) {
  if(!validateArticle){
    return false;
  }
  const data = {
    $set: {
      title: article.title,
      img: article.img,
      summary: article.summary,
      content: article.content,
      tags: article.tags,
    },
  };

  return dbArticle.findOneAndUpdate({ _id: article._id }, data)
    .then(() => {
      return true;
    })
    .catch(() => {
      return false;
    });
}

function popularTags(){
  const num = 2;
  const tags = [];
  const tmp = [];
  return dbArticle.find()
    .then(articles => {
      articles.forEach((article) => {
        article.tags.forEach((tag) => tmp.push(tag));
      });
      tmp.sort();
      let a = 0;
      if (tmp.length > 1) {
        for (let i = 1; i < tmp.length; i++) {
          if (tmp[i] !== tmp[i - 1] || i === (tmp.length - 1)) {
            if ((i - a) >= num) {
              tags.push(tmp[a]);
              a = i;
            }
            a = i;
          }
        }
      }
      else if (num === 1 && tmp.length === 1) {
        tags.push(tmp[a]);
      }
      return tags;
    });
}

app.get('/articles', (req, res) => {
  getArticles(req.query.skip, req.query.top, req.query.filter)
    .then((articles) => {
      res.json(articles);
    });
});

app.get('/article/:id', (req, res) => {
  getArticle(req.params.id)
    .then((article) => {
      res.json(article);
    });
});

app.get('/articles/amount', (req, res) => {
  getArticlesAmount()
    .then((amount) => {
      res.send(amount.toString());
    });
});

app.get('/users', (req, res) => {
  dbArticle.distinct('author')
    .then(users => users.sort((a, b) => a < b))
      .then((users) => {
        res.json(users);
      })
      .catch(() => {
        res.json([]);
      });
});

app.get('/user', (req, res) => {
  if (req.user) {
    res.send(req.user);
  }
  else {
    res.end();
  }
});

app.get('/tags', (req, res) => {
  dbArticle.distinct('tags')
    .then(tags => tags.sort((a, b) => a < b))
      .then((tags) => {
        res.json(tags);
      })
      .catch(() => {
        res.json([]);
      });
});

app.get('/tags/popular', (req, res) =>  {
  popularTags()
    .then(tags => {
        res.json(tags);
      })
      .catch(() => {
        res.json([]);
      });
});

app.post('/login', (req, res) => {
  passport.authenticate('local', (err, user) => {
    if (err) {
      res.send(err.message);
      return;
    }
    if (!user) {
      res.send('Autharization Error');
      return;
    }

    req.logIn(user, (error) => {
      if (error) {
        res.send(error.message);
        return;
      }

      res.end();
    });
  })(req, res);
});

app.post('/exit', (req, res) => {
  if (!req.user) {
    res.status(401).end();
    return;
  }
  req.session.destroy((err) => {
    if (err) {
      res.send(err.message);
    }
    res.end();
  });
});

app.post('/article', (req, res) => {
  if(!req.user){
    res.end(403);
    return;
  }
  addArticle(req.body);
  res.end();
});

app.patch('/article', (req, res) => {
  if(!req.user){
    res.end(403);
    return;
  }
  editArticle(req.body);
  res.end();
});

app.delete('/article/:id', (req, res) => {
  if(!req.user){
    res.end(403);
    return;
  }
  dbArticle.findByIdAndRemove(req.params.id).catch((err) => {console.log(err);});
  res.end();
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
