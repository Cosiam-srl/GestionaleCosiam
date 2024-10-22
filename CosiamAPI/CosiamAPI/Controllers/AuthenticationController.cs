
using JWTAuthentication.Authentication;
using Newtonsoft.Json.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Linq;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.WebUtilities;
using NetCoreBackend.Models.Security;
using CosiamAPI.Data;
using System.Text.Json;

namespace CosiamAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthenticateController : ControllerBase
    {
        private readonly UserManager<IdentityUser> userManager;
        private readonly RoleManager<IdentityRole> roleManager;
        private readonly IConfiguration _configuration;
        private readonly IEmailSender _mailService;
        private readonly ApplicationDbContext _context;

        public AuthenticateController(UserManager<IdentityUser> userManager, RoleManager<IdentityRole> roleManager, ApplicationDbContext context, IConfiguration configuration, IEmailSender mailService)
        {
            this.userManager = userManager;
            this.roleManager = roleManager;
            this._context = context;
            _configuration = configuration;
            _mailService = mailService;
        }

        /// <summary>
        /// API endpoint for user login, the user posts it's credentials to this endpoint
        /// and if the credentials are correct, a JWT (Json Web Token) is returned.
        /// Use the token obtained to compare as a logged in user.
        /// </summary>
        /// <param name="model">Credentials of the user</param>
        /// <returns>a JWT and a detail on it's expiration</returns>
        [HttpPost]
        [Route("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            var user = await userManager.FindByNameAsync(model.Username);
            if (user == null){
                user = await userManager.FindByEmailAsync(model.Username);
                if(user == null)
                    return Unauthorized("Wrong username");
            }
            if (user.LockoutEnabled && user.LockoutEnd > DateTime.UtcNow)
                return Unauthorized("User disabled");
            if (user != null && await userManager.CheckPasswordAsync(user, model.Password))
            {
                var userRoles = await userManager.GetRolesAsync(user);
  
                var authClaims = new List<Claim>
                {
                    new Claim("username", user.UserName),  //"username" can be ClaimTypes.Name
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                };

                foreach (var userRole in userRoles)
                {
                    authClaims.Add(new Claim("roles", userRole));  //"roles" can be ClaimTypes.Role
                }
  
                var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:Secret"]));
  
                var token = new JwtSecurityToken(
                        //issuer: _configuration["JWT:ValidIssuer"],
                        //audience: _configuration["JWT:ValidAudience"],
                        expires: DateTime.Now.AddHours(5),
                        claims: authClaims,
                        signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
                    );

                return Ok(new
                {
                    token = new JwtSecurityTokenHandler().WriteToken(token),
                    expiration = token.ValidTo
                });
            }
            return Unauthorized();
        }

        /// <summary>
        /// API endpoint for the registration of other users. with this API an Admin of the system
        /// can post user data (username, email, and password) to register him for the login.
        /// If the register operation succeded the new user can now login to the app.
        /// </summary>
        /// <param name="model">User data: username, email, and password</param>
        [HttpPost]
        [Authorize(Roles = UserPolicy.Utenti_C)]
        [Route("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            var userExists = await userManager.FindByNameAsync(model.Username);
            if (userExists != null)
                return StatusCode(StatusCodes.Status500InternalServerError, new Response { Status = "Error", Message = "User already exists!" });

            IdentityUser user = new IdentityUser()
            {
                Email = model.Email,
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = model.Username
            };
            var result = await userManager.CreateAsync(user, model.Password);
            if (!result.Succeeded)
                return StatusCode(StatusCodes.Status500InternalServerError, new Response { Status = "Error", Message = "User creation failed! Please check user details and try again." });

            return Ok(new Response { Status = "Success", Message = "User created successfully!" });
        }
  
        /// <summary>
        /// API endpoint for the registration of a new admin user. with this API an Admin of the system
        /// can post user data (username, email, and password) to register him for the login as an administrator.
        /// If the register operation succeded the new user can now login to the app and register other users.
        /// </summary>
        /// <param name="model">User data: username, email, and password</param>
        [HttpPost]
        [Authorize(Roles=UserPolicy.Utenti_C)]
        [Route("register-admin")]
        public async Task<IActionResult> RegisterAdmin([FromBody] RegisterModel model)
        {
            var userExists = await userManager.FindByNameAsync(model.Username);
            if (userExists != null)
                return StatusCode(StatusCodes.Status500InternalServerError, new Response { Status = "Error", Message = "User already exists!" });

            IdentityUser user = new IdentityUser()
            {
                Email = model.Email,
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = model.Username
            };
            var result = await userManager.CreateAsync(user, model.Password);
            if (!result.Succeeded)
                return StatusCode(StatusCodes.Status500InternalServerError, new Response { Status = "Error", Message = "User creation failed! Please check user details and try again." });
  
            if (!await roleManager.RoleExistsAsync(UserRoles.Admin))
                await roleManager.CreateAsync(new IdentityRole(UserRoles.Admin));
            if (!await roleManager.RoleExistsAsync(UserRoles.HeadOfOrder))
                await roleManager.CreateAsync(new IdentityRole(UserRoles.HeadOfOrder));
            if (!await roleManager.RoleExistsAsync(UserRoles.Foreman))
                await roleManager.CreateAsync(new IdentityRole(UserRoles.Foreman));

            if (await roleManager.RoleExistsAsync(UserRoles.Admin))
            {
                await userManager.AddToRoleAsync(user, UserRoles.Admin);
            }

            return Ok(new Response { Status = "Success", Message = "User created successfully!" });
        }

        /// <summary>
        /// API to assign a role to a user
        /// </summary>
        /// <param name="user">username or email of an existing user</param>
        /// <param name="role">role to assign to the user</param>
        /// <returns></returns>
        [HttpGet]
        [Authorize(Roles=UserPolicy.Utenti_U)]
        [Route("assign-role/{user}/{role}")]
        public async Task<IActionResult> AssignRole([FromRoute] string user, [FromRoute] string role) {
            var targetUsr = await userManager.FindByEmailAsync(user);
            if (targetUsr == null) {
                targetUsr = await userManager.FindByNameAsync(user);
            }
            if (targetUsr == null)
                return BadRequest($"{user} is not an existing user!");
            // user is an existing user
            var targetRole = await roleManager.FindByNameAsync(role);
            if (targetRole == null)
                return BadRequest($"{role} is not an exisiting role!");
            // role is an existing role

            // Adding user to role
            var res = await userManager.AddToRoleAsync(targetUsr, targetRole.Name);

            if(res.Succeeded)
                // Operation completed
                return Ok(
                    $"Added user {targetUsr.Id} to role {targetRole.Id}"
                );
            // An error occurred
            return new StatusCodeResult((int)StatusCodes.Status500InternalServerError);
        }

        /// <summary>
        /// API to unassign a role to a user
        /// </summary>
        /// <param name="user">username or email of an existing user</param>
        /// <param name="role">role to unassign from the user</param>
        /// <returns></returns>
        [HttpGet]
        [Authorize(Roles=UserPolicy.Utenti_U)]
        [Route("unassign-role/{user}/{role}")]
        public async Task<IActionResult> UnassignRole([FromRoute] string user, [FromRoute] string role) {
            var targetUsr = await userManager.FindByEmailAsync(user);
            if (targetUsr == null) {
                targetUsr = await userManager.FindByNameAsync(user);
            }
            if (targetUsr == null)
                return BadRequest($"{user} is not an existing user!");
            // user is an existing user
            var targetRole = await roleManager.FindByNameAsync(role);
            if (targetRole == null)
                return BadRequest($"{role} is not an exisiting role!");
            // role is an existing role

            // Adding user to role
            var res = userManager.RemoveFromRoleAsync(targetUsr, targetRole.Name);
            if (res.IsCompletedSuccessfully)
                // Operation completed
                return Ok(
                    $"Added user {targetUsr.Id} to role {targetRole.Id}"
                );
            // An error occurred
            return new StatusCodeResult((int)StatusCodes.Status500InternalServerError);
        }

        /// <summary>
        /// API endpoint to get the list of the usernames of the users registered on the system, the users
        /// who can login to the app. Must be logged in to trigger this endpoint.
        /// </summary>
        /// <returns>The list of the usernames of the users registered on the system</returns>
        [HttpGet]
        [Route("retrieve-users")]
        [Authorize(Roles = UserPolicy.Utenti_R)]
        public IEnumerable<string> Get() {
            List<IdentityUser> users = this.userManager.Users.ToList();
            
            List<String> usernames = new List<string>();
            foreach(IdentityUser user in users){
                usernames.Add(user.UserName);
            }

            return usernames;
        }

        [HttpGet]
        [Route("{userName}/roles")]
        [Authorize(Roles = UserPolicy.Utenti_R)]
        public async Task<List<string>> Get([FromRoute] string userName) 
        {
            var targetUsr = await userManager.FindByEmailAsync(userName);
            if (targetUsr == null) {
                targetUsr = await userManager.FindByNameAsync(userName);
            }
            if (targetUsr == null)
                return new List<string>();
            var roles = await this.userManager.GetRolesAsync(targetUsr);
            return roles.ToList();
        }

        [HttpGet]
        [Route("retrieve-roles")]
        [Authorize(Roles = UserPolicy.Utenti_R)]
        //public JArray GetRoles()
        public IEnumerable<Object> GetRoles()
        {
            var r = this.roleManager.Roles
                .Select(x => new{ x.Name, x.Id })
                .ToList();
            return r;
        }

        [HttpPost]
        [AllowAnonymous]
        [Route("forgot-password")]
        public async Task<IActionResult> ForgotPasswd([FromBody]JsonDocument json)
        {
            string username = json.RootElement.GetProperty("username").GetString();

            if (String.IsNullOrEmpty(username))
            {
                return BadRequest();
            }
            var user = await userManager.FindByNameAsync(username);
            if (user == null)
            {
                user = await userManager.FindByEmailAsync(username);
                if(user == null)
                    return NotFound();
            }
            var token = await userManager.GeneratePasswordResetTokenAsync(user);
            var tokenBytes = Encoding.UTF8.GetBytes(token);
            var formattedToken = WebEncoders.Base64UrlEncode(tokenBytes);

            string resetUrl = $"{_configuration["ClientAppUrl"]}/pages/reset-password?user={user.UserName}&token={formattedToken}";
            string mailContent = "<h1>Resetta la password di Cosiam</h1>" +
                "<br />" +
                $"<p>Per resettare la tua password <a href={resetUrl}>clicca qui</a></p>" +
                "<br />" +
                "<p>Se non hai richiesto tu questa operazione, non continuare la procedura, il tuo account � sicuro.</p>";

            try
            {
                mailContent = System.IO.File.ReadAllText("wwwroot/html/emailTemplate_resetPassword.html");
                mailContent = mailContent.Replace("[UserName]", user.UserName);
                mailContent = mailContent.Replace("[ResetUrl]", resetUrl);
            } catch { }

            // Sending forgot/reset mail to the user

            await _mailService.SendEmailAsync(user.Email, "[Cosiam] Reset Password", mailContent);

            return Ok();
        }

        /// <summary>
        /// API endpoint to reset user password, a PasswordResetToken is necessary to complete this action.
        /// </summary>
        /// <param name="model">The model with the info to complete the operation</param>
        /// <returns></returns>
        [HttpPost]
        [Route("reset-password")]
        public async Task<IActionResult> ResetPasswd([FromBody] ResetPasswdModel model)
        {
            if (model == null)
            {
                return BadRequest();
            }
            if (String.IsNullOrEmpty(model.User))
            {
                return BadRequest("User can not be null");
            }
            var user = await userManager.FindByNameAsync(model.User);
            if (user == null)
            {
                return NotFound();
            }

            if (String.IsNullOrEmpty(model.Token))
            {
                return BadRequest("Token can not be null");
            }
            var tokenBytes = WebEncoders.Base64UrlDecode(model.Token);
            var token = Encoding.UTF8.GetString(tokenBytes);

            if (String.IsNullOrEmpty(model.newPasswd)) {
                return BadRequest("Password can not be null");
            }
            var result = await userManager.ResetPasswordAsync(user, token, model.newPasswd);

            if (result.Succeeded)
            {
                return Ok();
            }
            return Forbid();
        }

        /// <summary>
        /// Disable user login without deleting him from DB
        /// </summary>
        /// <param name="user">The user to lock out</param>
        /// <returns></returns>
        [HttpGet]
        [Route("disable-user/{user}")]
        [Authorize(Roles = UserPolicy.Utenti_D)]
        public async Task<IActionResult> DisableUser([FromRoute] string user) {
            var targetUsr = await userManager.FindByEmailAsync(user);
            if (targetUsr == null) {
                targetUsr = await userManager.FindByNameAsync(user);
            }
            if (targetUsr == null)
                return BadRequest($"{user} is not an existing user!");
            // user is an existing user
            var res = userManager.SetLockoutEnabledAsync(targetUsr, true);
            var res2 = userManager.SetLockoutEndDateAsync(targetUsr, DateTime.MaxValue);

            if (res.IsCompletedSuccessfully && res2.IsCompletedSuccessfully)
                return Ok(
                    $"{user} disabled"
                );
            return new StatusCodeResult((int)StatusCodes.Status500InternalServerError);
        }

        [HttpGet]
        [Route("remove-user/{user}")]
        [Authorize(Roles = UserPolicy.Utenti_D)]
        public async Task<IActionResult> RemoveUser([FromRoute] string user) {
            var targetUsr = await userManager.FindByEmailAsync(user);
            if (targetUsr == null) {
                targetUsr = await userManager.FindByNameAsync(user);
            }
            if (targetUsr == null)
                return BadRequest($"{user} is not an existing user!");

            this._context.Users.Remove(targetUsr);
            var userRoles = this._context.UserRoles.Where(x => x.UserId == targetUsr.Id);
            this._context.UserRoles.RemoveRange(userRoles);
            var loginsToDelete = this._context.UserLogins.Where(x => x.UserId == targetUsr.Id);
            this._context.UserLogins.RemoveRange(loginsToDelete);
            var tokensToDelete = this._context.UserTokens.Where(x => x.UserId == targetUsr.Id);
            this._context.UserTokens.RemoveRange(tokensToDelete);

            await this._context.SaveChangesAsync();
            return Ok();
        }
    }
}
