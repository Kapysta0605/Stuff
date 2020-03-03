/* eslint-disable no-underscore-dangle */
const utils = (() => {
  function formatDate(d) {
    return `${d.getDate()}.${(d.getMonth() + 1)}.${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}`;
  }

  return {
    formatDate
  };
})();

const articleContent = (() => {
  function authors() {
    return new Promise(function(resolve, reject) {
      const oReq = new XMLHttpRequest();
      function handler() {
        resolve(JSON.parse(oReq.responseText));
        cleanUp();
      }

      function cleanUp() {
        oReq.removeEventListener('load', handler);
      }

      oReq.addEventListener('load', handler);

      oReq.open('GET', '/users');
      oReq.send();
    });
  }

  function getArticles(skip, top, filterConfig) {
    return new Promise(function(resolve, reject) {
      const oReq = new XMLHttpRequest();
      function handler() {
        resolve(JSON.parse(oReq.responseText, (key, value) =>
          ((key === 'createdAt') ? new Date(value) : value)));
        cleanUp();
      }

      function cleanUp() {
        oReq.removeEventListener('load', handler);
      }

      oReq.addEventListener('load', handler);

      if (filterConfig) {
        const params = `skip=${skip}&top=${top}&filter=${JSON.stringify(filterConfig)}`;
        oReq.open('GET', `/articles?${params}`);
      }
      else {
        const params = `skip=${skip}&top=${top}`;
        oReq.open('GET', `/articles?${params}`);
      }

      oReq.send();
    });
  }

  function getArticle(id) {
    return new Promise(function(resolve, reject) {
      const oReq = new XMLHttpRequest();

      function handler () {
        resolve(JSON.parse(oReq.responseText, (key, value) =>
          ((key === 'createdAt') ? new Date(value) : value)));
        cleanUp();
      }

      function cleanUp () {
        oReq.removeEventListener('load', handler);
      }

      oReq.addEventListener('load', handler);
      oReq.open('GET', `/article/${id}`);
      oReq.send();
    });
  }

  function addArticle(article) {
    return new Promise(function(resolve, reject) {
      const oReq = new XMLHttpRequest();

      function handler() {
        resolve();
        cleanUp();
      }

      function cleanUp() {
        oReq.removeEventListener('load', handler);
      }

      oReq.addEventListener('load', handler);
      oReq.open('POST', '/article');
      oReq.setRequestHeader('content-type', 'application/json');
      const body = JSON.stringify(article);
      oReq.send(body);
    });
  }

  function editArticle(article) {
    return new Promise(function(resolve, reject) {
      const oReq = new XMLHttpRequest();

      function handler() {
        resolve();
        cleanUp();
      }

      function cleanUp() {
        oReq.removeEventListener('load', handler);
      }

      oReq.addEventListener('load', handler);
      oReq.open('PATCH', '/article');
      oReq.setRequestHeader('content-type', 'application/json');
      const body = JSON.stringify(article);
      oReq.send(body);
    });
  }

  function removeArticle(id) {
    return new Promise(function(resolve, reject) {
      const oReq = new XMLHttpRequest();

      function handler() {
        resolve();
        cleanUp();
      }

      function cleanUp() {
        oReq.removeEventListener('load', handler);
      }

      oReq.addEventListener('load', handler);
      oReq.open('DELETE', `/article/${id}`);
      oReq.setRequestHeader('content-type', 'application/json');
      oReq.send();
    });
  }

  function getArticlesAmount() {
    return new Promise(function(resolve, reject) {
      const oReq = new XMLHttpRequest();

      function handler() {
        resolve(Number(oReq.responseText));
        cleanUp();
      }

      function cleanUp() {
        oReq.removeEventListener('load', handler);
      }

      oReq.addEventListener('load', handler);
      oReq.open('GET', '/articles/amount');
      oReq.send();
    });
  }

  return {
    getArticlesAmount,
    authors,
    getArticle,
    getArticles,
    removeArticle,
    editArticle,
    addArticle
  };
})();

