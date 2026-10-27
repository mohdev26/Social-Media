export const template= (
    Code:string,
    firstName:string,
    subject:string
) => `<!DOCTYPE html>
<html>
<head>
<style>
body {
font - family: Arial, sans-serif;
margin:0;
padding: 0;
backgound-color: #f4f4f4;
}
.email-container{
max-width: 600px;
margin: 20px auto;
background-color: #ffffff;
broder: 1px solid #dddddd;
broder-radius: 8px;
overflow: hidden;
}
.email-header{
background-color: #007BFF;
color: #ffffff;
text-align: center;
padding: 20px;
}
.email-header h1 {
margin: 0;
font-size: 24px;
}
.email-body{
padding: 20px;
color: #333333;
line-height: 1.6;
}
.email-body h2 {
margin-top: 0;
color: #007BFF;
}
.action-button{
display: inline-block;
background-color: #007BFF;
color: #ffffff !important;
text-decoration: none;
padding: 10px 20px;
border-radius: 5px;
font-zize: 16px;
margin: 20px 0;
}
.action-button:hover{
background-color: #0056b3;
}
.email-footer{
text-align: center;
padding: 15px;
background-color: #f4f4f4;
font-size: 14px;
color: #777777;
}
.email-footer a{
color: #007BFF;
text-decoration: none;
}
</style>
</head>
<body>  
<div class="email-container">
<div class="email-header">
<h1>${subject}</h1>
</div>
<div class="email-body">
<h2>Hello ${firstName},</h2>
<p>Thank you for registering with us. Please use the following code to verify your email address:</p>
<p><strong>${Code}</strong></p>
<a href="#" class="action-button">Verify Email</a>
</div>
<div class="email-footer">
<p>If you did not request this email, please ignore it.</p>
<p>Contact us at <a href="mailto:support@company.com">support@company.com</a></p>
</div>
</div>
</body>
</html>`