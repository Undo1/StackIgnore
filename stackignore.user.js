// ==UserScript==
// @name StackIgnore
// @description To ignore folks on Stack Exchange
// @namespace Undo
// @author Undo
// @license MIT
// @include http://stackoverflow.com/*
// @include http://serverfault.com/*
// @include http://superuser.com/*
// @include http://meta.stackoverflow.com/*
// @include http://meta.serverfault.com/*
// @include http://meta.superuser.com/*
// @include http://stackapps.com/*
// @include http://*.stackexchange.com/*
// @include http://askubuntu.com/*
// @include http://meta.askubuntu.com/*
// @include http://mathoverflow.net/*
// @include http://meta.mathoverflow.net/*
// @include http://discuss.area51.stackexchange.com/*
// @exclude http://chat.*/*
// @exclude http://area51.stackexchange.com/*


// ==/UserScript==
function with_jquery(f) {
	var script = document.createElement("script");
	script.type = "text/javascript";
	script.textContent = "(" + f.toString() + ")(jQuery)";
	document.body.appendChild(script);
};

with_jquery(function($) {

	var arr = $.parseJSON(localStorage["ignoredUsers"]);
	
	if (arr == null || arr == undefined) arr = [];
	localStorage["ignoredUsers"] = JSON.stringify(arr);

	var users = '<div id="ignoredUsersDiv">';
	$.each(arr, function(index, item) {
		users += '<a href="/users/' + item + '" class="post-tag user-tag ignored-user-tag-' + item + '" rel="tag">' + item + '</a>';
	});
	users += '</div>';

	$("div#sidebar").prepend('<div class="module" id="ignored-users"><h4 id="h-ignored-users">Ignored users</h4><div id="ignoredUsers"></div>' + users + '<span id="add-ignored"></span><a id="addIgnoredUser" class="">Add/remove an ignored user</a><br></div></div>');

	$('#addIgnoredUser').bind("click", function(){
		$('#addIgnoredUser').remove();
		$("#ignored-users").append('<span id="add-ignored-user"><table><tbody><tr><td class="vt"><input type="text" placeholder="user id" id="ignored-user" name="ignored-user" autocomplete="off" class="ac_input"></td><td class="vt"><input id="ignored-user-add" type="button" value="Go"></td> </tr></tbody></table></span>');

		$("#ignored-user-add").bind('click',function(){
			var userToIgnore = $("#ignored-user").val();
			if (userToIgnore.length < 1) return;

			var arr = $.parseJSON(localStorage["ignoredUsers"]);
			var i = arr.indexOf(userToIgnore);
			if (i != -1) {
				arr.splice(i, 1);
				console.log("yay");
				$(".ignored-user-tag-" + userToIgnore).remove();
				localStorage["ignoredUsers"] = JSON.stringify(arr);
				return;
			}

			arr.push(userToIgnore);
			localStorage["ignoredUsers"] = JSON.stringify(arr);
			$("#ignoredUsersDiv").append('<a href="/users/' + userToIgnore + '" class="post-tag user-tag ignored-user-tag-' + userToIgnore + '" rel="tag">' + userToIgnore + '</a>')
		});
	});

	var numAnswersHidden = 0;
	$.each(arr, function(index, item) {
		console.log("checking for answers from " + item);
		var answer = $("div.user-details a[href^='/users/" + item + "']").closest("div[id^=answer]");
		if (answer.length > 0) {
			numAnswersHidden++;
			stackIgnore(answer);
		}
	});
	if (numAnswersHidden) {
		$("h2.bottom-notice.bottom-share-links").css("display", "none");
		$("div.subheader.answers-subheader h2").append(" <span style='color:grey'> (" + numAnswersHidden + " hidden)</span>");

		stackIgnoreBanner($("form.post-form"), numAnswersHidden + ((numAnswersHidden != 1) ? " answers" : " answer") + " hidden by StackIgnore. <a class='stackignore-show-hidden-answers'>Click to show.</a>").addClass('stackignore-answers-hidden-banner');
		$(".stackignore-show-hidden-answers").bind('click', function() {
			$("div.hiddenByStackIgnore[id^=answer]").css("display", "block");
		});
	}
	
	var numCommentsHidden = 0;
	$.each(arr, function(index, item) {
		console.log("checking for comments from " + item);
		var comment = $("tr.comment a.comment-user[href^='/users/" + item + "']").closest("tr[id^=comment]");
		if (comment.length > 0) {
			numCommentsHidden++;
			stackIgnore(comment);
		}
	});
	if (numCommentsHidden) {
		$("h2.bottom-notice.bottom-share-links").css("display", "none");

		stackIgnoreBanner($("form.post-form"), numCommentsHidden + ((numCommentsHidden > 1) ? " comments" : " comment") + " hidden by StackIgnore. <a class='stackignore-show-hidden-comments'>Click to show.</a>").addClass('stackignore-comments-hidden-banner');
		$(".stackignore-show-hidden-comments").bind('click', function() {
			$("tr.comment.hiddenByStackIgnore").css("display", "block");
		});
	}
	
	function stackIgnore(el) {
		el.css("background-color", "rgb(220,240,255)");
		el.css("display", "none");
		el.addClass("hiddenByStackIgnore");
	}
	
	function stackIgnoreBanner(el, html, bannerClass) {
		return $("<div>" + html + "</div>").css({
			fontSize: '17px',
			backgroundColor: 'rgb(220,240,255)',
			margin: '5px',
			padding: '10px',
			border: '3px solid rgb(210,230,245)'
		}).insertBefore(el);
	}
	
});