const popularTags = (() => {
  let tags = [];

  function init(num) {
    return new Promise(function(resolve, reject) {
      const oReq = new XMLHttpRequest();

      function handler () {
        resolve();
        tags = JSON.parse(oReq.responseText);
        cleanUp();
      }

      function cleanUp () {
        oReq.removeEventListener('load', handler);
      }

      oReq.addEventListener('load', handler);
      oReq.open('GET', '/tags/popular');
      oReq.send();
    });
  }

  function removeTagsFromDOM() {
    document.querySelector('.tag-list').innerHTML = '';
    return true;
  }

  function insertTagsInDOM() {
    const popular = document.querySelector('.tag-list');
    popular.textContent = 'Популярно: ';
    for (let i = 0; i < tags.length; i++) {
      const li = document.createElement('li');
      li.innerHTML = `<li>${tags[i]}</li>`;
      popular.appendChild(li);
    }
    return true;
  }

  function allTags() {
    return new Promise(function(resolve, reject) {
      const oReq = new XMLHttpRequest();
      function handler() {
        resolve(JSON.parse(oReq.responseText));
        cleanUp();
      }

      function cleanUp() {
        oReq.removeEventListener('load', handler);
      }

      oReq.addEventListener('load', handler);

      oReq.open('GET', '/tags');
      oReq.send();
    });
  }

  return {
    allTags: allTags,
    init: init,
    removeTagsFromDOM: removeTagsFromDOM,
    insertTagsInDOM: insertTagsInDOM
  };
})();

const articleRenderer = (() => {
  let ARTICLE_TEMPLATE;
  let ARTICLE_LIST;

  function init() {
    ARTICLE_TEMPLATE = document.querySelector('#template-article');
    ARTICLE_LIST = document.querySelector('.article-list');
  }

  function insertArticlesInDOM(articles) {
    const articlesNodes = renderArticles(articles);
    articlesNodes.forEach(function (node) {
      ARTICLE_LIST.appendChild(node);
      ARTICLE_LIST.lastElementChild.addEventListener('click', readMoreHandler);
    });
  }

  function renderArticles(articles) {
    return articles.map(function (article) {
      return renderArticle(article);
    });
  }

  function renderArticle(article) {
    const template = ARTICLE_TEMPLATE;
    template.content.querySelector('.article').dataset.id = article._id;
    template.content.querySelector('#article-title').textContent = article.title;
    template.content.querySelector('#article-img').src = article.img;
    template.content.querySelector('.article-summary').textContent = article.summary;
    template.content.querySelector('#article-publname').textContent = article.author;
    const createdAt = article.createdAt;
    template.content.querySelector('#article-date').textContent = utils.formatDate(createdAt);
    const tags = template.content.querySelector('.article-tags');
    tags.innerHTML = 'ТЭГИ: ';

    if (article.tags) {
      for (let i = 0; i < article.tags.length; i++) {
        const li = document.createElement('li');
        li.innerHTML = `<li>${article.tags[i]}</li>`;
        tags.appendChild(li);
      }
    }

    return template.content.querySelector('.article').cloneNode(true);
  }


  function removeArticlesFromDom () {
    ARTICLE_LIST.innerHTML = '';
  }

  return {
    init: init,
    insertArticlesInDOM: insertArticlesInDOM,
    removeArticlesFromDom: removeArticlesFromDom
  };
})();

const userLog = (() => {
  function login(login, password) {
    return new Promise((response) => {
      const oReq = new XMLHttpRequest();

      function handler () {
        response();
        renderUser();
        cleanUp();
      }

      function cleanUp () {
        oReq.removeEventListener('load', handler);
      }
      const params = `username=${login}&password=${password}`;
      oReq.addEventListener('load', handler);
      oReq.open('POST', `/login?${params}`);
      oReq.setRequestHeader('content-type', 'application/json');
      oReq.send();
    });
  }

  function exit() {
    return new Promise((resolve) => {
      const oReq = new XMLHttpRequest();

      function handler () {
        resolve();
        renderUser();
        cleanUp();
      }

      function cleanUp () {
        oReq.removeEventListener('load', handler);
      }
      oReq.addEventListener('load', handler);
      oReq.open('POST', '/exit');
      oReq.setRequestHeader('content-type', 'application/json');
      oReq.send();
    });
  }

  function renderUser() {
    username()
      .then((user) => {
        const logInfo = document.querySelector('.log-info');
        const aAdd = document.querySelector('#aAdd');
        if (user) {
          aAdd.textContent = 'Добавить';
          logInfo.style.fontSize = '50%';
          logInfo.innerHTML = `Профиль<br/><div id='username'>${user}</div>`;
        }
        else {
          aAdd.textContent = '';
          logInfo.style.fontSize = '100%';
          logInfo.innerHTML = 'Войти';
        }
      });
  }

  function username() {
    return new Promise((resolve) => {
      const oReq = new XMLHttpRequest();

      function handler () {
        if (oReq.responseText) {
          resolve(oReq.responseText);
        }
        else {
          resolve();
        }
        cleanUp();
      }

      function cleanUp () {
        oReq.removeEventListener('load', handler);
      }

      oReq.addEventListener('load', handler);
      oReq.open('GET', '/user');
      oReq.setRequestHeader('content-type', 'application/json');
      oReq.send();
    });
  }

  return {
    renderUser,
    username,
    login,
    exit
  };
})();

