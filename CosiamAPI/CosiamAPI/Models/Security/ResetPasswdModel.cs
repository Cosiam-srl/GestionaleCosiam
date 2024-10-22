using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NetCoreBackend.Models.Security
{
    public class ResetPasswdModel
    {
        public string User { get; set; }
        public string Token { get; set; }
        public string newPasswd { get; set; }
    }
}
