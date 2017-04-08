var articleContent = (function(){
	var authors = [];

	function getArticles(skip, top, filterConfig, callback){
		var oReq = new XMLHttpRequest();
		function handler () {
       		callback(JSON.parse(oReq.responseText, (key, value) =>
          		((key === 'createdAt') ? new Date(value) : value)));
			cleanUp();
		}

		function cleanUp () {
			oReq.removeEventListener('load', handler);
		}

		oReq.addEventListener('load', handler);
		
		if(filterConfig){
			const params = `skip=${skip}&top=${top}&filter=${JSON.stringify(filterConfig)}`;
			oReq.open('GET', '/articles?' + params);
		}
		else{
			const params = `skip=${skip}&top=${top}`;
			oReq.open('GET', '/articles?' + params);
		}

		oReq.send();
	}

	function getArticle(id, callback){
		var oReq = new XMLHttpRequest();

		function handler () {
			callback(JSON.parse(oReq.responseText, (key, value) =>
          		((key === 'createdAt') ? new Date(value) : value)));
			cleanUp();
		}

		function cleanUp () {
			oReq.removeEventListener('load', handler);
		}

		oReq.addEventListener('load', handler);

		oReq.open('GET', '/article/' + id);
		oReq.send();
	}

	function addArticle(article, callback){
		var oReq = new XMLHttpRequest();

		function handler () {
			callback();
			cleanUp();
		}

		function cleanUp () {
			oReq.removeEventListener('load', handler);
		}

		oReq.addEventListener('load', handler);
		
		oReq.open('POST', '/article');
		oReq.setRequestHeader('content-type', 'application/json');
		const body = JSON.stringify(article);
		oReq.send(body);

		var author = article.author;
		var key = true;
		authors.forEach(function(item){
			if(item == author){
				key = false;
			}
		});

		if(key){
			authors.push(author);
		}

			authors.sort();
	}

	function editArticle(article, callback){
		var oReq = new XMLHttpRequest();

		function handler () {
			callback();
			cleanUp();
		}

		function cleanUp () {
			oReq.removeEventListener('load', handler);
		}

		oReq.addEventListener('load', handler);

		oReq.open('PATCH', '/article');

		oReq.setRequestHeader('content-type', 'application/json');

		const body = JSON.stringify(article);
		console.log(article);

		oReq.send(body);
	}

	function removeArticle(id, callback){
		var oReq = new XMLHttpRequest();

		function handler () {
			callback();
			cleanUp();
		}

		function cleanUp () {
			oReq.removeEventListener('load', handler);
		}

		oReq.addEventListener('load', handler);

		oReq.open('DELETE', '/article/' + id);

		oReq.setRequestHeader('content-type', 'application/json');

		oReq.send();
	}

	function authorsInit(){
		getArticlesAmount((top) => {
			articleContent.getArticles(0, top, undefined,(articles) => {
				articles.forEach(function(item){
					var author = item.author;
					var key = true;
					for(var i = 0; i < authors.length; i++){
						if(authors[i] == author){
							key = false;
						}
					}
					if(key){
						authors.push(author);
					}
				});
				authors.sort();
			});
		});
	}

	function getArticlesAmount(callback){
		var oReq = new XMLHttpRequest();

		function handler () {
			callback(Number(oReq.responseText));
			cleanUp();
		}

		function cleanUp () {
			oReq.removeEventListener('load', handler);
		}

		oReq.addEventListener('load', handler);

		oReq.open('GET', '/articles/amount');
		oReq.send();
	}

	return {
		getArticlesAmount:  getArticlesAmount,
		authors: authors,
		authorsInit: authorsInit,
		getArticle: getArticle,
		getArticles: getArticles,
		removeArticle: removeArticle,
		editArticle: editArticle,
		addArticle: addArticle
	}
}());