function readMoreHandler(event) {
  window.onscroll = 0;
  const target = event.target;
  if (target === this.querySelector('#readMore') ||
    target === this.querySelector('#article-img') ||
    target === this.querySelector('#article-title')) {
    const id = this.dataset.id;
    articleContent.getArticle(id)
      .then((article) => {
        articleRenderer.removeArticlesFromDom();
        popularTags.removeTagsFromDOM();
        document.querySelector('.main-title').firstElementChild.textContent = '';
        const template = document.querySelector('#template-article-full');
        template.content.querySelector('.article').dataset.id = article._id;
        template.content.querySelector('#article-title').textContent = article.title;
        template.content.querySelector('#article-full-img').src = article.img;
        template.content.querySelector('.article-content').textContent = article.content;
        template.content.querySelector('#article-publname').textContent = article.author;
        const createdAt = article.createdAt;
        template.content.querySelector('#article-date').textContent = utils.formatDate(createdAt);
        const tags = template.content.querySelector('.article-tags');

        tags.innerHTML = 'ТЭГИ: ';
        for (let i = 0; i < article.tags.length; i++) {
          const tmp = document.createElement('li');
          tmp.innerHTML = `<li>${article.tags[i]}</li>`;
          tags.appendChild(tmp);
        }
        userLog.username()
          .then((user) => {
            if (!user) {
              const footer = template.content.querySelector('.article-footer');
              footer.removeChild(template.content.querySelector('#article-delete'));
              footer.removeChild(template.content.querySelector('#article-change'));
            }
            const content = template.content.querySelector('.article').cloneNode(true);
            document.querySelector('.article-list').appendChild(content);
            if (user) {
              const deleteButton = document.querySelector('#article-delete');
              const changeButton = document.querySelector('#article-change');
              deleteButton.addEventListener('click', articleFullDeleteHandler);
              changeButton.addEventListener('click', articleFullChangeHandler);
            }
          });

        function articleFullDeleteHandler() {
          articleContent.removeArticle(document.querySelector('.article').dataset.id)
            .then(() => {
              mainPage.loadMainPage();
            });
        }

        function articleFullChangeHandler() {
          const id = document.querySelector('.article').dataset.id;
          const article = articleContent.getArticle(id)
            .then((article) => {
              window.onscroll = 0;
              const mainTitle = document.querySelector('.main-title');
              mainTitle.firstElementChild.textContent = 'Изменить новость';
              popularTags.removeTagsFromDOM();
              articleRenderer.removeArticlesFromDom();
              const template = document.querySelector('#template-add-article');
              template.content.querySelector('.article').dataset.id = article._id;
              const tagSelector = template.content.querySelector('.input-tags');
              tagSelector.innerHTML = '';
              const tmp1 = document.createElement('option');
              tmp1.innerHTML = '<option disabled>Возможные теги</option>';
              tagSelector.appendChild(tmp1);
              popularTags.allTags()
                .then((tags) => {
                  tags.forEach(function(item) {
                    const tmp = document.createElement('option');
                    tmp.innerHTML = `<option value='${item}'>${item}</option>`;
                    tagSelector.appendChild(tmp);
                  });
                  const inputButton = template.content.querySelector('.input-button');
                  inputButton.setAttribute('onclick', 'changeSubmitHandler()');
                  const content = template.content.querySelector('.article').cloneNode(true);
                  document.querySelector('.article-list').appendChild(content);
                  document.forms.add.title.value = article.title;
                  document.forms.add.summary.value = article.summary;
                  document.forms.add.content.value = article.content;
                  document.forms.add.img.value = article.img;
                  document.forms.add.tags.value = article.tags.join(' ');
                  const inputTags = document.querySelector('.input-tags');
                  inputTags.addEventListener('change', tagSelectorHandler);
                });

              function tagSelectorHandler(event) {
                const target = event.currentTarget.value;
                const text = document.forms.add.tags;
                const tmp = text.value.split(' ');
                let key = false;
                tmp.forEach(function(item) {
                  if (item === target) {
                    key = true;
                  }
                });
                if (key) {
                  text.value = tmp.map(function(item) {
                    if (item === target) {
                      return '';
                    }
                    return item;
                  }).join(' ');
                }
                else if (target === 'Возможные теги');
                else {
                  text.value += ` ${target}`;
                }
              }
            });
        }
      });
  }
}

