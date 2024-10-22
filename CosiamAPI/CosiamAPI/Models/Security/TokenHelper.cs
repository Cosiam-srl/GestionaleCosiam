using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Threading.Tasks;

namespace CosiamAPI.Models.Security
{
    public class TokenHelper
    {
        private UserManager<IdentityUser> _userManager { get; set; }

        public TokenHelper(UserManager<IdentityUser> manager)
        {
            this._userManager = manager;
        }
        public async Task<IdentityUser> GetUserFromRequestAsync(HttpRequest request)
        {
            request.Headers.TryGetValue("Authorization", out var t);
            if (t.Count <= 0)
                return null;
            string token = t.First();
            token = token.Remove(0, 7);
            JwtSecurityToken decriptedToken = new JwtSecurityTokenHandler().ReadJwtToken(token);
            string username = (string)decriptedToken.Payload.Single(x => x.Key == "username").Value;

            IdentityUser user = await _userManager.FindByNameAsync(username);
            return user;
        }
    }
}
