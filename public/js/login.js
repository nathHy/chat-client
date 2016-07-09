$(document).ready(function () 
{
console.log('welcome to the login page')


$("#loginButton").click(function() {
	console.log('Logining in')
	formData = getForm();
	console.log(formData)
	$.post('/login',formData,function (data){
		console.log(data)
		if (data.success)
		{
			window.localStorage.setItem("username",formData.username);
			window.location = "/";
		} else {
			alert(data.message);
		}
	})
})




$("#registerButton").click(function() {
	console.log('registering')
	formData = getForm();
	console.log(formData)
	$.post('/user',formData,function (data){
		console.log(data)
		if (data.success)
		{
			$("#responseMessage").text(data.message);
		} else {
			$("#responseMessage").text(data.message);
		}
	})
})




function getForm() {
	var form = {};
	form.username=$('#username').val();
	form.password=$('#password').val();
	return form;
}

});