function changeSubmitHandler() {
  const form = document.forms.add;
  if (form.title.value !== '' && form.summary.value !== '' && form.content.value !== '') {
    userLog.username()
      .then((user) => {
        const article = {
          title: form.title.value,
          img: form.img.value,
          summary: form.summary.value,
          content: form.content.value,
          createdAt: new Date(),
          author: user,
        };

        const tags = form.tags.value.split(' ');

        for (let i = 0; i < tags.length; i++) {
          if (tags[i].length === 0) {
            tags.splice(i, 1);
            i--;
          }
        }

        article.tags = tags;
        article._id = document.querySelector('.article').dataset.id;

        articleContent.editArticle(article)
          .then(() => {
            mainPage.loadMainPage();
          });
      });
  }
}

function addEvents() {
  document.querySelector('#aMain').addEventListener('click', aMain);
  document.querySelector('#aAdd').addEventListener('click', aAdd);
  document.querySelector('#aSearch').addEventListener('click', aSearchClosed);
  document.querySelector('.logoBox').addEventListener('mouseover', showMemes);
  logInfoAddEvents();

  function aMain(event) {
    mainPage.loadMainPage();
  }

  function aAdd(event) {
    window.onscroll = 0;
    document.querySelector('.main-title').firstElementChild.textContent = 'Добавить новость';
    popularTags.removeTagsFromDOM();
    articleRenderer.removeArticlesFromDom();

    const template = document.querySelector('#template-add-article');
    const tagSelector = template.content.querySelector('.input-tags');
    tagSelector.innerHTML = '';
    const tmp1 = document.createElement('option');
    tmp1.innerHTML = '<option disabled>Возможные теги</option>';
    tagSelector.appendChild(tmp1);
    popularTags.allTags()
      .then((tags) => {
        tags.sort();
        tags.forEach(function(item) {
          const tmp = document.createElement('option');
          tmp.innerHTML = `<option value='${item}'>${item}</option>`;
          tagSelector.appendChild(tmp);
        });
        const content = template.content.querySelector('.article').cloneNode(true);
        document.querySelector('.article-list').appendChild(content);
        document.querySelector('.input-tags').addEventListener('change', tagSelectorHandler);
      });

    function tagSelectorHandler(event) {
      const target = event.currentTarget.value;
      const text = document.forms.add.tags;
      const tmp = text.value.split(' ');
      let key = false;

      tmp.forEach(function(item) {
        if (item === target) {
          key = true;
        }
      });
      if (key) {
        text.value = tmp.map(function(item) {
          if (item === target) {
            return '';
          }
          return item;
        }).join(' ');
      }
      else if (target === 'Возможные теги');
      else {
        text.value += ` ${target}`;
      }
    }
  }

  function aSearchClosed(event) {
    this.removeEventListener('click', aSearchClosed);
    this.addEventListener('click', aSearchOpened);

    const template = document.querySelector('#template-search');

    const tagSelector = template.content.querySelector('.search-tags');
    tagSelector.innerHTML = '';
    const tagsOptionDefault = document.createElement('option');
    tagsOptionDefault.innerHTML = '<option disabled>Возможные теги</option>';
    tagSelector.appendChild(tagsOptionDefault);
    popularTags.allTags()
      .then((tags) => {
        tags.sort();
        tags.forEach(function(tag) {
          const tmp = document.createElement('option');
          tmp.innerHTML = `<option value='${tag}'>${tag}</option>`;
          tagSelector.appendChild(tmp);
        });
        return articleContent.authors(); })
          .then((authors) => {
            const authorSelector = template.content.querySelector('.search-author');
            authorSelector.innerHTML = '';
            const authorsOptionDefault = document.createElement('option');
            authorsOptionDefault.innerHTML = '<option disabled>Возможные авторы</option>';
            authorSelector.appendChild(authorsOptionDefault);
            authors.forEach(function(author) {
              const tmp = document.createElement('option');
              tmp.innerHTML = `<option value='${author}'>${author}</option>`;
              authorSelector.appendChild(tmp);
            });

            document.querySelector('.search').innerHTML = '';
            const content = template.content.querySelector('.search-form').cloneNode(true);
            document.querySelector('.search').appendChild(content);

            document.forms.search.createdAfter.addEventListener('change', createdAfterHandler);
            document.forms.search.createdBefore.addEventListener('change', createdBeforeHandler);
            document.forms.search.tags.value = '';
            document.querySelector('.search-tags').addEventListener('change', tagSelectorHandler);
            document.querySelector('.search-button-accept').addEventListener('click', filter);
          });

    function tagSelectorHandler(event) {
      const target = event.currentTarget.value;
      const text = document.forms.search.tags;
      const tmp = text.value.split(' ');
      let key = false;

      tmp.forEach(function(item) {
        if (item === target) {
          key = true;
        }
      });
      if (key) {
        text.value = tmp.map(function(item) {
          if (item === target) {
            return '';
          }
          return item;
        }).join(' ');
      }
      else if (target === 'Возможные теги');
      else {
        text.value += ` ${target}`;
      }
    }

    function createdAfterHandler() {
      document.forms.search.createdBefore.setAttribute('min', this.value);
    }

    function createdBeforeHandler() {
      document.forms.search.createdAfter.setAttribute('max', this.value);
    }

    function filter(event) {
      const form = document.forms.search;
      const filterConfig = {};
      const date1 = new Date(form.createdAfter.value);
      if (date1 !== 'Invalid Date') {
        filterConfig.createdAfter = date1;
      }

      const date2 = new Date(form.createdBefore.value);
      if (date2 !== 'Invalid Date') {
        filterConfig.createdBefore = date2;
      }

      const author = form.author.value;
      if (author !== 'Возможные авторы') {
        filterConfig.author = author;
      }

      const tags = form.tags.value.split(' ');

      for (let i = 0; i < tags.length; i++) {
        if (tags[i].length === 0) {
          tags.splice(i, 1);
          i--;
        }
      }

      filterConfig.tags = tags;

      mainPage.setFilter(filterConfig);

      mainPage.loadMainPage();
    }
  }

  function aSearchOpened(event) {
    this.removeEventListener('click', aSearchOpened);
    document.querySelector('.search').innerHTML = '';
    this.addEventListener('click', aSearchClosed);
  }

  function showMemes() {
    document.querySelector('.logoBox').removeEventListener('mouseover', showMemes);
    const template = document.querySelector('#MEMES');
    document.body.style.background = 'url(\'content/PEPE.gif\')';
    document.body.style.backgroundSize = '100%';
    const memes = template.content.querySelector('.MEMES').cloneNode(true);
    document.querySelector('.imagez').appendChild(memes);
    document.querySelector('.logoBox').addEventListener('mouseout', hideMemes);
  }

  function hideMemes() {
    document.querySelector('.logoBox').removeEventListener('mouseout', showMemes);
    const template = document.querySelector('#MEMES');
    document.body.style.background = '';
    document.querySelector('.imagez').innerHTML = '';
    document.querySelector('.logoBox').addEventListener('mouseover', showMemes);
  }
}

