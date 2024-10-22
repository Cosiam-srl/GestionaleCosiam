using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace CosiamAPI.Models
{
    public class _File
    {
        public int Id { get; set; }
        public int HashCode { get; set; }
        public string FileName { get; set; } = "";
        public DateTime UploadDateTime { get; set; }
        public string Type { get; set; }
        public string URL { get; set; }

    }
}