var popularTags = (function(){
	var tags = [];
	var allTags = [];

	function init(num, articles){
		if(typeof num != "number") return false;
		if(tags){
			tags.length = 0;
		}
		if(allTags){
			allTags.length = 0;
		}
		var tmp = [];
		for(var i = 0; i < articles.length; i++){
			for(var j = 0; j < articles[i].tags.length; j++)
				tmp.push(articles[i].tags[j]);
		}
		tmp.sort();

		var a = 0;
		if(tmp.length > 1){
			allTags.push(tmp[a]);
			for(var i = 1; i < tmp.length; i++){
				if(tmp[i] != tmp[i - 1] || i == (tmp.length - 1)){
					if((i - a) >= num){
						tags.push(tmp[a]);
						a = i;
					}
					allTags.push(tmp[i]);
					a = i;
				}
			}
		}
		else if(num == 1 && tmp.length == 1){
			tags.push(tmp[a]);
		}
	}

	function removeTagsFromDOM(){
		document.querySelector('.tag-list').innerHTML = '';
		return true;
	}

	function insertTagsInDOM(){
		var tags1 = document.querySelector('.tag-list');

		tags1.textContent = 'Популярно: '

		for(i = 0; i < tags.length; i++){
			var tmp1 = document.createElement('li');
			tmp1.innerHTML = "<li>" + tags[i] + "</li>";
			tags1.appendChild(tmp1);
		}

		return true;
	}

	return{
		allTags: allTags,
		init: init,
		removeTagsFromDOM: removeTagsFromDOM,
		insertTagsInDOM: insertTagsInDOM
	}
}());

var articleRenderer = ( function(){
	var ARTICLE_TEMPLATE;
	var ARTICLE_LIST;

	function init(){
		ARTICLE_TEMPLATE = document.querySelector('#template-article');
		ARTICLE_LIST = document.querySelector('.article-list');
	}

	function insertArticlesInDOM(articles) {
		var articlesNodes = renderArticles(articles);
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
		var template = ARTICLE_TEMPLATE;
		template.content.querySelector('.article').dataset.id = article.id;
		template.content.querySelector('#article-title').textContent = article.title;
		template.content.querySelector('#article-img').src = article.img;
		template.content.querySelector('.article-summary').textContent = article.summary;
		template.content.querySelector('#article-publname').textContent = article.author;
		template.content.querySelector('#article-date').textContent = formatDate(article.createdAt);
		var tags = template.content.querySelector('.article-tags');
		tags.innerHTML = 'ТЭГИ: ';
		
		if(Boolean(article.tags)){
			for(i = 0; i < article.tags.length; i++){
				var tmp = document.createElement('li');
				tmp.innerHTML = "<li>" + article.tags[i] + "</li>";
				tags.appendChild(tmp);
			}
		}

		return template.content.querySelector('.article').cloneNode(true);
	}

	function formatDate(d) {
		return d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear() + ' ' +
		d.getHours() + ':' + d.getMinutes();
	}

	function removeArticlesFromDom () {
		ARTICLE_LIST.innerHTML = '';
	}

	return {
        init: init,
        insertArticlesInDOM: insertArticlesInDOM,
        removeArticlesFromDom: removeArticlesFromDom
    };
 }());

