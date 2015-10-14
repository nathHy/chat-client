$(document).ready(function () 
{
console.log('welcome to the login page')


$("#loginButton").click(function() {
	console.log('Logining in')
	formData = getForm();
	console.log(formData)
	$.post('http://10.20.30.100:3000/login',formData,function (data){
		console.log(data)
		if (data.success)
		{
			// alert(data.message)
			window.location = "http://10.20.30.100:3000";
		} else {
			alert(data.message);
		}
	})
})




$("#registerButton").click(function() {
	console.log('registering')
	formData = getForm();
	console.log(formData)
	$.post('http://10.20.30.100:3000/user',formData,function (data){
		console.log(data)
		if (data.success)
		{
			alert(data.message)
		} else {
			alert(data.message);
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