function inputSubmitHandler() {
  const form = document.forms.add;
  if (form.title.value !== '' && form.summary.value !== '' && form.content.value !== '') {
    userLog.username()
      .then((user) => {
        const article = {
          title: form.title.value,
          img: form.img.value,
          summary: form.summary.value,
          content: form.content.value,
          createdAt: new Date(),
          author: user,
        };

        const tags = form.tags.value.split(' ');

        for (let i = 0; i < tags.length; i++) {
          if (tags[i].length === 0) {
            tags.splice(i, 1);
            i--;
          }
        }

        article.tags = tags;

        articleContent.addArticle(article)
          .then(() => {
            mainPage.loadMainPage();
          });
      });
  }
}

function searchReset() {
  document.querySelector('.search-input').innerHTML = '';
}

const mainPage = (function() {
  let filterConfig;
  let articleCount = 5;
  function renderArticles() {
    articleContent.getArticlesAmount()
      .then((top) => {
        articleContent.getArticles(0, top, undefined)
          .then(articles => popularTags.init())
            .then(() => {
              popularTags.insertTagsInDOM();
            });
      });
    articleContent.getArticles(0, articleCount, filterConfig)
      .then((articles) => {
        articleRenderer.removeArticlesFromDom();
        articleRenderer.insertArticlesInDOM(articles);
      });
  }

  function loadMainPage() {
    articleCount = 5;
    document.querySelector('.main-title').firstElementChild.textContent = 'Новости';
    renderArticles();
    window.onscroll = scrollMainPage;
  }

  function setFilter(filter) {
    filterConfig = filter;
  }

  function moreNews() {
    articleContent.getArticlesAmount()
      .then((count) => {
        if (articleCount + 5 > count) {
          articleCount = count;
          window.onscroll = 0;
        }
        else {
          articleCount += 5;
        }
      });
  }

  return {
    moreNews: moreNews,
    setFilter: setFilter,
    renderArticles: renderArticles,
    loadMainPage: loadMainPage
  };
}());

