using CosiamAPI;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace JWTAuthentication.Authentication
{
    public static class UserRoles
    {
        public const string Admin = "Admin";
        public const string HeadOfOrder = "HeadOfOrder"; // Capo commessa
        public const string Foreman = "Foreman"; //Capo Cantiere
    }

    //public interface IUserPolicy
    //{
    //    public  UserPolicy Istance { get; }
    //}
    public class UserPolicy //: IUserPolicy
    {
        //public string Personale_C {  get;  }
        //public string Personale_R { get; }
        //public string Personale_U { get; }
        //public string Personale_D { get; }

        //public string Mezzi_C { get; }
        //public string Mezzi_R { get; }
        //public string Mezzi_U { get; }
        //public string Mezzi_D { get; }

        //public string Utenti_C { get; }
        //public string Utenti_R { get; }
        //public string Utenti_U { get; }
        //public string Utenti_D { get; }

        //public string Cantieri_C { get; }
        //public string Cantieri_R { get; }
        //public string Cantieri_U { get; }
        //public string Cantieri_D { get; }

        //public string ReportDiCantiere_C { get; }
        //public string ReportDiCantiere_R { get; }
        //public string ReportDiCantiere_U { get; }
        //public string ReportDiCantiere_D { get; }

        //public string Documenti_C { get; }
        //public string Documenti_R { get; }
        //public string Documenti_U { get; }
        //public string Documenti_D { get; }

        //public string Attrezzatura_C { get; }
        //public string Attrezzatura_R { get; }
        //public string Attrezzatura_U { get; }
        //public string Attrezzatura_D { get; }

        //public string Clienti_C { get; }
        //public string Clienti_R { get; }
        //public string Clienti_U { get; }
        //public string Clienti_D { get; }

        //public string Fornitori_C { get; }
        //public string Fornitori_R { get; }
        //public string Fornitori_U { get; }
        //public string Fornitori_D { get; }

        //public string NoteDiCantiere_C { get; }
        //public string NoteDiCantiere_R { get; }
        //public string NoteDiCantiere_U { get; }
        //public string NoteDiCantiere_D { get; }

        //public static readonly UserPolicy istance = JsonConvert.DeserializeObject<UserPolicy>(new StreamReader("UserPolicy.json").ReadToEnd());
        //public UserPolicy Istance => istance;

        public const string Personale_C = "Admin,HeadOfOrder"; // Head of order, tho, cannot create connected user
        public const string Personale_R = "Admin,HeadOfOrder, Foreman";
        public const string Personale_U = "Admin,HeadOfOrder";
        public const string Personale_D = "Admin,";

        public const string Mezzi_C = "Admin,HeadOfOrder";
        public const string Mezzi_R = "Admin,HeadOfOrder, Foreman";
        public const string Mezzi_U = "Admin,HeadOfOrder";
        public const string Mezzi_D = "Admin";

        public const string Contratti_C = "Admin,HeadOfOrder";
        public const string Contratti_R = "Admin,HeadOfOrder, Foreman";
        public const string Contratti_U = "Admin,HeadOfOrder";
        public const string Contratti_D = "Admin";

        public const string Utenti_C = "Admin";
        public const string Utenti_R = "Admin,HeadOfOrder";
        public const string Utenti_U = "Admin";
        public const string Utenti_D = "Admin";
        public const string Utenti_on_User_U = "Admin,HeadOfOrder"; //Same as personale_c

        public const string Cantieri_C = "Admin,HeadOfOrder";
        public const string Cantieri_R = "Admin,HeadOfOrder,Foreman"; //headoforder and foreman can only read their own's
        public const string Cantieri_U = "Admin,HeadOfOrder";
        public const string Cantieri_D = "Admin";

        public const string ReportDiCantiere_C = "Admin, HeadOfOrder,Foreman";
        public const string ReportDiCantiere_R = "Admin,HeadOfOrder,Foreman";
        public const string ReportDiCantiere_U = "Admin, HeadOfOrder,Foreman";
        public const string ReportDiCantiere_D = "Admin";

        public const string Documenti_C = "Admin,HeadOfOrder,Foreman";
        public const string Documenti_R = "Admin,HeadOfOrder,Foreman";
        public const string Documenti_U = "Admin,HeadOfOrder,Foreman";
        public const string Documenti_D = "Admin";

        public const string Attrezzatura_C = "Admin,HeadOfOrder";
        public const string Attrezzatura_R = "Admin,HeadOfOrder,Foreman";
        public const string Attrezzatura_U = "Admin,HeadOfOrder";
        public const string Attrezzatura_D = "Admin";

        public const string Clienti_C = "Admin,HeadOfOrder";
        public const string Clienti_R = "Admin,HeadOfOrder,Foreman";
        public const string Clienti_U = "Admin,HeadOfOrder";
        public const string Clienti_D = "Admin";

        public const string Fornitori_C = "Admin,HeadOfOrder";
        public const string Fornitori_R = "Admin,HeadOfOrder,Foreman";
        public const string Fornitori_U = "Admin,HeadOfOrder";
        public const string Fornitori_D = "Admin";

        public const string NoteDiCantiere_C = "Admin,HeadOfOrder,Foreman";
        public const string NoteDiCantiere_R = "Admin,HeadOfOrder,Foreman";
        public const string NoteDiCantiere_U = "Admin,HeadOfOrder,Foreman";
        public const string NoteDiCantiere_D = "Admin";
    }
}
