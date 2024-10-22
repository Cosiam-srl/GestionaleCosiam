using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Configuration;
using System;
using System.Text;
using System.Threading.Tasks;

namespace CosiamAPI.Common
{
    public class Utils
    {
        public IConfiguration Configs { get; }
        public UserManager<IdentityUser> UserManager { get; }
        public RoleManager<IdentityRole> RoleManager { get; }
        public IEmailSender EmailSender { get; }

        public Utils(
            IConfiguration configs,
            UserManager<IdentityUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IEmailSender sender)
        {
            Configs = configs;
            UserManager = userManager;
            RoleManager = roleManager;
            EmailSender = sender;
        }

        public async Task SendResetPasswordEmailAsync(IdentityUser user)
        {
            var token = await UserManager.GeneratePasswordResetTokenAsync(user);
            var tokenBytes = Encoding.UTF8.GetBytes(token);
            var formattedToken = WebEncoders.Base64UrlEncode(tokenBytes);

            string resetUrl = $"{Configs["ClientAppUrl"]}/pages/reset-password?user={user.UserName}&token={formattedToken}";
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
            }
            catch { }

            // Sending forgot/reset mail to the user

            await EmailSender.SendEmailAsync(user.Email, "[Cosiam] Reset Password", mailContent);

        }

        public async Task DisableUserLogin(IdentityUser user)
        {
            var target = await UserManager.FindByIdAsync(user.Id);
            var res = await UserManager.SetLockoutEnabledAsync(target, true);
            var res2 = await UserManager.SetLockoutEndDateAsync(target, DateTime.MaxValue);
        }
    }
}