function scrollMainPage() {
  const footer = document.querySelector('.footer-content');
  const bottom = footer.lastElementChild.getBoundingClientRect().top;
  if (window.pageYOffset > bottom) {
    mainPage.moreNews();
    mainPage.renderArticles();
  }
}

const loginEvents = (() => {
  function mouseover() {
    userLog.username()
      .then((user) => {
        const logInfo = document.querySelector('.log-info');
        logInfo.removeEventListener('mouseover', mouseover);
        logInfo.addEventListener('mouseout', mouseout);
        logInfo.innerHTML = `Выйти<br/><div id='username'>${user}</div>`;
      });
  }

  function mouseout() {
    userLog.username()
      .then((user) => {
        const logInfo = document.querySelector('.log-info');
        logInfo.removeEventListener('mouseout', mouseout);
        logInfo.addEventListener('mouseover', mouseover);
        logInfo.innerHTML = `Профиль<br/><div id='username'>${user}</div>`;
      });
  }

  function logout() {
    const logInfo = document.querySelector('.log-info');
    logInfo.removeEventListener('mouseout', mouseout);
    userLog.exit()
      .then(() => {
        logInfo.removeEventListener('click', logout);
        logInfo.addEventListener('click', login);
        mainPage.loadMainPage();
      });
  }

  function login() {
    window.onscroll = 0;
    document.querySelector('.main-title').firstElementChild.textContent = 'ВХОД';
    popularTags.removeTagsFromDOM();
    articleRenderer.removeArticlesFromDom();
    const template = document.querySelector('#template-login');
    const content = template.content.querySelector('.login-background').cloneNode(true);
    document.querySelector('.article-list').appendChild(content);
  }
  return {
    mouseout,
    mouseover,
    login,
    logout
  };
})();

function logInfoAddEvents() {
  const logInfo = document.querySelector('.log-info');
  userLog.username()
    .then((user) => {
      if (user) {
        logInfo.addEventListener('mouseover', loginEvents.mouseover);
        logInfo.addEventListener('click', loginEvents.logout);
      }
      else {
        logInfo.addEventListener('click', loginEvents.login);
      }
    });
}

function loginSubmitHandler() {
  const login = document.forms.login.login.value;
  const password = document.forms.login.password.value;
  userLog.login(login, password)
    .then(() => {
      const logInfo = document.querySelector('.log-info');
      userLog.username()
        .then((user) => {
          if (user) {
            logInfo.removeEventListener('click', loginEvents.login);
            logInfo.addEventListener('mouseover', loginEvents.mouseover);
            logInfo.addEventListener('click', loginEvents.logout);
          }
        });
      mainPage.loadMainPage();
    });
  return false;
}

document.addEventListener('DOMContentLoaded', startApp);
function startApp() {
  articleRenderer.init();
  userLog.renderUser();
  mainPage.loadMainPage();

  addEvents();
}