var userLog = ( function(){

	function init(login, password, callback){
		var oReq = new XMLHttpRequest();

		function handler () {
			callback();
			renderUser();
			cleanUp();
		}

			function cleanUp () {
				oReq.removeEventListener('load', handler);
			}

			oReq.addEventListener('load', handler);
			
			oReq.open('POST', '/users/login');
			oReq.setRequestHeader('content-type', 'application/json');
			var user = {};
			if(login){
				user.login = login;
				user.password = password;
			}
			else{
				user.login = ' ';
				user.password = ' ';
			}
			const body = JSON.stringify(user);
			oReq.send(body);
	}

	function renderUser(){
		var user = JSON.parse(localStorage.getItem('user'));
		username((user) => {
			if(user){
				document.querySelector('#aAdd').textContent = 'Добавить';
				document.querySelector('.log-info').style.fontSize = '50%';
				document.querySelector('.log-info').innerHTML = 'Профиль<br/><div id="username">' + user + '</div>';
			}
			else{
				document.querySelector('#aAdd').textContent = '';
				document.querySelector('.log-info').style.fontSize = '100%';
				document.querySelector('.log-info').innerHTML = 'Войти';
			}
		});
	}

	function username(callback){
		
		var oReq = new XMLHttpRequest();

		function handler () {
			if(oReq.responseText){
				callback(JSON.parse(oReq.responseText));
			}
			else{
				callback();
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
	}

	return{
		renderUser: renderUser,
		username: username,
		init: init
	};
}());

function readMoreHandler(event){
	window.onscroll = 0;
	var target = event.target;
	if(target == this.querySelector('#readMore') || target == this.querySelector('#article-img') || target == this.querySelector('#article-title')){    	
    	var id = this.dataset.id;
		articleContent.getArticle(id, (article) =>{

    	articleRenderer.removeArticlesFromDom();
    	popularTags.removeTagsFromDOM();
    	document.querySelector('.main-title').firstElementChild.textContent = '';

    	var template = document.querySelector('#template-article-full');
    	template.content.querySelector('.article').dataset.id = article.id;
		template.content.querySelector('#article-title').textContent = article.title;
		template.content.querySelector('#article-full-img').src = article.img;
		template.content.querySelector('.article-content').textContent = article.content;
		template.content.querySelector('#article-publname').textContent = article.author;
		template.content.querySelector('#article-date').textContent = formatDate(article.createdAt);
		var tags = template.content.querySelector('.article-tags');

		function formatDate(d) {
			return d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear() + ' ' +
			d.getHours() + ':' + d.getMinutes();
		}

		tags.innerHTML = 'ТЭГИ: ';

		for(i = 0; i < article.tags.length; i++){
			var tmp = document.createElement('li');
			tmp.innerHTML = "<li>" + article.tags[i] + "</li>";
			tags.appendChild(tmp);
		}
		
		userLog.username((user) => {
			if(!user){
				template.content.querySelector('.article-footer').removeChild(template.content.querySelector('#article-delete'));
				template.content.querySelector('.article-footer').removeChild(template.content.querySelector('#article-change'));
			}
			document.querySelector('.article-list').appendChild(template.content.querySelector('.article').cloneNode(true));
			if(user){
				document.querySelector('#article-delete').addEventListener('click', articleFullDeleteHandler);
				document.querySelector('#article-change').addEventListener('click', articleFullChangeHandler);
			}
		});

    	function articleFullDeleteHandler(){
    		articleContent.removeArticle(document.querySelector('.article').dataset.id, () => {
    			mainPage.loadMainPage();
			});
    	}

    	function articleFullChangeHandler(){
    		var id = document.querySelector('.article').dataset.id;
    		var article = articleContent.getArticle(id, (article) =>{


    		window.onscroll = 0;
    		document.querySelector('.main-title').firstElementChild.textContent = 'Изменить новость';
    		popularTags.removeTagsFromDOM();
    		articleRenderer.removeArticlesFromDom();

    		var template = document.querySelector('#template-add-article');
    		template.content.querySelector('.article').dataset.id = article.id;
    		var tags = popularTags.allTags;
    		var tagSelector = template.content.querySelector('.input-tags');
    		tagSelector.innerHTML = '';
    		var tmp1 = document.createElement('option');
    		tmp1.innerHTML = '<option disabled>Возможные теги</option>';
    		tagSelector.appendChild(tmp1);
    		tags.forEach(function(item){
    			var tmp = document.createElement('option');
    			tmp.innerHTML = '<option value=\'' + item + '\'>' + item + '</option>';
    			tagSelector.appendChild(tmp);
    		});

			template.content.querySelector('.input-button').setAttribute('onclick', "changeSubmitHandler()");

    		document.querySelector('.article-list').appendChild(template.content.querySelector('.article').cloneNode(true));
			document.forms.add.title.value = article.title;
			document.forms.add.summary.value = article.summary;
			document.forms.add.content.value = article.content;
			document.forms.add.img.value = article.img;
			document.forms.add.tags.value = article.tags.join(' ');

    		document.querySelector('.input-tags').addEventListener('change', tagSelectorHandler);

    		function tagSelectorHandler(event){
    			var target = event.currentTarget.value;
    			var text = document.forms.add.tags;
    			var tmp = text.value.split(' ');
    			var key = false;

    			tmp.forEach(function(item){
    				if(item == target){
    					key = true;
    				}
    			});
    			if(key){
    				text.value = tmp.map(function(item){
    					if(item == target){
    						return '';
    					}
    					return item;
    				}).join(' ');
    			}
    			else if(target == 'Возможные теги');
    			else{
    				text.value += ' ' + target;
    			}
    		}
			});
    	}
		});	
	} 
}

function changeSubmitHandler(){
	var form = document.forms.add;
	if(form.title.value != "" && form.summary.value != "" && form.content.value != ""){
		userLog.username((user) => {
			var article = {
				id: '0',
				title: form.title.value,
				img: "",
				summary: form.summary.value,
				content: form.content.value,
				createdAt: new Date(),
				author:  user,
			}
			article.img = form.img.value;

			var tags = form.tags.value.split(' ');

			for(var i = 0; i < tags.length; i++){
				if(tags[i].length == 0){
					tags.splice(i,1);
					i--;
				}
			}

			article.tags = tags;
			article.id = document.querySelector('.article').dataset.id;

			articleContent.editArticle(article, callback => {
				mainPage.loadMainPage();
			});
		});
	}
}




document.addEventListener('DOMContentLoaded', startApp);
function startApp(){
	articleRenderer.init();
	userLog.renderUser();
	articleContent.authorsInit();
	mainPage.loadMainPage();

	addEvents();
}





function addEvents(){
	document.querySelector('#aMain').addEventListener('click', aMain);
	document.querySelector('#aAdd').addEventListener('click', aAdd);
	document.querySelector('#aSearch').addEventListener('click', aSearchClosed);
	document.querySelector('.logoBox').addEventListener('mouseover', showMemes);	
	logInfoAddEvents();

	function aMain(event){
		mainPage.loadMainPage();
	}

	function aAdd(event){
		window.onscroll = 0;
		document.querySelector('.main-title').firstElementChild.textContent = 'Добавить новость';
		popularTags.removeTagsFromDOM();
		articleRenderer.removeArticlesFromDom();

  		var template = document.querySelector('#template-add-article');
  		var tags = popularTags.allTags;
  		var tagSelector = template.content.querySelector('.input-tags');
  		tagSelector.innerHTML = '';
  		var tmp1 = document.createElement('option');
  		tmp1.innerHTML = '<option disabled>Возможные теги</option>';
  		tagSelector.appendChild(tmp1);
  		tags.forEach(function(item){
  			var tmp = document.createElement('option');
  			tmp.innerHTML = '<option value=\'' + item + '\'>' + item + '</option>';
  			tagSelector.appendChild(tmp);
  		});
		document.querySelector('.article-list').appendChild(template.content.querySelector('.article').cloneNode(true));
		document.querySelector('.input-tags').addEventListener('change', tagSelectorHandler);

		function tagSelectorHandler(event){
			var target = event.currentTarget.value;
			var text = document.forms.add.tags;
			var tmp = text.value.split(' ');
			var key = false;

			tmp.forEach(function(item){
				if(item == target){
					key = true;
				}
			});
			if(key){
				text.value = tmp.map(function(item){
					if(item == target){
						return '';
					}
					return item;
				}).join(' ');
			}
			else if(target == 'Возможные теги');
			else{
				text.value += ' ' + target;
			}
		}
	}

	function aSearchClosed(event){
		this.removeEventListener('click', aSearchClosed);
		this.addEventListener('click', aSearchOpened);

  		var template = document.querySelector('#template-search');

  		var tags = popularTags.allTags;
  		var tagSelector = template.content.querySelector('.search-tags');
  		tagSelector.innerHTML = '';
  		var tmp1 = document.createElement('option');
  		tmp1.innerHTML = '<option disabled>Возможные теги</option>';
  		tagSelector.appendChild(tmp1);
  		tags.forEach(function(item){
  			var tmp = document.createElement('option');
  			tmp.innerHTML = '<option value=\'' + item + '\'>' + item + '</option>';
  			tagSelector.appendChild(tmp);
  		});

  		var authors = articleContent.authors;
  		var authorSelector = template.content.querySelector('.search-author');
  		authorSelector.innerHTML = '';
  		var tmp1 = document.createElement('option');
  		tmp1.innerHTML = '<option disabled>Возможные авторы</option>';
  		authorSelector.appendChild(tmp1);
  		authors.forEach(function(item){
  			var tmp = document.createElement('option');
  			tmp.innerHTML = '<option value=\'' + item + '\'>' + item + '</option>';
  			authorSelector.appendChild(tmp);
  		});

  		document.querySelector('.search').innerHTML = '';
		document.querySelector('.search').appendChild(template.content.querySelector('.search-form').cloneNode(true));

		document.forms.search.createdAfter.addEventListener('change', createdAfterHandler);
		document.forms.search.createdBefore.addEventListener('change', createdBeforeHandler);
		document.forms.search.tags.value = '';

		tags = document.querySelector('.search-tags').addEventListener('change', tagSelectorHandler);

		document.querySelector('.search-button-accept').addEventListener('click', filter);

		function tagSelectorHandler(event){
			var target = event.currentTarget.value;
			var text = document.forms.search.tags;
			var tmp = text.value.split(' ');
			var key = false;

			tmp.forEach(function(item){
				if(item == target){
					key = true;
				}
			});
			if(key){
				text.value = tmp.map(function(item){
					if(item == target){
						return '';
					}
					return item;
				}).join(' ');
			}
			else if(target == 'Возможные теги');
			else{
				text.value += ' ' + target;
			}
		}

		function createdAfterHandler(){
			document.forms.search.createdBefore.setAttribute('min', this.value);
		}

		function createdBeforeHandler(){
			document.forms.search.createdAfter.setAttribute('max', this.value);
		}

		function filter(event){
			var form = document.forms.search;
			var filterConfig = {};
			var date1 = new Date(form.createdAfter.value);
			if(date1 != 'Invalid Date'){
				filterConfig.createdAfter = date1;
			}

			var date2 = new Date(form.createdBefore.value);
			if(date2 != 'Invalid Date'){
				filterConfig.createdBefore = date2;
			}

			var author = form.author.value;
			if(author != 'Возможные авторы'){
				filterConfig.author = author;
			}

			var tags = form.tags.value.split(' ');

			for(var i = 0; i < tags.length; i++){
				if(tags[i].length == 0){
					tags.splice(i,1);
					i--;
				}
			}

			filterConfig.tags = tags;

			mainPage.setFilter(filterConfig);

			mainPage.loadMainPage();
		}

	}

	function aSearchOpened(event){
		this.removeEventListener('click', aSearchOpened);
  		document.querySelector('.search').innerHTML = '';
		this.addEventListener('click', aSearchClosed);
	}

	function showMemes(){
		document.querySelector('.logoBox').removeEventListener('mouseover', showMemes);
		var template = document.querySelector('#MEMES');
		document.body.style.background = "url(\"content/PEPE.gif\")";
		document.body.style.backgroundSize = "100%";
		document.querySelector('.imagez').appendChild(template.content.querySelector('.MEMES').cloneNode(true));
		document.querySelector('.logoBox').addEventListener('mouseout', hideMemes);
	}

	function hideMemes(){
		document.querySelector('.logoBox').removeEventListener('mouseout', showMemes);
		var template = document.querySelector('#MEMES');		
		document.body.style.background = "";
		document.querySelector('.imagez').innerHTML = '';
		document.querySelector('.logoBox').addEventListener('mouseover', showMemes);
	}
}

function inputSubmitHandler(){
	var form = document.forms.add;
	if(form.title.value != "" && form.summary.value != "" && form.content.value != ""){
		userLog.username((user) => {
			var article = {
				id: '0',
				title: form.title.value,
				img: "",
				summary: form.summary.value,
				content: form.content.value,
				createdAt: new Date(),
				author:  user,
			}
			article.img = form.img.value;

			var tags = form.tags.value.split(' ');

			for(var i = 0; i < tags.length; i++){
				if(tags[i].length == 0){
					tags.splice(i,1);
					i--;
				}
			}

			article.tags = tags;

			articleContent.addArticle(article, () =>{
				mainPage.loadMainPage();
			});
		});
	}
}

function searchReset(){
  		document.querySelector('.search-input').innerHTML = '';
}

var mainPage = (function(){

	var filterConfig;

	var articleCount = 5;

	function renderArticles() {
		articleContent.getArticlesAmount((top) => {
			articleContent.getArticles(0, top, undefined, (articles) => {
				console.log(articles);
				popularTags.init(2, articles);
				popularTags.insertTagsInDOM();
			});
		});
		articleContent.getArticles(0, articleCount, filterConfig, (articles) => {
			articleRenderer.removeArticlesFromDom();
			articleRenderer.insertArticlesInDOM(articles);
		});
	}

	function loadMainPage(){
		articleCount = 5;
		document.querySelector('.main-title').firstElementChild.textContent = 'Новости';
		renderArticles();
		window.onscroll = scrollMainPage;
	}

	function setFilter(filter){
		filterConfig = filter;
	}

	function moreNews(){
		articleContent.getArticlesAmount((count) => {
		if(articleCount + 5 > count){
			articleCount = count;
			window.onscroll = 0;
		}
		else{
			articleCount += 5;
		}
		});
	}

	return{
		moreNews: moreNews,
		setFilter: setFilter,
		renderArticles: renderArticles,
		loadMainPage: loadMainPage
	}

}());

function scrollMainPage(){
	var bottom = document.querySelector('.footer-content').lastElementChild.getBoundingClientRect().top;
	if(window.pageYOffset > bottom){
		mainPage.moreNews();
		mainPage.renderArticles();
	}
}

function logInfoAddEvents(){
	var logInfo = document.querySelector('.log-info');

	userLog.username((user) => {
		if(user){
			logInfo.addEventListener('mouseover', mouseover);
			logInfo.addEventListener('click', logout);
		}
		else{
			logInfo.addEventListener('click', login);
		}
	});

	function mouseover(){
		userLog.username((user) => {
			logInfo.removeEventListener('mouseover', mouseover);
			logInfo.addEventListener('mouseout', mouseout);
			document.querySelector('.log-info').innerHTML = 'Выйти<br/><div id="username">' + user + '</div>';
		});
	}

	function mouseout(){
		userLog.username((user) => {
			logInfo.removeEventListener('mouseout', mouseout);
			logInfo.addEventListener('mouseover', mouseover);
			document.querySelector('.log-info').innerHTML = 'Профиль<br/><div id="username">' + user + '</div>';
		});
	}

	function logout(){
		logInfo.removeEventListener('mouseout', mouseout);
		userLog.init(undefined, undefined, () => {
			logInfo.removeEventListener('click', logout);
			logInfo.addEventListener('click', login);
		});
	}

	function login(){
		window.onscroll = 0;
		document.querySelector('.main-title').firstElementChild.textContent = 'ВХОД';
		popularTags.removeTagsFromDOM();
		articleRenderer.removeArticlesFromDom();

		var template = document.querySelector('#template-login');
		document.querySelector('.article-list').appendChild(template.content.querySelector('.login-background').cloneNode(true));
	}
}

function loginSubmitHandler(){
	userLog.init(document.forms.login.login.value, document.forms.login.password.value, () => {


	var logInfo = document.querySelector('.log-info');
	userLog.username((user) => {
		if(user){
			logInfo.removeEventListener('click', login);
			logInfo.addEventListener('mouseover', mouseover);
			logInfo.addEventListener('click', logout);
		}
	});
	mainPage.loadMainPage();

	function mouseover(){
		userLog.username((user) => {
			logInfo.removeEventListener('mouseover', mouseover);
			logInfo.addEventListener('mouseout', mouseout);
			document.querySelector('.log-info').innerHTML = 'Выйти<br/><div id="username">' + user + '</div>';
		});
	}

	function mouseout(){
		userLog.username((user) => {
			logInfo.removeEventListener('mouseout', mouseout);
			logInfo.addEventListener('mouseover', mouseover);
			document.querySelector('.log-info').innerHTML = 'Профиль<br/><div id="username">' + user + '</div>';
		});
	}


	function logout(){
		logInfo.removeEventListener('mouseout', mouseout);
		userLog.init(undefined, undefined, () => {
			logInfo.removeEventListener('click', logout);
			logInfo.addEventListener('click', login);
		});
	}

	function login(){
		window.onscroll = 0;
		document.querySelector('.main-title').firstElementChild.textContent = 'ВХОД';
		popularTags.removeTagsFromDOM();
		articleRenderer.removeArticlesFromDom();

		var template = document.querySelector('#template-login');
		document.querySelector('.article-list').appendChild(template.content.querySelector('.login-background').cloneNode(true));
	}
	});
}


